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


AUDIO_ASSETS = {".ogg", ".mp3", ".wav", ".m4a"}
# Scripts using these need Lensmith 0.10 (versionCode 15).
SENSES_RE = re.compile(r"lens\.(sound|music)\s*\(|lens\.(hands|pose)\b")
SENSES_APP_VERSION = 15


MODEL_ASSETS = {".glb"}
MAX_MODEL_BYTES = 5 * 1024 * 1024
MAX_MODEL_TRIANGLES = 60_000
MODELS_APP_VERSION = 16  # 3D models (.glb) on the head
FACE_PAINT_APP_VERSION = 17  # facePaint on the face mesh


def check_glb(path) -> list:
    """Problems with a .glb 3D model (empty list = fine): format, embedded data, size."""
    import json as _json
    import struct as _struct
    data = Path(path).read_bytes()
    if len(data) < 20 or data[:4] != b"glTF" or _struct.unpack_from("<I", data, 4)[0] != 2:
        return ["not a binary glTF 2.0 (.glb) file"]
    length, kind = _struct.unpack_from("<II", data, 12)
    if kind != 0x4E4F534A:
        return ["damaged .glb file"]
    try:
        gltf = _json.loads(data[20:20 + length])
    except ValueError:
        return ["damaged .glb file"]
    errors = []
    for b in gltf.get("buffers", []):
        if "uri" in b:
            errors.append("buffers must be embedded in the .glb (no separate .bin files)")
    for im in gltf.get("images", []):
        if "uri" in im:
            errors.append("textures must be embedded in the .glb")
    triangles = 0
    accessors = gltf.get("accessors", [])
    for mesh in gltf.get("meshes", []):
        for prim in mesh.get("primitives", []):
            if prim.get("mode", 4) != 4:
                continue
            acc = prim.get("indices", prim.get("attributes", {}).get("POSITION"))
            if acc is not None and acc < len(accessors):
                triangles += accessors[acc].get("count", 0) // 3
    if triangles > MAX_MODEL_TRIANGLES:
        errors.append(f"{triangles} triangles (at most {MAX_MODEL_TRIANGLES})")
    return errors


def is_audio(path) -> bool:
    """A real sound file (checked by its first bytes, not just the name)."""
    head = Path(path).read_bytes()[:12]
    return (head.startswith(b"OggS") or head.startswith(b"ID3") or head[:2] in (b"\xff\xfb", b"\xff\xf3", b"\xff\xf2")
            or (head.startswith(b"RIFF") and head[8:12] == b"WAVE") or head[4:8] == b"ftyp")


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
