from __future__ import annotations

import json
from typing import Any

import requests

try:
    from ..config import GEMINI_API_KEY, GEMINI_BASE_URL, GEMINI_MODEL
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from config import GEMINI_API_KEY, GEMINI_BASE_URL, GEMINI_MODEL


AI_EXPLANATION_PROMPT_TEMPLATE = """
Anda adalah AI Assistant untuk Semantic Web flora-fauna (WikiFF adalah nama aplikasi ini).

Peran Anda:
- Menjelaskan hasil query SPARQL dengan singkat, padat, dan informatif.
- Jangan bertele-tele. Langsung berikan intisari dan penjelasan yang bermakna.
- Format jawaban secara penuh menggunakan Markdown (tabel, list terstruktur, bold, dll) untuk mempermudah pembacaan.
- Hanya gunakan data dari konteks JSON. Jangan mengarang fakta tambahan di luar konteks.

Tugas:
{task}

Konteks JSON:
{context_json}
"""


def build_ai_prompt(task: str, context: dict[str, Any]) -> str:
    """Create the Gemini prompt from task metadata and SPARQL context."""
    context_json = json.dumps(context, ensure_ascii=False, indent=2)
    return AI_EXPLANATION_PROMPT_TEMPLATE.format(task=task, context_json=context_json)


def call_gemini(prompt: str) -> tuple[str | None, str | None]:
    """Call Gemini and return either generated text or a readable error."""
    if not GEMINI_API_KEY:
        return None, "GEMINI_API_KEY belum diset. Fitur AI Explanation Assistant bersifat opsional."

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2},
    }
    try:
        response = requests.post(
            f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent",
            headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        parts = data["candidates"][0]["content"]["parts"]
        text = "\n".join(part.get("text", "") for part in parts).strip()
        return text or None, None
    except Exception as exc:  # External API can fail independently from the app.
        return None, str(exc)


def make_ai_response(task: str, context: dict[str, Any]) -> dict[str, Any]:
    """Wrap Gemini output with metadata used by the frontend."""
    prompt = build_ai_prompt(task, context)
    answer, error = call_gemini(prompt)
    return {
        "answer": answer,
        "error": error,
        "mode": "gemini" if answer else "disabled",
        "model": GEMINI_MODEL,
        "promptTemplate": AI_EXPLANATION_PROMPT_TEMPLATE.strip(),
        "context": context,
    }
