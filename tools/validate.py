"""Checks filter folders in a pull request.

    python tools/validate.py --base origin/main --author <github-login> --association <author_association>

Every filter is checked for format, files, sizes and references. Folders changed by the pull
request must also belong to its author (maintainers may edit anyone's) and raise their version.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from PIL import Image

import lensmith as L

MAINTAINER_ROLES = {"MAINTAINER", "OWNER", "MEMBER", "COLLABORATOR"}


def changed_filter_dirs(base: str) -> set[tuple[str, str]]:
    out = subprocess.run(
        ["git", "diff", "--name-only", f"{base}...HEAD"], capture_output=True, text=True, check=True
    ).stdout
    dirs = set()
    for line in out.splitlines():
        parts = Path(line).parts
        if not parts or parts[0] != "filters":
            continue
        if len(parts) >= 3:
            dirs.add((parts[1], parts[2]))
        elif len(parts) == 2:
            # A loose file under filters/<creator>/ still counts toward that creator.
            dirs.add((parts[1], ""))
    return dirs


def version_on_base(base: str, f: L.Filter) -> int | None:
    result = subprocess.run(
        ["git", "show", f"{base}:{(f.path / 'listing.json').as_posix()}"], capture_output=True, text=True
    )
    if result.returncode != 0:
        return None  # new filter
    import json

    try:
        return int(json.loads(result.stdout).get("version", 0))
    except Exception:
        return 0


def check_filter(f: L.Filter) -> list[str]:
    errors = []
    where = f"filters/{f.creator}/{f.slug}"

    if not L.NAME_RE.match(f.creator) or not L.NAME_RE.match(f.slug):
        errors.append(f"{where}: folder names must be lowercase letters, numbers and dashes")

    # Files
    total = 0
    for p in f.path.rglob("*"):
        if p.is_dir():
            continue
        rel = p.relative_to(f.path).as_posix()
        size = p.stat().st_size
        total += size
        if "/" not in rel:
            if rel not in L.TOP_LEVEL_FILES:
                errors.append(f"{where}/{rel}: unexpected file (allowed: filter.json, listing.json, script.js, thumbnail, assets/)")
            elif rel == L.SCRIPT_FILE and size > L.MAX_SCRIPT_BYTES:
                errors.append(f"{where}/{rel}: larger than 256 KB")
        elif rel.startswith("assets/") and rel.count("/") == 1:
            if p.suffix.lower() not in L.ALLOWED_ASSETS | L.AUDIO_ASSETS:
                errors.append(f"{where}/{rel}: only png, webp and jpg pictures and ogg, mp3, wav and m4a sounds are allowed")
            elif size > L.MAX_ASSET_BYTES:
                errors.append(f"{where}/{rel}: larger than 2 MB")
            elif p.suffix.lower() in L.AUDIO_ASSETS:
                if not L.is_audio(p):
                    errors.append(f"{where}/{rel}: not a readable sound file")
            else:
                errors.extend(check_image(p, L.MAX_IMAGE_SIDE, f"{where}/{rel}"))
        else:
            errors.append(f"{where}/{rel}: files must be at the top level or directly in assets/")
    if total > L.MAX_FILTER_BYTES:
        errors.append(f"{where}: the whole filter is larger than 20 MB")
    if f.thumbnail:
        errors.extend(check_image(f.thumbnail, L.MAX_THUMB_SIDE, f"{where}/{f.thumbnail.name}"))

    # filter.json
    try:
        fj = L.load_json(f.path / "filter.json")
        f.filter_json = fj
    except FileNotFoundError:
        errors.append(f"{where}: missing filter.json")
        fj = None
    except Exception as e:
        errors.append(f"{where}/filter.json: not valid JSON ({e})")
        fj = None
    if fj is not None:
        name = fj.get("name")
        if not isinstance(name, str) or not 1 <= len(name.strip()) <= 24:
            errors.append(f"{where}/filter.json: name must be 1-24 characters")
        version = fj.get("formatVersion", 1)
        if not isinstance(version, int) or version > L.FORMAT_VERSION:
            errors.append(f"{where}/filter.json: formatVersion {version} is newer than this store supports ({L.FORMAT_VERSION})")
        for ref in L.image_references(fj):
            target = (f.path / ref).resolve()
            if not ref.startswith("assets/") or f.path.resolve() not in target.parents:
                errors.append(f"{where}/filter.json: picture '{ref}' must be inside assets/")
            elif not target.exists():
                errors.append(f"{where}/filter.json: picture '{ref}' is missing from assets/")
        script = f.path / L.SCRIPT_FILE
        if "script" in fj:
            if fj["script"] != L.SCRIPT_FILE:
                errors.append(f'{where}/filter.json: "script" must be "{L.SCRIPT_FILE}"')
            elif not script.exists():
                errors.append(f"{where}: filter.json uses a script but script.js is missing")
            else:
                try:
                    source = script.read_text(encoding="utf-8")
                except UnicodeDecodeError:
                    errors.append(f"{where}/script.js: must be UTF-8 text")
                    source = ""
                for ref in sorted(set(L.SCRIPT_ASSET_RE.findall(source))):
                    if not (f.path / ref).exists():
                        errors.append(f"{where}/script.js: picture '{ref}' is missing from assets/")
        elif script.exists():
            errors.append(f'{where}: script.js is present but filter.json has no "script": "script.js"')

    # listing.json
    try:
        listing = L.load_json(f.path / "listing.json")
        f.listing = listing
        if not isinstance(listing.get("version"), int) or listing["version"] < 1:
            errors.append(f"{where}/listing.json: version must be a whole number, 1 or more")
        desc = listing.get("description", "")
        if not isinstance(desc, str) or len(desc) > 200:
            errors.append(f"{where}/listing.json: description must be text, at most 200 characters")
        tags = listing.get("tags", [])
        if not isinstance(tags, list) or len(tags) > 8 or not all(isinstance(t, str) and len(t) <= 20 for t in tags):
            errors.append(f"{where}/listing.json: tags must be a list of up to 8 short words")
    except FileNotFoundError:
        errors.append(f"{where}: missing listing.json (see CONTRIBUTING.md)")
    except Exception as e:
        errors.append(f"{where}/listing.json: not valid JSON ({e})")

    return errors


def check_image(path: Path, max_side: int, label: str) -> list[str]:
    try:
        with Image.open(path) as img:
            img.verify()
        with Image.open(path) as img:
            w, h = img.size
    except Exception:
        return [f"{label}: not a readable picture"]
    if max(w, h) > max_side:
        return [f"{label}: {w}x{h} is too big (max {max_side}px on the longest side)"]
    return []


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="origin/main")
    parser.add_argument("--author", default="")
    parser.add_argument("--association", default="")
    args = parser.parse_args()

    filters = L.find_filters()
    errors = []
    for f in filters:
        errors.extend(check_filter(f))

    if args.author:
        maintainer = args.association.upper() in MAINTAINER_ROLES
        author = args.author.lower()
        by_key = {(f.creator, f.slug): f for f in filters}
        for creator, slug in sorted(changed_filter_dirs(args.base)):
            if not maintainer and creator != author:
                errors.append(f"filters/{creator}/: you can only add or change filters in filters/{author}/")
            f = by_key.get((creator, slug))
            if f is None or not f.listing:
                continue
            old = version_on_base(args.base, f)
            if old is not None and f.version <= old:
                errors.append(f"filters/{creator}/{slug}: changed, so raise version in listing.json above {old}")

    if errors:
        print("Some checks failed:\n")
        for e in errors:
            print(f"  ✗ {e}")
            print(f"::error::{e}")
        return 1
    print(f"✓ {len(filters)} filter(s) look good.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
