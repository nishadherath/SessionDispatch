# Live status

The rolling view of the work: done, in progress, left to do, each with a
time estimate, and the decisions waiting on the operator. The session
doing the work updates it at every stage boundary and whenever an
estimate moves by more than a quarter (AGENTS.md rule 11). Handoffs in
`docs/handoffs/` are the per-stage snapshots; the roadmap and its
arithmetic are in the newest `docs/assessment-YYYY-MM-DD.md`.

Last updated: 2026-10-30, tenth update, by Stage S2 (claude-sonnet-5-5, medium) at its close.

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

## In progress

| Stage | Session | Class, effort | Where | Estimate |
|---|---|---|---|---|
| H1: evaluation runs | to be started by the coordinating session from `docs/handoffs/2026-10-30-stage-h1-eval-runs.md` | Sonnet, medium | this checkout, `main` | 30 to 60 min; 6 to 20 USD by D7 (estimate) |

Stage S1 is merged into `main` (`73393b8`): the installer ships `scripts/`,
has `--check` and `--seed`, and `npm test` runs 22 tests; the gate takes
`--today` and, with the calculator, judges a table's age by the local
calendar day. The user copy at `~/.claude/skills/session-dispatch/` was
refreshed with `node scripts/install.mjs` on 2026-10-29, and `--check`
reports all three installed copies (claude, codex, opencode) current.

## To do

From `docs/assessment-2026-10-29.md` section 6. Costs at API list price
from `pricing/2026-10-18.json`; wall clock is the model's, operator
review separate.

| Stage | Class, effort | Cost (USD) | Wall clock | Depends on |
|---|---|---|---|---|
| S3: adapter verification on each harness | Sonnet, medium, operator present | 1 to 2.5 | 30 to 45 min plus the operator's installs | none |
| F2: reassessment on the evaluation results | Fable, high | 12 to 20 | 60 to 120 min | H1 |
| Variant C (D2, conditional): `SKILL.md`, adapters and templates rewritten under STE100's writing rules, scored on the evaluation scenarios | Opus, high | 3 to 5 (estimate) | 30 to 60 min | H1 |

From the F1 acceptance (its section 7), not yet staged: an Opus stage for
the fresh-side fixed-cost terms and step 2.1's two sentences (F1-1,
F1-5; after H1 shows their weight, about 3 USD, estimate); a Sonnet stage
for the gate's recompute of term lines and Step B costs (F1-3, about 1
USD, estimate); F2 settles the one effort rule for acceptance (F1-4).

Total for the whole roadmap, the stages done included: about 46 USD
(quote 35 to 65) as assessed, about 56 to 65 with H1 at O2's estimate,
plus about 4 USD for the F1 follow-ups. Serial chain
about 5.5 hours of model time, about 1.5 hours of it done; operator
review about 3 to 4 hours across all stages (rough).

## Decisions waiting

Each is set out in the five-part shape in section 7 of the assessment,
D5 below.

- D1 Autonomy: yes, recorded 2026-10-29 in `docs/operator-preferences.json`. Finishing sessions start the next stage themselves where the class allows; a higher class is started by the Fable coordinating session or by the operator.
- D2 ASD-STE100 (key `ste100`): no, recorded 2026-10-30 (option A, the recommendation). Variant C, STE100's writing rules without its dictionary for `SKILL.md`, the adapters and the templates, is deferred to after H1 and is adopted only if it scores higher on the evaluation scenarios.
- D3 How price refreshes are filled: the operator chose live reads (option b) on 2026-10-29, for the Anthropic family first. Other families stay null until the operator names them.
- D4 Stage order: settled on 2026-10-29 by the operator starting O1, S1 and H0 together.
- D5 Acceptance of O2's design, below. O2's evidence for the recommendation's condition: the rubric scores deterministically; the scorer's recompute path reproduces the calculator on all 18 computable scenarios, and every hand-set expectation names its rule in the scenario's notes.
- D7 H1's scope, below.
- D6 Pushes to origin: standing yes given by the operator on 2026-10-30 ("Push, standing yes"), recorded under `approvals.push_origin` in `docs/operator-preferences.json`; `main` was pushed to origin at `f84cc82` the same day, so every stage above is on the remote.
- Carried from Stage 0: whether to paste the printed pointer blocks into `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md` and `~/.gemini/GEMINI.md`.

```
D5
Decision:      Whether O2's evaluation design is accepted by a Fable session before S2 builds the runner, or whether F2's reassessment of the results is the acceptance.
Options:       A F2 covers it (as the roadmap stands) / B a short Fable acceptance of the design before S2
Pros and cons: A no extra stage; a design flaw shows up only after S2 and H1 have spent about 6 USD on it. B about 3 USD and 20 minutes (estimate) now; catches a scenario set that cannot distinguish the classes before anything is built on it.
Blast radius:  A S2 and H1 may need a rerun if the design is wrong. B one extra stage and one more handoff.
Recommended:   A, because S2's dry run on one scenario per class is itself a check of the design, and F2 reads every result; choose B if O2's stage report shows the rubric could not be scored deterministically.
```

```
D7
Decision:      How many of the 80 possible runs H1 makes (20 scenarios, Haiku and Sonnet subjects, calculator and hand arms).
Options:       A all 80 / B calculator arm on both classes plus hand arm on Haiku (60), then the Sonnet hand arm only if Haiku fails by hand / C calculator arm only (40)
Pros and cons: A answers every cell at once; about 23 USD (estimate). B about 14 USD; answers whether the skill is a procedure at the cheapest class first, and the Sonnet hand arm (about 10 USD) runs only when it would change the answer. C about 13 USD; never tests the skill without its calculator, which is the assessment's open question.
Blast radius:  A spends about 10 USD that B may not need. B a second H1 pass, one more handoff. C F2 cannot say whether the skill is a procedure.
Recommended:   B, because a Sonnet subject that passes where Haiku passes adds nothing, and the Sonnet hand arm is the dearest quarter of the runs.
```
