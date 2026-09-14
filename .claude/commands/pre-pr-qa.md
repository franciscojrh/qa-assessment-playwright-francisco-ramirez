---
description: E2E QA gate before opening a PR
argument-hint: TICKET-ID
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(npm:*), Bash(npx playwright:*), Read, Grep, Glob
---

Pre-PR QA for ticket **$1**.

Follow `AGENTS.md` → **Pre-PR QA check**.

End with: ready to open PR, or list blockers.
