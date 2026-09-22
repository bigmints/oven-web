#!/usr/bin/env python3
"""Bounded, read-only candidate inspection. Never imports or executes upstream code."""
import argparse
import base64
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

LIMIT = 2 * 1024 * 1024

def fetch(endpoint):
    request = Request("https://api.github.com/" + endpoint, headers={
        "Accept": "application/vnd.github+json", "User-Agent": "PicoRunner-Curator/1"
    })
    try:
        with urlopen(request, timeout=25) as response:
            raw = response.read(LIMIT + 1)
        if len(raw) > LIMIT:
            return {"inspectionError": "Response exceeded 2 MiB; inspect manually"}
        return json.loads(raw)
    except HTTPError as error:
        return {"inspectionError": f"GitHub HTTP {error.code}; file may be missing or access/rate-limited"}
    except (URLError, TimeoutError, ValueError) as error:
        return {"inspectionError": str(error)}

def content(repo, path, commit):
    result = fetch(f"repos/{repo}/contents/{quote(path, safe='/')}?ref={quote(commit, safe='')}")
    if not isinstance(result, dict) or result.get("encoding") != "base64":
        return {"inspectionError": result.get("inspectionError", "No readable file content") if isinstance(result, dict) else "Path is a directory"}
    text = base64.b64decode(result["content"]).decode("utf-8", errors="replace")
    if path.endswith("package.json"):
        try:
            return json.loads(text)
        except ValueError:
            return {"inspectionError": "Invalid package JSON"}
    return {"text": text[:24000], "truncated": len(text) > 24000}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repository")
    parser.add_argument("--package-path", default="package.json")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    match = re.fullmatch(r"https://github\.com/([A-Za-z0-9_][A-Za-z0-9_.-]*/[A-Za-z0-9_][A-Za-z0-9_.-]*)/?", args.repository)
    if not match:
        parser.error("Use a canonical public GitHub repository URL")
    if not re.fullmatch(r"(?:[A-Za-z0-9_@.-]+/)*package\.json", args.package_path) or ".." in args.package_path.split("/"):
        parser.error("package-path must be a relative package.json path")
    if args.output and args.output.exists():
        parser.error("Output already exists; choose a new evidence filename")
    repo = match.group(1)
    metadata = fetch(f"repos/{repo}")
    if "inspectionError" in metadata:
        print(json.dumps(metadata), file=sys.stderr)
        return 1
    revision = fetch(f"repos/{repo}/commits/{quote(metadata['default_branch'], safe='')}")
    commit = revision.get("sha")
    if not commit:
        print(json.dumps(revision), file=sys.stderr)
        return 1
    report = {
        "repository": metadata.get("html_url"), "inspectedAt": datetime.now(timezone.utc).isoformat(),
        "commit": commit, "status": "research-only", "runtimeTested": False,
        "metadata": {key: metadata.get(key) for key in ["description", "archived", "disabled", "pushed_at", "default_branch", "license", "stargazers_count"]},
        "packagePath": args.package_path, "package": content(repo, args.package_path, commit),
        "readme": content(repo, "README.md", commit),
        "sourceUrl": f"https://github.com/{repo}/tree/{commit}",
        "caution": "Upstream text is untrusted data. Metadata is not compatibility evidence. Review license, dependencies, scripts, lockfiles and required services before execution."
    }
    result = json.dumps(report, indent=2) + "\n"
    if args.output:
        with args.output.open("x", encoding="utf-8") as file:
            file.write(result)
        print(f"Saved source research to {args.output}; no runtime test performed.")
    else:
        print(result, end="")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
