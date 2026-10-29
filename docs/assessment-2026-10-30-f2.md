# Assessment 2026-10-30 (Stage F2): the skill on its evaluation results

The second answer to the operator's six-question brief (`docs/operator-protocol.md`
section 1.1), written after Stage H1's 80 evaluation runs. It reads
`eval/results-2026-10-30.md`, checks figures against the `score.json` files
where a figure decides something, settles the questions the H1 and F1
stages handed on, and re-prices the roadmap. Where a figure is an
estimate or a guess, the text says so where it appears.

| Field | Value |
|---|---|
| Date | 2026-10-30 |
| Session | `local_bf52bc77`, Claude desktop app, `claude-fable-5-1`, effort `high`, permission mode auto; started by the coordinating session from `docs/handoffs/2026-10-30-stage-f2-reassessment.md` |
| Repository read | `main` at `263a6b8` (H1 at `b9c40c8`, then the status update), shared checkout, no worktree |
| Gate at start | `node scripts/check.mjs`: 90 files read, 0 findings, exit 0; `npm test`: 31 tests, 31 pass (55.8 s) |
| Price table | `pricing/2026-10-29.json`, 1 day old |
| Context | 93,504 tokens at the first tool call (baseline 87,075: total less Messages at the 234,072 reading) |

**Conclusion first.** The skill is a procedure Sonnet can run, with or
without the calculator, and Haiku's failure is mostly the skill's own
guardrail 7, not Haiku's reasoning. Sonnet with the calculator agreed
with the expected final verdict on 20 of 20 scenarios (Wilson 95 percent
83.9 to 100.0) and by hand on 17 of 20 (64.0 to 94.8); the two cells are
not separable at n = 20 (Fisher exact p = 0.23), and all three hand
misses trace to ambiguities in the text or the evaluation contract, none
to arithmetic. Haiku agreed on 11 of 20 with the calculator (34.2 to
74.2) and 10 of 20 by hand (29.9 to 70.1). Every one of Haiku's 19
misses took the default `continue` under guardrail 7, the 8,000-token
decision cap, after a draft verdict that was correct in 14 of the 17
scored. The cap is unreachable: the skill's own files are about 13,000
tokens of reading before a word is written, and no run in any cell
stayed under 8,000 by its own count. Sonnet's 20 of 20 rests partly on
not obeying the cap it recorded breaking. The calculator did not lift
Haiku's verdicts (p = 1.0 between its arms) and cannot be shown to lift
Sonnet's; it did remove Haiku's hand-arithmetic errors (43 of 44 figures
correct against 32 of 35). So: a procedure for Sonnet, two classes below
the frontier, which is the claim `SKILL.md` makes; for Haiku, untested
until the cap is fixed, and I guess (confidence medium) it lands between
the two classes afterwards. Section 6 prices the next stages at about 31
USD firm plus 3 to 18 USD of subject runs, and section 7 puts two
decisions to the operator.

## 1. What the deliverables are

Unchanged in kind from the assessment of 2026-10-29, section 1, with
these additions since:

1. **`scripts/dispatch.mjs` and `dispatch-core.mjs`** (Stage O1): the
   step 2 and 3.3 calculator, per-turn long-context pricing, the split,
   `--formula 2026-10-27` for older records. The gate recomputes every
   example and every evaluation scenario from its inputs.
2. **`eval/`** (Stages O2, S2, H1): 20 scenarios in the calculator's
   input shape with a brief and hand-set expectations, a stale fixture
   table, the rubric, the subject prompt, the runner and scorer, and
   `eval/results-2026-10-30.md` with 80 scored runs under
   `eval/runs/2026-10-30/`.
3. **Tests** (`npm test`, 31): the gate, the installer, the refresh
   script, the scenario set and the scorer.
4. **A second worked example** and the install portability work
   (`--check`, `--seed`, `scripts/` in the payload).
5. **Three acceptance and assessment records**: `docs/acceptance-2026-10-29-stage-o1.md`,
   `docs/assessment-2026-10-29.md`, this document.

## 2. How it all works

The decision pipeline of the first assessment's section 2.1 stands,
with step 2 now priced at the current model for `continue` and the
target class for `fresh`, growth F + O, a miss term, the break-even and
the split. What is new is the loop around it: the skill is a prompt,
`eval/` is its regression suite, and a run is one scenario put to one
sub-agent of one class in one arm (with or without `scripts/`), scored
without a model in the loop from the JSON block the subject appends to
its record. The four measures are verdict agreement, guardrail
compliance, arithmetic error and the cost of deciding; the scorer prints
Wilson intervals beside every rate. The gate's `checkEval` step reruns
the calculator on every scenario, so a formula change fails the gate
until each moved expectation is regenerated with its reason.

