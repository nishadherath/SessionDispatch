# Assessment 2026-10-29: SessionDispatch

The first answer to the operator's six-question brief (`docs/operator-protocol.md`
section 1.1) for this repository. Every tracked file was read in full; the
two scripts were run; the arithmetic in both shipped records was re-checked
line by line; the desktop app's session tools were read from their live
schemas; this session's own context and configuration were measured. Where
a figure below is an estimate, the text says so.

| Field | Value |
|---|---|
| Date | 2026-10-29 |
| Session | `local_af23607d`, Claude desktop app, `claude-fable-5-1`, effort `xhigh`, permission mode auto |
| Repository read | `main` at `6ff89f1`, in sync with origin (0 ahead, 0 behind), clean tree, 44 tracked files, 322 KB |
| Gate at start | `node scripts/check.mjs`: 47 files read, 0 findings, exit 0 (Node 26.7.0) |
| Installed copy | `~/.claude/skills/session-dispatch/` byte-identical to the repository payload (`diff -rq`) |
| Price table | `pricing/2026-10-18.json`, 11 days old; the gate exits 2 from 2026-11-02 UTC |
| Context | 163,573 of 1,000,000 tokens after the reading phase; baseline 86,450 (total less the Messages category) |

**Conclusion first.** This is a sound v0.1 of a good idea. The arithmetic in
both records it ships is correct, the procedure lives in one text, prices
are data with a refusal rule, and a gate enforces the shape and the prose.
Three things hold it back. The procedure asks a model one or two classes
below the frontier to do by hand the one task such a model is worst at,
arithmetic; a calculator script would make Step A and Step B deterministic
and let the gate recompute every example. The cost model omits prompt-cache
misses, a term that alone can exceed the whole difference between
continuing and handing off. And the central claim, that a lower class
reaches the frontier's verdict by following the text, has never been
measured. Section 6 prices a nine-stage roadmap at about 46 USD list,
staged by model class; section 7 puts four decisions to the operator.

## 1. What the deliverables are

Eight things, in order of weight to the operator.

1. **The procedure, `SKILL.md`** (324 lines, about 4,700 tokens). Triggers
   (step 0), inputs with their sources (step 1), the continue-or-hand-off
   formula with a 10 percent band and quality tie-breaks (step 2), the
   class and effort matrix and the concurrency rules (step 3), eight hard
   guardrails (step 4), an adversarial pass that may change the verdict
   only on arithmetic (step 5), the record with its six-row cost of
   deciding (step 6), and a per-harness table of where the numbers come
   from (step 7).
2. **Nine adapters, `adapters/`**: Claude Code, Codex, Cline, OpenCode,
   Gemini CLI with Antigravity, Z-Code, Kimi Code, DeepSeek and a generic
   one. Each says where the skill goes, how it loads, the pointer block to
   paste and where the harness reports usage. Two are verified on the
   operator's machine (Claude Code, Z-Code); seven say so when they are not.
3. **Price tables, `pricing/`**: one dated JSON in force, the Anthropic
   family filled and operator-verified on 2026-10-18, five families null
   (OpenAI, Google, DeepSeek, Kimi, GLM); a schema README; a refresh
   starter. The skill refuses a table past 14 days or any null it needs.
4. **Templates, `templates/`**: the decision record pasted into a handoff,
   and the handoff shape with front matter.
5. **One worked example, `examples/`**: the fork_graft Stage 26 decision of
   2026-10-27 re-run through the procedure, inputs marked reconstructed
   where they were.
6. **Three scripts, `scripts/`**: `check.mjs` (the gate), `install.mjs`
   (copies the payload where each harness looks and prints pointer blocks,
   never editing an instruction file), `pricing-new.mjs`. Node 20 or later,
   standard library only, Windows paths first, copies not links.
7. **The operator protocol kit**: `AGENTS.md`, `docs/operator-protocol.md`,
   `docs/handoffs/` with its README, the session-start hook and its
   `settings.json` entry, and from today `docs/status.md` and
   `docs/operator-preferences.json`. Protocol section 9 is the recipe for
   seeding another project with the kit, which the operator's standing
   instruction asks for.
8. **Persona copies**: four class editions and twelve language profiles,
   generated elsewhere on 2026-09-03 and copied verbatim. 193 KB of the
   repository's 322 KB. Not authored here; their source is not here either.

