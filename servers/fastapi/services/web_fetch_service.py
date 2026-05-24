"""Auto-fetch URLs mentioned in user prompts to ground slide generation in real content.

When a user types "make a deck about acme.com" or "pitch for openai.com/pricing",
we pull those pages and inject their text into the LLM's context so it doesn't
have to guess or hallucinate about the company/product.

Safety:
- HTTP timeout per request (8s)
- Per-page byte cap (300 KB) — we cut the body off mid-stream once exceeded
- Total URLs fetched per request capped (4) so a wall of links can't DoS us
- Private/loopback hosts blocked (no localhost / 127.0.0.1 / 10.x / 192.168.x / fd00::/8)
- Only http/https schemes
"""

from __future__ import annotations

import asyncio
import ipaddress
import logging
import re
import socket
from html.parser import HTMLParser
from typing import Iterable
from urllib.parse import urlparse, urlunparse

import aiohttp

logger = logging.getLogger(__name__)

# --- Tunables -----------------------------------------------------------------

_REQUEST_TIMEOUT_S = 8.0
_MAX_BYTES_PER_PAGE = 300_000  # 300 KB
_MAX_URLS_PER_REQUEST = 4
_USER_AGENT = "SliddifyBot/1.0 (+https://sliddify.app)"

# Skip these — they rarely contribute useful slide context and often block bots.
_BLOCKED_HOST_SUFFIXES = (
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "tiktok.com",
)

# --- URL extraction -----------------------------------------------------------

# Match http(s)://... URLs first (any TLD)
_HTTP_URL_RE = re.compile(
    r"https?://[^\s<>\"'\]\)]+", re.IGNORECASE
)

# Bare domains like acme.com or shop.acme.co.uk (only common TLDs to avoid
# catching things like "v1.2" or "main.py").
_BARE_DOMAIN_RE = re.compile(
    r"(?<![a-z0-9@/.\-])"
    r"((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
    r"(?:com|org|net|io|ai|app|dev|co|tech|so|xyz|gov|edu|us|uk|de|fr|jp|ca|au|in|eu)"
    r"(?:/[^\s<>\"'\]\)]*)?)",
    re.IGNORECASE,
)


def extract_urls(text: str | None) -> list[str]:
    """Pull http(s) URLs and bare domains out of user-provided content."""
    if not text:
        return []

    found: list[str] = []
    seen: set[str] = set()

    for m in _HTTP_URL_RE.finditer(text):
        url = m.group(0).rstrip(".,;:)!?")
        if url not in seen:
            seen.add(url)
            found.append(url)

    for m in _BARE_DOMAIN_RE.finditer(text):
        bare = m.group(1).rstrip(".,;:)!?")
        url = f"https://{bare}"
        if url not in seen:
            seen.add(url)
            found.append(url)

    return found[:_MAX_URLS_PER_REQUEST]


# --- Safety: block private / loopback / link-local hosts ----------------------


def _is_private_host(host: str) -> bool:
    """Block fetches to private/internal IPs (SSRF prevention)."""
    if not host:
        return True
    host = host.lower()
    if host in ("localhost", "metadata.google.internal", "metadata"):
        return True
    if host.endswith(".local"):
        return True
    try:
        # If host is a literal IP, check directly.
        ip = ipaddress.ip_address(host)
        return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
    except ValueError:
        pass
    try:
        # Resolve hostname; if any A/AAAA points to private space, refuse.
        infos = socket.getaddrinfo(host, None)
        for family, *_ , sockaddr in infos:
            addr = sockaddr[0]
            try:
                ip = ipaddress.ip_address(addr)
                if (
                    ip.is_private
                    or ip.is_loopback
                    or ip.is_link_local
                    or ip.is_reserved
                ):
                    return True
            except ValueError:
                continue
    except (socket.gaierror, OSError):
        return True
    return False


def _is_blocked_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
    except Exception:
        return True
    if parsed.scheme not in ("http", "https"):
        return True
    host = (parsed.hostname or "").lower()
    if not host:
        return True
    if any(host == suf or host.endswith("." + suf) for suf in _BLOCKED_HOST_SUFFIXES):
        return True
    if _is_private_host(host):
        return True
    return False


# --- HTML → text --------------------------------------------------------------


