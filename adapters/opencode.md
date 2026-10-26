# Adapter: OpenCode

## Where it goes

- Skill folder: `~/.config/opencode/skill/session-dispatch/SKILL.md`
  with `pricing/`, `templates/` and `examples/` beside it. OpenCode
  reads skills from `skill/` under its config folder and from
  `<repo>/.opencode/skill/` (to be checked on first use: the operator's
  `~/.config/opencode/` held `opencode.jsonc` on 2026-10-27 and no
  `skill/` folder yet).
- Standing instructions: `~/.config/opencode/AGENTS.md` (user level) or
  the project's `AGENTS.md`.

`node scripts/install.mjs --harness opencode` copies the folder and
prints the block.

## How it loads

OpenCode reads `AGENTS.md` at the project root and the user-level file
on every session, and lists skills by their front matter. The block
makes the trigger explicit.

## Pointer block

```
## Session dispatch

Before a stage of more than ten turns, at any model or effort change,
after a compaction, or before delegating to a sub-agent, load the
`session-dispatch` skill and follow it. Paste its decision record into
the handoff.
```

## Numbers

The session header shows the token count and the model. The operator's
`opencode.jsonc` names the Kimi models the price table lists under
`kimi`; their prices are null until filled.
