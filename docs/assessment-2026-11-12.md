# Assessment 2026-11-12: a model note for Claude Fable 5.2

Stage F9. Written by `claude-fable-5-2` at effort `high` in the Claude Code desktop app, on the
operator's request of 2026-11-12. The request: plan an update to the skill that applies only when
a session uses Claude Fable 5.2, and that gets the best work from that model for the least tokens.
This document is the plan. It changes no file of the skill. It follows ASD-STE100 writing rules
with Australian spelling, as the operator asked.

Measured before any change: `node scripts/check.mjs` reads 130 files with 0 findings. The price
table in force is `pricing/2026-11-10.json`, 2 days old. This session's baseline is 65,242 tokens
(`get_usage self`: 224,284 total less 159,042 Messages). All its cache writes are 1-hour writes.

## 1. The answer

Make effort an input with a price, for this model only.

1. Put all Fable 5.2 facts in one small file, `models/claude-fable-5-2.md` (a model note). The
   skill reads it only when a session, a piece or a coordinator runs on that model.
2. Add two sentences to `SKILL.md`. They tell a reader to look for a note. Every other model pays
   about 75 tokens for them (300 characters, an estimate).
3. The note starts every piece at `high`. It permits `xhigh` only after a measurement shows a gain.
   It gives the inputs T and O for each effort level from the ledger. It prices an effort change in
   a live session. It gives six rules for a brief that this model reads.
4. The formula and the calculator do not change. T and O are inputs already.

Why: on this model about half the cost of a stage comes from output tokens, and effort controls
output tokens. The skill selects effort from a table cell today. It cannot show what a higher
level costs. Three rules raise effort before any failure. The vendor says that this model gains
little above `high`.

Cost of the chain: about 32 USD and 2 to 2.5 hours (section 8). Effect: unmeasured on this
workload. My estimate is 5 to 13 USD less for each acceptance stage of the size of Stage F8
(section 7). One decision is the operator's: D17 (section 10).

## 2. Where the cost is on this model

Prices from the table in force, per million tokens: output 40, 1-hour cache write 16, cache read
0.20.

One output token is paid three times. The model produces it (40). The next turn writes it to the
cache (16). Each later turn reads it (0.20 for each turn).

```
cost of one output token with n turns left = 40 + 16 + 0.20 * n   USD per million
n = 30:  62 USD per million
one tool-result token, n = 30:  16 + 0.20 * 30 = 22
one output token on claude-sonnet-5-5, n = 30:  10 + 4 + 0.10 * 30 = 17
```

Stage F8 is the largest stage on this model in the ledger (`docs/dispatch/calibration.md`): 103
calls, 21.21 USD, effort `xhigh`.

| Part of Stage F8 | Tokens | USD | Source |
|---|---|---|---|
| Output | 163,873 (1,591 a call) | 6.55 | ledger row, times 40 |
| Cache writes | 463,155 | 7.41 | ledger row, times 16 |
| Cache reads | not in the row | 7.25 | the remainder of 21.21 |
| Output that the next turn wrote to the cache | 163,873 | 2.62 | a part of the 7.41 |

Output caused 6.55 + 2.62 = 9.17 USD directly, 43 percent of the stage. Later turns also read
those tokens: about 1.7 USD more (an estimate from the mean of 51 turns left). The total is about
half of the stage.

Three pieces ran on this model, all at `xhigh`: F7 (10.52 USD), F8 (21.21) and the coordinator of
the O6 chain (7.31). That is 39.04 USD. No piece of record ran at `high`, so the ledger cannot
compare the two levels.

## 3. What the vendor's pages say

Read on 2026-11-12 from `platform.claude.com/docs`: the Effort page, the Prompting Claude Fable
5.2 page, the page on cost and intelligence, and the Fable 5.2 release page. Each line below is
the vendor's statement or measurement, not mine.

1. Effort sets how much the model thinks, how many tool calls it makes, how long a turn takes and
   how many tokens it uses. The default is `high`.
2. Most of the capability gain is present at `high`. Above `high` the gains are uneven. `xhigh`
   raised scores slightly on the vendor's coding evaluations and used many more tokens. `max` is
   for measurement of the ceiling.
