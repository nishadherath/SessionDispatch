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

Node 20 or later. Nothing to `npm install`. The step-by-step guide, with
a table of what each harness needs, is `docs/installing.md`.

After you clone the repository, from its root folder:

```bash
node scripts/install.mjs --harness all --dry-run
```

```bash
node scripts/install.mjs
```

The first command previews every harness. The second installs for
Claude Code. Then paste the pointer block it prints into your
instruction file, and run `node scripts/install.mjs --check`.

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

- 2026-10-30: Stage S3, adapters verified on the operator's machine. One session
  per harness given scenario 03 by hand wrote a record in the skill shape:
  Claude Code, Codex, Z-Code, OpenCode, Cline, Antigravity and DeepSeek;
  Kimi Code is not installed; Gemini CLI deferred. Each adapter carries a
  dated line. New `docs/installing.md` (ASD-STE100 style install guide)
  and a quick-start in the Install section.
- 2026-10-30: Stage F5, the closing assessment on H3
  (`docs/assessment-2026-10-30-f5.md`). Sonnet threshold met (21 of 21);
  Haiku not met (13 of 21), ruled the subject's record formatting and the
  harness (a 200,000-token window the CLI applied to `claude-haiku-5-5`,
  and a calculator grant that refused every Haiku command form), not the
  procedure or the contract. D10 ruled A (variant C closed); D11 raised
  (a Haiku rerun, recommended declined). The class floor in `SKILL.md`
  gained two measured sentences on the H3 cells (no figure, formula,
  matrix row or guardrail changed); `eval/README.md` gained the H3 entry.
  S3 handoff written; the project is not done until S3.
- 2026-10-30: Stage H3, the clean-harness regression (`eval/results-2026-11-01.md`,
  42 runs through the CLI runner on the S5 text). Sonnet calculator 21 of 21
  (threshold 20 of 21 met); Haiku calculator 13 of 21 (threshold 19 of 21 not
  met: all scorable records right, 8 format or no-record misses). Measured
  subject cost 6.61 USD. No change to `SKILL.md`; D10's reopening condition
  holds and F5 rules on it.
- 2026-10-30: Stage S5, three additions to `SKILL.md` under matrix row 5
  (assessment F4): a class floor stating the measured Sonnet and Haiku
  results, a definition of writing-heavy for the O default in step 1.2,
  and a fragility sentence on the fresh side's two omitted terms in step 2.
  No formula, figure, matrix row or guardrail changed.
- 2026-10-30: Stage S4, harness hardening and the evaluation contract.
  `node eval/run.mjs run --runner cli` runs the prepared prompts through
  `claude -p` from each sandbox with measured usage and a table-priced
  cost per run; the probe found that a default CLI subject sees the
  installed copy of this skill and the user's hooks, so the runner turns
  both off. `prepare` merges into the day's manifest. The gate now
  recomputes the cost term lines and Step B's cost column of each worked
  example. The block contract changed (`t_star` null on a model change,
  `usd` string or null, the block on its own lines) and scenario 21
  covers guardrail 7 with no draft, so the set is 21 scenarios.
- 2026-10-30: reassessment on the H2 results (Stage F4),
  `docs/assessment-2026-10-30-f4.md`. The Sonnet thresholds are met
  (40 of 40 in both arms, arms not different); Haiku's 18-of-20
  threshold is ruled not met on the pre-registered scorer's count, the
  two format failures counting as misses with the hand reading (19 of
  20) recorded as a second figure. The text gains a class floor (Stage
  S5); variant C is left unstaged for want of a measurable target
  (decision D10 for the operator); O4 is declined in favour of one
  sentence on the omitted terms; the Sonnet `t_star` misses are a block
  encoding fault, fixed in the prompt (Stage S4); scenario 10's Haiku
  misses are an undefined term in step 1.2, defined in S5; a 21st
  scenario covers guardrail 7's fallback (S4). H1 to H2 compared cell by
  cell without scenario 17. Roadmap re-priced from
  `docs/dispatch/2026-10-30-f4-roadmap.json`: S4, S5, H3, S3, F5 remain.
  Handoffs for S4 and S5 written. No change to the skill, the scripts or
  the evaluation.