## 3. Assessment

### 3.1 The four cells

Final agreement, n = 20 scenarios per cell, one run each, one day
(`eval/results-2026-10-30.md`, summary table; intervals recomputed here
by my own Wilson code and matching to the decimal).

| Cell | Final agreement | Wilson 95 percent | Draft agreement | Bound guardrails | Arithmetic correct/stated |
|---|---|---|---|---|---|
| Sonnet, calculator | 20/20 | 83.9 to 100.0 | 14/15 | 10/10 | 45/47 |
| Sonnet, hand | 17/20 | 64.0 to 94.8 | 13/15 | 9/10 | 43/47 |
| Haiku, calculator | 11/20 | 34.2 to 74.2 | 12/15 | 9/10 | 43/44 |
| Haiku, hand | 10/20 | 29.9 to 70.1 | 10/15 | 5/10 | 32/35 |

Fisher exact tests, two-sided, computed in this session:

| Comparison | p |
|---|---|
| Sonnet calculator against Sonnet hand (20/20 against 17/20) | 0.23 |
| Haiku calculator against Haiku hand (11/20 against 10/20) | 1.00 |
| Haiku against Sonnet, calculator arm | 0.0012 |
| Haiku against Sonnet, hand arm | 0.041 |

**What n = 20 can show.** That a cell at 20 of 20 is above 83.9 percent.
That Haiku and Sonnet differ, in both arms. That nothing else differs:
the two Haiku arms are indistinguishable, and so are the two Sonnet arms.
A gap of about 35 points is the smallest two cells of this size can
separate at 95 percent.

**What it cannot show.** That Sonnet exceeds 90 percent (that needs 40
of 40 for a lower bound of 91.2, or 60 of 60 for 94.0). Whether the
calculator helps Sonnet: at the observed rates the arms separate only at
n = 40 if the hand arm stays at or below 34 of 40 (p = 0.026), or n = 60
at or below 51 of 60 (p = 0.0028). Sampling variance inside a cell: one
run per scenario means a scenario a subject gets right half the time is
indistinguishable from one it always gets right.

### 3.2 Why Haiku missed

Every Haiku miss is in the `score.json` files with guardrail 7 in its
`false_alarms` (the guardrail was listed and the scenario does not bind
it), and the one unscorable Haiku run's block lists `[7]` too. Read from
the records' "Final verdict" lines, one at a time:

| Cell | Misses | Listing guardrail 7 | Draft correct among scored drafts | Final taken |
|---|---|---|---|---|
| Haiku, calculator | 9 | 9 | 8 of 9 | `continue` 7, `stop` 2 (01 and 08, both with the draft right and a guardrail argued over the default) |
| Haiku, hand | 10 | 10 (one via the unscorable block) | 6 of 8 | `continue` 8, `stop` 1, unscorable 1 |

The records say it in their own words: "by the cap default" (02), "the
default taken at the decision cap" (12), "overridden by the budget
default" (13), "the skill gives no order between the two hard stops"
(01, where guardrail 2 said fresh and guardrail 7 said continue). Haiku
read its own token count honestly, found it over 8,000 at step 4, and
did what the text says: took the default. Its drafts were right in 14 of
the 17 that could be scored. This is not a decision error of Haiku's; it
is the procedure giving the wrong instruction at a point every run
reaches.

Sonnet reached the same point. Nine of its 20 calculator records and 13
of its 20 hand records name an overrun, and the summary's over-cap column
counts 16 and 11 of 20. Sonnet applied guardrail 7 in only 3 runs per
arm (as false alarms in scenarios where `continue` was expected anyway)
and otherwise kept its verdict with the overrun recorded. Under the text
as written those are breaches that happened to give the expected
verdict; the rubric does not score them because guardrail 7 binds only
in scenario 17. Sonnet's 20 of 20 therefore measures Sonnet's judgement
about when to follow the text, not only its ability to follow it.

Guess, confidence medium: had the cap not fired, Haiku's correct drafts
would have carried through to about 19 of 20 with the calculator (every
miss but 07, whose draft was wrong) and about 15 of 20 by hand (the
misses with a wrong draft, 11 and 20, and the two where a bound guardrail
was also missed, 09 and 15, stay misses). That is a projection from the
drafts, not a measurement; H2 measures it.

