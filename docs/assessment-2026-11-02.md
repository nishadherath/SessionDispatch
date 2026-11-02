# Assessment 2026-11-02: the coordinator's cost

Written by the Fable session the operator opened on 2026-11-02
(claude-fable-5-1, effort high, Claude Code desktop) in answer to a
report from the Tsunami project's coordinating session. The report asks
whether the session-dispatch formula should price the turns of the
session that coordinates a dispatched chain. This document checks the
report's figures against the Tsunami repository's own records, says
where the report is right and where its arithmetic is off, and proposes
how the skill changes. The decision is D12 in `docs/status.md`, set out
in section 6 below in the five-part shape.

Read for this assessment: `SKILL.md`, `scripts/dispatch-core.mjs`,
`scripts/dispatch.mjs`, `scripts/check.mjs`, the record template, the
worked example of 2026-10-29, scenario 07, `pricing/2026-10-29.json`
(age 4 days), and in `D:\Code\Claude\Tsunami`: handoff 38 (sections 10
and 13), `STATUS.md` section 6 and decision D-112.

## 1. The measurement, verified

The report's figures are the Tsunami project's, measured from the
transcripts with its `scripts/session_cost.py` (usage per API call,
priced with this repository's table of 2026-10-29). They are in
`STATUS.md` section 6 and D-112 item 4 of that repository.

| Row | Projected (handoff 38) | Measured (D-112) | Ratio |
|---|---|---|---|
| Piece A, content, Opus high | 8.6 USD (T 50) | 4.27 USD (42 calls) | 0.50 |
| Piece B, build, Sonnet high | 9.9 USD (T 100) | 4.89 USD | 0.49 |
| Piece C, content acceptance, Fable high | 9.1 USD (T 30) | 6.53 USD | 0.72 |
| Piece D, page acceptance, Opus high | 5.8 USD (T 40) | 9.80 USD (116 calls) | 1.69 |
| Pieces together | 33.4 USD | 25.49 USD | 0.76 |
| Orchestration, Fable high | 5.3 USD (T 25, priced by hand) | about 56 USD (166 calls; 52.42 measured at 14:06 plus about 4 estimated for the closing turn) | about 10 |
| Stage | 38.7 USD | about 82 USD | 2.1 |

The coordinator's 166 calls break down as 49.7M cache-read tokens
(12.43 USD at 0.25), 1.07M cache-write tokens (13.38 USD at 12.50),
469K output tokens (23.45 USD at 50.00) and four Sonnet sub-agents
(3.06 USD). Per call: 299K tokens read from cache (the average
context), 6,446 written, 2,825 of output; 0.297 USD per call. The
context ran from 145,115 to 557K tokens with one compaction.

Three readings of these numbers that the report does not draw:

1. **The projection did price the coordinator.** Handoff 38 section 10
   has a row "Orchestration here, Fable: 25 turns, 5.3 USD". The formula
   has no symbol for it, as the report says, but the omission at
   projection time was not the term; it was the turn count. 166 against
   25 is a factor of 6.6; the per-call cost, 0.297 against 0.212, is a
   factor of 1.4. A term with a default of 25 turns would have missed by
   the same factor. So the fix has to carry a measured per-piece default
   and a rule for counting coordinating turns, or it changes nothing.
2. **Output is the coordinator's largest cost, not context.** 23.45 of
   52.42 USD is output at Fable's 50 USD per million; cache reads are
   12.43. A coordinator writes briefs, handoffs, acceptance briefs,
   status rows and decision entries: writing-heavy turns at the dearest
   output rate in the table. The class of the coordinator matters more
   than the size of its context.
3. **The first measurement of M.** Net context growth was 412K tokens
   over 166 calls, 2,482 per call; cache writes were 6,446 per call, 2.6
   times the growth. One compaction's rebuild accounts for part of the
   difference; the rest is about one to two whole-context rewrites over
   the stage, the cache misses the formula's M term prices and that no
   record has measured until now. The cause is not identified. One
   candidate, unverified: the desktop app keeps a "Linked sessions now"
   note current in the coordinating session's prompt, and each change to
   a child session's state changes that prefix, which invalidates the
   cache from that point. A coordinator with many children would then
   miss more often than a session working alone. This is a hypothesis to
   test with one transcript, not a finding.

Two caveats on the 166 calls. D-112 says the orchestrator also ran the
dispatch with its overrun, the skeleton of the source document, the
coordination with the PPLI chain in the same checkout, and the handoff
renumbering. The per-piece figure of about 40 is therefore an upper
bound from one stage, with an unknown share that was not coordination of
these four pieces. And the pieces came in at 0.76 of projection here and,
by handoff 38's own note, at 0.36 to 0.70 on the five stages before it:
the formula's piece defaults (T, F, O) run high on that project, in the
opposite direction to the coordinator's omission. Two errors that partly
cancel are two errors.

## 2. Where the report is right and where it is off

**Right.** The gap is real: `splitCost` sums brief, run and acceptance;
`pieceCost` prices each piece as a fresh session; nothing prices the
session that stays alive to start, verify, merge and record. Under this
project's protocol (autonomy yes, sessions started by the finishing
session) a coordinator exists in every dispatched plan, so a term is the
right shape, a formula date is the right versioning, and the old formula
stays behind `--formula`. The report's option costs for the pieces of
the change are plausible analogues from its measured sessions.