## 2. How it all works

### 2.1 The decision pipeline

A trigger fires (a stage over ten turns, a model or effort change, a
compaction, delegation, or the operator). The session gathers inputs, each
tagged measured or estimated: the window W, the compaction point K, the
current context C0, whether it has compacted, what it knows that is in no
file; then the work ahead: turns T, fresh input per turn F, output per turn
O, the re-read set R a fresh session would need, the handoff size H, the
task type, whether the stage is design-heavy, and any step that leaves the
machine. Context growth is projected (`C_end = C0 + T*F`, `crosses = C_end >
K`) and two average contexts are formed, `C_cont` for continuing and
`C_fresh = B + R + T*F/2` for a fresh session with baseline B.

Step A prices both paths from the table in force:

```
cost_continue = T*C_cont*p_cache_read + T*F*p_cache_write + T*O*p_output + penalty_compaction
cost_fresh    = H*p_output + (B+R)*p_cache_write + T*C_fresh*p_cache_read + T*F*p_cache_write + T*O*p_output + penalty_loss
```

A side wins on cost only past a 10 percent margin; inside the band the
quality terms decide (a compacted session loses, a session that will cross
K loses, otherwise continue). Step B picks the class from a five-row
matrix keyed on task type, adjusts effort by stated rules, and lays out
the pieces with their oracles, serial or parallel. Eight guardrails are
hard stops that override the arithmetic. The adversarial pass argues the
other side, names how each input could be wrong, recomputes with the worst
one, and may change the verdict only if the recomputation crosses the band
or a guardrail. The record, with the six-row cost of deciding, is pasted
into the handoff. The whole decision is capped at 8,000 tokens and 10
minutes; past the cap the default (continue, same model, same effort) is
taken and the overrun recorded.

### 2.2 Where the money is