### 3.3 Sonnet by hand: the three misses

| Run | Got, expected | Cause, from the record | Where the fix goes |
|---|---|---|---|
| 10-band-continue-quality | `fresh`, `continue` | Draft right (continue by quality, 6.3 percent). The adversarial pass doubled T from 12 to 24 as step 5.2 suggests, the margin became 38.5 percent fresh by cost, and step 5.4 says a recomputation that crosses the band changes the verdict. The record followed the text. | `SKILL.md` step 5.3 and 5.4: a fourth place where the text gives two answers (section 3.6) |
| 15-null-price | unscorable, `incomplete` | The block's `target` is `null` because the model has no price and the skill forbids naming one from memory; the rubric's type requires a string. The record's final outcome is `incomplete`, the expected one. | The evaluation contract (section 3.6, null target) |
| 18-not-run-short | `not-run` with `model` null, `not-run` with the current model | The prompt defines `final.model` as the model that runs the next piece; for a stage that does not run the skill the subject wrote null. The rubric expects the session's model. | The prompt and rubric, prospectively |

None of the three is an arithmetic failure. The hand arm's four stated
figures in error (43 of 47) moved no verdict.

### 3.4 The cap against the records

Figures from the 80 `score.json` files and the records' own
cost-of-deciding tables, aggregated by a script in this session. The
measured total is the harness's `subagent_tokens`; the 18-not-run-short
runs, which read `SKILL.md` and wrote one line, give its floor.

| Cell | Reported tokens, median (min to max) | Reported output, median (max) | Record size in tokens, median (max) | Measured total, median | Not-run floor | Measured less floor, median (max) | Minutes reported, median (max) | Minutes measured, median (max) |
|---|---|---|---|---|---|---|---|---|
| Haiku, calculator | 14,000 (8,400 to 20,000) | 3,500 (10,000) | 2,453 (3,596) | 105,245 | 77,288 | about 28,000 (39,000) | 6 (11) | 2.7 (3.4) |
| Haiku, hand | 12,000 (10,500 to 15,000) | 3,000 (6,000) | 2,367 (3,439) | 103,428 | 77,357 | about 26,000 (42,000) | 6 (8) | 2.5 (3.6) |
| Sonnet, calculator | 14,500 (6,500 to 23,500) | 3,000 (4,000) | 2,278 (3,064) | 87,468 | 76,262 | about 11,200 (14,500) | 5 (11) | 1.9 (2.7) |
| Sonnet, hand | 10,125 (5,000 to 17,700) | 3,200 (4,000) | 2,496 (3,353) | 87,601 | 76,353 | about 11,200 (17,600) | 6 (11) | 2.2 (2.8) |

Record size is characters divided by 4. What a subject must read before
writing: `SKILL.md` 24,727 characters (about 6,200 tokens), the two
templates 4,882 (about 1,200), the table 4,146 (about 1,000), and the
two examples 20,236 (about 5,100) if it opens them: about 8,400 tokens
without the examples, 13,500 with them. The 8,000 cap sits below the
reading alone, which is why no run stayed under it and why Haiku, which
counts honestly and obeys, lost 17 verdicts to it.

Two further facts from the same table. The subjects' self-reported token
counts are 12 to 16 percent of the harness's total (the `report_ratio`
median per cell), and their self-reported minutes are two to three times
the measured ones. Step 6's cost-of-deciding table, filled from
self-estimates, is therefore wrong in both directions; where the harness
reports usage, the record should carry that figure. And the time cap
never bound: the slowest run took 3.6 minutes.

### 3.5 Findings

Severity is the effect on a verdict or on the operator's money.

