#!/usr/bin/env python3
"""Log Agent session completion timestamps for local audit."""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

LOG_PATH = Path(__file__).resolve().parent / "sessions.log"


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        data = {}

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    status = data.get("status") or data.get("reason") or "stop"
    line = f"{timestamp}\tsession_end\t{status}\n"

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.open("a", encoding="utf-8").write(line)

    print("{}")


if __name__ == "__main__":
    main()