**Off, in four places.**

1. **"About one tenth" at a Sonnet coordinator is about one quarter.**
   At the measured per-call tokens (299K read, 6,446 written, 2,825
   out), one coordinating call costs 0.297 USD on Fable, 0.149 on Opus,
   0.074 on Sonnet at the same context and 0.059 on Sonnet from a
   smaller context (150K average). The ratio is 4.0 to 5.0, not 10.
   Over 166 calls: Fable 49.3 USD, Sonnet 9.8 to 12.3. The saving is
   still the largest single lever in the stage, about 37 to 40 USD, but
   the report's figure overstates it by two.
2. **The term belongs in three places, not one.** The report adds it to
   `cost_split` and "any plan in which the current session stays to
   coordinate". Concretely: the split (step 2.1), the pieces plan (step
   3.3, where the stage cost is the sum of the pieces), and the fresh
   side of step 2 whenever this session starts the fresh session and
   stays to receive its note, verify and merge, which under autonomy is
   the usual case (a few turns, not forty). It never belongs on the
   continue side, where T already covers every turn. So To is an input
   per plan, and the record names who coordinates and at what class.
3. **The report's own option A omits its own coordinator.** It prices A
   at 15 to 20 USD: an Opus session about 8, a Fable acceptance about 7,
   the dispatch about 1.3. If this Fable session coordinates three
   pieces at the report's default of 40 turns each, that is 120
   coordinating turns at about 0.30 USD, 36 USD, or 44 USD by the
   formula's defaults (F 3,000, O 3,000 from a context of 190K). The
   stage would cost 55 to 65 USD, not 15 to 20. If the operator starts
   the sessions from cards and this session ends, coordination costs
   about nothing and the stage costs 19 to 25 USD (section 4). The
   lesson the report draws is the one to apply to its own execution.
4. **A cheaper coordinator has a harness limit the report does not
   name.** In the desktop app a session started by another session
   cannot start sessions (recorded in this project's memory on
   2026-10-29: `start_session` with `initiation: user_asked` is refused
   from a child; only a card works). The protocol also accepts a started
   session's model only at or below the starter's class. So a Sonnet
   coordinator can run tests, merge, re-export and record, but it cannot
   start an Opus or Fable acceptance, and if Fable started it, it cannot
   start anything. The cheap shape is therefore: the high-class session
   writes the briefs and starts (or proposes as cards) every session in
   the chain in a handful of turns, then ends; a Sonnet session the
   operator starts, or the operator, coordinates from there. The skill
   text has to say this, or a subject will plan a coordinator that
   cannot do its job.