| No. | Finding | Severity | Confidence | Evidence |
|---|---|---|---|---|
| F2-1 | Guardrail 7's 8,000-token cap is below the cost of reading the skill. Taken literally it overrides a correct draft with `continue` in most scenarios; Haiku took it literally in 17 of 20 runs per arm and lost 17 of its 19 misses to it. | High | High | Section 3.2 and 3.4 |
| F2-2 | Step 5.3 and 5.4 flip any band verdict: "what if T doubles" followed by "change the verdict if the recomputation crosses the band" turns every 10-percent-band verdict into its opposite. Sonnet did so in scenario 10. | High | High | Section 3.3; `SKILL.md` step 5 |
| F2-3 | Guardrails have no precedence. Scenario 01 put guardrail 2 (fresh) against guardrail 7 (continue) and a Haiku record said the text gives no order. The three two-answer places in `eval/README.md` are the same defect. | Medium | High | 01-compacted-assessment.haiku.calculator record |
| F2-4 | The result block's `inputs.target` type (string) rejects the one case the skill itself produces, a target that cannot be named because its price is null. Two runs unscorable, one of them with the expected outcome. | Medium | High | The two blocks, read in this session |
| F2-5 | Self-reported cost of deciding is a sixth to an eighth of the measured token total and two to three times the measured minutes. | Medium | High (on the sub-agent harness; the meaning of its total is not documented) | Section 3.4 |
| F2-6 | The scorer does not see a guardrail 7 breach: a record that names an overrun and keeps its verdict passes. Sonnet did so in 9 and 13 of 20 runs. | Medium | High | Section 3.2; `eval/rubric.md` section 4 |
| F2-7 | The sub-agent harness reports one token total with no input and output split and no model id, so "USD to decide" is priced on self-estimates. | Medium | High | `usage.json` files; H1 handoff fact 1 |
| F2-8 | Sub-agents load the project's `AGENTS.md` and `MEMORY.md` (validity threat, rubric section 9 item 2). Its direction, if any, is towards `fresh` (the operator rules say handoff per stage); the misses went to `continue`, so it did not produce them. Effect otherwise unmeasured. | Low | Medium | H1 handoff fact 4; section 3.2 |
| F2-9 | F1-1's omitted fresh-side terms (0.13 to 0.27 USD on the records) are the size of the band scenarios' margins (0.03 to 0.36 USD across 01, 03, 06, 10, 11, 20, calculator run in this session) and would move scenario 20 from "by cost" to "by quality" with the same final verdict. No final verdict on the 20 scenarios flips. | Low | High | Calculator output on the six scenarios |
| F2-10 | `prepare` rewrites `manifest.json`; H1 merged three manifests by hand. | Low | High | H1 notes |

### 3.6 Verdicts

These are mine under matrix row 5 (the tiering rules and the procedure's
guardrails are Fable's to decide); an Opus stage writes them into the
text and a Fable acceptance checks the writing. Each names the rule and
the reason; none changes a figure in the evaluation.

**The three places `SKILL.md` gives two answers** (`eval/README.md`),
and a fourth from scenario 10:

1. *Guardrail 1 against step 2 rule 1* (a stage under 10 turns needing a
   higher class). Rule 1 wins. Guardrail 1's reason is money (a handoff
   costs more than ten turns of work); running work below its class is a
   quality error the matrix exists to prevent, and it costs nothing to
   avoid: work under 10 turns that needs a higher class goes to a
   sub-agent of that class with the brief in the message, not to a fresh
   session. Guardrail 1 is reworded to "never hand off to a fresh session
   for work under 10 turns at the same class".
2. *Guardrail 1 against guardrail 2* (a design-heavy stage under 10 turns
   in a compacted session). Guardrail 2 wins: fresh. The loss after a
   compaction is the "why", which no number of turns recovers.
3. *The effort for an acceptance* (F1-4). One rule, in matrix row 4:
   acceptance runs one class above the author at `high`; `xhigh` when
   the author is the top class (the acceptor shares the class, so effort
   is the only lever left) or when the accepted change is a release or a
   merge. Guardrail 6 and protocol section 2 point at the row instead of
   restating it; the protocol's "Fable runs xhigh only for acceptance"
   becomes "only where matrix row 4 says". Evidence: F1 at xhigh cost
   about 7.4 USD against 5.0 projected, the difference being reasoning
   billed as output; this stage at high reads and decides as the row
   intends. Scenarios 08 (Opus, high) and 09 (Fable, xhigh) already
   encode the rule.
4. *Step 5.3 and 5.4* (F2-2). The adverse recompute changes the verdict
   only when the adverse value is inside the range the input was stated
   with (step 1.2 asks for T as a range when unsure) or is a measurement
   the draft ignored. A doubled T or a 30-percent C0 is a stress test: a
   band verdict that flips under it is recorded as "fragile: flips at T
   of n or more" and kept. Preference never changes a verdict, and
   neither does an input nobody claims is true.

To make the first three stable, step 4 gains a precedence line:
guardrails 5 and 8 (nothing to compute from, wrong class) come first,
then 2, 3 and 6 (quality, approval, acceptance), then 1 and 7 (the cost
of handing off and of deciding). A cost rule never overrides a quality
rule.

