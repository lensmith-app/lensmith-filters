"""Shared rules for Lensmith filter folders (used by validate.py and build.py)."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

FILTERS_DIR = Path("filters")
FORMAT_VERSION = 2  # newest filter.json format this repo accepts

NAME_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,38}$")
ALLOWED_ASSETS = {".png", ".webp", ".jpg", ".jpeg"}
THUMBNAILS = ("thumbnail.png", "thumbnail.webp", "thumbnail.jpg")
SCRIPT_FILE = "script.js"
TOP_LEVEL_FILES = {"filter.json", "listing.json", SCRIPT_FILE, *THUMBNAILS}
MAX_SCRIPT_BYTES = 256 * 1024
SCRIPT_ASSET_RE = re.compile(r"assets/[A-Za-z0-9._-]+")

MAX_ASSET_BYTES = 2 * 1024 * 1024
MAX_FILTER_BYTES = 20 * 1024 * 1024
MAX_IMAGE_SIDE = 2048
MAX_THUMB_SIDE = 512


@dataclass
class Filter:
    creator: str
    slug: str
    path: Path
    filter_json: dict = field(default_factory=dict)
    listing: dict = field(default_factory=dict)

    @property
    def key(self) -> str:
        """Store id, e.g. "janedoe.heart-rain". Unique because folders are per creator."""
        return f"{self.creator}.{self.slug}"

    @property
    def version(self) -> int:
        return int(self.listing.get("version", 0))

    @property
    def tag(self) -> str:
        return f"{self.key}-v{self.version}"

    @property
    def package_name(self) -> str:
        return f"{self.tag}.lensmith"

    @property
    def thumbnail(self) -> Path | None:
        return next((self.path / t for t in THUMBNAILS if (self.path / t).exists()), None)


def find_filters(root: Path = Path(".")) -> list[Filter]:
    found = []
    base = root / FILTERS_DIR
    if not base.exists():
        return found
    for creator_dir in sorted(p for p in base.iterdir() if p.is_dir()):
        for filter_dir in sorted(p for p in creator_dir.iterdir() if p.is_dir()):
            found.append(Filter(creator_dir.name, filter_dir.name, filter_dir))
    return found


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError("must be a JSON object")
    return data


def image_references(node) -> list[str]:
    """Every "image": "assets/..." path used anywhere in filter.json."""
    refs = []
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "image" and isinstance(value, str):
                refs.append(value)
            else:
                refs.extend(image_references(value))
    elif isinstance(node, list):
        for item in node:
            refs.extend(image_references(item))
    return refs
