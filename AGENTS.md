Model class: load `ENGINEERING_PERSONA.<class>.md` for your class (a
harness or delegating agent states it; unset means `sonnet`) plus
`ENGINEERING_PERSONA_LANGUAGES/node-ts-js.<class>.md`, `bash.<class>.md`
when the task touches shell, and `ai-prompting.<class>.md` when it
touches `SKILL.md` or an adapter. Then `docs/operator-protocol.md`: the
operator's standing instructions, loaded on every session and binding.

# AGENTS.md: SessionDispatch

This repository holds one portable skill, `session-dispatch`, that the
operator includes in every Claude Code session and project and in
sessions of other agentic harnesses (Codex, Cline, OpenCode, Gemini CLI,
Antigravity, Z-Code, Kimi Code, the DeepSeek harness). The skill is a
procedure a model one or two classes below the frontier can follow: it
decides with arithmetic whether to continue the current session or hand
off to a fresh one, picks the model class, effort and concurrency shape
for the coming work, argues the opposite in an adversarial pass, and
records the decision and the token cost of making it in the handoff.
`SKILL.md` at the root is the canonical text; everything else serves it.

## Non-negotiables

1. **`node scripts/check.mjs` is the gate.** Nothing is done until it
   exits zero (or exits 2 on a stale table and nothing else) and its
   counts are quoted in the report. Node 20 or later, standard library
   only.
2. **One canonical text.** `SKILL.md` holds the procedure. Adapters
   under `adapters/` say where the skill goes in each harness and carry
   a pointer block; they never restate the procedure. A change to the
   procedure is a change to `SKILL.md` and, where the example's figures
   move, to `examples/`.
3. **Prices live in `pricing/<date>.json`, never in text or code.** The
   newest file by name is in force. The skill refuses a table older than
   its `max_age_days` (14) and any null figure; a null is filled by the
   operator or by a live read of the row's `source` page with the
   operator's yes, never from memory. No vendor fact in `SKILL.md` or the
   scripts.
4. **Arithmetic, not adjectives.** Every verdict in a record or a handoff
   shows its inputs with sources, the formula, the numbers and the
   margin. A verdict changes only on arithmetic or a guardrail, never on
   preference.
5. **The decision is capped.** 8,000 tokens and 10 minutes; past the
   cap, the default (continue, same model, same effort) and a recorded
   overrun.
6. **Windows is the primary platform.** Paths through `path.join` and
   `os.homedir()`; copies, never links; nothing assumes a POSIX shell.
7. **Outward-facing steps need a yes.** Creating a remote and opening a
   pull request go through the REST API with the stored credential (no
   `gh` CLI here), only after the operator says so in the session that
   does it, and the token is never printed. A push to `origin` carries
   the operator's standing yes of 2026-10-30, recorded under
   `approvals.push_origin` in `docs/operator-preferences.json`: push
   after a green gate and a clean commit, and name the push in the
   stage report (protocol section 1.3).
8. **Keep the shape.** A changelog line in `README.md` per user-visible
   change; a new adapter only after its harness's folder layout is
   checked on a machine; a new worked example for any change to the
   step 2 formula.

## Operator protocol (always on)

The full text and mechanics are `docs/operator-protocol.md`. The rules
that every session applies without being asked:

1. **Handoff on every model or effort change, new agent, or finished
   stage.** Write `docs/handoffs/YYYY-MM-DD-<stage>.md` from the
   template in `docs/handoffs/README.md`: goal, decisions made, files
   that matter, verified facts, work completed, open questions, exact
   next action, cost projection, time projection, and the session
   dispatch decision. Nothing else.
2. **Commit before handing off.** Gate green, work committed, then the
   handoff; never a red tree, never uncommitted work.
3. **Create the next session's entry yourself.** A fully specified
   stage for a cheaper class runs as a sub-agent with the handoff as its
   brief, or as a fresh session started with `start_session` carrying
   the handoff path and its `model` and `effort` (accepted at or below
   this session's class). Without the operator's autonomy yes (protocol
   section 1.3) the fresh session is proposed as a card for the operator
   to start; with it, the session is started at once and the operator is
   told. A stage that needs a higher class than this session gets a card
   naming the model for the operator to pick. A session that takes over
   a handoff checks its own model and effort first and stops on a
   mismatch.
4. **Every stage report ends with the next stage's model, effort and
   exact kickoff prompt**, as a labelled line and a fenced block.
5. **Projections are arithmetic.** Cost at API list price from the table
   in force, with the assumptions stated; time as wall clock plus review
   time (protocol sections 6 and 7).
6. **Decisions the operator must make** are presented as decision,
   options, pros and cons, blast radius, recommendation with reasoning.
   Everything not depending on the decision is finished first.
7. **Prose conventions hold in every file written here:** Australian
   English, no em-dashes, none of the persona's banned vocabulary. The
   check script enforces the last two outside the persona copies.
8. **The standing analysis brief** (protocol section 1.1) is answered,
   when asked, in a dated `docs/assessment-YYYY-MM-DD.md`.
9. **Say when you are guessing.** A figure or claim that is an estimate
   or low-confidence is marked as such where it appears, never presented
   as measured.
10. **Two questions, asked once.** `docs/operator-preferences.json`
    records whether the operator wants ASD-STE100 Simplified Technical
    English and whether sessions may work autonomously. The session-start
    hook names any unanswered one; ask it in the first reply, record the
    answer with the date, commit. Protocol section 1.3 says what each
    answer changes.
11. **Keep `docs/status.md` current.** Work done, in progress and left,
    each with a time estimate, updated at every stage boundary; the hook
    announces it.

## Daily commands

```
node scripts/check.mjs                 # the gate: table, templates, examples, adapters, prose
node scripts/install.mjs               # user-level install for Claude Code
node scripts/install.mjs --harness all --dry-run
node scripts/pricing-new.mjs           # start a price refresh (today's file, figures unchanged)
```