3. Cost for each solved task on a coding benchmark (463 problems): `high` 1.39 USD at 96.3 percent
   solved; `low` 0.39 USD at 94.6 percent. On a research benchmark, cost for each task: `low` 1.49,
   `medium` 2.16, `high` 4.82 USD, at scores of 54.5, 55.0 and 57.7 percent. On a defect search,
   `low` cost 37 percent less than `high` and scored 4.3 points lower.
4. The vendor publishes no cost figure for `xhigh` on this model. On Claude Opus 5.5 the same
   coding benchmark cost 0.29 USD a task at `high` and 0.74 at `xhigh`, for 1.4 points.
5. On the same coding benchmark Claude Opus 5.5 at `high` solved 95.5 percent for 0.30 USD.
   Fable 5.2 at `low` solved 94.6 percent for 0.39 USD.
6. At `high` and above the model thinks before almost every reply. An instruction to think less
   has no effect at `medium` and above.
7. At `low` and `medium` the model stops early more often. A paragraph that tells it to finish the
   task halved such stops and raised output tokens by about 30 percent.
8. A new top-level effort value starts the prompt cache again. A per-message effort change keeps
   the cache, on platforms that support it.
9. At `xhigh` and `max` the model started sub-agents to review its own work. Sub-agents can be a
   large part of the cost of a session.
10. A token budget that the prompt shows to the model changes how much it spends. Without a large
    budget the cost fell and the performance stayed.
11. Prompts written for earlier models are often too prescriptive. The model follows rules
    closely: a rule with "never" is absolute, and old cautions in notes hold back routine work.
12. A request that asks the model to write out its internal reasoning can be refused.

## 4. Five gaps in the skill for this model

1. **Effort has no price.** Step 3.1 gives effort as a table cell. The record cannot show the cost
   of one level against the next.
2. **Three rules raise effort before a failure.** Matrix row 4 sets `xhigh` when the author is the
   top class or the change is a release or a merge. The raise rule adds a step for an irreversible
   step, for security and for a merge. The protocol (section 2) says: raise on measured failure,
   never before. Item 2 of section 3 says the same for this model.
3. **T is too low on `xhigh` acceptance.** The calls were 2.45 times the projected T on F7 and
   1.72 times on F8. The measured cost was 1.39 and 1.23 times the projection.
4. **An effort change has no price.** Step 1.2 prices a model switch as one cache miss. It says
   nothing about an effort change (item 8 of section 3).
5. **The brief rules are for lower classes.** Step 3.2 rule 4 lists the content of a brief. It has
   no rule for a brief that this model reads (items 6, 10, 11 and 12 of section 3).

## 5. The design

### 5.1 A model note, read on demand

`models/<model id>.md` holds the facts for one model. `SKILL.md` gets two sentences (appendix B):
a line in the file list and item 6 of step 1.4. A reader looks for a note for the current model,
for the model of each piece and for the model of the coordinator. With no file, nothing changes.

This keeps three rules of the project. `SKILL.md` stays the one text of the procedure and holds no
vendor fact. The note has a source and a `fetched` date for its vendor facts, and the gate checks
its shape. A persistent text costs tokens on every load, so the Fable text loads only on Fable
sessions. A new model identifier has no note, so the note cannot apply to a later model by
accident.

The note is in appendix A: 3,495 characters, about 875 tokens. The gate limits a note to 5,000
characters.

### 5.2 The effort rule (note section 1)

1. Start at `high`.
2. Go above `high` only with a measurement on the same task type. Without one, stay at `high`.
   The raise rule and matrix row 4 stop at `high` on this model. D17 decides this sentence.
3. A piece with an oracle can run at `medium` or `low` first. The failures run again at `high`.

Rule 3 has a break-even. Let f be the failure rate at the low level:

```
cost(low first) = c_low + f * c_high      pays while  f < 1 - c_low / c_high
vendor ratios c_low / c_high: 0.28 (0.39 / 1.39), 0.31 (1.49 / 4.82), 0.63 (defect search)
break-even f: 0.72, 0.69, 0.37
```

### 5.3 Inputs by effort (note section 2)

The note gives O and a factor for T at each effort level, each with its sample size and its ledger
row. The reader puts them into the calculator as T and O. The record shows the cost at the level
chosen and at one level below it. The rows today:

