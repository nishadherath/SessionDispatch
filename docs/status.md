# Live status

The rolling view of the work: done, in progress, left to do, each with a
time estimate, and the decisions waiting on the operator. The session
doing the work updates it at every stage boundary and whenever an
estimate moves by more than a quarter (AGENTS.md rule 11). Handoffs in
`docs/handoffs/` are the per-stage snapshots; the roadmap and its
arithmetic are in the newest `docs/assessment-YYYY-MM-DD.md`.

Last updated: 2026-10-29, third update, by the Fable coordinating session (claude-fable-5-1, xhigh) on starting Stage F1.

## Done

| Stage | Date | Result |
|---|---|---|
| Stage 0: bootstrap | 2026-10-27 | Skill, nine adapters, first price table, templates, worked example, three scripts, protocol kit. Commits `9e821b7`, `6ff89f1`. Gate 47 files, 0 findings. |
| Stage 0b: first assessment and protocol revision | 2026-10-29 | `docs/assessment-2026-10-29.md` with a priced roadmap; the standing instructions of 2026-10-29 recorded; session mechanics re-verified; the two operator questions and this document added; the gate checks them. |
| Stage H0: price table refresh | 2026-10-29 | `pricing/2026-10-29.json`: Anthropic read live, unchanged, `fetched` 2026-10-29; other families null. Gate 129 files, 330 findings, all under `graft\` (gitignored cache, awaiting O1's skip); install held until O1 lands. Handoff `docs/handoffs/2026-10-29-stage-h0-pricing.md`. |
| Stage O1: formula revision, calculator, gate recompute, new example | 2026-10-29 | `SKILL.md` step 2 revised (current and target prices, growth F + O, miss term, break-even, split); `scripts/dispatch.mjs`; the gate recomputes every example and skips gitignored and nested-checkout folders. Commit `0cc7d52`. Gate 57 files, 0 findings. About 30 minutes. The Stage 0 record's 1.19 recomputes to 1.18 (its terms were rounded before adding); F1 rules on it. |
| Stage S1: install portability, seed command, script tests | 2026-10-29 | On branch `claude/modest-swirles-cae434` (`9734bfd`, `9b2cdc3`): `scripts/` in the payload, `install --check` and `--seed`, 22 tests green, gate 53 files and 0 findings there. Not merged into `main`; awaits the operator's word. |

## In progress

| Stage | Session | Class, effort | Where | Estimate |
|---|---|---|---|---|
| F1: adversarial acceptance of Stage O1 | `local_ec0281d1` | Fable, xhigh | this checkout, `main` | 20 to 30 min, 5 to 15 USD |

F1 was started by the Fable coordinating session under the autonomy yes,
with `docs/handoffs/2026-10-29-stage-f1-acceptance.md` as its brief. If
F1 accepts O1 it starts Stage O2 itself. S1 is complete on branch
`claude/modest-swirles-cae434` and is merged into `main` on the operator's
word; the merge conflicts in `README.md` and `docs/status.md` are
changelog and status lines. On merge: align the scripts' date convention
(F1 handoff, unresolved questions) and refresh the user copy with
`node scripts/install.mjs`.

## To do

From `docs/assessment-2026-10-29.md` section 6. Costs at API list price
from `pricing/2026-10-18.json`; wall clock is the model's, operator
review separate.

| Stage | Class, effort | Cost (USD) | Wall clock | Depends on |
|---|---|---|---|---|
| F1: acceptance of O1 | Fable, xhigh, fresh session | 5 to 15 (5.89 by the calculator) | 20 to 30 min | O1 (done) |
| O2: evaluation design (scenario set, rubric, runner brief) | Opus, high | 4 to 8 | 30 to 60 min | F1 |
| S2: evaluation runner | Sonnet, medium | 2 to 4 | 30 to 45 min | O2 |
| H1: evaluation runs with Haiku and Sonnet as subjects | Sonnet orchestrating | 3 to 6 (rough) | 30 to 60 min | S2 |
| S3: adapter verification on each harness | Sonnet, medium, operator present | 1 to 2.5 | 30 to 45 min plus the operator's installs | none |
| F2: reassessment on the evaluation results | Fable, high | 12 to 20 | 60 to 120 min | H1 |

Total for the whole roadmap, the three stages in progress included: about 46 USD (quote 35 to 65). Serial chain about 5.5 hours of
model time; operator review about 3 to 4 hours across all stages
(rough).

## Decisions waiting

Each is set out in the five-part shape in section 7 of the assessment.

- D1 Autonomy: yes, recorded 2026-10-29 in `docs/operator-preferences.json`. Finishing sessions start the next stage themselves where the class allows; a higher class is started by the Fable coordinating session or by the operator.
- D2 ASD-STE100 (key `ste100`): unanswered.
- D3 How price refreshes are filled: the operator chose live reads (option b) on 2026-10-29, for the Anthropic family first. Other families stay null until the operator names them.
- D4 Stage order: settled on 2026-10-29 by the operator starting O1, S1 and H0 together.
- Carried from Stage 0: whether to paste the printed pointer blocks into `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md` and `~/.gemini/GEMINI.md`.
