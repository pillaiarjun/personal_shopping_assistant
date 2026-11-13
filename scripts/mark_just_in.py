#!/usr/bin/env python3
"""Mark about 1 in 9 products as "Just in" (simulated, like price and sale).

Spread evenly across men's and women's and every category, skipping socks and underwear.
Deterministic: the same products are picked every run. Sets simulated.just_in on every
product in data/catalog/products.json, then rebuild agent-catalog.json.

Run from the repo root: python3 -I scripts/mark_just_in.py && python3 -I scripts/build_agent_catalog.py
"""
import collections
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "catalog" / "products.json"
SHARE = 1 / 9
SKIP = {"Socks", "Underwear"}


def rank(pid):
    return hashlib.md5(f"just-in:{pid}".encode()).hexdigest()


def main():
    products = json.loads(SRC.read_text())
    groups = collections.defaultdict(list)
    for p in products:
        if p["category"] not in SKIP:
            groups[(p["gender"], p["category"])].append(p)
    picked = set()
    for items in groups.values():
        n = max(1, round(len(items) * SHARE))
        picked.update(p["id"] for p in sorted(items, key=lambda p: rank(p["id"]))[:n])
    for p in products:
        p["simulated"]["just_in"] = p["id"] in picked
    SRC.write_text(json.dumps(products, indent=1, ensure_ascii=False) + "\n")
    men = sum(1 for p in products if p["id"] in picked and p["gender"] == "men")
    print(f"{len(picked)} of {len(products)} marked just in ({men} men's, {len(picked) - men} women's)")


if __name__ == "__main__":
    main()
