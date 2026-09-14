#!/usr/bin/env python3
"""Warn when Agent edits Playwright TypeScript without running typecheck (log only)."""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

LOG_PATH = Path(__file__).resolve().parent / "e2e-edits.log"
WATCH_PREFIXES = (
    "tests/",
    "src/",
    "playwright.config.ts",
    "global-setup.ts",
)


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("{}")
        return

    path = (data.get("file_path") or data.get("path") or "").replace("\\", "/")
    if not any(p in path for p in WATCH_PREFIXES):
        print("{}")
        return

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"{timestamp}\te2e_edit\t{path}\n"
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.open("a", encoding="utf-8").write(line)

    print(json.dumps({
        "additional_context": (
            "Playwright file edited. When done, run: npm run typecheck && npm run test:smoke "
            "(see AGENTS.md)."
        )
    }))


if __name__ == "__main__":
    main()
