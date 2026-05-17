from __future__ import annotations

import re
import unicodedata


def slugify(value: str) -> str:
    """Create a stable URI-safe identifier from text."""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^A-Za-z0-9]+", "_", ascii_value.lower()).strip("_")
    return slug or "unknown"

