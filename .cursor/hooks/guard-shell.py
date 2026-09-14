#!/usr/bin/env python3
"""Block dangerous shell commands during Agent execution."""

import json
import re
import sys

DENY_PATTERNS = [
    (r"git\s+push\b[^;\n]*(--force|-f)\b", "Force push is blocked. Use a normal push or ask explicitly."),
    (r"git\s+config\b", "Updating git config is blocked in this project."),
    (r"git\s+reset\s+--hard\b", "Hard reset is blocked — can discard uncommitted work."),
    (r"git\s+clean\s+-[^;\n]*f", "git clean -f is blocked — can delete untracked files."),
    (r"rm\s+-[^;\n]*rf\s+(/|\~|\$HOME|\$\{HOME\})", "Recursive delete of root or home is blocked."),
    (r"\bdd\s+if=", "dd is blocked in Agent shell."),
    (r"chmod\s+-R\s+777\b", "chmod 777 is blocked."),
    (r"curl[^;\n]*\|\s*(ba)?sh", "Piping curl to shell is blocked."),
    (r"wget[^;\n]*\|\s*(ba)?sh", "Piping wget to shell is blocked."),
]

ASK_PATTERNS = [
    (r"git\s+push\b", "Git push detected — confirm branch and remote before pushing."),
    (r"git\s+commit\b", "Git commit detected — confirm the user requested a commit."),
    (r"npm\s+publish\b", "npm publish requires explicit approval."),
]


def respond(permission: str, user_message: str = "", agent_message: str = "") -> None:
    payload = {"permission": permission}
    if user_message:
        payload["user_message"] = user_message
    if agent_message:
        payload["agent_message"] = agent_message
    print(json.dumps(payload))
    if permission == "deny":
        sys.exit(2)
    if permission == "ask":
        sys.exit(0)


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        respond("allow")
        return

    command = data.get("command") or data.get("full_command") or ""
    if not command.strip():
        respond("allow")
        return

    for pattern, message in DENY_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            respond("deny", message, f"Hook blocked shell command: {command[:200]}")

    for pattern, message in ASK_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            respond("ask", message, f"Hook flagged shell command for review: {command[:200]}")

    respond("allow")


if __name__ == "__main__":
    main()