| Effort and task | O per turn | T | n |
|---|---|---|---|
| `high`, any task | 1,500 (the default) | as planned | 0 |
| `high`, assessment or plan | 4,000 | as planned | 1 (this stage: 4,066) |
| `xhigh`, acceptance | 1,750 | 2 times the plan estimate | 2 (F7, F8) |
| `xhigh`, coordinator | 2,750 | To as counted | 1 |

One fact from these rows: this stage ran at `high` and produced more output a call than the two
`xhigh` acceptance stages. The task type moves O more than the level does in these rows. The rows
are estimates of the spread, not findings.

### 5.4 The price of an effort change (note rule 1.4)

Until a measurement says otherwise, an effort change in a live session is one cache miss:

```
miss = C * (p_cache_write - p_cache_read)          C 390,000: 390,000 * 15.8e-6 = 6.16 USD
saving per turn = dO * (p_output + p_cache_write)  dO 1,500:  1,500 * 56e-6    = 0.084 USD
turns to break even = 6.16 / 0.084 = 73            at C 100,000: 1.58 / 0.084 = 19
```

The coordinator of the O6 chain ran 30 calls at a context of about 390,000 tokens. A lower effort
for those calls would not have paid. So: set the effort when a session or sub-agent starts.

One probe measures the real behaviour of the app (section 8, step 1). If the app keeps the cache,
the note's field `effort_switch` becomes `kept` and the change is free.

Result of the probe (2026-11-12, after the operator's yes; transcript `e932f360`, 4 calls,
1.31 USD): the app kept the cache. The call before the change read 124,950 tokens from the cache
and wrote 267. The call after the change from `high` to `low` read 125,223 and wrote 263. So
`effort_switch` is `kept` for the Claude Code desktop app, with n = 1 and one direction. The note
now permits a lower effort for a coordinator in that app (note section 4). In another harness the
miss price above stays until someone measures it.

A second fact from the same transcript: the first call of the fresh session read 48,935 tokens
from the cache and wrote 41,117. Another session on the same model had the common prefix in the
cache. The formula prices all of B + R at the write price, so it reads high for such a start.
This is one observation. It moves nothing; it is in the ledger's notes.

### 5.5 Brief rules for this model (note section 3)

Six rules, each from an item of section 3: state the goal and leave the method open; no line that
says to think less; no budget as an instruction; exact approvals; ask for numbers, not for
reasoning; a model and an effort on every sub-agent.

### 5.6 The record, the gate, the installer, the evaluation

- `templates/decision-record.md`: one input row ("Model note") and four words in the effort line
  (appendix C).
- `scripts/check.mjs`: a `checkModels` function. It checks each note's front matter, its two
  required headings, its size, and that its model is in the table in force. Three tests seed
  faults.
- `scripts/install.mjs`: `models` joins `PAYLOAD_ITEMS`. A test checks it.
- `eval/`: scenario 25 is scenario 09 on `claude-fable-5-2`. A subject that applies the note
  states `high`. A subject that does not states `xhigh`. The other 24 scenarios name no
  `claude-fable-5-2` (`grep` gives 0 files), so their expected results do not change.
- `docs/operator-protocol.md` section 2: one clause on the effort default for Fable.
- `README.md`: a changelog line.

## 6. What I rule out

1. **Fable 5.2 at `low` in place of Opus 5.5 at `high`.** Item 5 of section 3: 0.39 USD against
   0.30 for each solved task, at 94.6 against 95.5 percent. No gain. The class matrix stays.
2. **A lower effort for a live coordinator, where the change is a cache miss.** Section 5.4: 73
   turns to break even against 30 measured. The probe shows that the desktop app keeps the
   cache, so the note permits the change there.
3. **An `--effort` flag in the calculator.** T and O are inputs now. A formula stage needs an Opus
   stage, a new worked example and a Fable acceptance, about 30 USD by the estimate in D16. The
   ledger has 2 rows. Add the flag when the rows show stable factors.
4. **An effort sweep with a Fable subject on all 24 scenarios.** The 24 Sonnet runs cost 11.29 USD
   measured. This model's output and write prices are 4 times Sonnet's, so one level costs about
   40 USD (an estimate). The sweep would measure the decision procedure, which a Sonnet subject
   runs at 24 of 24.
5. **A Sonnet sub-agent that makes the decision for a Fable session.** It saves about 0.5 USD for
   each decision (an estimate), under 2 percent of a chain.