One more thing the report leaves out. With the measured coordinator in
place of the hand figure, handoff 38's split cost was about 85 USD
(33.4 plus 52), against its continue side of 81 USD. The verdict stood
on guardrail 2 (design-heavy and compacted), not on cost, but the
record's "margin 42 USD, 108 percent" was wrong in sign. Under the
proposed term with its defaults (To 40 per piece, four pieces, F 4,000
and O 2,000 from a context of 151,615 at Fable's rates) the coordinator
prices at 53.3 USD, within 6 percent of the 56 measured. That agreement
is partly circular, since the default comes from the same stage, and it
says the shape of the term is right, not that the default is.

## 3. The proposal

Four changes, in one Opus stage plus one Sonnet stage, accepted by a
Fable session. The report's option A, amended by section 2.

### 3.1 The term

One new input in step 1.2:

| Input | Symbol | How to get it |
|---|---|---|
| Coordinating turns | To | Turns this session, or the session named as coordinator, spends after the briefs are written: starting each session, receiving its note, running the oracle on its result, merging, re-exporting, recording the outcome and talking to the operator. Count per piece: start 1, note 1, verification 3 to 10, merge 2 to 5, record 1 to 3. Default 30 per piece (range 20 to 40). One measurement so far, Tsunami 2026-11-02, about 40 per piece, an upper bound that included other work (section 1 of `docs/assessment-2026-11-02.md`). 0 when the operator starts the sessions and this session ends. |

The term, in step 2:

```
cost_coord = To turns of the coordinator's session, from C0 + H,
             at the coordinator's model: reads of the growing context,
             writes of G per turn, O per turn (writing-heavy: 3,000),
             plus M_o misses and penalty_compaction if the coordinator
             crosses K.
```

It is the continue side's arithmetic with T replaced by To, which
`sessionTurns` in `dispatch-core.mjs` already computes. It is added to
`cost_fresh` (To small: 3 to 5, when this session starts the fresh
session and verifies its result; 0 when the operator starts it), to
`cost_split` (To per piece times the pieces), and to the Step B total.
The calculator takes `--To` and `--coordinator <model id or class>`
(default: the current model), prints a `cost_coord` block and, beside
it, the same turns at the sonnet model, so the record shows what a
cheaper coordinator saves. Formula date 2026-11-02; records before it
omit To; `--formula 2026-10-29` reproduces them. M for the coordinator
defaults to 0 as elsewhere, with the first measurement (one to two
whole-context rewrites per 166 turns) named in step 1.2 as the value
to test in step 5.

### 3.2 Who coordinates

A line in the matrix (step 3.1) and a rule in step 3.2:

- Matrix: "Coordinating a dispatched chain whose briefs name their
  oracles: start, receive, verify, merge, record. Sonnet, medium. The
  oracle is the intelligence; a session that only reads an exit code
  and merges a branch pays for class it does not use." Escalate on a
  failed verification the oracle cannot explain.
- Step 3.2, new rule 7: "The session that writes the briefs starts or
  proposes every session of the chain in its last turns and then ends;
  it does not stay alive to coordinate when its class is above the
  coordinator row. A session started by another session cannot start
  sessions in the Claude Code desktop app (verified 2026-10-29), and a
  session starts only models at or below its own class (protocol
  section 3), so the coordinator is either the operator or a session
  the operator starts. The plan names the coordinator, its class and
  To, and prices To at that class."
- Guardrail: none new. A cost rule, not a quality rule; the term makes
  the cost visible and the matrix row gives the class.

### 3.3 The calibration loop

The skill has no path from a measured cost back to its defaults. This
stage's two errors (pieces at 0.76 of projection, the coordinator at
10 times) were both visible only because the Tsunami project wrote its
own transcript pricer. Three additions:

- `scripts/session-cost.mjs`: prices a Claude Code transcript (the
  session's JSONL under `~/.claude/projects/`, usage per assistant
  message) with the table in force; standard library; a port of
  Tsunami's `session_cost.py`. Output: calls, context at the last call,
  cache-read, cache-write and output tokens, the cost, and the per-call
  averages that are the skill's defaults (F plus visible O as growth,
  cache-write per call, O per call).
- A "Measured" column in the handoff template's cost projection, filled
  at stage close from that script, and a ledger
  `docs/dispatch/calibration.md`: one row per piece and per coordinator,
  with class, effort, T projected and measured, per-call tokens, cost
  projected and measured. Seeded with the five rows of the Tsunami
  stage (section 1) and the two of Stage O1 and F1 where their
  transcripts still exist.
- Every default in step 1.2 carries its sample size: "default 3,000 (n
  = 1, fork_graft 2026-10-11)". A default moves only on the ledger, the
  way `BAND_PERCENT` moves only on evaluation data.

### 3.4 The evaluation

Two scenarios, figures captured from the calculator, scored on the next
required rerun as D11 chose for H4:

- 22: a four-piece split where a Fable coordinator at To 30 per piece
  makes the split dearer than the fresh side with an operator-started
  session, and a Sonnet coordinator makes it cheaper; the expected plan
  names the coordinator's class.
- 23: a fresh verdict where this session starts the session and
  verifies (To 4) against one where the operator starts it (To 0),
  inside the band either way; the quality rule decides and the record
  states To.

The class-floor paragraph in `SKILL.md` gets one sentence: its figures
were measured under the formula of 2026-10-29, before To; the term is
unscored until the next rerun. The 21 scenarios pin their formula date
and do not move.

## 4. Stages, priced

Prices from `pricing/2026-10-29.json` (age 4 days). B 86,450 measured
2026-10-29. The calculator's figures where it can give them
(`node scripts/dispatch.mjs --current claude-fable-5-1 --target opus
--W 1000000 --K 970000 --C0 150000 --T 60 --F 3000 --O 3000 --B 86450
--R 25000 --H 2500 --Ta 15 --Ra 30000 --compacted no --today 2026-11-02`
for the Opus piece at T 60); the rest by the step 3.3 formula, by hand.