Two terms are identical on both sides and cancel: the fresh input written
to cache and the output. The output is also the biggest single term (60
turns of 1,500 Fable tokens is 4.50 USD of a 10 USD stage). What differs
is only the cache-read term on a smaller context, the fixed cost of the
handoff (writing H, then the fresh session's first read of B + R), and the
penalties. Rearranged, fresh pays off on cost after

```
T* = (H*p_output + (B+R)*p_cache_write) / ((C_cont - C_fresh) * p_cache_read)
```

turns. In the worked example that is 72 turns against a stage of 60, which
is why the example lands inside the band and is decided by quality. On a
1,000,000-token window, with no class change and no compaction ahead, Step
A almost always lands in the band. The money is in Step B: the Stage 0
handoff's margin from changing class (Fable to Sonnet) was 255 percent;
the worked example's margin from the context difference alone was 3.7
percent.

### 2.3 The machinery around it

The newest `pricing/<date>.json` by filename is in force; its `table_date`
must equal the filename, must not be in the future, and the gate exits 2
once it is past `max_age_days`. Each family names the page its figures
came from and the day it was read; a null is filled by the operator or by
a live read of that page with the operator's yes, never from memory. The
gate validates the table, the templates' headings, each example's headings,
cost rows and verdict lines, the skill's front matter and sections, each
adapter's sections, the hook's presence and the newest handoff's front
matter, and the prose rules (no em-dash, none of ten banned words) over
every Markdown file that is not a persona edition, skipping blockquote
lines so verbatim operator text is exempt. `install.mjs` copies the four
payload directories to each harness's skill folder where one exists, writes
Cline's rule file, and prints the pointer block for the others. The hook
announces the protocol, the newest handoff, the status document and any
unanswered operator question at every session start.

## 3. Assessment

### 3.1 What is right

- **The arithmetic is correct.** Every line of the worked example (10.10
  against 9.74 USD; the adverse recomputation at 9.60 against 11.39) and
  of the Stage 0 handoff (4.22 against 1.19 USD) was recomputed here and
  agrees to the cent.
- **One text, data for prices, pointers for harnesses.** The three
  non-negotiables that matter most are kept: no vendor fact in the text,
  no restated procedure in an adapter, no price in code.
- **Refusal over guessing.** A stale table or a null price stops the
  arithmetic rather than bending it. This is the right default for a
  procedure whose whole value is that its numbers can be trusted.
- **Guardrails are not arithmetic.** The worked example shows the design
  working: the adverse recomputation flips the cost case by 18.6 percent
  and the verdict still stands on guardrail 2, with the record saying so.
- **The skill measures itself.** The cost-of-deciding table gives the
  operator the one number needed to judge whether the procedure pays for
  itself.
- **Honesty about verification.** Seven adapters say "to be checked";
  reconstructed inputs are marked; the handoff separates measured from
  estimated.
- **Engineering hygiene.** Standard library only; `path.join` and
  `os.homedir()`; copies, never links; every gate finding names its file
  and its fix; the hook never throws.

### 3.2 Findings

Severity is the effect on a verdict or on the operator's money; confidence
is mine in the finding, not in the fix.

| No. | Finding | Severity | Confidence | Evidence |
|---|---|---|---|---|
| 1 | Step 2's text says to price both sides with the target class's prices. Both shipped records price `continue` at the current session's model and `fresh` at the target class, which is the right comparison (guardrail 8 forbids a mid-session class change). The text is wrong and the records deviate from it. | High | High | `SKILL.md` step 2 first paragraph; Stage 0 handoff, Step A |
| 2 | No cache-miss term. The formula assumes every turn reads the whole context from cache. A miss rewrites the context at the cache-write rate: on a 200,000-token Fable context, one miss costs 2.45 USD. Six misses in a 60-turn stage exceed the entire cache-read difference in the worked example (0.68 USD). Misses come from pauses longer than the cache lifetime, which operator review produces. The harness states a one-hour lifetime for this session; the API default is five minutes. The omission biases Step A toward continuing, since the larger context pays more per miss. | High | High on the mechanism; the miss rate is unmeasured | `SKILL.md` step 2; price table |
| 3 | Context growth is modelled as F per turn. Output also enters the context, so growth is F + O: with the defaults 3,000 and 1,500, a third more than modelled. Both sides move together, so verdicts barely change; projections of a stage's cost are low by about 12 percent (7.39 against 8.43 USD for Stage O1 below). | Medium | High | `SKILL.md` step 1.3 |
| 4 | The long-context tier cannot be applied to a single average context; it needs a per-turn pass. Haiku's tier starts at 100,000 tokens; the desktop app's baseline is 86,450, so a Haiku stage is in the tier within a few turns. The per-turn script the protocol cites (`project-cost.cjs`) lives in another repository. | Medium | High | `pricing/2026-10-18.json` Haiku row; protocol section 6; measured baseline |
| 5 | Portability bug. The installed payload has no `scripts/`, yet step 1.4 tells a session in any project to run `node scripts/pricing-new.mjs` relative to the skill's folder. In eight of nine harness targets that path does not exist. There is also no check that an installed copy matches the repository after a refresh. | High | High | `install.mjs` PAYLOAD; `SKILL.md` step 1.4; `ls ~/.claude/skills/session-dispatch` |
| 6 | The gate does not check the numbers. `checkExamples` verifies headings and that a `Draft verdict` and `Verdict holds` line exist. An example with wrong arithmetic passes. | High | High | `scripts/check.mjs` `checkExamples` |
| 7 | The central claim is untested. The skill is a prompt; the project's own AI-prompting profile requires a regression suite of fixed inputs with evaluated outputs for every prompt, re-run on every model change. There is none. Nobody has measured whether Haiku or Sonnet, following the text, reaches the verdict Fable reaches, or what it costs them to decide. | High | High | `ENGINEERING_PERSONA_LANGUAGES/ai-prompting.fable.md`; the repository has no `eval/` |
| 8 | No tests for `check.mjs`, `install.mjs` or `pricing-new.mjs`. The gate guards everything and nothing guards the gate. A fixture set (stale table exits 2, a null beside a fetched date exits 1, an em-dash exits 1, green exits 0) is an hour of Sonnet work with `node:test`. | Medium | High | `scripts/`; persona section 11 |
| 9 | Protocol section 5 was out of date. It named `spawn_task` and said the chip cannot set the model. On 2026-10-29 `start_session` takes `model` and `effort` for a fresh session at or below the parent's class, and `set_session_model` and `set_session_effort` change a child afterwards (cheaper without a prompt, dearer with the operator's confirmation). The autonomy the operator asks for is now mechanically possible for same-or-cheaper classes. Corrected today. | Medium | High | Tool schemas read in this session |
| 10 | Protocol section 9 (seeding) omitted the persona files that the first line of `AGENTS.md` requires. A project seeded by the list would point at missing files. Corrected today. | Low | High | `AGENTS.md` line 1; protocol section 9 |
| 11 | Two clocks. The scripts take the date from `toISOString` (UTC); handoffs and the operator use local time (UTC+11 today). A table created locally in the morning is named for the previous UTC day; a table named by local date can read as "in the future" for up to 11 hours. Harmless so far; pick one convention and state it. | Low | High | `check.mjs` `todayIso`; `pricing-new.mjs` |
| 12 | Output per turn is effort-independent. The defaults were measured on one Fable session at high effort. `xhigh` and `max` produce more reasoning tokens, which are billed as output. An effort multiplier, measured, would tighten projections. | Low | Medium (not measured per effort in this harness) | protocol section 6 |
| 13 | `--user` is documented as a flag and never parsed; the default path happens to do what it says. Harmless, misleading. | Low | High | `install.mjs` argument handling |
| 14 | Step A has no short path. A closed-form break-even (section 2.2) settles Step A in one line when the class does not change, leaving the budget for Step B, which carries the money. | Low | High | derivation in section 2.2 |
| 15 | The Haiku you pay for in the desktop app is long-context Haiku: cache read 0.05 and output 2.50 per million against Sonnet's 0.10 and 10. Half of Sonnet's read rate, not a tenth. The protocol's section 2 table now says so; the matrix should too when Haiku is chosen for a stage that runs in this app. | Observation | High | price table; measured baseline 86,450 |
| 16 | The persona copies are generated from a source not in this repository, built 2026-09-03, with no commit pin. A refresh is not reproducible from here. | Observation | High | file headers |

