---
stage: "Stage O2: evaluation design (scenario set, rubric, runner brief)"
model: claude-opus-5-5
effort: high
status: done
created: 2026-10-29
from: "Session local_ec0281d1 (Fable 5.1, xhigh): Stage F1, acceptance of Stage O1"
---

# Stage O2: evaluation design

## Goal
Design the evaluation of the skill (assessment 2026-10-29, sections 3.4 and 6.1 "O2"). The skill is a prompt, and the project's AI-prompting profile requires a regression suite of fixed inputs with evaluated outputs, re-run on every model and text change; none exists. Deliverables, all under a new `eval/`: 15 to 20 scenarios, each a JSON file in the calculator's input shape (`node scripts/dispatch.mjs --json <scenario>` scores it) plus the scenario's prose brief, its expected draft verdict from the calculator, and the guardrails it must trigger; coverage of every matrix row, both verdicts, compaction and no compaction, a null price, a stale table, an outward step, the decision cap, one case within 10 percent of the band (acceptance note F1-1) and one with growth F plus visible output (F1-2); a rubric with four measures (verdict agreement, guardrail compliance, arithmetic error, tokens and dollars to decide), each scored deterministically from the subject's record; and the runner brief, written as `docs/handoffs/2026-10-29-stage-s2-eval-runner.md` for a Sonnet session that reads nothing else. Done when the scenario set exists and scores, the rubric is written, the S2 handoff is complete under matrix row 2 (contract, oracle, observable done), `node scripts/check.mjs` exits 0 with its counts quoted, and `README.md` has a changelog line.

## Decisions already made
- Opus, high, fresh session sharing this checkout on `main` (record below). Protocol section 2 puts evaluation design at Opus; F2 (Fable) retunes on the results.
- Expected verdicts come from the calculator plus the guardrails stated per scenario, never from a model. Arithmetic error is measured against the calculator's figures at the gate's tolerance (half a unit of the last decimal place).
- The stale-table scenario uses a fixture table under `eval/` passed with `--table`; `pricing/` holds real tables only (AGENTS.md non-negotiable 3). The null-price scenario can use the table's `gpt-6.1-sol` row.
- Subjects in H1 are Haiku and Sonnet following `SKILL.md` as installed; the runner is Sonnet, medium. The S2 brief therefore carries the runner's contract, the report's row shape (`eval/results-YYYY-MM-DD.md`, one row per scenario per subject) and a dry-run oracle (one scenario, each class, the rows appear).
- No change to `SKILL.md`, `scripts/dispatch-core.mjs` or the examples in this stage: the evaluation measures the formula as accepted. The step 2 and 2.1 text changes of F1-1 and F1-5 wait for the evaluation to show their weight. The band, floor and cap stay until F2.
- If the gate is to score scenarios, add one `checkEval` step to `scripts/check.mjs` (run the calculator's arithmetic on each scenario's inputs, compare its stated expected verdict), standard library only, and no file under `scripts/*.test.mjs` (Stage S1 owns those on its unmerged branch).
- Prose: Australian English, no em-dashes, none of the persona's banned words; the gate enforces the last two. Stage files by name, never `git add -A` (the root `.ignore` and `graft/` belong to a tool). No push; a remote step needs the operator's yes.

