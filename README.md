# Sliddify

**AI-powered presentation generator.** Generate editable PPTX/PDF decks from a prompt or uploaded documents, using your own API keys (OpenAI, Gemini, Anthropic, Vertex, Azure, Ollama, or any OpenAI-compatible endpoint).

> Sliddify is a fork of [Presenton](https://github.com/presenton/presenton), released under Apache 2.0. See [NOTICE](NOTICE) and [LICENSE](LICENSE) for attribution and third-party credits.

---

## ⚡ Quick start (local Docker)

```bash
git clone https://github.com/YOUR_GH_USER/sliddify.git
cd sliddify
cp .env.example .env          # fill in API keys
docker build -t sliddify .
docker run -it --rm \
  --name sliddify \
  -p 5000:80 \
  --env-file .env \
  -v "./app_data:/app_data" \
  sliddify
```

Then open <http://localhost:5000>.

> First boot will preseed an admin account from `AUTH_USERNAME` / `AUTH_PASSWORD` in your `.env`.

---

## ☁️ Deploy on Railway

1. Push this repo to GitHub (see "Push to GitHub" below).
2. Go to **railway.app → New Project → Deploy from GitHub repo** and pick your `sliddify` repo.
3. Railway auto-detects [Dockerfile](Dockerfile) via [railway.json](railway.json). The build takes ~5-10 min the first time.
4. Under **Variables**, paste the values from your `.env.example` (at minimum: `LLM`, the matching API key, `AUTH_USERNAME`, `AUTH_PASSWORD`).
5. Under **Settings → Networking**, click **Generate Domain**. Railway maps your `*.up.railway.app` URL to the container's port 80.
6. Add a persistent **Volume** mounted at `/app_data` so generated decks, the database, and user config survive redeploys.

### Required Railway env vars (minimum)

| Var | Example | Purpose |
|---|---|---|
| `LLM` | `openai` | Text model backend |
| `OPENAI_API_KEY` | `sk-…` | API key for the chosen backend |
| `IMAGE_PROVIDER` | `pexels` | Slide image source |
| `PEXELS_API_KEY` | `…` | Or `OPENAI_API_KEY` for `dall-e-3`, etc. |
| `AUTH_USERNAME` | `admin` | First-boot admin login |
| `AUTH_PASSWORD` | `≥6 chars` | First-boot admin password |

See [.env.example](.env.example) and [docker-compose.yml](docker-compose.yml) for the full list (Vertex, Azure, Anthropic, Ollama, ComfyUI, etc.).

---

## 🧠 What's in the box

- **AI deck generation** from prompts, markdown outlines, or uploaded files (PDF/DOCX/CSV)
- **Multi-provider LLMs** — OpenAI, Google, Vertex, Azure, Anthropic, Ollama, custom OpenAI-compatible
- **Multi-provider images** — Pexels, Pixabay, DALL·E 3, Gemini Flash, ComfyUI, Open WebUI
- **Editable templates** — HTML + Tailwind; bring your own
- **PPTX & PDF export** with professional formatting
- **HTTP API** at `/api/v1/ppt/presentation/generate` (HTTP Basic auth)
- **MCP server** built in
- **Presentation memory** (Mem0 OSS, scoped per deck)

---

## 🔌 API usage

```bash
curl -u admin:yourpassword \
  -X POST https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/v1/ppt/presentation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Introduction to Machine Learning",
    "n_slides": 5,
    "language": "English",
    "template": "general",
    "export_as": "pptx"
  }'
```

Response:

```json
{
  "presentation_id": "uuid",
  "path": "/app_data/uuid/Introduction_to_Machine_Learning.pptx",
  "edit_path": "/presentation?id=uuid"
}
```

Prepend your Railway URL to `path` and `edit_path` for valid links.

Full API parameters (tone, verbosity, web_search, files, etc.) are documented in [Presenton's upstream docs](https://docs.presenton.ai/using-presenton-api) — most behavior is identical.

---

## 🛠 Local development (no Docker)

Requires Node.js 20+, Python 3.11, and [`uv`](https://docs.astral.sh/uv/).

```bash
cd electron
npm run setup:env   # installs node deps + uv sync + Next.js deps
npm run dev         # boots FastAPI + Next.js inside Electron
```

---

## 📤 Push to GitHub

```bash
# In the Sliddify/ folder, after git init:
gh repo create sliddify --public --source=. --remote=origin --push
# or, manually:
# git remote add origin git@github.com:YOUR_GH_USER/sliddify.git
# git push -u origin main
```

After pushing, replace `YOUR_GH_USER` placeholders in [package.json](package.json) and [electron/package.json](electron/package.json).

---

## 🎨 Branding

Placeholder logos live in [servers/nextjs/public/sliddify-logo.svg](servers/nextjs/public/sliddify-logo.svg), [servers/nextjs/public/sliddify-mark.svg](servers/nextjs/public/sliddify-mark.svg), and [servers/nextjs/app/icon1.svg](servers/nextjs/app/icon1.svg). Swap them with your own design (same filenames = no code changes needed). The favicon `.png`/`.ico` files in `servers/nextjs/app/` still carry the upstream icon — regenerate them with your logo.

---

## 📄 License & attribution

Apache 2.0. Forked from [Presenton](https://github.com/presenton/presenton). Original copyright and third-party notices retained in [LICENSE](LICENSE) and [NOTICE](NOTICE).