**Guardrail 7 and step 0's budget** (F2-1). The cap moves from the
reading to the writing: the record under 4,000 tokens (about 16,000
characters; every record on file is under 3,600) and 10 minutes of wall
clock (every run on file under 4). Reading is measured and recorded in
step 6, never capped: it is the skill's own size, a design parameter the
operator reads from the cost-of-deciding row, not a choice the subject
makes. Past the cap, steps 4 and 6 still run, step 5 is what is cut, and
the verdict is step 2's draft where it was written, else `continue`.
Reason: the default exists to be the reversible choice, and a draft that
says "fresh by class" overridden to `continue` is not reversible in the
sense that matters, since the work then runs below its class. Scenario
17's brief (8,400 tokens and 11 minutes already spent) still binds the
guardrail on its time clause, so no expectation moves.
Correction, 2026-10-30 (Stage O3, ruled by the coordinating session): the
guardrail binds, but its consequence moved. Scenario 17's record covers
steps 1 to 3, so a draft exists and the rule keeps it: the expected final
is now fresh on claude-opus-5-5 at high. H1's rows stay as scored.

**A null `target`, and the two unscorable runs** (F2-4). `inputs.target`
becomes string or null in the rubric, the prompt and the scorer; a null
is legal, and the step 1.4.4 text says to write it that way with the
reason, since guardrail 4 forbids naming a model from memory. The two
runs are rescored by the Opus stage under the changed type, and
`eval/results-2026-10-30.md` carries both figures with a dated note:
as scored on 2026-10-30, and as rescored. Projection, not a result:
15-null-price.sonnet.hand passes (its outcome is `incomplete`, its model
null, its guardrail 5 consequence holds), which makes Sonnet by hand 18
of 20 (69.9 to 97.2); 16-outward-release.haiku.hand stays a miss
(`continue` for `fresh`, guardrail 7 again). Scenario 18's `final.model`
for `not-run` is fixed prospectively in the prompt (the session's own
model, as for `stop`) and not rescored: the subject never saw that text,
and moving an expectation to fit a result is tuning on the test set.
The as-scored figures stay the H1 result in every document.

**Repeating cells.** Not on the current text: narrowing 20 of 20 to a
lower bound of 91.2 costs 20 more Sonnet runs and answers nothing the
next text change will not reopen, and the Haiku cells measure guardrail
7, not Haiku. On the revised text, yes, as Stage H2: Sonnet at two runs
per scenario in both arms (n = 40 each, 80 runs) and Haiku at one (n =
20 each, 40 runs). Thresholds fixed now, before the run: the claim "a
procedure for Sonnet" holds if both Sonnet cells reach 38 of 40 (lower
bound 83.5) and the calculator arm reaches 40 of 40; the arms are called
different only if Fisher's p is under 0.05; Haiku is said to run the
skill only if its calculator cell reaches 18 of 20 (lower bound 69.9),
and the text gains a class floor if it does not. H2 runs on H1's
arithmetic so that any change is the text's.

**F1-1** (F2-9): staged as O4, Opus, after H2 and conditional on F4
finding the band scenarios matter in practice. Not before H2, because a
formula change between H1 and H2 would make the two runs incomparable;
not dropped, because the omitted terms equal the margins in the band.

**F1-3**: into Stage S4 (Sonnet): the gate's recompute reads the term
lines and the Step B cost column, with `node scripts/check.mjs` as the
oracle.

**F1-5**: into Stage O3, as two sentences in step 2.1 (the acceptance
session is priced without misses; an outward step in the split's run
needs guardrail 3's approval line in the brief).

**The `AGENTS.md` and `MEMORY.md` load** (F2-8). A real threat to what
the runs generalise to, not the cause of what they show. Mitigation goes
to S4: run each subject through the Claude Code CLI (`claude -p` with
`--model`, `--output-format json`) from the sandbox folder, which has no
`AGENTS.md`, and take the usage and cost the CLI reports (F2-7 falls with
it). Confidence medium that this works as described: the CLI also loads
the user's own instruction files and installed skills, among them the
installed copy of this skill, which is a leak of another kind; S4's first
task is a probe that asks a subject which instruction files and skills it
loaded, and S4 isolates the home directory or the setting sources if the
probe shows one.

**The class floor.** The skill's claim is "one or two classes below the
frontier": Opus and Sonnet. Haiku is three below and was never in the
claim; the data as scored agree, and the misses are the cap's. No floor
goes into the text until H2 measures Haiku on the revised cap.
`eval/README.md` states the measured position meanwhile.

**Step 6's cost table** (F2-5): where the harness reports the decision's
usage, the record carries the measured figure and names the source;
self-estimates are marked as such. Into O3, with the template's row
sources.

**The scorer** (F2-6): a diagnostic "overrun recorded, default not
taken", so the next run shows how often Sonnet keeps a verdict the text
says to drop. Into O3's contract commit (the scorer's types change
there anyway).