### 3.3 The economics the formula does not see

Four things follow from the findings and from the measured figures, and
they change how the skill should be read until Stage O1 lands.

**Cache misses dominate the continue-or-fresh difference.** Finding 2 in
numbers: the worked example's two sides differ by 0.36 USD on paper. A
single cache miss on the continuing session's 190,000-token context costs
2.33 USD; on the fresh session's 145,000 it costs 1.78. One miss per ten
turns over a 60-turn stage is 14 USD against 10.7 USD, a 3.3 USD swing in
favour of fresh, nine times the paper difference. Any stage with operator
review between turns longer than the cache lifetime should carry a miss
term `M * C_avg * (p_cache_write - p_cache_read)`, with M estimated from the
review pattern and stated.

**Growth is F + O, and the baseline is the floor.** With an 86,450-token
baseline, no stage in this app starts under 90,000 tokens of context. The
protocol's section 6 defaults (C from 30,000 to 150,000) were measured in
a session with fewer tools loaded; in the desktop app add the baseline.
The calculator should take B as an input and report it.

**Output is the biggest term and the one the class change moves most.**
Fable output is 50 USD per million, Sonnet 10, Haiku 0.50 (2.50 in the long
tier). A stage's output cost scales with the class ratio; its cache-read
cost scales with context. The lever is therefore the class, then the number
of turns, and only then the context. The skill's matrix is the most valuable
page in it.

**Haiku in this app is long-context Haiku** (finding 15). Still the cheapest
class by two to four times, not by ten to twenty.

### 3.4 The central claim is untested

The skill exists because "a model one or two classes below the frontier
can follow it and reach the same verdict". That is a hypothesis with a
cheap test: a set of scenario files (the inputs of step 1, each with the
verdict a calculator produces), run through Haiku and Sonnet sessions that
are given only the skill and the scenario, scored on verdict agreement,
guardrail compliance, arithmetic error and cost of deciding. Until that
runs, every claim in this repository about lower classes is a design
intent. Stages O2, S2 and H1 below are that test. The result decides
whether the skill is a procedure or a checklist for a calculator.

## 4. Status

- **Version 0.1.0, two commits on `main` before this session, origin in
  sync.** Stage 0 (bootstrap) is done and recorded in
  `docs/handoffs/2026-10-27-stage-0-bootstrap.md`.
