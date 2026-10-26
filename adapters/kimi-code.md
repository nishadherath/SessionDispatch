# Adapter: Kimi Code (Moonshot)

## Where it goes

Not verified on the operator's machine (no `~/.kimi/` folder on
2026-10-27). Documented places to check on first use, in order:

1. A skill folder under the harness's home folder, if it lists skills by
   `SKILL.md` front matter: copy the user folder there.
2. Otherwise the project's `AGENTS.md`, which the harness reads at the
   project root: paste the block below.

Until checked, use the generic adapter: the block points at the Claude
Code user copy by absolute path.

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

The harness's status line, else estimate from characters. The Kimi
rows in the price table carry the model ids the operator's OpenCode
configuration names; prices are null until filled. Correct this file
once the folder layout is known.