- 2026-10-30: evaluation rerun on the revised text (Stage H2).
  `prepare --repeat <n>` gives repeat runs of a scenario, subject and
  arm distinct ids (`.2` and on), with its test. 120 sub-agent runs on
  the `Agent` runner, labelled 2026-10-31 so H1's run folder stays:
  `eval/results-2026-10-31.md` (thresholds, comparability and reading
  notes first). Final agreement: Sonnet 40 of 40 in both arms (n = 40
  each), Haiku calculator 17 of 20 and hand 19 of 20 (n = 20 each); the
  Sonnet threshold is met, the Haiku calculator threshold (18 of 20) is
  not met on the scorer's count. No change to the skill or the scorer.
  F4 handoff written.
- 2026-10-30: acceptance of Stage O3 (Stage F3),
  `docs/acceptance-2026-10-30-stage-o3.md`. Sixteen claims accepted,
  none rejected: the text carries F2's verdicts and the scenario 17
  ruling as written; one run rescored by hand, the over-cap column and
  the overrun diagnostic recomputed from the 80 records, the scorer
  probed with twenty-one mutations. Seven findings handed on (the
  rubric's row 7 against the guardrail order where 5 and 7 both bind;
  a repeat index for `prepare` before H2; the runner choice for H2).
  H2 handoff written for 120 runs on the `Agent` runner. No change to
  the skill, the scripts or the evaluation.
- 2026-10-30: skill text revision and evaluation contract (Stage O3).
  `SKILL.md` carries F2's verdicts: the decision cap is on the record
  (under 4,000 tokens) and the minutes (10), reading is measured, never
  capped, and past the cap step 2's draft stands; guardrail 1 applies
  at the same class only; the guardrails gain an order (a cost rule
  never overrides a quality rule); matrix row 4 is the one acceptance
  effort rule; a stress-test flip in step 5 is recorded as fragile and
  kept; a target the table cannot name is written null; measured
  cost-of-deciding figures name their source. The evaluation contract
  follows (null `target`, `over_cap` on the record's size, guardrail 7's
  new consequence, an overrun diagnostic); scenario 17's expected final
  moves to fresh on Opus with the rule. Two H1 runs rescored, both
  figures in `eval/results-2026-10-30.md`. No formula change.
- 2026-10-30: reassessment on the evaluation results (Stage F2),
  `docs/assessment-2026-10-30-f2.md`. Sonnet runs the skill with or
  without the calculator (20/20 and 17/20, not separable at n = 20);
  all 19 Haiku misses took guardrail 7's default after a correct draft
  in 14 of 17, so the 8,000-token cap is the defect. Verdicts on the
  cap, the guardrail order, the adverse-value rule, the acceptance
  effort rule, a null target and the rerun; roadmap re-priced from
  `docs/dispatch/2026-10-30-f2-roadmap.json`. No change to the skill;
  Stage O3 writes the verdicts in from
  `docs/handoffs/2026-10-30-stage-o3-skill-text-revision.md`.
- 2026-10-30: evaluation runs (Stage H1). 80 sub-agent runs (20 scenarios,
  Haiku and Sonnet, calculator and hand arms) scored into
  `eval/results-2026-10-30.md`: final agreement Sonnet 20/20 with the
  calculator and 17/20 by hand, Haiku 11/20 and 10/20 (n = 20 per cell).
  No change to the skill; F2 reassesses from
  `docs/handoffs/2026-10-30-stage-f2-reassessment.md`.
- 2026-10-30: evaluation runner and scorer (Stage S2). `eval/score.mjs`
  scores one record into the rubric's four measures and writes the report
  with Wilson intervals; `eval/run.mjs` prepares a sandbox and prompt per
  run (`prepare`), records the sub-agents' usage (`usage`), copies the
  records (`collect`) and scores (`score`);
  `scripts/eval-score.test.mjs` pins both to a perfect block on all 20
  scenarios, seven mutations and the Wilson values. A dry run on scenario 03
  with a Haiku and a Sonnet sub-agent scored both correct
  (`eval/results-2026-10-30.md`). Stage H1 runs the set from
  `docs/handoffs/2026-10-30-stage-h1-eval-runs.md`.
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