### 3.7 D5: acceptance of O2's design

Accepted, with F2-2, F2-4, F2-6 and the `not-run` model rule carried to
Stage O3 as contract fixes. What was checked in this session, beyond
reading the results: the gate's `checkEval` reruns the calculator on all
20 scenarios (90 files, 0 findings); `npm test` 31 of 31; the rubric's
Wilson values recomputed independently and matching; the summary's
counts recomputed from the 80 `score.json` files and matching; the two
unscorable blocks read in full; the "Final verdict" lines of all 19
Haiku misses and the 3 Sonnet hand misses read; the calculator run on
the six band scenarios. The design held where it had to: the scoring is
deterministic, every hand-set expectation names its rule, and the
scenario set put the subjects exactly where the text is weak (the band,
the cap, the null price), which is what found F2-1 to F2-4. A design
that could not distinguish the classes would not have produced p =
0.0012 between them.

## 4. Status

- **`main` at `263a6b8`**, pushed to origin through `b9c40c8` by the
  coordinating session; this stage's commit follows. Gate 90 files, 0
  findings; 31 tests pass.
- **Stages done**: 0, 0b, H0, O1, S1, F1, O2, S2, H1, and this F2
  (`docs/status.md` has each with its figures).
- **The skill text is unchanged since O1** (`SKILL.md` SHA-256
  `d033a33c…` in the results header). Every verdict above waits on
  Stage O3 to enter it.
- **Price table** 1 day old; stale from 2026-11-13 by the local day.
- **Installed copy** refreshed after S1; `install --check` reported
  three copies current on 2026-10-29. O3's text change will put them
  behind until `node scripts/install.mjs` runs again.
- **Open operator items**: D8 and D9 (section 7); the pointer-block paste
  carried from Stage 0; S3 whenever the operator is at a harness.

## 5. Improvements proposed

**A. Fix the two instructions that override correct verdicts** (F2-1,
F2-2) and give the guardrails an order (F2-3): Stage O3, the text
changes of section 3.6, no formula change.

**B. Fix the evaluation contract where it rejected the skill's own
behaviour** (F2-4, F2-6, the `not-run` model): O3's second commit,
rescoring only the two type-rejected runs, both figures reported.

**C. Measure the subjects instead of asking them** (F2-5, F2-7, F2-8,
F2-10): Stage S4, the CLI runner from the sandbox with measured usage,
the manifest merge, and F1-3's gate recompute of term lines.

**D. Rerun on the revised text with pre-registered thresholds** (section
3.6, repeating cells): Stage H2, 120 runs, then F4 reads it.

**E. Leave the arithmetic alone until the rerun has a baseline** (F2-9):
O4 after F4, conditional.

Not proposed: a class floor in the text before H2; a rewrite of the
scenarios; a third arm; any change to the matrix's classes. Each would
spend money on a question the cap finding has already answered or made
unaskable until it is fixed.

## 6. Roadmap by model class, priced

**Method.** Each stage is priced as a fresh session by `SKILL.md` step 2
and 3.3 (first read of B + R at the cache-write rate, then T turns with
context growing by F + O, output at the output rate, Haiku at its tier
where it applies), from `pricing/2026-10-29.json`, by one calculator run
over the pieces in `docs/dispatch/2026-10-30-f2-roadmap.json`:

```
node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f2-roadmap.json --today 2026-10-30
```

B is 87,075, this session's measured baseline. T, F, O and R are
estimates; no miss term (M 0), so the figures are floors. Wall clock from
protocol section 7. Each row's "Cost" is the Step B table's figure for
the piece of that name in the command's output.

