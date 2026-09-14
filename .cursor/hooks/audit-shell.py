#!/usr/bin/env python3
"""Append shell commands to a local audit log (Agent accountability)."""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

LOG_PATH = Path(__file__).resolve().parent / "audit-shell.log"


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("{}")
        return

    command = data.get("command") or data.get("full_command") or ""
    exit_code = data.get("exit_code")
    cwd = data.get("cwd") or data.get("working_directory") or ""

    if not command.strip():
        print("{}")
        return

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"{timestamp}\tcwd={cwd}\texit={exit_code}\t{command.strip()}\n"

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.open("a", encoding="utf-8").write(line)

    print("{}")


if __name__ == "__main__":
    main()
