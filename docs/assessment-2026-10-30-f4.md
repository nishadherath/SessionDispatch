# Assessment 2026-10-30 (F4): reassessment on the H2 results

Written by Stage F4 (`claude-fable-5-1`, effort `high`, session
`local_1edc5e80`) from `docs/handoffs/2026-10-30-stage-f4-reassessment.md`,
reading `eval/results-2026-10-31.md` (its notes first) against the
thresholds fixed in `docs/assessment-2026-10-30-f2.md` section 3.6 and
decision D8. Section 1 is the threshold ruling, written before anything
else. Section 2 holds the verdicts on the findings the H2 and F3 stages
carried here. Section 3 answers the six questions of protocol section 1.1
for the new state and prices what remains. Section 4 is the one decision
that is the operator's. Figures are measured unless marked as estimates.

## 1. The threshold ruling

### 1.1 The three pre-registered thresholds against their figures

| Threshold (F2 section 3.6, fixed before H2) | Figure (H2, scorer's count) | Met |
|---|---|---|
| "A procedure for Sonnet": both Sonnet cells at 38 of 40 or more and the calculator cell at 40 of 40 | calculator 40 of 40 (91.2 to 100.0 percent), hand 40 of 40 (91.2 to 100.0) | yes |
| The Sonnet arms are different only if Fisher's p is under 0.05 | 40 of 40 against 40 of 40, p = 1.000 | not different |
| Haiku runs the skill only if its calculator cell reaches 18 of 20 (lower bound 69.9 percent), else the text gains a class floor and D8 stages variant C | 17 of 20 (64.0 to 94.8 percent) | no |

The first two close the class question the skill was written to answer.
The claim "a procedure a model one or two classes below the frontier can
follow" is Opus and Sonnet; Sonnet is now measured at 80 of 80 runs on the
revised text, in both arms, and the calculator cannot be shown to help
Sonnet on the final verdict at any n the budget allows (it still helps on
the figures: section 2.2). The third threshold is the one this section
rules on.

### 1.2 How a format failure counts

Three Haiku calculator runs miss. One is a decision miss (scenario 10,
section 2.1). Two are unscorable: `12-crosses-design-heavy`, whose block
sits inside the last cell of the cost-of-deciding table and closes with
"``` |", so the scorer finds no block; and `14-stale-table`, whose
`cost_of_deciding.usd` is JSON `null` where the rubric's type says string.
I read both records (the only two read whole this stage). In each the
verdict is right: 12 ends `fresh` on `claude-opus-5-5` at `high` with
guardrail 2 listed and its consequence holding, inputs matched; 14 ends
`continue` on `claude-sonnet-5-5` at `medium`, every total null, guardrails
4 and 5 listed, the refresh step named, the stale table's age given as 29
days. Read by hand, the cell is 19 of 20.

**For counting them as misses.** The pre-registered measure was the
scorer's count, and the rubric (section 2) says an unscorable run counts
as a miss because "a subject that cannot produce the block is a finding
about the subject". Reading records after the result and rescuing the
ones whose verdict looks right is the thing pre-registration exists to
stop: it would make the threshold a floor that moves to meet the data.
The hand reading is also not neutral. I know the expected outcome when I
read, and the two records I read are the two whose rescue would change
the ruling. And a Haiku that cannot keep a JSON block out of a table cell
is a Haiku that will, in use, write a handoff whose front matter a hook
cannot parse; the operator's pipeline reads records by machine, so the
block is not "extra" in the way rubric threat 3 allows.

**Against.** The block is the evaluation's contract, not the skill's: the
skill asks for a Markdown record, and nothing in `SKILL.md` mentions the
block. Both failures are contract faults of the kind F2 already met
(F2-4: the type rejected a null target that the skill's own step 1.4.4
produces), and F2's remedy then was to change the type and report both
figures, not to count the runs against the subject. The `usd` null is the
more honest encoding: the skill says a stale table is "not priced", and
the prompt offers no null for one field, only for the whole object. The
rubric's types were tightened by O3 after H1, so the contract Haiku faced
in H2 is not the one the threshold was written against. And a subject
that reaches the right verdict but cannot format the block tells a
different story from one that decides wrongly: the first is a
format-compliance limit, the second a reasoning limit, and the skill's
claim is about reasoning.

**Ruling.** A format failure counts as a miss against the pre-registered
threshold. The measure fixed on 2026-10-30 was the scorer's count under the
contract in force when H2 ran; both records ran under that contract and
failed it; the threshold is not met. The reading of the two records is
recorded here as what it is, a second figure with a stated method (the
same shape as the H1 rescoring note), never as the result. The alternative
would leave the project with a threshold nobody can rely on next time.

**Which story the evidence supports.** The format story, on four facts,
none of which moves the ruling. First, the two unscorable runs are right
on every scored measure a reader can apply by hand. Second, Haiku's one
scored decision miss (scenario 10) is the same in both arms and turns on
an input choice the text leaves open (section 2.1), not on the procedure.
Third, the hand arm, which has no calculator to lean on, scored 19 of 20,
and calculator against hand is p = 0.605: the arms are not separable, and
the hand arm is the cell whose misses cannot be format faults of the
block's arithmetic fields. Fourth, H1's Haiku misses were all guardrail
7's default taken after a correct draft (F2 section 3.2); on the revised
cap the diagnostic for that is empty in all four H2 cells. Haiku follows
the procedure; what it cannot yet do reliably is the machine-readable
output, and the skill's own handoff format is machine-read.

### 1.3 What the hand arm's 19 of 20 adds

It bounds the decision reading from the other side. If the calculator
cell's two format misses were reasoning misses in disguise, the hand arm,
where the same subject does the arithmetic itself and has more to get
wrong, would be expected at or below the calculator cell; it is above it.
The hand arm also fixes the one real miss as scenario 10 in both arms,
which makes it a pattern (n = 2, one scenario) rather than noise, and
section 2.1 reads it. What the hand arm cannot do is stand in for the
pre-registered cell: the threshold named the calculator cell, and 19 of 20
there is a hand reading, not a scorer's count.

### 1.4 What follows under D8

1. **The text gains a class floor.** F2's rule was "the text gains a class
   floor if it does not", and it did not. The floor states the measured
   position, not a prohibition: the procedure is written for Sonnet and
   above; a Haiku-class model follows it to the verdict but cannot be
   relied on for the machine-readable record, so on Haiku the record's
   block (and any handoff front matter) goes through a parser before
   anything reads it. The exact lines are in Stage S5's handoff
   (`docs/handoffs/2026-10-30-stage-s5-skill-text.md`), to be typed into
   `SKILL.md` by a Sonnet session with the gate as the oracle and the
   diff checked against the handoff by the coordinating Fable session.
   The wording is this stage's (matrix row 5); only the typing is
   delegated.

2. **Variant C's gate is open, and C1 is not staged.** D8's rule is "stage
   C1 only if H2 shows Haiku still below 18 of 20": a necessary condition
   that F4 was deferred to decide, not a trigger. The gate is open. I do
   not stage C1, because it has no measurable target. C1 is a rewrite of
   `SKILL.md` under ASD-STE100's writing rules, judged on Haiku. Haiku's
   decision misses on the revised text are one scenario in each arm,
   both the same scenario, and that scenario's miss is an input default
   the rewrite would not touch (section 2.1). The two other misses are
   block-format faults in the evaluation's prompt, which the rewrite
   would not touch either. A rewrite can therefore move the Haiku
   calculator cell from 17 to at most 18 of 20 on the scorer's count, or,
   once Stage S4 fixes the block contract, from 19 to at most 20 of 20;
   at n = 20 neither move is distinguishable from noise (19 of 20 against
   20 of 20, Fisher p = 1.000). D8 priced C1 at 6.02 USD plus 40 Haiku
   runs; with the Fable acceptance matrix row 4 requires it is 12.31 USD
   plus runs (section 3.6), to measure a change the design cannot show.
   The persona's rule is that novelty that cannot move a number is
   decoration. This is the decision D8 deferred to F4, so it is taken
   here; because the operator's recorded option named the rule, the
   choice to leave C1 unstaged is also put back to the operator as D10
   (section 4), with the measure fixed below in case they overrule.

3. **The measure if C1 is staged**, fixed now so nobody chooses it after
   the result: C1 runs only after S4 (the block contract fixed) and S5
   (the floor in), against a baseline Haiku calculator cell of n = 40
   (two runs per scenario, 21 scenarios, 42 runs) on the S5 text and the
   S4 contract, and C1's own text is scored on the same cell at the same
   n in the same harness. C1 is judged to help only if its cell is above
   the baseline cell with Fisher's p under 0.05, which at these rates
   needs the baseline at or below about 34 of 42 and C1 at 42 of 42.
   Anything else is "no measurable effect" and variant C is closed.

## 2. Findings and verdicts

### 2.1 Scenario 10's pair of Haiku misses: a trap in the text, not a weakness

Both Haiku runs (calculator and hand) end `fresh` on `claude-sonnet-5-5`
where `continue` on `claude-opus-5-5` is expected. Both took O = 3,000
("writing-heavy default: the stage writes a test suite") where the
scenario expects the 1,500 default; the input table shows the O miss in
each arm (13 of 14). With O = 3,000 the arithmetic gives 1.43 against
1.14 USD, fresh by cost at 25.7 percent, outside the band, and both
records apply rule 2 correctly to that. Both adversarial passes then
recompute at O = 1,500, find 0.96 against 0.90 (6.3 percent, continue by
quality), name the flip point at about 1,700 tokens per turn, and keep
`fresh` under step 5.4 because 1,500 is a stress value nobody in the
brief claims. That is the procedure followed to the letter on a
defensible input. Sonnet's eight runs on the scenario all took 1,500.

Step 1.2 says "Default 1,500. Writing-heavy stages: 3,000" and defines
writing-heavy nowhere; a test suite is a stage that writes files, so the
term admits Haiku's reading. The scenario's expectation picked one of two
readings the text allows, which is a trap in the sense that matters: the
subject can be right by the text and wrong by the key. Verdict: a text
fault, fixed in the text, not in the expectation. Stage S5 ties the term
to the matrix: writing-heavy is matrix row 3's writing (a specification,
a brief, a design note) or a new module written from a blank file; row 2
work with a stated test, a refactor and a chore take the default. Under
that rule scenario 10 is row 2 and O is 1,500, so no expectation moves.
H3 (section 3.6) re-measures it. Confidence that the rule is the right
cut: medium; the observable is the matrix row the subject must already
determine, which is the cheapest deterministic rule available.

