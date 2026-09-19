#!/usr/bin/env python3
"""Verify recorded launch recipes against pinned GitHub manifests; never run them."""
import argparse
import base64
import json
import re
import sys
import subprocess
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("catalog", nargs="?", default="catalog/apps.json", type=Path)
parser.add_argument("--changed-only", action="store_true")
args = parser.parse_args()
catalog = json.loads(args.catalog.read_text())
previous = {}
if args.changed_only:
    baseline = json.loads(subprocess.check_output(["git", "show", "HEAD:catalog/apps.json"], text=True))
    previous = {a["id"]: a for a in baseline["apps"]}
errors = []
for app in catalog["apps"]:
    if previous.get(app["id"]) == app:
        continue
    c = app["compatibility"]
    if c["status"] not in ("source-reviewed", "verified"):
        continue
    try:
        repo = app["repository"].removeprefix("https://github.com/")
        if not re.fullmatch(r"[A-Za-z0-9_][A-Za-z0-9_.-]*/[A-Za-z0-9_][A-Za-z0-9_.-]*", repo):
            raise ValueError("Invalid repository")
        if not re.fullmatch(r"[a-f0-9]{40}", c["commit"]):
            raise ValueError("Invalid source commit")
        launch = c["launch"]
        manifest_path = launch["packagePath"]
        if not re.fullmatch(r"(?:[A-Za-z0-9_@.-]+/)*package\.json", manifest_path) or ".." in manifest_path.split("/"):
            raise ValueError("Invalid package manifest path")
        url = f"https://api.github.com/repos/{repo}/contents/{quote(manifest_path, safe='/')}?ref={c['commit']}"
        request = Request(url, headers={"Accept":"application/vnd.github+json", "User-Agent":"Oven-Source-Verification/1"})
        with urlopen(request, timeout=30) as response:
            raw = response.read(2 * 1024 * 1024 + 1)
        if len(raw) > 2 * 1024 * 1024:
            raise ValueError("Manifest response too large")
        payload = json.loads(raw)
        if payload.get("encoding") != "base64":
            raise ValueError("No readable manifest")
        package = json.loads(base64.b64decode(payload["content"]))
        expected = {"packageName":package.get("name"), "script":app["preferredScript"], "command":package.get("scripts",{}).get(app["preferredScript"]), "packageManager":package.get("packageManager")}
        if not expected["command"] or package.get("name") != app["packageName"]:
            raise ValueError("Catalog launch target does not match the pinned package")
        for key, value in expected.items():
            if launch.get(key) != value:
                raise ValueError(f"Recorded {key} does not match upstream")
        license_url = f"https://api.github.com/repos/{repo}/license?ref={c['commit']}"
        request = Request(license_url, headers={"Accept":"application/vnd.github+json", "User-Agent":"Oven-Source-Verification/1"})
        with urlopen(request, timeout=30) as response:
            raw = response.read(2 * 1024 * 1024 + 1)
        if len(raw) > 2 * 1024 * 1024:
            raise ValueError("License response too large")
        detected = json.loads(raw).get("license",{}).get("spdx_id")
        if detected in (None, "NOASSERTION") or detected != app["editorial"]["license"]:
            raise ValueError("Recorded license does not match the pinned upstream license identification")
        print(f"PASS {app['id']}: pinned launch manifest matches (not a runtime test)")
    except Exception as error:
        errors.append(f"{app['id']}: {error}")
if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)
