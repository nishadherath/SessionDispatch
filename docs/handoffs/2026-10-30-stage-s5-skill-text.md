---
stage: "Stage S5: skill text, the class floor and two definitions"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-10-30
from: "Session local_1edc5e80 (Fable 5.1, high): Stage F4, the reassessment on H2"
---

# Stage S5: skill text, the class floor and two definitions

## Goal
Type three additions into `SKILL.md`, exactly as written below (F4 decided the wording under matrix row 5; this stage places it), add the changelog line, refresh the installed copies, and leave the gate green. Done when the diff of `SKILL.md` against `main` is the three additions and nothing else, `node scripts/check.mjs` exits 0 with every scenario's expected values unchanged (`checkEval`), `npm test` passes, `node scripts/install.mjs` then `--check` reports 0 files behind, and all of it is committed by name. The coordinating Fable session reads the diff against this file as the acceptance (above matrix row 4's Opus for Sonnet work; no separate acceptance stage).

## Decisions already made
- The wording is F4's (`docs/assessment-2026-10-30-f4.md` sections 1.4, 2.1, 2.3). Change no other sentence; if a placement below does not fit the file as it stands, stop and ask the coordinating session with the five-line escalation rather than reword.
- No formula change, no change to the front matter, the matrix, the guardrails or any figure; the examples and scenarios keep reproducing.
- This stage edits `SKILL.md` and `README.md` only. Stage S4 runs beside it on `eval/` and `scripts/`; the one shared file is `README.md` (a changelog line each); whichever lands second rebases its line.
- Prose: Australian English, no em-dashes, none of the persona's banned words; the gate enforces the last two.

## Files and links that matter
- `SKILL.md`: the introduction (before the heading `## 0. Should this skill run at all`), step 1.2's table row for O (about line 85), step 2 between the `penalty_loss` paragraph and `**Short path: the break-even.**` (about line 230).
- `README.md` changelog (at about line 126): one line for this stage.
- `docs/assessment-2026-10-30-f4.md` sections 1.2 and 1.4 (the ruling the floor states).

## The three additions, verbatim

1. At the end of the introduction, as a new paragraph immediately before `## 0. Should this skill run at all`:

   **Class floor (measured 2026-10-30).** This procedure is written for the Sonnet class and above. On the twenty-scenario evaluation in the SessionDispatch repository (`eval/results-2026-10-31.md`), a Sonnet-class subject reached the expected verdict in 40 of 40 runs with the calculator and 40 of 40 by hand. A Haiku-class subject reached it in 17 of 20 with the calculator and 19 of 20 by hand on the scorer's count; the two further calculator misses were records whose verdict was right and whose machine-readable result block (the evaluation's output contract) was malformed. A Haiku-class model therefore follows the procedure but is not relied on for the machine-readable record: where one runs it, keep the calculator on and have a parser check the handoff's front matter and the record's figures before anything acts on them.

2. In step 1.2, the O row's "How to get it" cell: replace the two sentences `Default 1,500. Writing-heavy stages: 3,000.` with:

   Default 1,500. Writing-heavy stages: 3,000, where writing-heavy means matrix row 3's writing (a specification, a brief, a design note) or a new module written from a blank file; row 2 work with a stated test, a refactor and a chore take the default.

   The rest of the cell stays as it is.

3. In step 2, a new paragraph after the `penalty_loss` paragraph and before `**Short path: the break-even.**`:

   The fresh side omits two small terms: the handoff turn's own context read at the current model, and the turns the fresh session spends reading R in. Measured on three records (acceptance of Stage O1, finding F1-1) they are 2 to 11 percent of the smaller side. A `fresh` verdict by cost whose margin is inside that range is fragile: write it so in step 5 and keep it.

## Verified facts
- `node scripts/check.mjs`: 97 files, 0 findings; `npm test`: 35 pass (F4's close, 2026-10-30).
- `SKILL.md` SHA-256 before this stage: `60107f3e130f54132f16bbfaf95fc41913fc6e8301792bb24f1006c6b7b9276b` (the H2 results header). Any later evaluation run records the new hash.
- The installed copies (claude, codex, opencode) were current after O3; this stage's edit puts them behind until `node scripts/install.mjs` runs.

## Work completed
- None in this stage. F4's commit holds this handoff and the assessment.

## Unresolved questions
- None for the operator. Coordinating session: start beside S4 or after it.

## Exact next action
Run `get_session self` and stop unless it reports `claude-sonnet-5-5` at `medium`. Then load `ENGINEERING_PERSONA.sonnet.md` and `ENGINEERING_PERSONA_LANGUAGES/ai-prompting.sonnet.md`, `docs/operator-protocol.md` and `AGENTS.md`, read this handoff, and make addition 1 in `SKILL.md`.

## Cost projection
Sonnet 5.5, medium, fresh: T 15, F 3,000, O 1,500, B 87,114 (measured), R 15,000 (estimate), H 2,500: 0.85 USD as a piece (the `S5` row of `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f4-roadmap.json --today 2026-10-30`, `pricing/2026-10-29.json`); quote 0.7 to 1.5.

## Time projection
15 to 25 minutes wall clock (protocol section 7, Sonnet, one commit plus the install). Operator review about 10 minutes, by diff.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-fable-5-1, effort high, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day). Priced as the `S5` piece of the roadmap command above; the continue-or-hand-off decision for the F4 session is the S4 handoff's record (fresh, by cost, 12.91 against 3.31 USD), and this piece is the second of two Sonnet pieces that run in parallel (step 3.2 rule 1: disjoint files, one shared changelog line). Guardrails: 1 no (T 15, over 10); 2 to 5 as the S4 record; 6 acceptance by the coordinating Fable session reading a diff of three fixed paragraphs; 7 within the cap; 8 Sonnet at medium stated above. Cost of deciding: inside the S4 record's figure.
