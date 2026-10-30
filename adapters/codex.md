# Adapter: OpenAI Codex (CLI and desktop)

## Where it goes

- Skill folder: `~/.codex/skills/session-dispatch/SKILL.md` with
  `pricing/`, `templates/` and `examples/` beside it. Codex discovers
  skills in that folder by their `SKILL.md` front matter (to be checked
  on first use on this machine: the folder did not exist on 2026-10-27,
  while `~/.codex/AGENTS.md` and `~/.codex/config.toml` did).
- Standing instructions: `~/.codex/AGENTS.md` (user level, verified
  present on 2026-10-27) or the project's `AGENTS.md`.

`node scripts/install.mjs --harness codex` copies the folder and prints
the block below with the absolute path filled in. It never edits
`AGENTS.md`; paste the block yourself.

Verified on 2026-10-30: the copy was refreshed (`install --check`, 0 behind),
the pointer block is in `~/.codex/AGENTS.md`, and a Codex session given
scenario 03 by hand wrote a record in the skill shape. The 2026-10-27
lines above stand.

## How it loads

Codex reads `AGENTS.md` files from the home folder and the project
root on every thread. The block tells it when to open the skill file;
the skill body is read only then, so the standing cost is the block.

## Pointer block

```
## Session dispatch

Before a stage of more than ten turns, at any model or reasoning-effort
change, after the thread is compacted, or before delegating, read
`~/.codex/skills/session-dispatch/SKILL.md` and follow it. Paste its
decision record into the handoff.
```

## Numbers

`/status` shows the context used in the thread. The model and effort
are in `~/.codex/config.toml` (`model`, `model_reasoning_effort`).
