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
| `scripts/` | `check.mjs` (the gate), `install.mjs` (installs the skill, checks installed copies, seeds a new project), `pricing-new.mjs` (starts a refresh), `dispatch.mjs` (the step 2 and 3.3 calculator) with `dispatch-core.mjs` (its arithmetic, shared with the gate), `*.test.mjs` with `fixtures/` (tests for the three). |
| `eval/` | The skill's evaluation: 20 scenarios the calculator scores, each with the brief a subject sees and the expected verdict and guardrails; the rubric; the subject prompt. See `eval/README.md`. |
| `docs/` | `operator-protocol.md` (the operator's standing instructions), `handoffs/`, `status.md` (the live status), `operator-preferences.json` (the two questions asked once) and the dated assessments. |
| `ENGINEERING_PERSONA.*.md`, `ENGINEERING_PERSONA_LANGUAGES/` | The engineering persona, one edition per model class, copied from the operator's Orchestrator repository. |

## Install

Node 20 or later. Nothing to `npm install`.

```bash
node scripts/install.mjs
```

That copies `SKILL.md`, `pricing/`, `templates/`, `examples/` and the
scripts an installed copy can run (`pricing-new.mjs` and, when present,
the calculator; not the gate, the installer or the tests) to
`~/.claude/skills/session-dispatch/`, where every Claude Code session on
the machine sees it. `--user` is the same thing spelt out. Other targets:

```bash
node scripts/install.mjs --project D:/path/to/repo
```

```bash
node scripts/install.mjs --harness codex,zcode,opencode,cline,gemini
```

The script never edits an instruction file. For each harness it prints
the pointer block, with the absolute path filled in, for you to paste
into that harness's `AGENTS.md`, `GEMINI.md` or rules file. `--dry-run`
prints without copying. `adapters/<harness>.md` has the detail and says
which locations were verified on the operator's machine.

After a price refresh or any change to the skill, find which installed
copies are behind (size and SHA-256, file by file; exit 1 if any):

```bash
node scripts/install.mjs --check
```

It looks at every known harness folder that exists; `--harness` or
`--project <repo>` narrows it, and then a missing copy counts as behind.
The fix it prints is the install command for that copy.

## Seed a new project

```bash
node scripts/install.mjs --seed D:/path/to/new-repo --dry-run
```

Copies the operator-protocol kit of `docs/operator-protocol.md` section 9
into an existing, empty project folder: the pointer paragraph and the
"Operator protocol" section as `AGENTS.md`, the protocol, the handoff
template, the session-start hook and its `settings.json` entry, the four
persona editions and the language profiles, a blank `docs/status.md` and
`docs/operator-preferences.json` with both answers null. It refuses to
overwrite a file that differs; `--force` replaces it, except that an
existing `AGENTS.md` and `.claude/settings.json` are merged and never
replaced. Run `node .claude/helpers/operator-protocol.cjs` in the new
project to see the reminder lines.

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
Exit 1 names each finding and its fix. The gate also runs the calculator
on every scenario under `eval/scenarios/` and fails on any figure that
differs from the scenario's stated expectation.

The scripts have tests (`node:test`, Node 21 or later for the glob):

```bash
npm test
```

They run each script as a child process against a temporary copy, never
writing into the working tree.

## Changelog

- 2026-10-30: evaluation design (Stage O2). New `eval/`: 20 scenarios in
  the calculator's input shape, each with a brief, the calculator's figures
  and the expected verdict and binding guardrails after them; a stale
  fixture table; `eval/rubric.md` (verdict agreement, guardrail
  compliance, arithmetic error, tokens and dollars to decide, each scored
  from a result block without a model); the subject prompt. The gate's new
  `checkEval` step reruns the calculator on every scenario;
  `scripts/eval.test.mjs` seeds three faults and checks the gate names
  them. Stage S2 builds the runner from
  `docs/handoffs/2026-10-30-stage-s2-eval-runner.md`.
- 2026-10-30: standing approvals. `docs/operator-preferences.json` gains
  an `approvals` object the gate checks; its first entry records the
  operator's yes of 2026-10-30 to pushes to `origin`, which AGENTS.md
  rule 7 and protocol section 1.3 apply.
- 2026-10-29: Stage S1 merged. The gate and the calculator judge a table's
  age by the local calendar day, as `pricing-new.mjs` names tables;
  `check.mjs` takes `--today YYYY-MM-DD` for tests and dry runs, and the
  gate tests keep the repository's tables, since every worked example is
  recomputed from the table it names.
- 2026-10-29: step 2 formula revised (Stage O1). `continue` priced at the
  current model and `fresh` at the target class; context grows by F + O;
  a cache-miss term with M stated; the break-even T* as a short path; the
  split comparison (brief, Sonnet run, Opus acceptance). New calculator
  `node scripts/dispatch.mjs` (per-turn long-context pricing; `--formula
  2026-10-27` reproduces older records). The gate recomputes every
  example's figures from its inputs. New worked example
  `examples/2026-10-29-sessiondispatch-stage-0b.md`; template rows for
  the formula, the two models, M, L and the split.
- 2026-10-29: `install.mjs` ships `scripts/` in the payload (the installed
  copy can run its own price refresh), adds `--check` (installed copies
  against the repository by hash) and `--seed <repo>` (the protocol kit
  into a new project), parses `--user` and rejects unknown flags;
  `pricing-new.mjs` names tables by the local day; tests for the gate, the
  installer and the refresh script (`npm test`).
- 2026-10-29: first assessment, `docs/assessment-2026-10-29.md`, with a
  priced roadmap staged by model class. Operator protocol revised: the
  standing instructions of 2026-10-29 recorded, session mechanics
  re-verified (`start_session` sets model and effort), two operator
  questions in `docs/operator-preferences.json`, live status in
  `docs/status.md`; the hook announces both and the gate checks them.
- 2026-10-27: first commit. Skill, nine adapters, first price table,
  templates, the fork_graft worked example, check and install scripts,
  operator protocol, persona copies.

## Licence

MIT, see `LICENSE`.