## Files and links that matter
- `docs/assessment-2026-10-29.md` sections 3.4, 6 and 6.1 ("O2", "S2", "H1", "F2").
- `docs/acceptance-2026-10-29-stage-o1.md` sections 2, 6 and 7 (F1-1 to F1-5 name the sensitivities a scenario should carry).
- `SKILL.md` in full (the subject under evaluation); steps 0, 2, 2.1, 3.1, 4 and 5 give the dimensions.
- `scripts/dispatch.mjs` (`--json`, `pieces`, exit codes 0 to 3), `scripts/dispatch-core.mjs` (`draftVerdict`, `breakEven`, `splitCost`), `scripts/check.mjs` (`recomputeExample`, `matchesStated`, `section`) as the pattern for a scorer.
- `examples/` (two records that seed two scenarios), `templates/decision-record.md` (the shape a subject's record must take), `ENGINEERING_PERSONA_LANGUAGES/ai-prompting.opus.md` (the suite requirement).
- `pricing/2026-10-29.json` (in force, 0 days); `pricing/2026-10-18.json` (identical Anthropic rows).

## Verified facts
- Gate at `17c9526`: `node scripts/check.mjs`, 59 files read, 0 findings, exit 0 (2026-10-29, Node 26.7.0).
- Calculator exits: 0 computed, 1 input or table error, 2 stale (age over `max_age_days`; 14 days computes), 3 null price with the verdict marked incomplete (acceptance note section 6).
- Every record on file reproduces to the cent from its inputs (acceptance note rows 10 to 12); four seeded mutations each failed the gate by name.
- Baseline in this app: 86,931 (this session), 86,450 (assessment), 84,957 (O1); window 1,000,000; compaction at 97 percent (`get_usage self`).
- O2 as one piece from the calculator: 6.04 USD (T 40, F 3,000, O 3,000, R 27,000) plus the handoff 0.125.
- `start_session` takes `model` and `effort` at or below the parent's (tool schema, 2026-10-29).

## Work completed
- `0cc7d52` (Stage O1), `17c9526` (Stage F1 acceptance note and the Stage 0 record's correction), this handoff's commit.

## Unresolved questions
- Operator: D2 (ASD-STE100) is still unanswered; the F1 session asked once more.
- Operator: whether O2's design gets a short Fable acceptance before S2 runs (about 3 USD, estimate) or F2's reassessment covers it (`docs/status.md`, Decisions waiting, D5).
- Operator: the merge of S1's branch `claude/modest-swirles-cae434`; on merge, the date convention and the user copy (`docs/status.md`).
- O2: how a subject is run on a scenario in H1 (the harness's `Agent` tool with `model` set, or fresh sessions) is the S2 brief's to state; the cost-to-decide measure needs the usage figures the subject's record carries.
- Later stages, not O2: F1-1 and F1-5 (`SKILL.md` step 2 and 2.1, Opus, after H1); F1-3 (gate recompute of term lines, Sonnet); F1-4 (one effort rule for acceptance, F2).
- Carried: the handoff hook names the newest file by name, so `stage-f1` sorted before `stage-o1` (a later Sonnet stage); two clocks (S1 merge).

## Exact next action
Confirm `get_session self` reports `claude-opus-5-5` at `high` (stop and name the mismatch otherwise), then read `docs/assessment-2026-10-29.md` section 3.4 and 6.1 "O2" and `docs/acceptance-2026-10-29-stage-o1.md` section 7, and list the scenario dimensions from `SKILL.md` steps 0 to 5 before writing any file.

## Cost projection
Opus 5.5, high, T 40, B 86,931, R 27,000, F 3,000, O 3,000, M 0, from the calculator: handoff 2,500 x 50e-6 = 0.125 (this session); first read 113,931 x 5e-6 = 0.570; reads 40 x 233,931 x 0.2e-6 = 1.871; writes 40 x 6,000 x 5e-6 = 1.200; output 40 x 3,000 x 20e-6 = 2.400. About 6.17 USD; quote 5 to 10 (adverse below: 18.85).

## Time projection
30 to 60 minutes wall clock (protocol section 7, Opus); operator review of the scenario list and rubric about 30 minutes.

## Session dispatch decision
Date: 2026-10-29. Decided by: claude-fable-5-1, xhigh, Claude Code desktop. Table `pricing/2026-10-29.json` (0 days). Formula 2026-10-29.

### Inputs
W 1,000,000 and K 970,000 (measured); C0 273,098 (measured, `get_usage self`, 11:35 UTC); compacted no; unrecorded context none (the acceptance note holds every finding); T 40 (assessment estimate); F 3,000 and O 3,000 (design and writing at high effort, step 1.2); B 86,931 (measured, total less Messages); R 27,000 (assessment 3.4 and 6.1 about 3,000, acceptance note section 7 about 2,500, `SKILL.md` 6,200, `dispatch-core.mjs` 2,900, `dispatch.mjs` 3,600, `check.mjs` 5,100, this file 2,500, the ai-prompting profile 650; characters divided by 4); H 2,500; M 0 (unmeasured); L 0; Ta 15 and Ra 25,000 (the split figure only); task type evaluation design (matrix row 3); design-heavy yes; outward-facing none.

### Step A: continue or hand off
`node scripts/dispatch.mjs --current claude-fable-5-1 --target opus` with the inputs above: continue on Fable 12.93 USD (reads 3.931, writes 3.000, output 6.000, misses 0); fresh on Opus 6.17 USD (handoff 0.125 at Fable, first read 0.570, reads 1.871, writes 1.200, output 2.400). T* n/a: the model changes.
Draft verdict: fresh, by cost, margin 6.76 USD (109.7 percent of the smaller).
Split: brief 0.125, run on Sonnet 3.021, acceptance on Opus 2.380: 5.53 USD, cheaper than fresh by 0.64 (11.6 percent). Not an option: choosing the scenario dimensions and the rubric is the design, so a brief that settled them would be the stage; the figure is what a sharper brief would save.

### Step B: model, effort and concurrency
One piece, Opus, `claude-opus-5-5`, high; oracle: `eval/` scenarios the calculator scores, the rubric, the S2 handoff complete under row 2, gate exit 0; serial after F1; Stage S3 (Sonnet, operator present, disjoint files) may run beside it. Effort high, the row 3 default: no outward step, no credentials, not a merge.

### Guardrails checked
1 no (T 40). 2 design-heavy, no compaction behind or ahead (C_end 513,098 under K). 3 none outward; a push needs the operator's yes. 4 model from the table's opus row. 5 table 0 days, rows complete. 6 acceptance of O2 is Fable's: F2 reads the results, or a short Fable acceptance first (D5, the operator's). 7 within budget (table below). 8 the O2 session checks its front matter; this session starts it, Opus being below Fable.

### Adversarial pass
For continuing: this session has read every file O2 needs and holds F1-1 and F1-2 in working memory, so it would write the scenarios fastest; the stage is small in money either way. Against: at 12.93 it costs twice the fresh side, Fable tokens are the project's most expensive, protocol section 2 puts evaluation design at Opus, and the persona's delegation rule says anything a lower class can do to the standard is delegated. Inputs: C0 measured; T could be 60 if the rubric needs iteration, or 20 if the scenario list falls out of `SKILL.md` directly; O at high 3,000, 5,000 if the rubric prose runs long; R 40,000 if the Opus session reads the protocol in full; M 3 across operator review pauses; task type could be argued up to Fable (the tiering itself, row 5), but the assessment split that between O2 (design) and F2 (retune); prices 0 days old, no tier on Fable or Opus. Recomputed with T 60, O 5,000, R 40,000, M 3: continue 47.55, fresh 18.85 (152.3 percent). With T 20: continue 6.17, fresh 3.19 (93.3 percent).
Verdict holds: yes.

### Final verdict
Fresh session, `claude-opus-5-5`, high, one piece, serial. Exact next action: commit this handoff and the status, start the session with `start_session` (model `claude-opus-5-5`, effort `high`, fresh, sharing this checkout, this file as the brief), tell the operator.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 273,098 | usage tool, 11:35 UTC |
| Context at end | about 283,000 | estimate: three calculator runs and this file |
| Input tokens read | about 2,500 | the calculator's three outputs |
| Output tokens | about 3,000 | this file, characters divided by 4; estimate |
| Wall clock | about 8 minutes | session clock, 11:36 to 11:44 UTC |
| Priced | 2,500 x 12.5e-6 + 3,000 x 50e-6 = 0.18 USD | table `pricing/2026-10-29.json`, fable row |
