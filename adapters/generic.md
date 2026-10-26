# Adapter: any other harness

## Where it goes

1. Install the user copy once: `node scripts/install.mjs --user` puts
   the skill at `~/.claude/skills/session-dispatch/`. That folder is a
   plain directory any harness can read; its name is a convention, not
   a dependency on Claude Code.
2. If the harness lists skills by `SKILL.md` front matter, copy the
   same folder into its skill directory.
3. Paste the block below into whatever file the harness loads on every
   session (user-level first, project-level otherwise), with the
   absolute path filled in.

## How it loads

The block is the standing cost; the skill body is read when a trigger
fires.

## Pointer block

```
## Session dispatch

Before a stage of more than ten turns, at any model or effort change,
after a compaction, when the context is past 60 percent of the window,
or before delegating, read
`<absolute path>/session-dispatch/SKILL.md` and follow it. Paste its
decision record into the handoff.
```

## Numbers

If the harness reports no usage, estimate from characters (skill step
1.1) and mark every dependent figure as an estimate. Record what you
learn about the harness in a new adapter file named after it.