- **Gate green**: 47 files, 0 findings before this session's changes.
- **Installed** at user level for Claude Code on 2026-10-27; the copy
  matches the repository. Pointer blocks for Codex, OpenCode and Gemini
  were printed and not pasted (the operator's call, carried in
  `docs/status.md`).
- **Price table 11 days old**, stale from 2026-11-02 UTC. Five of six
  families null, so the skill can price Anthropic models only; the
  adapters for OpenAI, Google, DeepSeek, Kimi and GLM harnesses point at a
  table that refuses to price them.
- **Harness coverage**: Claude Code and Z-Code verified; seven adapters
  pending a check on their harness.
- **The bootstrap handoff's Stage 1** (Sonnet: verify adapters, refresh
  prices) has not started. This assessment re-stages it (section 6).
- **This session**: the standing instructions of 2026-10-29 recorded
  verbatim with the lines that changed (protocol 1.2); session mechanics
  re-verified (protocol 5); the two operator questions and the live
  status document added with hook and gate support; this document. The
  commit hash is in the handoff.
- **Open operator items**: the four decisions in section 7, and the
  pointer-block paste above.

## 5. Improvements proposed

Grouped by what they fix; the stages in section 6 carry them.

**A. Make the arithmetic deterministic (findings 1, 3, 4, 6, 14).** A
`scripts/dispatch.mjs` that takes the step 1 inputs (flags or a JSON file)
and prints the filled Step A block, the break-even, the per-turn
long-context accounting, and the Step B cost per piece. The skill's text
then says "run the calculator; paste its block", and a lower-class model
spends its budget on inputs and the adversarial pass instead of
multiplication. The gate recomputes every example from its stated inputs
and fails on a mismatch. Fix the Step 2 text to say `continue` is priced at
the current model and `fresh` at the target class.

**B. Complete the cost model (findings 2, 3, 12, 15).** Add growth G = F + O;
a cache-miss term with M stated; the baseline B as a named input with the
desktop and CLI measurements recorded; a note on Haiku's long-context tier
in this app; an effort multiplier for O once measured. Each change to step
2 gets a new worked example (non-negotiable 8); the first should be this
session's own decision, with measured figures.

**C. Prove the claim (finding 7).** An `eval/` with scenario files, the
calculator's verdict as the oracle, a runner that puts each scenario to
Haiku and Sonnet with the skill as their only instruction, and a report:
agreement rate, guardrail violations, arithmetic error, tokens and dollars
to decide, per class. Re-run on every change to `SKILL.md` and every model
version change. The skill-creator skill in this harness has an evaluation
harness that fits.

**D. Portability and seeding (findings 5, 10).** Ship `scripts/` in the
payload or have `SKILL.md` name the repository path; add `install.mjs
--check` (compare installed copies with the repository by hash and say
which are behind) and `install.mjs --seed <repo>` that copies the protocol
kit, persona files, hook, settings, status and preferences skeletons into a
new project, which is what the operator's standing instruction asks for.

**E. Tests and hygiene (findings 8, 11, 13).** `node --test scripts/` with
fixtures for the gate's exit codes, the installer's dry run and the refresh
script's refusal to overwrite; one date convention (local, stated) in the
scripts; drop or parse `--user`.

**F. Protocol currency (finding 9).** Done today for section 5. Add a
re-verification line to each handoff whenever the app updates.

Not proposed: a generator for adapters, a web page, a second canonical text,
or support for harnesses the operator does not run. Each would cost tokens
forever and buy nothing measured.

## 6. Roadmap by model class, priced

**Method.** Cost per stage at API list price from `pricing/2026-10-18.json`,
computed per turn by a script in this session: baseline B = 86,450
(measured in this app), first read of B + R at the cache-write rate, each
turn's context read at the cache-read rate, fresh input F written at the
cache-write rate, output O at the output rate, context growing by F + O
per turn, Haiku priced at its long-context tier once the context passes
100,000 tokens. No cache-miss term (finding 2), so these are floors. Wall
clock from protocol section 7; operator review separate. Classes and
efforts from the protocol's section 2 table and the skill's matrix. Turn
counts are estimates.