What H1 adds: Haiku's H1 "pass" on scenario 10 in both arms was
guardrail 7's default (`continue`) taken after a draft that missed, so
H1 had Haiku right for the wrong reason and H2 has it wrong for a
defensible one. The scenario has never been passed by Haiku on its
reasoning, which is why the text fix comes before any claim either way.

### 2.2 The `t_star` misses: an encoding fault in the block, not arithmetic

Every Sonnet "arithmetic" error in H2 but two is `t_star`: calculator
arm 8 of 9 error runs ("stated where the recompute has none"), hand arm 6
of 7 (the same). In each the record's own line reads "T* = n/a: the model
changes" and the block carries `"t_star": "never"`. The prompt offers
`"t_star" as a string of turns or "never"` and null "for each figure you
did not compute"; a subject that wrote "n/a" in prose had no value for it
and chose the nearest word. The recompute returns null when the model
changes (rubric section 5), so "never" is a figure stated where there is
none. The ninth calculator error is one "never" where the recompute is
finite; the two `cost_split` errors are the only money figures wrong
(outside half a unit of the last decimal). Haiku's `t_star` misses are
"too few decimal places (0)" (four runs, a figure like "72" where the
rule asks for one decimal) and one "stated where the recompute has none".

So the arithmetic column is clean on money in 102 of 104 stated money
figures across the Sonnet cells, and the `t_star` column measures the
prompt's wording. Verdict: a wording fix in `eval/subject-prompt.md`
("`t_star` null when the model changes; `never` only when C0 is not above
B + R"), with the scorer unchanged, in Stage S4; the rubric's decimal rule
for `t_star` stays (one decimal is what step 2 prints). O4 does not
address this: the F1-1 terms change the fresh side and T*'s numerator,
not whether T* exists.

What the calculator still buys Sonnet: the stated-figure error rate is
not separable between arms (9 of 107 against 7 of 103 stated figures),
and the final verdict is 40 of 40 in both. The calculator's value on
Sonnet is the record's figures being reproducible by the gate and the
scorer, and the time (median 1.7 against 1.5 minutes, the same). The
skill keeps "run the calculator where you have it" as written; nothing
in H2 argues for making it mandatory.

### 2.3 O4, the F1-1 fresh-side terms: declined

F2 staged O4 "conditional on F4 finding the band scenarios matter in
practice". They do not, on this evidence. The band scenarios are 10 and
11; Sonnet is 16 of 16 on them across both arms, Haiku 2 of 4, and
Haiku's two misses are the O default of section 2.1, which the F1-1
terms would not move (with O = 3,000 the margin is 25.7 percent; the
terms are 2 to 11 percent of the smaller side on the three records F1
sized). The terms only raise the fresh side, so they move verdicts
toward `continue`, which is rule 3's answer inside the band anyway; a
verdict changes only where fresh wins by between 10 and about 20
percent, and no run on file sits there. Against that, O4 costs 5.50 USD
of Opus, 6.29 of Fable acceptance, every scenario's expected figures
regenerated, a new worked example, and a rerun to restore comparability
with H2: about 20 USD and a day of the serial chain for a one-sided
accuracy gain the evaluation cannot see. Declined.

What is kept of F1-1: one sentence in step 2 (Stage S5) naming the
omission and its measured size, so that a `fresh` verdict by cost whose
margin is inside that range is written as fragile in step 5. The formula
and the calculator do not change; the gate's recompute of every example
and scenario stays valid.

### 2.4 A 21st scenario for guardrail 7's fallback branch: yes

Scenario 17 now tests "cap passed, draft written, draft stands". The
other branch, "cap passed, no draft, the default", is the branch every
one of H1's 19 Haiku misses went through under the old rule, and the
revised rule's version of it has never been run. Stage S4 adds scenario
21: the same shape as 17 (a resumed decision at 11 minutes) with the
record so far covering step 1 only, expected `continue` on the session's
own model and effort with guardrail 7 bound and `draft_required` false.
The calculator still prices it for `checkEval` (the figures exist; the
subject is not meant to compute them), and the rubric's row 7 already
scores the consequence. Twenty scenarios stay as they are, so
comparability of the first twenty is untouched; the scorer reports the
21st beside them.

### 2.5 F3-1, F3-5 and F3-6

**F3-1** (rubric row 7 against the guardrail order where guardrails 5 and
7 both bind): fix the rubric and `takesCapDefault` so that an
`incomplete` draft with guardrail 5 listed keeps `incomplete` (5 comes
first in step 4's order), with a scorer test as the oracle. No scenario
is added for it: the case is a stale or null table met after 10 minutes,
which the set does not need to hold to be complete, and the rubric says
so. Stage S4.

**F3-5** (the scorer's record size is the whole file, block included):
the H2 records measure 2,179 to 2,610 tokens at the median and 3,256 at
the largest (`07-split-plan.sonnet.hand`), against the 4,000 cap, so the
margin held. The block is 150 to 250 tokens of the evaluation's output,
not the subject's record, so the scorer subtracts it (`record_tokens`
measured on `record.txt` less the result block). One line and a test,
Stage S4; the over-cap column of H1 and H2 is not restated.

**F3-6** (the diagnostic double-counts an unlisted outcome guardrail):
read as F3 asked. H2's diagnostic is empty, the two bound-guardrail
failures are the two unscorable runs, and nothing is subtracted. The
scorer reports the overlap beside the diagnostic from now on ("flagged n,
of which m fail a bound outcome guardrail"), Stage S4, so the next reader
does not have to.

### 2.6 H1 against H2, cell by cell

From the 200 `score.json` files by script (`compare.mjs`, this session;
the records were not read). Scenario 17 is omitted: its expectation
moved with the cap rule (ruled 2026-10-30), so its H1 and H2 rows answer
different questions. Counts are final agreement; H2's Sonnet cells hold
two runs per scenario.

| Cell | H1 (19 scenarios) | H2 (19 scenarios) | Scenarios up, down, same | Fisher p, H1 against H2 |
|---|---|---|---|---|
| Haiku, calculator | 10 of 19 (31.7 to 72.7 percent) | 16 of 19 (62.4 to 94.5) | 9, 3, 7 | 0.079 |
| Haiku, hand | 9 of 19 (27.3 to 68.3) | 18 of 19 (75.4 to 99.1) | 10, 1, 8 | 0.003 |
| Sonnet, calculator | 19 of 19 | 38 of 38 | 0, 0, 19 | 1.000 |
| Sonnet, hand | 16 of 19 (62.4 to 94.5) | 38 of 38 | 3, 0, 16 | 0.033 |

The three Haiku calculator scenarios that went down are 10 (section 2.1),
12 and 14 (the two format failures, section 1.2); the one hand scenario
down is 10. Every Haiku scenario that went up (02, 05, 07, 08, 11, 13,
16, 20 with the calculator; 02, 05, 08, 09, 11, 12, 13, 15, 16, 20 by
hand) was an H1 miss that F2 traced to guardrail 7's default; in H2 no
run in any cell takes that default (the F2-6 diagnostic is empty). The
Sonnet hand scenarios that went up are 10 (a band miss in H1), 15 (the
null-target type, rescored in H1 to a pass) and 18 (the `not-run` model,
fixed in the prompt).

**What the comparison can attribute to the text change.** The Haiku
recovery in both arms is consistent with the cap rule and nothing else
on file: the H1 misses were the default's, the default is no longer
taken, and the scenarios that recovered are the ones the default had
cost. Sonnet's hand cell moving from 16 of 19 to 38 of 38 is two prompt
or contract fixes (15 and 18) and one band scenario, which at n = 1 per
cell in H1 is within noise.

**What it cannot attribute.** Three things changed besides `SKILL.md`:
the subject prompt (two lines, null target and the `not-run` model), the
rubric's types, and the day. The runner is the same `Agent` runner with
the same `AGENTS.md` and `MEMORY.md` load, which holds the harness
constant but does not remove the validity threat; the harness reports no
model version, so a model update between the two days cannot be excluded;
each prompt was copied by hand into its call, so a transcription slip is
possible and unobserved in both runs; and Haiku's H1 cells are n = 1 per
scenario, so the per-scenario rows are directions, not rates. The
attribution above is therefore "consistent with", at p = 0.003 for the
hand arm and 0.079 for the calculator arm, not a controlled result. S4's
CLI runner removes the instruction-file load and the hand copying for
every later run.

### 2.7 What S4 and S3 should now contain

**S4, harness hardening and evaluation contract** (Sonnet, medium; the
handoff is `docs/handoffs/2026-10-30-stage-s4-harness-and-contract.md`).
In order, as separate commits:

1. The block contract, prompt and rubric: `t_star` null when the model
   changes (section 2.2); `cost_of_deciding.usd` string or null, null
   meaning not priced (the stale-table case); the block on its own lines
   after the last table, never inside a cell (the 12 failure); F3-1's
   row 7; F3-5's record size without the block; F3-6's overlap line;
   F3-3's broken sentence in scenario 17's note; scenario 21 (section
   2.4); `eval/README.md`'s measured-position paragraph updated with the
   H2 figures and this ruling. Oracle: `scripts/eval-score.test.mjs`
   with a test per change, the gate's `checkEval` on 21 scenarios.
2. The runner: `node eval/run.mjs run --date <d> --runner cli` drives
   `claude -p` from each sandbox with `--model` and
   `--output-format json`, writes `usage.json` with the CLI's input,
   output, cache and cost figures, and the probe first: one run that asks
   the subject which instruction files and skills it loaded, with the
   home directory or the settings sources isolated if the probe shows
   the installed copy of this skill or any `AGENTS.md` (F2-8). The
   `Agent` path stays documented for H1 and H2's comparability. Oracle: a
   two-run dry run whose `usage.json` carries measured input, output and
   USD, the probe's answer recorded in the results notes.
3. `prepare` merges into an existing manifest instead of rewriting it
   (F2-10, met by hand in H1 and H2), with a test.
4. The gate's recompute reads the term lines inside the fenced block and
   the Step B cost column at the same tolerance (F1-3), with
   `node scripts/check.mjs` as the oracle and a seeded mutation test.

**S3, adapter verification with the operator present** (Sonnet, medium),
after S5 so the installed text is final: `node scripts/install.mjs
--harness all` and `--check`; for each harness the operator has on the
machine, paste the pointer block the installer prints (the Stage 0
question, carried since 2026-10-27), start one session there, give it
scenario 03's brief by hand, and confirm a record in the skill's shape is
written; mark each adapter "verified on <date>" or "not installed on this
machine", and record the three harnesses already refreshed on 2026-10-30.
Oracle: `install --check` at 0 files behind and one record per verified
harness, read by the operator.

## 3. The six questions, for the new state

### 3.1 Deliverables

Unchanged from F2 section 1: `SKILL.md` and its calculator, the adapters,
the price tables, the templates and examples, the evaluation under
`eval/` with its results files, and the protocol kit. What is new since
F2: the revised text (O3), its acceptance (F3), the rerun on it (H2), and
this ruling. The deliverable the project was started for, a procedure a
model one or two classes below the frontier can follow, is now measured:
Sonnet 80 of 80 on the revised text.

### 3.2 How it works

As F2 section 2 describes, with the cap on the record and the minutes
rather than on reading, the guardrail order, and the null target. The
evaluation runs on the `Agent` runner until S4's CLI runner lands.

### 3.3 Assessment

The skill does what it claims for the classes it claims, and the claim is
measured rather than argued: 40 of 40 and 40 of 40 on Sonnet, arms not
separable, no verdict on file lost to the cap. Below the claim, Haiku
follows the procedure (19 of 20 by hand reading in the calculator arm, 19
of 20 scored by hand) and fails the machine-readable contract 2 times in
20, which is the class floor's content. The remaining defects are in the
evaluation's contract and harness (the `t_star` encoding, the block in a
cell, the `usd` null, the instruction-file load, the hand-copied prompts),
and in two undefined terms in the text (writing-heavy; the omitted
fresh-side terms). None is in the arithmetic: 102 of 104 Sonnet money
figures within half a unit, and the two outside are `cost_split` by hand.

What I would still not claim: that the Sonnet result transfers to a
harness that loads no project instruction files (S4 measures it), that
it holds across model versions (the harness reports none; the persona's
rule is to rerun on every version change), or that the self-reported
cost-of-deciding figures mean anything (12 to 39 percent of the measured
totals in H2's report ratios; S4's measured usage replaces them).

### 3.4 Status

`main` at `ab25481` before this stage's commit, pushed through `0eb590b`
by the coordinating session. Stages done: 0, 0b, H0, O1, S1, F1, O2, S2,
H1, F2, O3, F3, H2, and this F4. Gate 97 files, 0 findings; 35 tests pass
(H2's close; re-run at this stage's close, counts in the stage report).
Price table `pricing/2026-10-29.json`, 1 day old, stale from 2026-11-13
by the local day. Installed copies refreshed after O3, 0 files behind.
`SKILL.md` unchanged since O3 (SHA-256 `60107f3e…`).

### 3.5 Improvements proposed

**A. Fix the evaluation's contract where it rejected the skill's own
behaviour, and measure the subjects** (sections 2.2, 2.4, 2.5, 2.7):
Stage S4.

**B. Write the measured position and the two definitions into the
text** (sections 1.4, 2.1, 2.3): Stage S5, three short additions to
`SKILL.md`, no formula change.

**C. Measure once on a clean harness** (section 2.6): Stage H3, 42 runs
on S4's CLI runner on the S5 text, Sonnet and Haiku calculator arms, one
run per scenario, thresholds in section 3.6.

**D. Verify the adapters with the operator** (section 2.7): Stage S3.

**E. Close** (section 3.7): Stage F5 reads H3, updates the floor's
figures if they moved, and declares the roadmap done or names what is
not.

Not proposed: C1 (section 1.4, D10); O4 (section 2.3); a third arm; more
Sonnet runs (80 of 80 is at the ceiling the budget can distinguish); a
second Haiku hand cell; any change to the matrix's classes or the
formula.

### 3.6 Roadmap by model class, priced

**Method.** Each stage is priced as a fresh session by `SKILL.md` step 2
and 3.3 from `pricing/2026-10-29.json` by one calculator run over the
pieces in `docs/dispatch/2026-10-30-f4-roadmap.json`:

```
node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f4-roadmap.json --today 2026-10-30
```

B is 87,114, this session's measured baseline (`get_usage self`: 258,108
total less 170,994 Messages). T, F, O and R are estimates; M is 0, so the
figures are floors. Each row's cost is the Step B table's figure for the
piece of that name in the command's output. Wall clock from protocol
section 7, operator review separate.

| Stage | Class, effort | T | R | Cost USD | Quote | Wall clock | Depends on |
|---|---|---|---|---|---|---|---|
| S4 Harness hardening and evaluation contract (section 2.7) | Sonnet, medium | 50 | 27,000 | 3.11 | 2.5 to 5 | 45 to 60 min | none |
| S5 Skill text: the class floor, writing-heavy, the omitted terms (sections 1.4, 2.1, 2.3) | Sonnet, medium | 15 | 15,000 | 0.85 | 0.7 to 1.5 | 15 to 25 min | none; beside S4 (disjoint files: `SKILL.md`, with one changelog line in `README.md` to rebase) |
| H3 Clean-harness regression: 42 runs (21 scenarios, Sonnet and Haiku, calculator arm) on the CLI runner, orchestration | Sonnet, medium | 15 | 15,000 | 0.85 plus subjects | 0.7 to 1.5; subjects 1 to 5 (estimate: Sonnet about 0.05 to 0.19 and Haiku about 0.02 to 0.07 a run, as F2 priced them; the CLI reports the real figure) | 20 to 40 min | S4, S5 |
| S3 Adapter verification, operator present (section 2.7) | Sonnet, medium | 25 | 15,000 | 1.31 | 1 to 2.5 | 30 to 45 min plus installs | S5 |
| F5 Closing assessment on H3 | Fable, high | 15 | 30,000 | 5.18 | 4 to 7 | 30 to 45 min | H3, S3 |
| C1 Variant C rewrite (not staged; D10) | Opus, high | 40 | 25,000 | 6.02 plus 84 Haiku runs | 5 to 9 | 30 to 60 min | S4, S5; the operator's overrule |
| F6 Acceptance of C1 (not staged; with C1) | Fable, high | 20 | 35,000 | 6.29 | 5 to 8 | 20 to 30 min | C1 |
| O4 Fresh-side fixed-cost terms (declined, section 2.3) | Opus, high | 40 | 30,000 | 5.50 plus acceptance and a rerun, about 20 | 15 to 25 | 30 to 60 min | not staged |

**H3's thresholds, fixed now.** Sonnet calculator at 20 of 21 or more
(lower bound 77.3 percent) keeps the Sonnet claim on the clean harness;
Haiku calculator at 19 of 21 or more (71.1 percent) says the contract
fixes, not the subject, were the H2 misses, and the floor's figures are
updated to H3's; below either, F5 reads the misses and says which it is.
Scenario 21's expectation is set by S4 before any run.

**Totals.** Firm stages left (S4, S5, H3, S3, F5): 11.30 USD of sessions
plus 1 to 5 of subject runs, about 12 to 17 USD; quote 12 to 20. The
unstaged stages would add 12.31 plus about 1 to 6 for C1's runs. Done
stages, from `docs/status.md` (estimates where the stage said so): about
60 USD through H2, plus this stage at about 9 (section 5): about 69 USD.
Whole roadmap, done and firm: about 81 to 86 USD; with C1 and F6 about 94
to 100. Serial chain left: S4, then H3, then F5, about 1.5 to 2.5 hours
of model time; S5 beside S4, S3 beside H3. Operator review: about 20
minutes per Sonnet stage, 30 for F5, about 2 hours in all including S3's
installs (rough).

### 3.7 Is the roadmap near its end, and what "done" looks like

Yes. The question the project was started on (does the procedure work
one or two classes below the frontier) is answered and measured; what is
left is hygiene and one clean measurement. Done, for this project, is:

1. `SKILL.md` carries the measured class position and the two
   definitions (S5), and no open verdict waits on a text change.
2. The evaluation runs end to end by script on a harness that loads no
   project instruction files, with measured usage and cost per run, and
   its results file on the final text is on file (S4, H3).
3. The adapters say, each, whether they were verified on a machine and
   when (S3), and `install --check` reports 0 files behind.
4. `docs/status.md` lists nothing under "In progress" or "To do" and the
   decisions waiting are empty or recorded as declined (F5).

After that the project is maintained, not developed: a price refresh
every 14 days (`pricing/README.md`), a rerun of the evaluation on any
change to `SKILL.md` or any model version change (the persona's rule),
and a handoff per stage as now. Nothing in H2 argues for more scenarios,
more arms or a formula change; those would be spending on questions the
data has answered or made unaskable.

## 4. Decision for the operator

```
D10
Decision:      Whether variant C (C1, an ASD-STE100-style rewrite of SKILL.md judged on Haiku) is staged now that D8's gate is open (Haiku 17 of 20 on the scorer's count) and F4 has read the misses as two block-format faults and one open input default.
Options:       A leave C1 unstaged and close variant C with this ruling / B stage C1 after S4 and S5 against the measure fixed in section 1.4 (baseline n = 42 on the S5 text, C1 at the same n, Fisher p under 0.05) / C stage C1 now against H2's cell, as D8 first read
Pros and cons: A costs nothing and keeps the budget for the clean measurement; it closes D2's deferred option on a reading of three records rather than a run. B is the only version that can measure a rewrite at all, about 12.31 USD of sessions plus about 84 Haiku runs (1 to 6 USD), and it can show an effect only if the baseline cell falls to about 34 of 42, which section 1.2's reading makes unlikely. C spends the same money on a cell whose misses are known to be contract faults, so its result would measure S4's absence.
Blast radius:  A none; variant C can be reopened by a later run if Haiku's clean-harness cell (H3) falls below 19 of 21. B two more stages on the serial chain after H3. C a confounded result.
Recommended:   A, because a rewrite's target on the revised text is one scenario whose miss is an input default S5 fixes, and no n the budget allows can show a move from 19 of 20; D8 deferred this choice to F4 and F4 takes it, subject to the operator's overrule.
```

Everything else in this assessment is decided; nothing waits on D10.

## 5. Cost of this assessment

Measured with the session usage tool and priced at the Fable row of
`pricing/2026-10-29.json` (cache read 0.25, cache write 12.50, output 50
USD per million). The F4 handoff projected 14.71 USD at T 45.

| Row | Value | Source |
|---|---|---|
| Context at start | 91,786 | `get_usage self` at the first tool call, 17:22 UTC; baseline 87,114 (258,108 less Messages 170,994 at the roadmap pricing) |
| Context before the writing | 258,108 | `get_usage self`, about 17:31 UTC |
| Context at end | 300,448 | `get_usage self` after the gate and tests, before the commit, 17:43 UTC |
| Turns | about 20 | model calls, counted from the transcript (estimate) |
| Input tokens read | about 120,000 | the brief, two personas and two language files, the protocol, both results files, two records, scenarios 10 and 17, two scenario 10 records, F2 sections 3.4 to 8, O3 acceptance sections 4 and 6, F1-1 to F1-3, the rubric, the prompt, `SKILL.md` steps 0 to 6, status, template, README head: characters divided by 4, estimate |
| Output tokens | about 22,000 visible | this document, two handoffs, the roadmap inputs file, two scripts, status and changelog edits: characters divided by 4, estimate; reasoning not separated by the usage tool |
| Wall clock | about 24 minutes | session created 17:21 UTC; commit at about 17:45 UTC |
| Priced | about 9 USD (estimate): the first write of 91,786 at 12.5e-6 = 1.15; growth to about 310,000 at the commit, 218,000 x 12.5e-6 = 2.73; cache reads about 4.0 million tokens over 20 turns x 0.25e-6 = 1.00; visible output 22,000 x 50e-6 = 1.10; total about 6.0 counting visible output; the Messages category grew by 208,000 tokens, of which tool results and visible output account for about 150,000, and the remaining 58,000 are consistent with reasoning retained in context, about 2.9 more as output: about 9 | table `pricing/2026-10-29.json`, fable row |
