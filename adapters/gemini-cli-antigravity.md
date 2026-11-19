# Adapter: Gemini CLI and Antigravity

## Where it goes

- Standing instructions: `~/.gemini/GEMINI.md` (user level, present and
  empty on the operator's machine on 2026-10-27) or the project's
  `GEMINI.md`. Antigravity shares the `~/.gemini/` folder on this
  machine (`~/.gemini/antigravity/` exists).
- Antigravity project rules: `<repo>/.agent/rules/session-dispatch.md`
  (to be checked in the app on first use).

Neither has a skill folder, so the block points at the Claude Code user
copy by absolute path. `node scripts/install.mjs --harness gemini`
prints the block with the path filled in; it never edits `GEMINI.md`.

Verified on 2026-10-30 for Antigravity: the pointer block is in
`~/.gemini/GEMINI.md` and an Antigravity session given scenario 03 by
hand wrote a record in the skill shape. Two small defects in that
record (two lines outside the pasted block, one blank recompute line)
were left as found. Gemini CLI itself: not tested on 2026-10-30; the operator deferred it. The
same `~/.gemini/GEMINI.md` block serves both.

## How it loads

`GEMINI.md` files are concatenated into the system prompt on every
session. Keep the block short.

## Pointer block

```
## Session dispatch

Before a stage of more than ten turns, at any model change, when
`/stats` shows the context past 60 percent, or before delegating, read
`C:\Users\<you>\.claude\skills\session-dispatch\SKILL.md` and follow it.
Paste its decision record into the handoff.
```

## Numbers

`/stats` in Gemini CLI and `/context` or `--output-format json` in
Antigravity CLI report tokens used. Google's Standard Paid Tier prices
are in `pricing/2026-11-20.json` (implicit caching: `cache_write`
equals `input`, no `cache_write_1h`, so use `--ttl 5m`). When
Antigravity lists an effort-suffixed slug such as
`gemini-4-neon-high`, pass its base model id (`gemini-4-neon`) to
`scripts/dispatch.mjs` and state the effort separately.