| Stage | Class, effort | T | Avg context | Cost USD | Quote | Wall clock | Depends on |
|---|---|---|---|---|---|---|---|
| H0 Price table refresh | Haiku, medium | 12 | 110k | 0.10 | 0.10 to 0.25 | 10 to 15 min plus the operator's figures | D3 |
| O1 Formula revision, calculator, gate recompute, new example | Opus, high | 60 | 286k | 8.43 | 7 to 12 | 45 to 75 min | H0 |
| S1 Install portability, `--check`, `--seed`, script tests | Sonnet, medium | 40 | 198k | 2.13 | 2 to 4 | 30 to 45 min | none; beside O1 |
| F1 Acceptance of O1 | Fable, xhigh, fresh | 15 | 164k | 4.43 | 4 to 6 | 20 to 30 min | O1 |
| O2 Evaluation design | Opus, high | 40 | 226k | 5.32 | 4 to 8 | 30 to 60 min | F1 |
| S2 Evaluation runner | Sonnet, medium | 40 | 201k | 2.15 | 2 to 4 | 30 to 45 min | O2 |
| H1 Evaluation runs | Haiku and Sonnet as subjects, Sonnet orchestrating | about 40 decisions | 8k each | 3 to 6 (rough) | 3 to 6 | 30 to 60 min | S2 |
| S3 Adapter verification | Sonnet, medium, operator present | 25 | 158k | 1.20 | 1 to 2.5 | 30 to 45 min plus installs | none |
| F2 Reassessment | Fable, high | 60 | 341k | 17.77 | 12 to 20 | 60 to 120 min | H1 |

Total about 46 USD; quote 35 to 65. The serial chain is H0, O1, F1, O2,
S2, H1, F2: about 5.5 hours of model time. S1 runs beside O1 (disjoint
files: `install.mjs` and tests against `SKILL.md`, `check.mjs`, `examples/`);
S3 runs whenever the operator is at a harness. Operator review about 30
minutes per Opus or Fable stage and 15 per Sonnet stage, plus the harness
installs for S3: about 3 to 4 hours in all (rough).

### 6.1 Stage detail

**H0, Haiku, medium.** Run `node scripts/pricing-new.mjs`; fill the figures
the operator supplies or, under decision D3, read each `source` page and
fill them; set `fetched`; `node scripts/check.mjs` exits 0; commit;
`node scripts/install.mjs` to refresh the user copy. Oracle: the gate and a
diff of the installed copy. Before 2026-11-02.

**O1, Opus, high.** In `SKILL.md` step 2: price `continue` at the current
model and `fresh` at the target class; growth F + O; a cache-miss term with
M as a stated input; the break-even line; a named "split" pattern (Fable
writes the brief, Sonnet runs it, Opus accepts) as a standard comparison.
Write `scripts/dispatch.mjs` (standard library, flags or JSON in, the
filled Step A and Step B blocks out, per-turn long-context accounting).
Extend `check.mjs` to recompute each example's figures from its inputs
table. Add `examples/2026-10-29-sessiondispatch-stage-0b.md` from this
session's measured decision. Update the template. Oracle: the gate green
with the recompute check; the calculator reproduces the two existing
records to the cent (10.10 and 9.74; 4.22 and 1.19) under a switch for the
old formula, and the new example documents the new figures. Changelog line.

**S1, Sonnet, medium.** `install.mjs`: add `scripts/` to the payload (or
print the repository path into the pointer block), `--check`, `--seed
<repo>`; parse or remove `--user`; one date convention across the three
scripts. `scripts/*.test.mjs` with `node:test` and fixtures under
`scripts/fixtures/`. Oracle: `node --test scripts/` green; the gate green;
a seeded temporary directory whose hook prints the reminder lines.

**F1, Fable, xhigh, fresh session.** Adversarial acceptance of O1 per the
matrix's row 4: every formula change checked against a hand derivation,
every guardrail re-read against the new text, the new example recomputed
independently. Oracle: an acceptance note listing each claim and the
command that checked it.

**O2, Opus, high.** Design the evaluation: 15 to 20 scenarios covering each
matrix row, both verdicts, compaction and no compaction, a null price, a
stale table, an outward step, the decision cap; the rubric (verdict
agreement, guardrail compliance, arithmetic error, tokens and dollars to
decide); the runner brief for S2. Oracle: a scenario set the calculator
scores, and a brief Sonnet can execute without this session.

