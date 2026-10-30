# Adapter: Z-Code (Z.ai GLM harness)

## Where it goes

- Skill folder: `~/.zcode/skills/session-dispatch/SKILL.md` with
  `pricing/`, `templates/` and `examples/` beside it. Verified on
  2026-10-27: `~/.zcode/skills/` on the operator's machine holds the
  same skill folders as `~/.claude/skills/`, so Z-Code reads the Claude
  Code skill layout.
- Standing instructions: the project's `AGENTS.md` or `CLAUDE.md`,
  which Z-Code reads as Claude Code does.

`node scripts/install.mjs --harness zcode` copies the folder.

Verified on 2026-10-30: the copy was refreshed (`install --check`, 0 behind)
and a Z-Code session given scenario 03 by hand wrote a record in the
skill shape. The 2026-10-27 line above stands.

## How it loads

As Claude Code: front matter at start, body on invocation. Use the
Claude Code pointer block in the project's instruction file.

## Pointer block

```
Session dispatch: before a stage of more than ten turns, at any model or
effort change, after a compaction, or before delegating, run the
`session-dispatch` skill and paste its record into the handoff.
```

## Numbers

Z-Code's status line, else estimate from characters (skill step 1.1).
GLM prices are null in the table until filled from the source page.
