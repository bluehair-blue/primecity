"""Verify danbooru tags exist with real post counts.

Usage:
    python tools/verify_danbooru_tags.py tag1 "tag with spaces" tag3 ...

Uses Danbooru public API (no auth needed for tag lookup).
Prints: tag_name -> post_count (0 = ghost tag, use something else)
"""
import sys
import json
import time
import urllib.parse
import urllib.request


API = "https://danbooru.donmai.us/tags.json"


def fetch(tag: str) -> int:
    tag_slug = tag.replace(" ", "_")
    url = f"{API}?search[name]={urllib.parse.quote(tag_slug)}"
    req = urllib.request.Request(url, headers={"User-Agent": "tag-verify/1.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
    if not data:
        return 0
    return data[0].get("post_count", 0)


def fuzzy(tag: str, limit: int = 5):
    """Fall back to wildcard search for discovery."""
    tag_slug = tag.replace(" ", "_")
    url = f"{API}?search[name_matches]=*{urllib.parse.quote(tag_slug)}*&search[order]=count&limit={limit}"
    req = urllib.request.Request(url, headers={"User-Agent": "tag-verify/1.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
    return [(t["name"], t["post_count"]) for t in data]


def main(argv):
    if not argv:
        print("Usage: verify_danbooru_tags.py <tag1> <tag2> ...")
        sys.exit(1)
    for tag in argv:
        try:
            count = fetch(tag)
            mark = "OK" if count >= 100 else ("LOW" if count > 0 else "GHOST")
            print(f"[{mark:5s}] {tag:40s} -> {count}")
            if count == 0:
                alts = fuzzy(tag)
                if alts:
                    print("         suggestions:")
                    for n, c in alts:
                        print(f"           {n:40s} ({c})")
            time.sleep(0.4)
        except Exception as e:
            print(f"[ERROR] {tag}: {e}")


if __name__ == "__main__":
    main(sys.argv[1:])
