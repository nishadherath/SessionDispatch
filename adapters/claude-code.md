# Adapter: Claude Code (CLI and desktop app)

## Where it goes

- User level, every project: `~/.claude/skills/session-dispatch/SKILL.md`
  (on Windows `C:\Users\<you>\.claude\skills\session-dispatch\SKILL.md`),
  with `pricing/`, `templates/` and `examples/` beside it. Verified on
  2026-10-27: skills in that folder appear in every session's skill
  list on the operator's machine.
- Project level: `<repo>/.claude/skills/session-dispatch/SKILL.md`, same
  layout. Use it to pin a version in a repository others clone.

`node scripts/install.mjs --user` or `--project <repo>` does the copy.

Verified on 2026-10-30: the user copy was refreshed and a Claude Code CLI session
given scenario 03 by hand wrote a record in the skill shape. The
2026-10-27 line above stands.

## How it loads

Claude Code reads the front matter of every skill at session start and
loads the body when the skill is invoked (`/session-dispatch`) or when
the model judges the description matches. The pointer block below makes
the trigger explicit for projects under the operator protocol.

## Pointer block

Paste into the project's `AGENTS.md` or `CLAUDE.md`:

```
Session dispatch: before a stage of more than ten turns, at any model or
effort change, after a compaction, or before delegating, run the
`session-dispatch` skill and paste its record into the handoff.
```

## Numbers

Desktop app: the session usage tool reports `tokensUsed`,
`contextWindow` and `autoCompactsAtPercent`. CLI: `/context`.
