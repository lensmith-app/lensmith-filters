"""Builds the store: packages, releases, download counts and the published index.

    python tools/build.py --repo lensmith-app/lensmith-filters [--publish]

- Packages every filter as `dist/packages/<creator>.<name>-v<version>.lensmith`.
- With --publish: attaches each new version to its own GitHub Release (via the `gh` CLI).
  GitHub counts downloads of release files, which is how popularity is measured.
- Reads download counts for every release, keeps a daily history (stats/history.json) and
  works out all-time `downloads` and 7-day `trending`.
- Writes the site that GitHub Pages serves: dist/site/index.json, thumbnails, index.html.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import lensmith as L

DIST = Path("dist")
PACKAGES = DIST / "packages"
SITE = DIST / "site"
INDEX_VERSION = 1
HISTORY_DAYS = 45
TRENDING_DAYS = 7


def run(*cmd: str, check: bool = True) -> str:
    return subprocess.run(cmd, capture_output=True, text=True, check=check).stdout


def load_filters() -> list[L.Filter]:
    filters = []
    for f in L.find_filters():
        try:
            f.filter_json = L.load_json(f.path / "filter.json")
            f.listing = L.load_json(f.path / "listing.json")
        except Exception as e:  # validate.py stops these reaching main; skip just in case
            print(f"! skipping {f.key}: {e}", file=sys.stderr)
            continue
        filters.append(f)
    return filters


def package(f: L.Filter) -> Path:
    """Zips a filter folder into a .lensmith file, with its store id written into filter.json."""
    PACKAGES.mkdir(parents=True, exist_ok=True)
    out = PACKAGES / f.package_name
    manifest = dict(f.filter_json, id=f.key)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("filter.json", json.dumps(manifest, ensure_ascii=False, indent=2))
        assets = f.path / "assets"
        if assets.exists():
            for p in sorted(assets.iterdir()):
                if p.is_file():
                    z.write(p, f"assets/{p.name}")
    return out


def releases(repo: str) -> list[dict]:
    out = run(
        "gh", "api", f"repos/{repo}/releases", "--paginate",
        "--jq", ".[] | {tag: .tag_name, assets: [.assets[] | {name, count: .download_count}]} | tojson",
    )
    return [json.loads(line) for line in out.splitlines() if line.strip()]


def publish_missing(repo: str, filters: list[L.Filter], existing: set[str]) -> None:
    for f in filters:
        if f.tag in existing:
            continue
        name = f.filter_json.get("name", f.slug)
        notes = f.listing.get("description", "") or f"{name} for Lensmith."
        print(f"→ releasing {f.tag}")
        run(
            "gh", "release", "create", f.tag, str(PACKAGES / f.package_name),
            "--repo", repo, "--title", f"{name} v{f.version} ({f.creator})", "--notes", notes,
        )


def download_counts(release_list: list[dict]) -> dict[str, int]:
    totals: dict[str, int] = {}
    for r in release_list:
        for a in r["assets"]:
            if a["name"].endswith(".lensmith"):
                key = a["name"][: -len(".lensmith")].rsplit("-v", 1)[0]
                totals[key] = totals.get(key, 0) + int(a["count"])
    return totals


def update_history(path: Path, totals: dict[str, int]) -> tuple[dict, dict[str, int]]:
    history = json.loads(path.read_text()) if path.exists() else {}
    today = dt.datetime.now(dt.timezone.utc).date()
    history[today.isoformat()] = totals
    cutoff = (today - dt.timedelta(days=HISTORY_DAYS)).isoformat()
    history = {d: v for d, v in sorted(history.items()) if d >= cutoff}

    # Compare with the snapshot from a week ago (or the oldest we have).
    week_ago = (today - dt.timedelta(days=TRENDING_DAYS)).isoformat()
    older = [d for d in history if d <= week_ago] or sorted(history)[:1]
    baseline = history[older[-1]] if older else {}
    trending = {k: max(0, v - baseline.get(k, 0)) for k, v in totals.items()}
    return history, trending


def last_updated(f: L.Filter) -> str:
    return run("git", "log", "-1", "--format=%cI", "--", f.path.as_posix(), check=False).strip() or \
        dt.datetime.now(dt.timezone.utc).isoformat()


def build_site(repo: str, filters: list[L.Filter], totals: dict[str, int], trending: dict[str, int]) -> None:
    owner, name = repo.split("/")
    site_url = f"https://{owner}.github.io/{name}"
    if SITE.exists():
        shutil.rmtree(SITE)
    (SITE / "thumbs").mkdir(parents=True)

    entries = []
    for f in filters:
        thumb = None
        if f.thumbnail:
            target = SITE / "thumbs" / f"{f.key}{f.thumbnail.suffix}"
            shutil.copy(f.thumbnail, target)
            thumb = f"{site_url}/thumbs/{target.name}"
        fj = f.filter_json
        entries.append({
            "id": f.key,
            "creator": f.creator,
            "name": fj.get("name", f.slug),
            "description": f.listing.get("description", ""),
            "tags": f.listing.get("tags", []),
            "version": f.version,
            "minAppVersion": fj.get("minAppVersion", 1),
            "package": f"https://github.com/{repo}/releases/download/{f.tag}/{f.package_name}",
            "size": (PACKAGES / f.package_name).stat().st_size,
            "thumbnail": thumb,
            "icon": next((s["emoji"] for s in fj.get("stickers", []) if "emoji" in s), None),
            "interactive": bool(fj.get("rules") or fj.get("game")),
            "downloads": totals.get(f.key, 0),
            "trending": trending.get(f.key, 0),
            "updated": last_updated(f),
        })
    entries.sort(key=lambda e: (-e["trending"], -e["downloads"], e["name"].lower()))

    index = {
        "formatVersion": INDEX_VERSION,
        "generated": dt.datetime.now(dt.timezone.utc).isoformat(),
        "repo": repo,
        "filters": entries,
    }
    (SITE / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    (SITE / "index.html").write_text(render_html(entries, repo), encoding="utf-8")
    (SITE / ".nojekyll").write_text("")


def render_html(entries: list[dict], repo: str) -> str:
    rows = "\n".join(
        f"<li><span class='icon'>{html.escape(e['icon'] or '✨')}</span>"
        f"<div><b>{html.escape(e['name'])}</b> <small>by {html.escape(e['creator'])} · v{e['version']}</small>"
        f"<p>{html.escape(e['description'])}</p></div>"
        f"<span class='dl'>⬇ {e['downloads']}</span></li>"
        for e in entries
    )
    return f"""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Lensmith Filters</title>
