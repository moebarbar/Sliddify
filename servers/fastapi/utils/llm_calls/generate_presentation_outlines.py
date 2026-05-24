from datetime import datetime
from typing import Optional

from llmai import get_client
from llmai.shared import (
    JSONSchemaResponse,
    Message,
    ResponseStreamCompletionChunk,
    SystemMessage,
    UserMessage,
    WebSearchTool,
)

from models.presentation_outline_model import PresentationOutlineModel
from utils.get_dynamic_models import get_presentation_outline_model_with_n_slides
from utils.llm_client_error_handler import handle_llm_client_exceptions
from utils.llm_config import enable_web_grounding, get_llm_config
from utils.llm_provider import get_model
from utils.llm_utils import (
    get_generate_kwargs,
    serialize_structured_content,
    stream_generate_events,
)
from utils.schema_utils import prepare_schema_for_validation


def get_system_prompt(
    verbosity: Optional[str] = None,
    include_title_slide: bool = True,
    include_table_of_contents: bool = False,
):
    verbosity_instruction = (
        "Each slide's body content should be around 20 words — punchy, no filler."
        if verbosity == "concise"
        else (
            "Each slide's body content should be around 60 words — dense but still scannable."
            if verbosity == "text-heavy"
            else "Each slide's body content should be around 40 words — concrete and confident."
        )
    )

    title_slide_instruction = (
        "Include presenter name in the first slide."
        if include_title_slide
        else "Do not include a presenter name in any slide."
    )

    toc_instruction = (
        "Include a table of contents slide in the outline sequence."
        if include_table_of_contents
        else ""
    )
    toc_block = f"{toc_instruction}\n" if toc_instruction else ""

    slide_outline_structure = (
        "Each slide content:\n"
        "   - Must have a `## title`.\n"
        "   - Must be in Markdown format.\n"
        "   - Don't use **bold** or __italic__ text.\n"
        "   - The first slide title must equal the presentation title.\n"
    )

    system = (
        # --- Role ---
        "You are an expert presentation writer. Your output is the outline (titles + body) "
        "for a slide deck. Another system will visually lay out each slide; do NOT include "
        "design, color, or branding hints.\n\n"

        # --- Output contract (preserves all existing structural requirements) ---
        "Generate the presentation title and the markdown content for each slide.\n"
        "Generate the deck flow based on the user **content** and use **context** as supporting reference.\n"
        "The presentation title is plain text, not markdown — concise, specific, no ALL CAPS.\n"
        f"{verbosity_instruction}\n"
        f"{slide_outline_structure}\n"

        # --- Quality bar: be specific, not generic ---
        "QUALITY RULES (these matter most):\n"
        "1. **Be specific.** Use the actual names, numbers, dates, places, products, and quotes "
        "from the provided content/context. Generic phrases like \"various stakeholders\", "
        "\"many challenges\", \"in today's world\", or \"key insights\" are forbidden — replace "
        "them with the real thing.\n"
        "2. **Every slide needs a single sharp idea.** State it in the title. The body supports "
        "that idea with evidence (numbers, examples, quotes). One claim, then proof.\n"
        "3. **Use real numbers.** When citing data, give the figure, the source (if known), and "
        "the year. \"Revenue grew 47% in 2024 (Q3 earnings)\" beats \"Revenue grew significantly.\"\n"
        "4. **Avoid these banned filler phrases**: \"in today's fast-paced world\", \"in conclusion\", "
        "\"it is important to note\", \"various\", \"numerous\", \"a wide range of\", \"delve into\", "
        "\"leverage\", \"unlock\", \"unleash\", \"navigate the complexities of\", \"in the realm of\", "
        "\"key takeaways\", \"thank you\".\n"
        "5. **Open with a hook, close with a clear next step.** The first content slide (after the "
        "title) should be the most attention-grabbing fact, question, or claim. The final slide "
        "should be a concrete call to action or decision the audience needs to make — not a "
        "thank-you slide.\n"
        "6. **Logical flow.** Each slide should naturally set up the next. Avoid repeating the "
        "same point in different words across slides.\n"

        # --- Tone & instructions ---
        "FOLLOWING USER INSTRUCTIONS:\n"
        "- Follow user instructions literally without reinterpretation.\n"
        "- Slide-specific instructions apply to the exact slide mentioned, only once. "
        "Do not generalize patterns across multiple slides unless explicitly requested.\n"
        "- Match the user's specified tone across all slides. If no tone is given, write in a "
        "clear, confident, professional voice — assume the audience is busy and intelligent.\n"

        # --- Factual grounding ---
        "FACTUAL GROUNDING:\n"
        "- Treat the provided **content** and **context** as the source of truth. The context "
        "may include fetched text from URLs the user mentioned — those are first-class sources, "
        "cite them in your writing where appropriate.\n"
        "- If the user mentions a specific company, product, person, or website, and the context "
        "does not cover it adequately, USE THE WEB SEARCH TOOL to look it up before writing. "
        "Verify names, spelling, current product names, prices, dates, and any statistics.\n"
        "- Use the web search tool any time the request involves current events, market data, "
        "competitor information, recent product launches, or anything that may have changed in "
        "the last 12 months.\n"
        "- If you can't verify a specific number or fact, omit it rather than invent one. "
        "It's better to make a qualitative claim than to fabricate a precise figure.\n"

        # --- Data, code, URLs ---
        "FORMATTING DETAILS:\n"
        "- Include numerical data, tables, or code blocks when relevant or requested.\n"
        "- Only include URLs that appear in the provided content/context or that you find via the "
        "web search tool — never invent URLs.\n"
        "- Keep numerical figures consistent across slides — don't say \"$5M ARR\" on one slide "
        "and \"$4.8M revenue\" on another for the same metric.\n"

        # --- Title/TOC flags ---
        f"{title_slide_instruction}\n"
        f"{toc_block}"
        "Slide content must not contain any presentation branding/styling information.\n"
        "The title slide must only contain title, presenter name, date, and a one-line overview.\n"
        "If language is set to 'auto-detect', detect it from the content/context.\n"
    )

    return system