| Stage | Class, effort | T | R | Cost USD | Quote | Wall clock | Depends on |
|---|---|---|---|---|---|---|---|
| O3 Skill text revision and evaluation contract (section 3.6) | Opus, high | 60 | 30,000 | 8.62 | 7 to 12 | 45 to 75 min | F2 (this) |
| S4 Harness hardening: CLI runner from the sandbox, measured usage, manifest merge, gate term lines (F1-3) | Sonnet, medium | 50 | 20,000 | 3.05 | 2.5 to 5 | 30 to 45 min | none; beside O3 (disjoint files: `eval/run.mjs`, `scripts/check.mjs` and their tests) |
| F3 Acceptance of O3 | Fable, high (matrix row 4 as settled) | 20 | 35,000 | 6.29 | 5 to 8 | 20 to 30 min | O3 |
| H2 Rerun, 120 runs (Sonnet n = 40 per arm, Haiku n = 20), thresholds of section 3.6 | Sonnet, medium, orchestrating; subjects Haiku and Sonnet | 40 | 20,000 | 2.40 plus subjects | orchestration 2 to 4; subjects 3 to 18 (estimate, see below) | 30 to 60 min | F3, S4 |
| F4 Reassessment on H2: the class question closed, the floor if any, O4 and C1 decided | Fable, high | 30 | 40,000 | 9.46 | 8 to 12 | 45 to 75 min | H2 |
| S3 Adapter verification on each harness | Sonnet, medium, operator present | 25 | 15,000 | 1.31 | 1 to 2.5 | 30 to 45 min plus installs | none |
| O4 Fresh-side fixed-cost terms (F1-1), new worked example, expectations regenerated | Opus, high | 40 | 30,000 | 5.50 | 4.5 to 8 | 30 to 60 min | F4, conditional |
| C1 Variant C rewrite under STE100's writing rules, scored on the scenarios (D8) | Opus, high | 40 | 25,000 | 6.02 plus 40 Haiku runs | 5 to 9 | 30 to 60 min | F4, conditional on D8 |

