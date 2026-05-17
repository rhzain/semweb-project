from __future__ import annotations

import json
from typing import Any

import requests

try:
    from ..config import GEMINI_API_KEY, GEMINI_BASE_URL, GEMINI_MODEL
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from config import GEMINI_API_KEY, GEMINI_BASE_URL, GEMINI_MODEL


AI_EXPLANATION_PROMPT_TEMPLATE = """
Anda adalah AI Explanation Assistant untuk aplikasi leksikon flora-fauna berbasis Semantic Web.

Peran Anda:
- Menjelaskan hasil query SPARQL dalam bahasa Indonesia yang natural.
- Menggunakan hanya data yang tersedia pada konteks JSON.
- Tidak menambahkan fakta, angka, habitat, status konservasi, atau relasi yang tidak ada dalam konteks.
- Jika sebuah fakta tidak tersedia di konteks, tulis bahwa data tersebut tidak tersedia.
- Tekankan bahwa data utama berasal dari Knowledge Graph/RDF/SPARQL, sedangkan Anda hanya membuat penjelasan natural language.

Jenis tugas:
{task}

Konteks hasil SPARQL dalam JSON:
{context_json}

Tulis jawaban ringkas, jelas, dan cocok untuk presentasi proyek Semantic Web.
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
