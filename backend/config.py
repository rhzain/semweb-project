from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root (one level above this backend/ directory)
_env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(_env_path)


PROJECT_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"

SPARQL_ENDPOINT = os.getenv("SPARQL_ENDPOINT", "http://localhost:3030/flora-fauna/sparql")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta").rstrip("/")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
