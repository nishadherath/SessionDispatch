# SessionDispatch

One portable skill, `session-dispatch`, for any agentic coding harness.
Before a long stage, at a model or effort change, after a compaction or
before delegating, it decides with arithmetic whether to continue the
current session or hand off to a fresh one, which model class and effort
the coming work needs, and what can run at the same time. It argues the
opposite in an adversarial pass, then records the verdict and the token
cost of reaching it in the handoff, so the operator can see over time
whether deciding pays for itself.

The procedure is written for a model one or two classes below the
frontier. The verdict comes from stated inputs and a formula, not from
the model's confidence.

## Layout

| Path | What it is |
|---|---|
| `SKILL.md` | The canonical skill: triggers, inputs, the continue-or-hand-off formula, the model and effort matrix, concurrency rules, guardrails, the adversarial pass, the record. |
| `adapters/` | One file per harness: where the skill goes, how it loads, the pointer block to paste. Claude Code, Codex, Cline, OpenCode, Gemini CLI and Antigravity, Z-Code, Kimi Code, DeepSeek, generic. |
| `pricing/` | Dated price tables, `YYYY-MM-DD.json`. The newest is in force; stale or null means refuse, never guess. |
| `templates/` | `decision-record.md` (the section pasted into a handoff) and `handoff.md`. |
| `examples/` | Filled records. The first is the fork_graft decision of 2026-10-27 that this skill generalises. |
| `scripts/` | `check.mjs` (the gate), `install.mjs` (copies the skill where each harness looks), `pricing-new.mjs` (starts a refresh). |
| `docs/` | `operator-protocol.md` (the operator's standing instructions) and `handoffs/`. |
| `ENGINEERING_PERSONA.*.md`, `ENGINEERING_PERSONA_LANGUAGES/` | The engineering persona, one edition per model class, copied from the operator's Orchestrator repository. |

## Install

Node 20 or later. Nothing to `npm install`.

```bash
node scripts/install.mjs
```

That copies `SKILL.md`, `pricing/`, `templates/` and `examples/` to
`~/.claude/skills/session-dispatch/`, where every Claude Code session on
the machine sees it. Other targets:

```bash
node scripts/install.mjs --project D:\path\to\repo
```

```bash
node scripts/install.mjs --harness codex,zcode,opencode,cline,gemini
```

The script never edits an instruction file. For each harness it prints
the pointer block, with the absolute path filled in, for you to paste
into that harness's `AGENTS.md`, `GEMINI.md` or rules file. `--dry-run`
prints without copying. `adapters/<harness>.md` has the detail and says
which locations were verified on the operator's machine.

## Use

In Claude Code, `/session-dispatch`, or the model invokes it when a
trigger in the skill's step 0 fires. The output is a filled
`templates/decision-record.md` pasted into the stage's handoff under
"Session dispatch decision", with the six-row cost-of-deciding table at
the end.

## Price tables

```bash
node scripts/pricing-new.mjs
```

Copies the newest table to today's date and lists the nulls. Fill them
from each family's `source` page, set `fetched`, run the check, commit.
`pricing/README.md` has the schema. The first table carries the
Anthropic figures the operator verified on 2026-10-18; OpenAI, Google,
DeepSeek, Kimi and GLM rows are null until filled.

## Check

```bash
node scripts/check.mjs
```

Exit 0 is green. Exit 2 means only that the table is past its 14 days.
Exit 1 names each finding and its fix.

## Changelog

- 2026-10-27: first commit. Skill, nine adapters, first price table,
  templates, the fork_graft worked example, check and install scripts,
  operator protocol, persona copies.

## Licence

MIT, see `LICENSE`.