6. **The cache lifetime.** The harness sets it. D16 decided no lifetime for each piece. I do not
   reopen it.

## 7. The effect, and what is unmeasured

No stage on this model ran at `high` and at `xhigh` on the same task. Each figure below is an
estimate.

| Quantity | Estimate | Basis |
|---|---|---|
| A stage like F8 at `high` in place of `xhigh` | 4.7 USD less (22 percent) | My guess: 20 percent less output a call and 15 percent fewer calls |
| The same, upper bound | about 13 USD less | The Opus 5.5 ratio of item 4, 0.29 / 0.74. Nothing shows that this model follows it |
| Projection error on `xhigh` acceptance | from 1.23 to 1.39 times, to about 1 | T times 2 (ledger, n = 2) |
| Text cost for other models | about 75 tokens in `SKILL.md` | 300 characters divided by 4 |
| Text cost on this model | about 875 tokens for each session that runs the skill | The note, characters divided by 4 |

The risk is quality. An acceptance at `high` can miss a defect that `xhigh` finds. The vendor's
evaluations show a slight gain above `high` on coding tasks. The paired check of section 8
measures this once, with a known answer.

## 8. Stages, priced

Prices: `node scripts/dispatch.mjs --json docs/dispatch/2026-11-12-fable-note.json --today 2026-11-12`,
formula 2026-11-11, 1-hour writes for sessions. The two sub-agent arms write 5-minute entries, so
their figures come from the same run with `--ttl 5m`.

| Step | Who | Class, effort | T | USD | Wall clock |
|---|---|---|---|---|---|
| 1. The probe: does an effort change start the cache again | this session, after the operator's yes | fable, high | about 8 calls | 2.2 for the probe session, about 2.4 for this session's calls (estimates) | 10 minutes |
| 2. Stage S7: the note, the two sentences, the template, the gate check and tests, the installer, scenario 25, the protocol clause, the changelog | a fresh session that this session starts | sonnet, high | 80 (60 to 100) | 4.91 (3.8 to 6.0), plus 0.12 for its handoff | 45 to 60 minutes |
| 3. Stage F10: acceptance of S7, the mini-evaluation, the release steps | a fresh session that the operator starts from S7's card | fable, xhigh (the rule in force) | 50 | 12.55 | 60 to 90 minutes |
| 3a. The paired check (option C of D17): two sub-agents of F10 | sub-agents | fable, `high` and `xhigh` | 30 each | 4.97 and 5.52 | inside step 3 |
| 3b. The mini-evaluation: 4 `claude -p` runs | Sonnet subjects | the CLI's default | n/a | 1.88 (4 times the measured mean of 0.47) | inside step 3 |

Total with the paired check: 2.2 + 2.4 + 4.91 + 0.12 + 12.55 + 4.97 + 5.52 + 1.88 = 34.55 USD.
Without it: 24.06 USD. The probe session then cost 1.31 USD measured, not 2.2, so the totals are
33.66 and 23.17 USD. Operator time: about 10 minutes for D17 and 15 minutes for F10's report.

S7 runs at `high` because it changes `SKILL.md` and the installed payload, which are public
interfaces (matrix row 2). F10 runs at `xhigh` because matrix row 4 is in force until the note is
accepted. Its T of 50 is a plan estimate of 25 times the factor 2 of section 5.3.

Who coordinates: nobody. This session starts S7 and ends. S7 writes the F10 handoff from this
section and proposes F10 as a card. F10 verifies S7. So To is 0.

### 8.1 Step 1, the probe

This session starts one small `claude-fable-5-2` session at `high`. It sends two short messages,
lowers the effort with the session tool, and sends one more. Then
`node scripts/session-cost.mjs <transcript>` shows the cache write of the call after the change.
A write near the whole context means a miss. A small write means the app kept the cache. The
result goes into the S7 handoff as the value of `effort_switch`.

Done on 2026-11-12: `kept`. Section 5.4 has the figures.

### 8.2 Stage F10, the fixed design

Fixed on 2026-11-12, before any run.

**The paired check.** F10 makes a copy of the accepted tree and seeds six faults that the gate
does not find: two in arithmetic, two where a text contradicts a file, two in the payload or a
test. F10 starts two sub-agents on `claude-fable-5-2`, one at `high` and one at `xhigh`, with the
same brief: accept or reject S7's claims on that copy, each finding with its file and line. F10
counts the seeded faults that each arm finds and prices each arm's transcript.