**S2, Sonnet, medium.** Implement the runner from O2's brief. Oracle: a dry
run on one scenario with each class produces the report rows.

**H1, Sonnet orchestrating.** Run the set on Haiku and Sonnet; write
`eval/results-YYYY-MM-DD.md`. Oracle: the report with one row per scenario
per class.

**S3, Sonnet, medium, operator present.** For each of the seven unverified
adapters, install, confirm the load path, record the command that verified
it, correct the file. Oracle: one verified line per adapter, gate green.

**F2, Fable, high.** Reassess on the evaluation results: retune the 10
percent band, the 10-turn floor and the 8,000-token cap on measured data;
decide whether the skill is a procedure or a calculator's checklist; answer
the six questions again.

## 7. Decisions for the operator

Everything that does not depend on these was finished in this session.

```
D1
Decision:      Whether sessions may start the next session themselves, with model and effort set, instead of proposing a card.
Options:       A yes, for any class at or below the finishing session's (the app allows it without a prompt) / B yes, for Haiku and Sonnet stages only / C no, cards only (as now)
Pros and cons: A saves a click and the idle time per handoff and keeps a chain moving while you are away; a wrong brief runs one stage unsupervised. B caps an unsupervised stage at about 4 USD; Opus stages still wait for you. C keeps every stage under your eye at the cost of idle time between stages.
Blast radius:  A one stage's cost, under 20 USD at list; nothing leaves the machine without your yes (guardrail 3). B the same, under 4 USD. C none.
Recommended:   A, because every outward step still needs your yes, the status document and the stage report keep you informed, and the gate must be green before any handoff; record it as autonomy: true.
```

```
D2
Decision:      Whether replies and project documents follow ASD-STE100 Simplified Technical English.
Options:       A no; keep the persona's section 14.1 (plain Australian English, short sentences) / B yes for project documents only / C yes for documents and replies
Pros and cons: A no change and consistent with the existing files. B more uniform, translation-friendly documents; needs a controlled-vocabulary check the gate can run only with a word list kept locally (the STE dictionary is copyrighted; the specification is available from ASD on registration, confidence medium); existing documents would need a rewrite stage. C as B, plus terse replies.
Blast radius:  B and C: every future document, a Sonnet rewrite stage for the existing ones (about 3 USD), and an STE edition of the persona's prose section.
Recommended:   A, because the persona already gives short declarative sentences and the gate cannot enforce STE's dictionary without a local copy; revisit if documents will be machine-translated or read by non-native readers.
```

```
D3
Decision:      How the null families and the fortnightly refresh of the price table are filled.
Options:       A you supply the figures at each refresh / B you give a standing yes for live reads of each family's source page by the refreshing session, which writes the file and commits it / C raise max_age_days
Pros and cons: A exact, costs you about 15 minutes a fortnight. B costs about 0.10 USD at Haiku per refresh and your review of the diff; the standing yes is recorded in docs/operator-preferences.json. C fewer refreshes, more verdicts on figures that may have moved.
Blast radius:  A and B a wrong figure, caught in review. C a verdict priced on a stale table.
Recommended:   B for the Anthropic family (the page you verified), A for the others until you use those harnesses; keep 14 days.
```

```
D4
Decision:      Which stage starts first.
Options:       A O1 now, with S1 beside it, H0 at the stale date / B H0 and S3 first, O1 after / C the bootstrap handoff's Stage 1 as written (Sonnet: adapters and prices)
Pros and cons: A fixes the defect every later stage inherits and makes the gate check the numbers; B fills data and verifies harnesses first, but on a formula with known gaps; C is the committed plan, but its pricing half needs your input anyway.
Blast radius:  A SKILL.md step 2, check.mjs, examples, template; Fable acceptance required. B and C data and adapter text only.
Recommended:   A, because the calculator is the change that lets a lower class use the skill at all.
```

## 8. Cost of this assessment

Measured with the session usage tool; the final figures and the dispatch
decision for the next stage are in
`docs/handoffs/2026-10-29-stage-o1-formula-calculator.md`, the handoff this
session wrote for the next stage. At the end of the reading
phase the context was 163,573 tokens after about 22 turns; the baseline was
86,450. The handoff's cost-of-deciding table carries the end-of-session
reading and the price at the Fable row of the table in force.
