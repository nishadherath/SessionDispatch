# Adapter: DeepSeek harness

## Where it goes

Not verified on the operator's machine (no DeepSeek harness folder on
2026-10-27). Use the generic adapter until checked: paste the block into
the harness's user-level instruction file if it has one, else into the
project's `AGENTS.md`, pointing at the Claude Code user copy by absolute
path. Record the real location here once known.

## How it loads

By the instruction file on every session; the skill body on demand.

## Pointer block

```
## Session dispatch

Before a stage of more than ten turns, at any model change, when the
context is past 60 percent of the window, or before delegating, read
`C:\Users\<you>\.claude\skills\session-dispatch\SKILL.md` and follow it.
Paste its decision record into the handoff.
```

## Numbers

The harness's status line, else estimate from characters. DeepSeek
prices are null in the table until filled from the source page.
