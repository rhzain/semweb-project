from __future__ import annotations

import os

from flask import Flask

try:
    from .config import FRONTEND_DIST
    from .routes.api_routes import api_bp
    from .routes.frontend_routes import frontend_bp
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from config import FRONTEND_DIST
    from routes.api_routes import api_bp
    from routes.frontend_routes import frontend_bp


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(
        __name__,
        static_folder=str(FRONTEND_DIST / "assets"),
        static_url_path="/assets",
    )
    app.register_blueprint(api_bp)
    app.register_blueprint(frontend_bp)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