class _TextExtractor(HTMLParser):
    """Strip tags, scripts, styles, nav/footer; keep visible body text."""

    _SKIP_TAGS = {"script", "style", "noscript", "svg", "nav", "footer", "form", "iframe"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._chunks: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs):
        if tag in self._SKIP_TAGS:
            self._skip_depth += 1
        elif tag in ("p", "br", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6", "tr"):
            self._chunks.append("\n")

    def handle_endtag(self, tag: str):
        if tag in self._SKIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1

    def handle_data(self, data: str):
        if self._skip_depth > 0:
            return
        text = data.strip()
        if text:
            self._chunks.append(text + " ")

    def text(self) -> str:
        raw = "".join(self._chunks)
        # Collapse runs of whitespace / repeated newlines.
        raw = re.sub(r"[ \t]+", " ", raw)
        raw = re.sub(r"\n\s*\n+", "\n\n", raw)
        return raw.strip()


def _html_to_text(html: str) -> str:
    parser = _TextExtractor()
    try:
        parser.feed(html)
    except Exception:
        # Malformed HTML — return whatever we got so far.
        pass
    return parser.text()


# --- Fetch --------------------------------------------------------------------


async def _fetch_one(session: aiohttp.ClientSession, url: str) -> tuple[str, str] | None:
    """Returns (final_url, extracted_text) or None on any failure."""
    if _is_blocked_url(url):
        logger.info("web_fetch: blocked URL %s", url)
        return None
    try:
        async with session.get(
            url,
            timeout=aiohttp.ClientTimeout(total=_REQUEST_TIMEOUT_S),
            allow_redirects=True,
            max_redirects=3,
        ) as response:
            if response.status >= 400:
                return None
            ctype = (response.headers.get("Content-Type") or "").lower()
            if "html" not in ctype and "text" not in ctype:
                return None

            # Re-check after redirects in case we ended up on a blocked host.
            final_url = str(response.url)
            if _is_blocked_url(final_url):
                return None

            body_bytes = bytearray()
            async for chunk in response.content.iter_chunked(16 * 1024):
                body_bytes.extend(chunk)
                if len(body_bytes) >= _MAX_BYTES_PER_PAGE:
                    break

            try:
                html = body_bytes.decode("utf-8", errors="replace")
            except Exception:
                return None

            text = _html_to_text(html)
            # Trim to ~12k chars per page — plenty for LLM context, bounded cost.
            if len(text) > 12_000:
                text = text[:12_000] + "\n…"
            if not text:
                return None
            return final_url, text
    except (asyncio.TimeoutError, aiohttp.ClientError, ValueError) as e:
        logger.info("web_fetch: %s failed: %s", url, e)
        return None


async def fetch_urls_for_context(urls: Iterable[str]) -> list[tuple[str, str]]:
    """Fetch a list of URLs concurrently and return successful (url, text) pairs."""
    urls = list(urls)[:_MAX_URLS_PER_REQUEST]
    if not urls:
        return []
    connector = aiohttp.TCPConnector(limit=_MAX_URLS_PER_REQUEST, ssl=True)
    async with aiohttp.ClientSession(
        connector=connector,
        headers={"User-Agent": _USER_AGENT, "Accept": "text/html,*/*;q=0.8"},
    ) as session:
        results = await asyncio.gather(
            *(_fetch_one(session, u) for u in urls), return_exceptions=False
        )
    return [r for r in results if r is not None]


def format_fetched_context(pairs: list[tuple[str, str]]) -> str:
    """Render fetched pages as a section the LLM can cite."""
    if not pairs:
        return ""
    parts = ["The following sources were fetched from the user-provided URLs:"]
    for url, text in pairs:
        parts.append(f"\n--- Source: {url} ---\n{text}")
    return "\n".join(parts)


async def enrich_context_with_urls(content: str | None) -> tuple[str, list[str]]:
    """Detect URLs in user content, fetch them, return (extra_context, fetched_urls).

    Returns empty string and empty list if no URLs were found or fetched.
    Safe to call unconditionally — it never raises.
    """
    try:
        urls = extract_urls(content)
        if not urls:
            return "", []
        pairs = await fetch_urls_for_context(urls)
        return format_fetched_context(pairs), [u for u, _ in pairs]
    except Exception as e:
        logger.warning("enrich_context_with_urls: unexpected error: %s", e)
        return "", []
