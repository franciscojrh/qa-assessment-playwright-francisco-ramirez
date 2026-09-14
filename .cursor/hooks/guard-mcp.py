#!/usr/bin/env python3
"""Ask before potentially destructive MCP tool calls (Jira, Qase, GitHub)."""

import json
import sys

# Substrings matched against "server/tool" or tool name (case-insensitive)
ASK_TOOL_HINTS = (
    "delete",
    "remove",
    "create",
    "update",
    "merge",
    "close",
    "transition",
    "publish",
    "post_comment",
)

SENSITIVE_SERVERS = ("qase", "atlassian", "jira", "github")
# Add other org MCP server ids here if you enable write-capable tools (e.g. linear).


def respond(permission: str, user_message: str = "", agent_message: str = "") -> None:
    payload = {"permission": permission}
    if user_message:
        payload["user_message"] = user_message
    if agent_message:
        payload["agent_message"] = agent_message
    print(json.dumps(payload))
    if permission == "deny":
        sys.exit(2)


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        respond("allow")
        return

    server = (data.get("server") or data.get("mcp_server") or "").lower()
    tool = (data.get("tool") or data.get("tool_name") or data.get("name") or "").lower()
    combined = f"{server}/{tool}"

    if not any(s in server for s in SENSITIVE_SERVERS):
        respond("allow")
        return

    if any(hint in tool for hint in ASK_TOOL_HINTS):
        respond(
            "ask",
            f"MCP write action on {server}: `{tool}`. Approve if intentional.",
            f"Hook flagged MCP tool call: {combined}",
        )

    respond("allow")


if __name__ == "__main__":
    main()