<style>body{{font-family:system-ui,sans-serif;background:#111;color:#eee;max-width:720px;margin:auto;padding:16px}}
a{{color:#ff8a3d}}ul{{list-style:none;padding:0}}li{{display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid #333}}
.icon{{font-size:32px}}div{{flex:1}}p{{margin:4px 0 0;color:#aaa}}small{{color:#888}}.dl{{color:#ff8a3d}}</style></head>
<body><h1>Lensmith Filters</h1><p>Open these in the Lensmith app's Store. Want to add yours?
<a href="https://github.com/{repo}/blob/main/CONTRIBUTING.md">Here's how</a>.</p><ul>{rows}</ul></body></html>"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--publish", action="store_true", help="create GitHub Releases for new versions")
    parser.add_argument("--history", default="stats/history.json")
    args = parser.parse_args()

    filters = load_filters()
    for f in filters:
        package(f)

    release_list = releases(args.repo) if args.publish else []
    if args.publish:
        publish_missing(args.repo, filters, {r["tag"] for r in release_list})
        release_list = releases(args.repo)

    totals = download_counts(release_list)
    history_path = Path(args.history)
    history, trending = update_history(history_path, totals)
    history_path.parent.mkdir(parents=True, exist_ok=True)
    history_path.write_text(json.dumps(history, indent=1))

    build_site(args.repo, filters, totals, trending)
    print(f"✓ built {len(filters)} filter(s) → {SITE}/index.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
