# Adapter: Cline (VS Code extension and CLI)

## Where it goes

- Global rule file: `~/Documents/Cline/Rules/session-dispatch.md` on
  Windows (`~/Documents/Cline/Rules/` on macOS and Linux). The
  `~/Documents/Cline/` folder existed on the operator's machine on
  2026-10-27; `Rules/` is created on first use from Cline's rules
  panel or by the install script.
- Project rule: `<repo>/.clinerules/session-dispatch.md`.

Cline has no skill folder, so the rule file points at the Claude Code
user copy of the skill by absolute path. `node scripts/install.mjs
--harness cline` writes the rule file with the path filled in after
installing the user copy.

Verified on 2026-10-30: `install --harness cline` wrote the rule file
`~/Documents/Cline/Rules/session-dispatch.md` and a Cline session given
scenario 03 by hand wrote a record in the skill shape.

## How it loads

Every rule file in those folders is added to the system prompt of every
task. Keep the rule to the pointer; the skill body is read on demand.

## Pointer block

The contents of the rule file:

```
# Session dispatch

Before a task of more than ten turns, at any model change, when the
context window bar passes 60 percent, or before starting a new task
to continue this work, read
`C:\Users\<you>\.claude\skills\session-dispatch\SKILL.md` and follow it.
Paste its decision record into the handoff file.
```

## Numbers

The context window bar in the task header shows tokens used against
the model's window. Treat 80 percent of the window as the compaction
point K, since Cline truncates by its own rule.
