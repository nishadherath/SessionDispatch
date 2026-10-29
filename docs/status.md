# Live status

The rolling view of the work: done, in progress, left to do, each with a
time estimate, and the decisions waiting on the operator. The session
doing the work updates it at every stage boundary and whenever an
estimate moves by more than a quarter (AGENTS.md rule 11). Handoffs in
`docs/handoffs/` are the per-stage snapshots; the roadmap and its
arithmetic are in the newest `docs/assessment-YYYY-MM-DD.md`.

Last updated: 2026-10-29 by the assessment session (claude-fable-5-1, xhigh).

## Done

| Stage | Date | Result |
|---|---|---|
| Stage 0: bootstrap | 2026-10-27 | Skill, nine adapters, first price table, templates, worked example, three scripts, protocol kit. Commits `9e821b7`, `6ff89f1`. Gate 47 files, 0 findings. |
| Stage 0b: first assessment and protocol revision | 2026-10-29 | `docs/assessment-2026-10-29.md` with a priced roadmap; the standing instructions of 2026-10-29 recorded; session mechanics re-verified; the two operator questions and this document added; the gate checks them. |

## In progress

None. The next stage starts when the operator picks it (assessment
section 7, decision D4) or, once the autonomy answer is yes, when the
finishing session starts it.

## To do

From `docs/assessment-2026-10-29.md` section 6. Costs at API list price
from `pricing/2026-10-18.json`; wall clock is the model's, operator
review separate.

| Stage | Class, effort | Cost (USD) | Wall clock | Depends on |
|---|---|---|---|---|
| H0: price table refresh, on or before 2026-11-02 | Haiku, medium | 0.10 to 0.25 | 10 to 15 min plus the operator's figures | Decision D3 |
| O1: formula revision, calculator script, gate recomputes the examples, new worked example | Opus, high | 7 to 12 | 45 to 75 min | H0 |
| S1: install portability (`scripts/` in the payload, `--check`, `--seed`) and tests for the three scripts | Sonnet, medium | 2 to 4 | 30 to 45 min | none; runs beside O1 |
| F1: acceptance of O1 | Fable, xhigh, fresh session | 4 to 6 | 20 to 30 min | O1 |
| O2: evaluation design (scenario set, rubric, runner brief) | Opus, high | 4 to 8 | 30 to 60 min | F1 |
| S2: evaluation runner | Sonnet, medium | 2 to 4 | 30 to 45 min | O2 |
| H1: evaluation runs with Haiku and Sonnet as subjects | Sonnet orchestrating | 3 to 6 (rough) | 30 to 60 min | S2 |
| S3: adapter verification on each harness | Sonnet, medium, operator present | 1 to 2.5 | 30 to 45 min plus the operator's installs | none |
| F2: reassessment on the evaluation results | Fable, high | 12 to 20 | 60 to 120 min | H1 |

Total about 46 USD (quote 35 to 65). Serial chain about 5.5 hours of
model time; operator review about 3 to 4 hours across all stages
(rough).

## Decisions waiting

Each is set out in the five-part shape in section 7 of the assessment.

- D1 Autonomy (`docs/operator-preferences.json`, key `autonomy`): unanswered.
- D2 ASD-STE100 (key `ste100`): unanswered.
- D3 How price refreshes are filled: the operator's figures, or live reads of each `source` page under a standing yes.
- D4 Which stage starts first: recommended O1, with S1 beside it.
- Carried from Stage 0: whether to paste the printed pointer blocks into `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md` and `~/.gemini/GEMINI.md`.