def _resolve_prompt_language(language: Optional[str]) -> str:
    if language is None:
        return "auto-detect"
    s = str(language).strip()
    if not s:
        return "auto-detect"
    if s.lower() in {"auto", "auto-detect"}:
        return "auto-detect"
    return s


def _resolve_prompt_n_slides(n_slides: Optional[int]) -> str:
    if n_slides is None:
        return "auto-detect"
    return str(n_slides)


def get_user_prompt(
    content: str,
    n_slides: Optional[int],
    language: Optional[str],
    additional_context: Optional[str] = None,
    tone: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
    include_table_of_contents: bool = False,
):
    display_language = _resolve_prompt_language(language)
    display_slides = _resolve_prompt_n_slides(n_slides)
    toc_text = f"Include Table Of Contents: {str(include_table_of_contents).lower()}\n"
    return (
        f"Content: {content or ''}\n"
        f"Number of Slides: {display_slides}\n"
        f"Language: {display_language}\n"
        f"Tone: {tone or ''}\n"
        f"Today's Date: {datetime.now().strftime('%Y-%m-%d')}\n"
        f"Include Title Slide: {include_title_slide}\n"
        f"{toc_text if include_table_of_contents else ''}"
        f"Instructions: {instructions or ''}\n"
        f"Context: {additional_context or 'None'}\n"
    )


def get_messages(
    content: str,
    n_slides: Optional[int],
    language: Optional[str],
    additional_context: Optional[str] = None,
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
    include_table_of_contents: bool = False,
) -> list[Message]:
    return [
        SystemMessage(
            content=get_system_prompt(
                verbosity,
                include_title_slide,
                include_table_of_contents,
            ),
        ),
        UserMessage(
            content=get_user_prompt(
                content,
                n_slides,
                language,
                additional_context,
                tone,
                instructions,
                include_title_slide,
                include_table_of_contents,
            ),
        ),
    ]


async def generate_ppt_outline(
    content: str,
    n_slides: Optional[int],
    language: Optional[str] = None,
    additional_context: Optional[str] = None,
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
    web_search: bool = False,
    include_table_of_contents: bool = False,
):
    model = get_model()
    response_model = (
        get_presentation_outline_model_with_n_slides(n_slides)
        if n_slides is not None
        else PresentationOutlineModel
    )

    client = get_client(config=get_llm_config())
    use_search_tool = web_search

    try:
        outline_schema = prepare_schema_for_validation(
            response_model.model_json_schema(),
            strict=True,
        )
        response_format = JSONSchemaResponse(
            name="response",
            json_schema=outline_schema,
            strict=True,
        )
        emitted_content = False
        async for event in stream_generate_events(
            client,
            **get_generate_kwargs(
                model=model,
                messages=get_messages(
                    content,
                    n_slides,
                    language,
                    additional_context,
                    tone,
                    verbosity,
                    instructions,
                    include_title_slide,
                    include_table_of_contents,
                ),
                response_format=response_format,
                tools=([WebSearchTool()] if use_search_tool else None),
                stream=True,
            ),
        ):
            if getattr(event, "type", None) == "content":
                chunk = getattr(event, "chunk", None)
                if chunk:
                    emitted_content = True
                    yield chunk
            elif (
                isinstance(event, ResponseStreamCompletionChunk) and not emitted_content
            ):
                final_content = serialize_structured_content(event.content)
                if final_content:
                    yield final_content
    except Exception as e:
        yield handle_llm_client_exceptions(e)