- Threshold P1: the cap of note rule 1.2 stays for matrix row 4 if the `high` arm finds at least
  the `xhigh` arm's count less one. If not, F10 changes that sentence so that row 4 keeps `xhigh`,
  and says so in its report.
- P2: F10 adds each arm's calls, output a call, cache write a call and cost to the ledger and to
  the note's table (n = 1 for each level).

One pair cannot show equal quality. Six of six bounds a detection rate at 61 percent or more
(Wilson, 95 percent). The pair can show a large difference, and it gives the first cost ratio of
the two levels on one task.

**The mini-evaluation.** Sonnet subjects, calculator arm, the CLI runner.

- P3: scenario 25, two runs: the final verdict as expected and effort `high`, 2 of 2.
- P4: scenarios 09 and 02, one run each, with the note in the sandbox: each gives its expected
  verdict, model and effort, 2 of 2. These scenarios name `claude-fable-5-1`, so the note must not
  apply.
- If P3 or P4 fails, F10 rejects the wording that failed and gives the choice to the operator in
  five parts. F10 can run all 25 scenarios (about 11.8 USD) if it finds a reason.

**Then.** Fast-forward `main`, push (`approvals.push_origin`), `node scripts/install.mjs --harness all`
and `--check` at 0 files behind, ledger rows for S7, F10 and the arms, `docs/status.md`. No tag:
F10 asks the operator.

## 9. What this assessment cost

Measured by `node scripts/session-cost.mjs` on transcript `928b13c6`, table 2026-11-10, just
before the commit of this file: 23 calls, 11.03 USD. The session read 6,867,176 tokens from the
cache, wrote 369,827 (all 1-hour writes) and produced 93,513 output tokens, 4,066 a call. Later
turns are not counted. The reading was large: the persona, the protocol, four vendor pages and
the vendor's bundled migration notes. No projection existed for this stage. The F9 row in
`docs/dispatch/calibration.md` holds the same figures.

## 10. D17, the decision

```
D17
Decision:      On claude-fable-5-2, does the model note stop effort at high until a measurement shows a gain, and is the first measurement made now?
Options:       A cap at high now, no paired check / B no cap: the note gives the prices, the inputs, the switch rule and the brief rules, and matrix row 4 and the raise rule keep xhigh / C cap at high now, and Stage F10 runs one paired check at high and xhigh on six seeded faults, with threshold P1 fixed today
Pros and cons: A costs 24.06 USD and follows the protocol's rule and the vendor's page; no test shows what an acceptance at high misses, and the note's inputs at high stay at n = 0 until a later stage. B has the lowest quality risk and the smallest saving: the three xhigh pieces in the ledger cost 39.04 USD and the rule that put them there stays. C costs 10.49 USD more than A; it tests the cap once with a known answer and gives the first measured cost ratio of the two levels; one pair is weak evidence and the report must say so.
Blast radius:  A and C: every later acceptance and release stage on this model in every project that has the skill runs at high; a defect that only xhigh finds reaches the installed copies. One sentence in the note reverses it. B: none beyond the note. In all three, other models and past records are unchanged.
Recommended:   C, because the cap changes the effort of the project's own quality gate, and such a change needs one direct test. The 10.49 USD is less than the saving I estimate for two or three acceptance stages. S7's work is the same under A and C. Under B, one sentence of the note changes (appendix A says which).
```

## Appendix A: the note, `models/claude-fable-5-2.md`

S7 copies this text as it is. It holds the probe's result.

````markdown
---
model: claude-fable-5-2
fetched: 2026-11-12
sources:
  - https://platform.claude.com/docs/en/build-with-claude/effort.md
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2.md
  - https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence.md
effort_start: high
effort_switch: kept
---

# Model note: claude-fable-5-2

Apply this note when this session, a piece or the coordinator runs on `claude-fable-5-2`. It
changes the effort cell of step 3.1 and three inputs of step 1.2 for that model only. The rest of
`SKILL.md` stays in force. Write in the record that you applied it.

## 1. Effort

1. Start every piece on this model at `high`. The vendor's default is `high`, and most of the
   capability gain is present there.
