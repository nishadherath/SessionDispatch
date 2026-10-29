# Live status

The rolling view of the work: done, in progress, left to do, each with a
time estimate, and the decisions waiting on the operator. The session
doing the work updates it at every stage boundary and whenever an
estimate moves by more than a quarter (AGENTS.md rule 11). Handoffs in
`docs/handoffs/` are the per-stage snapshots; the roadmap and its
arithmetic are in the newest `docs/assessment-YYYY-MM-DD.md`.

Last updated: 2026-10-30, fifth update, by the Fable coordinating session (claude-fable-5-1, xhigh) after pushing `main` and recording the standing push approval.

## Done

| Stage | Date | Result |
|---|---|---|
| Stage 0: bootstrap | 2026-10-27 | Skill, nine adapters, first price table, templates, worked example, three scripts, protocol kit. Commits `9e821b7`, `6ff89f1`. Gate 47 files, 0 findings. |
| Stage 0b: first assessment and protocol revision | 2026-10-29 | `docs/assessment-2026-10-29.md` with a priced roadmap; the standing instructions of 2026-10-29 recorded; session mechanics re-verified; the two operator questions and this document added; the gate checks them. |
| Stage H0: price table refresh | 2026-10-29 | `pricing/2026-10-29.json`: Anthropic read live, unchanged, `fetched` 2026-10-29; other families null. Gate 129 files, 330 findings, all under `graft\` (gitignored cache, awaiting O1's skip); install held until O1 lands. Handoff `docs/handoffs/2026-10-29-stage-h0-pricing.md`. |
| Stage O1: formula revision, calculator, gate recompute, new example | 2026-10-29 | `SKILL.md` step 2 revised (current and target prices, growth F + O, miss term, break-even, split); `scripts/dispatch.mjs`; the gate recomputes every example and skips gitignored and nested-checkout folders. Commit `0cc7d52`. Gate 57 files, 0 findings. About 30 minutes. The Stage 0 record's 1.19 recomputes to 1.18 (its terms were rounded before adding); F1 ruled for 1.18 and corrected the record. |
| Stage S1: install portability, seed command, script tests | 2026-10-29 | On branch `claude/modest-swirles-cae434` (`9734bfd`, `9b2cdc3`): `scripts/` in the payload, `install --check` and `--seed`, 22 tests green, gate 53 files and 0 findings there. Merged into `main` as `73393b8` with a clock seam (`check.mjs --today`) so the gate tests keep the repository's tables, and one date convention (local day) across the scripts. |
| Stage F1: adversarial acceptance of Stage O1 | 2026-10-29 | `docs/acceptance-2026-10-29-stage-o1.md`: step 2 derived by hand, every figure recomputed without the shared module, guardrails re-read, calculator probed, four gate mutations caught. Fourteen claims accepted, none rejected. Six findings handed on (fresh-side fixed cost understated by 2 to 11 percent of the smaller side; reasoning retention unmeasured; the gate's recompute stops at totals; three effort rules for acceptance; two sentences for step 2.1; one claim's wording). Commit `17c9526`. Gate 59 files, 0 findings. About 25 minutes; about 5 USD counting visible output, about 7.4 with reasoning (estimate). |

## In progress

| Stage | Session | Class, effort | Where | Estimate |
|---|---|---|---|---|
| O2: evaluation design (scenario set, rubric, runner brief) | not started: while the operator works over Remote Control the app allows neither a start nor a card from a session, so the coordinating session starts O2 on the operator's next message typed in the desktop app; F1's card was withdrawn | Opus, high | this checkout, `main` | 30 to 60 min, 5 to 10 USD (6.17 by the calculator) |

O2's brief is `docs/handoffs/2026-10-29-stage-o2-eval-design.md`; it writes
`eval/` and the S2 handoff, and the coordinating session starts S2 from it.
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
| S2: evaluation runner | Sonnet, medium | 2 to 4 | 30 to 45 min | O2 |
| H1: evaluation runs with Haiku and Sonnet as subjects | Sonnet orchestrating | 3 to 6 (rough) | 30 to 60 min | S2 |
| S3: adapter verification on each harness | Sonnet, medium, operator present | 1 to 2.5 | 30 to 45 min plus the operator's installs | none |
| F2: reassessment on the evaluation results | Fable, high | 12 to 20 | 60 to 120 min | H1 |

From the F1 acceptance (its section 7), not yet staged: an Opus stage for
the fresh-side fixed-cost terms and step 2.1's two sentences (F1-1,
F1-5; after H1 shows their weight, about 3 USD, estimate); a Sonnet stage
for the gate's recompute of term lines and Step B costs (F1-3, about 1
USD, estimate); F2 settles the one effort rule for acceptance (F1-4).

Total for the whole roadmap, the stages done included: about 46 USD
(quote 35 to 65), plus about 4 USD for the F1 follow-ups. Serial chain
about 5.5 hours of model time, about 1.5 hours of it done; operator
review about 3 to 4 hours across all stages (rough).

## Decisions waiting

Each is set out in the five-part shape in section 7 of the assessment,
D5 below.

- D1 Autonomy: yes, recorded 2026-10-29 in `docs/operator-preferences.json`. Finishing sessions start the next stage themselves where the class allows; a higher class is started by the Fable coordinating session or by the operator.
- D2 ASD-STE100 (key `ste100`): unanswered; asked again by the F1 session on 2026-10-29. The assessment recommends A (no).
- D3 How price refreshes are filled: the operator chose live reads (option b) on 2026-10-29, for the Anthropic family first. Other families stay null until the operator names them.
- D4 Stage order: settled on 2026-10-29 by the operator starting O1, S1 and H0 together.
- D5 Acceptance of O2's design, below.
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