| Stage | Class, effort | T, F, O, R | Cost | Wall clock |
|---|---|---|---|---|
| O5: the term in `SKILL.md` steps 1.2, 2, 2.1, 3.1, 3.2 and 3.3; `dispatch-core.mjs`, `dispatch.mjs`, `check.mjs` and their tests; the record template; formula 2026-11-02 with 2026-10-29 kept; one worked example from the Tsunami stage; scenarios 22 and 23; changelog, status, handoff | Opus, high | 60 to 90; 3,000; 3,000; 25,000 | 9.45 to 15.5 USD | 60 to 90 min |
| S6: `scripts/session-cost.mjs` with tests; the Measured column; `docs/dispatch/calibration.md` seeded; sample sizes on the defaults | Sonnet, medium | 40; 3,000; 1,500; 15,000 | 2.1 USD | 20 to 40 min |
| F7: acceptance of O5 and S6; the install (`node scripts/install.mjs --harness all`); the tag v1.1.0 and the push under the standing yes | Fable, xhigh (a release: matrix row 4's effort rule) | 20; 5,000; 3,000; 35,000 | 7.5 USD | 20 to 30 min |
| This session: the assessment, D12, the handoff for O5 and the cards | Fable, high | measured below | about 2.5 USD | done |
| Coordination, if the operator starts the three sessions from cards and this session ends | operator | To 0 | 0 | three clicks |
| Coordination, if this session stays to coordinate instead | Fable, high | To 120 (3 pieces at 40) | 36 to 44 USD | the same wall clock |

Totals: 19 to 25 USD and about 2 to 2.5 hours on the serial chain (O5,
then S6 and F7; S6 may run beside F7 in its own worktree, since its
files are disjoint from O5's apart from the changelog and status) with
operator-started sessions; 55 to 69 USD if this session coordinates.
Operator review about 30 to 45 minutes, separately. Confidence medium:
the piece figures are formula projections with the defaults that ran
high on Tsunami, so the measured figure is likely under the projection;
the coordination figures are from one stage.

## 5. What this assessment cost

| Row | Value | Source |
|---|---|---|
| Context at start | about 12,000 | self-estimate: the session's baseline before the first read |
| Context after the reads | 169,886 | measured, usage tool, before this document was written |
| Context at end | about 200,000 | self-estimate: this document, the status rows and the gate run |
| Input tokens read | about 160,000 | the skill, the scripts, the example, the protocol, the Tsunami records |
| Output tokens | about 10,000 | this document and the status rows, characters divided by 4; self-estimate |
| Wall clock | about 35 minutes | session timestamps |
| Priced | 160,000 x 12.5e-6 + 10,000 x 50e-6 = 2.50 USD | table `pricing/2026-10-29.json`, fable row; self-estimate |

## 6. D12, the decision

```
D12
Decision:      Whether, and how, the cost of the session that coordinates a dispatched chain enters the session-dispatch formula.
Options:       A' the report's term, amended: To per plan at the coordinator's class, a matrix row and a plan rule for who coordinates, a calibration loop (transcript pricer, Measured column, ledger, sample sizes on defaults), two scenarios, formula date 2026-11-02, tag v1.1.0; stages O5, S6, F7, sessions operator-started / A the report's term alone, as it stands (To in cost_split and the plan, defaults 40 per piece, 6,500 and 2,800 per turn) / B a paragraph in step 2.1: price the coordinator by hand as the continue side with T = To, and hand coordination to a cheaper class after the briefs / C nothing now
Pros and cons: A' closes the largest projection error on record (56 against 5.3 USD), makes a Fable coordinator's price visible beside a Sonnet one in every record, gives the defaults a path to become measurements, and tells a subject the harness limit that decides who can coordinate; it costs 19 to 25 USD and about 2.5 hours, and its term is unscored on a subject until the next rerun. A costs about the same and leaves the turn count, the main error, as an unmeasured default with no way to improve it, and leaves the one-quarter figure at one tenth. B costs about 1 USD and 20 minutes; the gate cannot check what it adds, and the calculator can already give the number (its continue side with T = To), so B is a text pointer to arithmetic the skill does not own. C repeats the omission on the next dispatch; on this one it was the difference between 38.7 and 82 USD.
Blast radius:  A' and A: this repository (v1.1.0), the installed copies on this machine (every Claude Code project, Tsunami included, plus codex and opencode), the record template; past records safe by formula date; the class floor's figures stay on the 2026-10-29 formula until the next rerun; Tsunami's repository unchanged. B: SKILL.md and the installed copies. C: nothing.
Recommended:   A', with the three sessions started by the operator from cards so that this session does not become the stage's dearest piece; B is the fallback if 2.5 hours is too much now, and A' can follow it.
```

Everything that does not depend on D12 is done: the figures are checked,
the proposal is written, this document and the status rows are committed.
The handoff for O5 is written only on the operator's choice, because its
front matter and kickoff prompt differ between A' and A.
