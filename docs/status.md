# Live status

The rolling view of the work: done, in progress, left to do, each with a
time estimate, and the decisions waiting on the operator. The session
doing the work updates it at every stage boundary and whenever an
estimate moves by more than a quarter (AGENTS.md rule 11). Handoffs in
`docs/handoffs/` are the per-stage snapshots; the roadmap and its
arithmetic are in the newest `docs/assessment-YYYY-MM-DD.md`.

Last updated: 2026-10-30, twenty-fourth update, by Stage H3 (claude-sonnet-5-5, medium) at its close: all 42 runs scored; F5 handoff written and `ready`.

## Done

| Stage | Date | Result |
|---|---|---|
| Stage 0: bootstrap | 2026-10-27 | Skill, nine adapters, first price table, templates, worked example, three scripts, protocol kit. Commits `9e821b7`, `6ff89f1`. Gate 47 files, 0 findings. |
| Stage 0b: first assessment and protocol revision | 2026-10-29 | `docs/assessment-2026-10-29.md` with a priced roadmap; the standing instructions of 2026-10-29 recorded; session mechanics re-verified; the two operator questions and this document added; the gate checks them. |
| Stage H0: price table refresh | 2026-10-29 | `pricing/2026-10-29.json`: Anthropic read live, unchanged, `fetched` 2026-10-29; other families null. Gate 129 files, 330 findings, all under `graft\` (gitignored cache, awaiting O1's skip); install held until O1 lands. Handoff `docs/handoffs/2026-10-29-stage-h0-pricing.md`. |
| Stage O1: formula revision, calculator, gate recompute, new example | 2026-10-29 | `SKILL.md` step 2 revised (current and target prices, growth F + O, miss term, break-even, split); `scripts/dispatch.mjs`; the gate recomputes every example and skips gitignored and nested-checkout folders. Commit `0cc7d52`. Gate 57 files, 0 findings. About 30 minutes. The Stage 0 record's 1.19 recomputes to 1.18 (its terms were rounded before adding); F1 ruled for 1.18 and corrected the record. |
| Stage S1: install portability, seed command, script tests | 2026-10-29 | On branch `claude/modest-swirles-cae434` (`9734bfd`, `9b2cdc3`): `scripts/` in the payload, `install --check` and `--seed`, 22 tests green, gate 53 files and 0 findings there. Merged into `main` as `73393b8` with a clock seam (`check.mjs --today`) so the gate tests keep the repository's tables, and one date convention (local day) across the scripts. |
| Stage F1: adversarial acceptance of Stage O1 | 2026-10-29 | `docs/acceptance-2026-10-29-stage-o1.md`: step 2 derived by hand, every figure recomputed without the shared module, guardrails re-read, calculator probed, four gate mutations caught. Fourteen claims accepted, none rejected. Six findings handed on (fresh-side fixed cost understated by 2 to 11 percent of the smaller side; reasoning retention unmeasured; the gate's recompute stops at totals; three effort rules for acceptance; two sentences for step 2.1; one claim's wording). Commit `17c9526`. Gate 59 files, 0 findings. About 25 minutes; about 5 USD counting visible output, about 7.4 with reasoning (estimate). |
| Stage O2: evaluation design | 2026-10-30 | `eval/`: 20 scenarios the calculator scores (every matrix row, every final outcome, guardrails 1 to 3 and 5 to 8 binding, a stale fixture table, a null price, the cap, the band, growth F plus visible output), `rubric.md` (four measures scored from a result block, no model in the loop), `subject-prompt.md`, an index. The gate's `checkEval` reruns the calculator on each scenario; `scripts/eval.test.mjs` seeds three faults. The scorer's recompute path reproduces all 18 computable scenarios. Gate 87 files, 0 findings; 24 tests pass. S2 handoff written. About 40 minutes. |
| Stage S2: evaluation runner and scorer | 2026-10-30 | `eval/score.mjs` (the four measures, Wilson intervals, the report), `eval/run.mjs` (`prepare`, `usage`, `collect`, `score`), `scripts/eval-score.test.mjs` (a perfect block on all 20 scenarios, seven mutations, the Wilson values, sandbox dating). Dry run, scenario 03 on a Haiku and a Sonnet sub-agent, calculator arm: both continue, 3 of 3 figures correct, 14 of 14 inputs matched (`eval/results-2026-10-30.md`). Four open facts settled in the H1 handoff. Gate 89 files, 0 findings; 31 tests pass. About 40 minutes; about 2.4 USD by the calculator at T 45 (estimate), subjects' split unreported. H1 handoff written. |
| Stage H1: evaluation runs | 2026-10-30 | 80 sub-agent runs scored (D7 = B; Haiku failed by hand, so the Sonnet hand arm ran): `eval/results-2026-10-30.md`. Final agreement, n = 20 per cell: Sonnet 20/20 with the calculator and 17/20 by hand; Haiku 11/20 and 10/20. Cap exceeded in 11 to 19 of 20 runs per cell; two runs unscorable (null `target`); sub-agents load `AGENTS.md` and `MEMORY.md` (validity threat). Commits `60a87f2` and `b9c40c8`. Gate 90 files, 0 findings; 31 tests pass. About 33 minutes wall clock; about 6.3 USD (estimate: orchestration 4.0, subjects 2.3 on the harness token totals). F2 handoff written. |
| Stage F2: reassessment on the evaluation results | 2026-10-30 | `docs/assessment-2026-10-30-f2.md`: the skill is a procedure Sonnet can run (20/20 with the calculator, 17/20 by hand, not separable, p = 0.23); every one of Haiku's 19 misses took guardrail 7's default after a draft correct in 14 of 17, so the 8,000-token cap, not Haiku, is the finding. Verdicts on the three two-answer places and a fourth (step 5.4), the cap (record under 4,000 tokens and 10 minutes, step 5 cut past it, the draft stands), the null target (string or null, two runs rescored by O3 with both figures), repeating cells (on the revised text only, 120 runs with pre-registered thresholds), F1-1 (O4 after H2), F1-3 (S4), F1-4 (one rule in matrix row 4), F1-5 (O3), the `AGENTS.md` load (S4's CLI runner); D5 accepted with four contract findings. Roadmap re-priced from `docs/dispatch/2026-10-30-f2-roadmap.json`. O3 handoff written. Gate and tests at close in the stage report. |
| Stage O3: skill text revision and evaluation contract | 2026-10-30 | F2's verdicts in `SKILL.md` (cap on the record, 4,000 tokens and 10 minutes, the draft standing past it; guardrail 1 at the same class; the guardrail order; one acceptance effort rule in matrix row 4; step 5.4's adverse-value rule; F1-5; the null target; measured cost-of-deciding figures), the template, protocol section 2 and `AGENTS.md` rule 5 (`271edfd`). Evaluation contract (`53da875`): null `target`, `not-run` model, `over_cap` on the record's measured size, guardrail 7's new consequence, the F2-6 diagnostic; scenario 17's expected final moved to fresh on Opus at high, escalated and ruled option A by the coordinating session. Two runs rescored with both figures (`3e78e26`): Sonnet by hand 17/20 as scored, 18/20 rescored. Gate 92 files, 0 findings; 34 tests pass. About 50 minutes; about 5 USD (estimate, stage report). F3 handoff written. |
| Stage F3: adversarial acceptance of Stage O3 | 2026-10-30 | `docs/acceptance-2026-10-30-stage-o3.md`: sixteen claims accepted, none rejected; the writing matches F2 section 3.6 and the scenario 17 ruling. One run rescored by hand (every field reproduces), the over-cap column (1, 0, 1, 1 of 20) and the F2-6 diagnostic (10 runs) recomputed from the 80 records without the scorer, Wilson by hand, twenty-one scorer probes. Seven findings handed on, none blocking: rubric row 7 against the guardrail order in a case no scenario holds (F4); a repeat index for `prepare` before H2; the runner choice for H2 (`Agent`, for comparability with H1); the scorer's record size is the whole file; the diagnostic double-counts an unlisted outcome guardrail; a broken sentence in scenario 17's note; the old-rule over-cap column with the two unscorable runs read (19, 18, 16, 12). H2 handoff written (`docs/handoffs/2026-10-30-stage-h2-eval-rerun.md`, Sonnet medium, 120 runs). Gate and tests at close in the stage report. About 22 minutes; about 5.9 USD counting visible output, about 7.8 with reasoning (estimate, stage report). |
| Stage H2: rerun on the revised text, 120 runs | 2026-10-30 | `prepare --repeat <n>` (`5349fdb`), then 120 `Agent` runs scored (`c45891e`): `eval/results-2026-10-31.md`, labelled 2026-10-31 because H1 holds 2026-10-30. Final agreement: Sonnet 40/40 in both arms (n = 40), Haiku calculator 17/20 and hand 19/20 (n = 20). Pre-registered thresholds: Sonnet "a procedure" met; arms not different (p = 1.000); Haiku calculator 18 of 20 not met on the scorer's count (two unscorable format failures whose final outcomes are right, so 19/20 by hand; scenario 10 missed in both arms). Over cap 6 runs, all scenario 17. Gate 97 files, 0 findings; 35 tests pass. About 50 minutes; about 5 USD orchestration plus about 4 for subjects (estimates, split unreported). F4 handoff written. |
| Stage F4: reassessment on the H2 results | 2026-10-30 | `docs/assessment-2026-10-30-f4.md`: the Sonnet thresholds met (40 of 40 in both arms, p = 1.000); Haiku's 18-of-20 threshold ruled not met on the pre-registered scorer's count (17 of 20), the two format failures counted as misses and the hand reading (19 of 20) recorded as a second figure; the class floor goes into the text (S5); C1 left unstaged for want of a measurable target (D10 to the operator); O4 declined for one sentence on the omitted terms; the Sonnet `t_star` misses traced to the block's encoding (S4 prompt fix); scenario 10's Haiku misses traced to the undefined "writing-heavy" (S5); scenario 21 for guardrail 7's fallback (S4); H1 to H2 compared cell by cell without scenario 17 (Haiku hand 9 of 19 to 18 of 19, p = 0.003). Roadmap re-priced (`docs/dispatch/2026-10-30-f4-roadmap.json`); S4 and S5 handoffs written. Gate 100 files, 0 findings; 35 tests pass. About 24 minutes; about 9 USD (estimate, assessment section 5). |
| Stage S4: harness hardening and evaluation contract | 2026-10-30 | Four commits on `main`: the block contract fixes and scenario 21 (`132b778`; `t_star` null on a model change, `usd` string or null, the block on its own lines, F3-1, F3-3, F3-5, F3-6, 21 scenarios and `checkEval` green); the CLI runner `run --runner cli` with measured usage and the F2-8 probe (`4541134`: the default `claude -p` lists the installed `session-dispatch` skill and runs the user's hooks, so the runner passes `--disable-slash-commands --setting-sources project`); `prepare` merging into the day's manifest (`6c3ee4c`); the gate's term-line and Step B recompute with seeded-mutation tests (`7b179e5`). Dry run: one hand-arm run each of Sonnet (0.63 USD priced, 1.59 million tokens) and Haiku (0.04 USD priced; the CLI's own 4.47 is not credible for `claude-haiku-5-5`). The calculator arm's scoped Bash grant is untested: the auto-mode classifier refused the first attempt. Gate 102 files, 0 findings; 48 tests pass. About 50 minutes of wall clock (17:49 to 18:38 by the session tools and the clock); about 3 USD (estimate: context grew from 91,000 to 276,000 tokens over about 75 turns, priced by the formula; the subjects add the dry run's 0.67 USD priced). H3 handoff written (`docs/handoffs/2026-10-30-stage-h3-clean-harness.md`). |
| Stage S5: skill text, the class floor and two definitions | 2026-10-30 | Three fixed additions in `SKILL.md` (F4 sections 1.4, 2.1, 2.3, matrix row 5): the class floor paragraph before step 0, writing-heavy defined by matrix row in step 1.2's O row, and the fragility sentence on the omitted fresh-side terms in step 2. No other sentence, figure, front matter, matrix row or guardrail changed. Changelog line in `README.md`; claude, codex and opencode copies reinstalled, `--check` 0 files behind. Gate 102 files, 0 findings, `checkEval` unchanged; 48 tests pass. About 15 minutes; about 0.85 USD (estimate, calculator row). H3 next, from its existing handoff. |
| Stage H3: clean-harness regression, 42 runs | 2026-10-30 | 42 runs on the CLI runner and the S5 text (`SKILL.md` SHA-256 `0bad1334...`), commits `cbd0f26` and the closing commit; `eval/results-2026-11-01.md`. Sonnet calculator 21 of 21 (84.5 to 100.0 percent), threshold 20 of 21 met. Haiku calculator 13 of 21 (40.9 to 79.2 percent), threshold 19 of 21 not met: all 13 scorable records right, the 8 misses are format (7 unscorable field types, 1 no record). Measured subject cost 6.61 USD (Sonnet 5.89, Haiku 0.72). Gate 103 files, 0 findings; 48 tests pass. D10's reopening condition holds. |

## In progress

| Stage | Session | Class, effort | Where | Estimate |
|---|---|---|---|---|
| none running; F5 is next (see To do) | | | | |

The three installed copies (claude, codex, opencode) were refreshed with
`node scripts/install.mjs` on 2026-10-30 after O3; `--check` reports 0
files behind. S5 reran the install after its edit; `--check` reports 0 files behind.

## To do

From `docs/assessment-2026-10-30-f4.md` section 3.6. Costs at API list
price from `pricing/2026-10-29.json` by one calculator run
(`node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f4-roadmap.json --today 2026-10-30`);
wall clock is the model's, operator review separate.

| Stage | Class, effort | Cost (USD) | Wall clock | Depends on |
|---|---|---|---|---|
| S3: adapter verification on each harness, operator present | Sonnet, medium | 1.31 (1 to 2.5) | 30 to 45 min plus installs | S5 |
| F5: closing assessment on H3; the floor's figures updated if they moved; "done" declared or what is not named | Fable, high | 5.18 (4 to 7) | 30 to 45 min | H3, S3 |

Not staged: C1 (variant C) and its acceptance F6, 12.31 USD plus about 84
Haiku runs, unless the operator overrules D10; O4 declined (F4 section
2.3), 5.50 plus acceptance and a rerun, about 20.

Totals: firm stages left about 12 to 17 USD (sessions 11.30 plus subject
runs 1 to 5), quote 12 to 20. Done stages about 69 USD (estimates where
the stage said so; F4 about 9). Whole roadmap about 81 to 86 USD firm,
94 to 100 with C1 and F6. Serial chain left (S4, H3, F5) about 1.5 to
2.5 hours of model time, S5 beside S4 and S3 beside H3; operator review
about 2 hours including S3's installs (rough). The roadmap is near its
end: F4 section 3.7 says what "done" looks like.

## Decisions waiting

Each is set out in the five-part shape in section 7 of the newest
assessment; D8 and D9 are repeated below.

- D1 Autonomy: yes, recorded 2026-10-29 in `docs/operator-preferences.json`. Finishing sessions start the next stage themselves where the class allows; a higher class is started by the Fable coordinating session or by the operator.
- D2 ASD-STE100 (key `ste100`): no, recorded 2026-10-30 (option A). Variant C is D8 below.
- D3 How price refreshes are filled: live reads (option b), 2026-10-29, for the Anthropic family first.
- D4 Stage order: settled 2026-10-29.
- D5 Acceptance of O2's design: F2 was the acceptance (option A); accepted on 2026-10-30 with four contract findings carried to O3 (`docs/assessment-2026-10-30-f2.md` section 3.7).
- D6 Pushes to origin: standing yes, 2026-10-30, under `approvals.push_origin`.
- D7 H1's scope: B, decided by the operator on 2026-10-30; done.
- D8 Variant C: A (defer to F4; staged only if Haiku stays below 18 of 20 on the revised text), decided by the operator on 2026-10-30; below. F4 ruled the gate open (17 of 20 on the scorer's count) and left C1 unstaged; D10 below puts that choice to the operator.
- D9 H2's size: A (120 runs), decided by the operator on 2026-10-30; below.
- D10 Variant C staged or closed (new, F4, 2026-10-30): waiting; recommended A. Nothing else waits on it.
- F3-7 H2's runner (the coordinating session's, not the operator's): A, the `Agent` runner as H1 used it, decided 2026-10-30 so that H1 and H2 share one harness and F4 can attribute any change to the text; S4's CLI runner follows H2.
- Carried from Stage 0: whether to paste the printed pointer blocks into `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md` and `~/.gemini/GEMINI.md`.

```
D8
Decision:      Whether variant C (SKILL.md, adapters and templates rewritten under ASD-STE100's writing rules without its dictionary, D2's deferred option) is staged, and against what.
Options:       A defer to F4: stage C1 only if H2 shows Haiku still below 18 of 20 on the revised text / B stage C1 now, beside O3, scored on Haiku in H2 / C drop variant C
Pros and cons: A costs nothing now; if the cap fix alone lifts Haiku, the rewrite has no target and is never paid for; if not, C1 runs with a clean baseline. B gets the answer one stage earlier at about 6 USD plus 40 Haiku runs, but two text changes land in one rerun and H2 cannot say which one moved Haiku. C saves about 6 to 9 USD and leaves D2's condition untested; Sonnet's cells cannot show a rise at any n the budget allows, so Haiku is the only place variant C could ever be shown to help.
Blast radius:  A none now. B a confounded H2. C D2's condition closed without data.
Recommended:   A, because H2 must attribute any change to one cause, and the cap finding means Haiku's baseline is not yet measured; the threshold (18 of 20) is fixed now so F4 does not choose it after seeing the result.
Decided:       A, by the operator on 2026-10-30 ("A: defer to F4"); the threshold of 18 of 20 on Haiku is fixed from this date.
```

```
D9
Decision:      How many runs Stage H2 makes on the revised text.
Options:       A 120: Sonnet two runs per scenario in both arms (n = 40 each), Haiku one (n = 20 each) / B 80: one run per cell as H1 / C 160: two runs per scenario in every cell
Pros and cons: A can show Sonnet above 91 percent (40 of 40), separate the Sonnet arms if the hand arm is at or below 34 of 40, and see Haiku's recovery (10 to 18 of 20 is p of about 0.01); about 2.4 USD orchestration plus 3 to 18 of runs. B cannot show Sonnet above 84 percent or separate its arms; about 2 plus 2 to 12. C narrows Haiku too (n = 40) for about 1 to 6 USD more; Haiku's question is whether it passes at all, which n = 20 answers.
Blast radius:  A and C one stage's cost. B a second rerun if F4 needs to separate the arms.
Recommended:   A, because the money question is whether Sonnet needs the calculator, and that needs n = 40 on Sonnet and nothing more on Haiku.
Decided:       A, by the operator on 2026-10-30 ("A: 120 runs"); the H2 handoff carries it.
```

```
D10
Decision:      Whether variant C (C1, an ASD-STE100-style rewrite of SKILL.md judged on Haiku) is staged now that D8's gate is open (Haiku 17 of 20 on the scorer's count) and F4 has read the misses as two block-format faults and one open input default.
Options:       A leave C1 unstaged and close variant C with F4's ruling / B stage C1 after S4 and S5 against the measure fixed in F4 section 1.4 (baseline n = 42 on the S5 text, C1 at the same n, Fisher p under 0.05) / C stage C1 now against H2's cell, as D8 first read
Pros and cons: A costs nothing and keeps the budget for the clean measurement; it closes D2's deferred option on a reading of three records rather than a run. B is the only version that can measure a rewrite at all, about 12.31 USD of sessions plus about 84 Haiku runs (1 to 6 USD), and it can show an effect only if the baseline cell falls to about 34 of 42, which F4's reading makes unlikely. C spends the same money on a cell whose misses are known to be contract faults, so its result would measure S4's absence.
Blast radius:  A none; variant C can be reopened by a later run if Haiku's clean-harness cell (H3) falls below 19 of 21. B two more stages on the serial chain after H3. C a confounded result.
Recommended:   A, because a rewrite's target on the revised text is one scenario whose miss is an input default S5 fixes, and no n the budget allows can show a move from 19 of 20; D8 deferred this choice to F4 and F4 takes it, subject to the operator's overrule.
```
