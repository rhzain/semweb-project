from __future__ import annotations

from flask import Blueprint, send_from_directory

try:
    from ..config import FRONTEND_DIST
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from config import FRONTEND_DIST


frontend_bp = Blueprint("frontend", __name__)


@frontend_bp.get("/")
@frontend_bp.get("/data")
@frontend_bp.get("/species/<path:_species_id>")
@frontend_bp.get("/compare")
@frontend_bp.get("/graph")
def serve_frontend(_species_id: str | None = None):
    """Serve the React build for all frontend routes."""
    index_file = FRONTEND_DIST / "index.html"
    if not index_file.exists():
        return (
            "Frontend build belum tersedia. Jalankan `npm install && npm run build` "
            "di folder frontend, atau gunakan `docker compose up --build`.",
            503,
        )
    return send_from_directory(FRONTEND_DIST, "index.html")