**Subject runs.** The sub-agent harness reports one total per run
(76,000 to 119,000 tokens) with no split, and its meaning is not
documented. Read as a per-turn context over about 8 calls, a Sonnet run
costs about 0.19 USD and a Haiku run 0.07 (cache reads, a 30,000-token
write, 4,000 output tokens, the table's rates; Haiku at its tier);
read as the whole billing, as H1 did, about 0.044 and 0.02. For H2's 80
Sonnet and 40 Haiku runs that is 3 to 18 USD. S4's CLI runner reports
the cost and removes the range.

**Totals.** Firm stages (O3, S4, F3, H2, F4, S3): 31.13 USD of sessions
plus 3 to 18 of subject runs, about 34 to 49 USD; quote 30 to 55. The
conditional stages add 11.52 plus about 0.3 to 3 for C1's runs. Done
stages, from `docs/status.md` and the handoffs (estimates where the
stage said so): H0 0.1, O1 about 8, S1 about 2, F1 about 7.4, O2 about
5, S2 about 2.4, H1 about 6.3, this F2 about 17 (section 8), the
bootstrap and the first assessment not priced at the time: about 48 USD.
Whole roadmap, done and firm: about 82 to 97 USD; with the conditional
stages about 95 to 110. Serial chain left: O3, F3, H2, F4, about 2.5 to
4 hours of model time; S4 and S3 run beside it. Operator review: about
30 minutes per Opus or Fable stage and 15 per Sonnet stage, about 2.5
hours in all (rough).

### 6.1 Stage detail

**O3, Opus, high.** `docs/handoffs/2026-10-30-stage-o3-skill-text-revision.md`
is the brief. Three commits: the `SKILL.md` text of section 3.6 with the
template's cost rows and the protocol's pointer; the evaluation contract
(rubric section 2 types, the prompt's `not-run` line, the scorer's types
and the overrun diagnostic, tests); the rescoring of the two runs with
the dated note. Oracle: gate 0 with every scenario's expected values
unchanged (`checkEval`), `npm test` green, the rescored results file
showing both figures, F3's acceptance.

**S4, Sonnet, medium.** The probe first (which files a CLI subject
loads), then `eval/run.mjs run` driving `claude -p` per prepared prompt
from the sandbox with `--model` and `--output-format json`, writing
`usage.json` from the CLI's usage and cost; `prepare` merging into an
existing manifest; `check.mjs` recomputing term lines and the Step B
column. Oracle: tests for each, a two-run dry run whose `usage.json`
carries input, output and USD, gate 0.

**F3, Fable, high.** Adversarial acceptance of O3 under matrix row 4 as
settled: every text change read against the verdicts of section 3.6,
every scenario expectation confirmed unchanged, the rescoring checked by
hand, the examples still reproducing. Oracle: an acceptance note in the
shape of `docs/acceptance-2026-10-29-stage-o1.md`.

**H2, Sonnet, medium.** `prepare` for both subjects and arms, two runs
per scenario for Sonnet, one for Haiku; the S4 runner; `score`; the
results file with the thresholds of section 3.6 stated in its notes
before the figures. Oracle: 120 `score.json` files, the results file, gate 0.

**F4, Fable, high.** Read H2 against the thresholds; close the class
question; write the floor into the text or not; decide O4 and C1 (D8);
answer the six questions again only where the answer moved.

**S3, Sonnet, medium, operator present.** As in the first assessment.

**O4 and C1**: as in section 3.6 and D8.

## 7. Decisions for the operator

Everything that does not depend on these is decided above or staged.

```
D8
Decision:      Whether variant C (SKILL.md, adapters and templates rewritten under ASD-STE100's writing rules without its dictionary, D2's deferred option) is staged, and against what.
Options:       A defer to F4: stage C1 only if H2 shows Haiku still below 18 of 20 on the revised text / B stage C1 now, beside O3, scored on Haiku in H2 / C drop variant C
Pros and cons: A costs nothing now; if the cap fix alone lifts Haiku, the rewrite has no target and is never paid for; if not, C1 runs with a clean baseline. B gets the answer one stage earlier at about 6 USD plus 40 Haiku runs, but two text changes land in one rerun and H2 cannot say which one moved Haiku. C saves about 6 to 9 USD and leaves D2's condition untested; Sonnet's cells cannot show a rise at any n the budget allows (85 to 100 percent needs n of about 60 per cell), so Haiku is the only place variant C could ever be shown to help.
Blast radius:  A none now. B a confounded H2. C D2's condition closed without data.
Recommended:   A, because H2 must attribute any change to one cause, and the cap finding means Haiku's baseline is not yet measured; the threshold (18 of 20) is fixed here so F4 does not choose it after seeing the result.
```

```
D9
Decision:      How many runs Stage H2 makes on the revised text.
Options:       A 120: Sonnet two runs per scenario in both arms (n = 40 each), Haiku one (n = 20 each) / B 80: one run per cell as H1 / C 160: two runs per scenario in every cell
Pros and cons: A can show Sonnet above 91 percent (40 of 40), separate the Sonnet arms if the hand arm is at or below 34 of 40, and see Haiku's recovery (10 to 18 of 20 is p of about 0.01); about 2.4 USD orchestration plus 3 to 18 of runs. B cannot show Sonnet above 84 percent or separate its arms; about 2 plus 2 to 12. C narrows Haiku too (n = 40) for about 1 to 6 USD more; Haiku's question is whether it passes at all, which n = 20 answers.
Blast radius:  A and C one stage's cost. B a second rerun if F4 needs to separate the arms.
Recommended:   A, because the money question is whether Sonnet needs the calculator, and that needs n = 40 on Sonnet and nothing more on Haiku.
```

## 8. Cost of this assessment

Measured with the session usage tool and priced at the Fable row of
`pricing/2026-10-29.json` (cache read 0.25, cache write 12.50, output
50 USD per million). The handoff projected 17.72 USD at T 60 and 60 to
120 minutes; the stage took about a third of the turns.

| Row | Value | Source |
|---|---|---|
| Context at start | 93,504 | `get_usage self` at the first tool call; baseline 87,075 |
| Context at end | 292,159 after the gate; about 300,000 by the commit (estimate) | `get_usage self` |
| Turns | about 19 | model calls, counted in the transcript |
| Input tokens read | about 95,000 | brief, personas, protocol, results, README, rubric, prompt, acceptance note, first assessment, `SKILL.md`, status, score aggregates, nine record excerpts: characters divided by 4, estimate |
| Output tokens | about 17,000 visible | this document, the O3 handoff, status, the roadmap inputs file, scripts and replies: characters divided by 4, estimate |
| Wall clock | about 26 minutes | session created 14:46 UTC, commit about 15:12 UTC |
| Priced | about 5.5 USD counting visible output: baseline 87,075 x 12.5e-6 = 1.09; growth 206,000 x 12.5e-6 = 2.58; cache reads about 3.6M tokens over 19 turns x 0.25e-6 = 0.90; visible output 17,000 x 50e-6 = 0.85. The Messages category grew by 198,000 tokens, of which tool results and visible output account for about 115,000; the remaining 80,000 are consistent with reasoning retained in context and would add 4.0 USD as output: about 9.5 USD, estimate | table `pricing/2026-10-29.json`, fable row |