2. Go above `high` only when a measurement on the same task type shows a gain. Name the
   measurement in the record. Without one, stay at `high` and write "xhigh not measured". The
   raise rule of step 3.1 and matrix row 4 stop at `high` on this model. Do not use `max` in a
   dispatched stage.
3. A piece with an oracle can run at `medium` or `low`. Its brief then says: finish the whole
   task, work through ordinary errors, and stop only for a deliberate blocker. Run the piece at
   the low level first and run the failures again at `high`. This pays while the failure rate is
   under 1 - cost_low / cost_high.
4. Set the effort when the session or sub-agent starts. `effort_switch` above is the result for
   the Claude Code desktop app: one change from `high` to `low` on 2026-11-12 kept the cache
   (n = 1). There an effort change costs nothing. In another harness, price the change as one
   cache miss (M + 1) until you measure it. The change then pays after
   C * (p_cache_write - p_cache_read) / (dO * (p_output + p_cache_write)) turns. dO is the output
   that the change saves in each turn.

## 2. Inputs for step 1.2

| Effort and task | O per turn | T | n | Source |
|---|---|---|---|---|
| `high`, any task | 1,500 (the default) | as planned | 0 | no row on this model |
| `high`, assessment or plan | 4,000 | as planned | 1 | ledger row F9: 4,066 output a call |
| `xhigh`, acceptance | 1,750 | 2 times the plan estimate | 2 | ledger rows F7 and F8: 1,909 and 1,591 output a call; calls 2.45 and 1.72 times T |
| `xhigh`, coordinator (Oo) | 2,750 | To as counted | 1 | ledger row F7, coordinator: 2,763 |

These rows are estimates of the spread, not findings. In Step B, give the cost at the level you
chose and at one level below it.

## 3. Briefs for a piece on this model

1. State the goal, the constraints, the oracle and the definition of done. Leave the method open.
2. Do not write "think less" or "answer directly". Lower the effort level.
3. Do not give a token budget or a turn budget as an instruction. Say that the projection is for
   the operator.
4. Name the exact action that an approval covers. Write "ask before X", not "never X", where an
   approved X must be possible.
5. Ask for inputs, formulas and numbers. Do not ask the model to write out its reasoning.
6. Give every sub-agent a model and an effort. A sub-agent with neither runs at this model's
   price. At `xhigh` the model can start reviewers of its own work: count them in T.

## 4. A coordinator on this model

A session on this model sometimes must stay as the coordinator: the chain has a piece of its
class, and a child session cannot start sessions. Price To at the Oo of section 2. Give the cost
of the other plan beside it: the operator starts each piece from a card (To 0). Where
`effort_switch` is `kept`, ask the operator to set the coordinator's effort to `medium` after the
last brief is written. Coordination has oracles (rule 1.3), and a session cannot change its own
effort. In another harness, lower it only when rule 1.4 pays.
````

Under option B of D17, the last two sentences of rule 1.2 become: "The raise rule of step 3.1 and
matrix row 4 stay in force on this model. Do not use `max` in a dispatched stage."

## Appendix B: the two sentences for `SKILL.md`

In the list "Files this skill uses", after the `scripts/dispatch.mjs` item:

```
- `models/<model id>.md`: a model note, where one exists. Step 1.4.6 says
  when to read it.
```

In step 1.4, a new item 6, before the paragraph "Never pick a model by name from memory":

```
6. Look for `models/<model id>.md` for the model you are on, for each
   piece's model and for the coordinator's model. Where the file exists,
   read it now and apply it: for that model only, it replaces the effort
   cell of step 3.1 and can restate inputs of step 1.2, and where it
   differs from this text it is in force. No file, no change. Name each
   note you applied in the record.
```

## Appendix C: the template and the protocol

`templates/decision-record.md`, a new row in the Inputs table after "Task type":

```
| Model note | `models/<model id>.md` applied, or "none" | Step 1.4.6 |
```

The effort line in Step B becomes:

```
Effort raised or lowered because: <rule from step 3.1, a model note's rule (name the note), or "no change">.
```

`docs/operator-protocol.md` section 2, the effort defaults: after "(`xhigh` only where `SKILL.md`
matrix row 4 says", add ", and on `claude-fable-5-2` only where its model note permits".
