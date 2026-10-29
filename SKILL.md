---
name: session-dispatch
description: Decide, with arithmetic, whether to continue the current session or hand off to a fresh one, and which model class, effort level and concurrency shape the coming work should run on. Use before starting a stage of more than ten turns, at any model or effort change, after a compaction, when context passes 60 percent of the window, or when asked to plan delegation to sub-agents or sessions. Records the decision, an adversarial check and the token cost of deciding in the handoff.
---

# Session dispatch

This skill is a procedure. Follow the steps in order, write the numbers
down as you go, and do not skip a step because the answer looks obvious.
It is written so that a model one or two classes below the frontier can
run it and reach the same verdict a frontier model would, because the
verdict comes from arithmetic on stated inputs, not from judgement.

Files this skill uses, relative to its own folder:

- `pricing/<date>.json`: the price table. The newest file by name is the
  one in force. Rules in step 1.4.
- `templates/decision-record.md`: the section you fill in and paste
  into the handoff.
- `templates/handoff.md`: the handoff shape, if the project has none.
- `examples/2026-10-29-sessiondispatch-stage-0b.md`: a filled record
  under the formula in force, with a class change and the split.
- `examples/2026-10-27-fork-graft-stage-26.md`: a filled record under
  the formula of 2026-10-27.
- `scripts/dispatch.mjs`, where the copy you run has `scripts/`: the
  calculator for steps 2 and 3.3. It multiplies; you still gather the
  inputs, apply the guardrails and argue the adversarial pass.

Prose rules for everything you write under this skill: Australian
English, no em-dashes, no AI-telltale vocabulary (the engineering
persona's section 14.1 lists it), numbers with their units and sources.

**Class floor (measured 2026-10-30).** This procedure is written for the Sonnet class and above. On the twenty-scenario evaluation in the SessionDispatch repository (`eval/results-2026-10-31.md`), a Sonnet-class subject reached the expected verdict in 40 of 40 runs with the calculator and 40 of 40 by hand. A Haiku-class subject reached it in 17 of 20 with the calculator and 19 of 20 by hand on the scorer's count; the two further calculator misses were records whose verdict was right and whose machine-readable result block (the evaluation's output contract) was malformed. On the rerun through the command-line harness (`eval/results-2026-11-01.md`, 21 scenarios, one run each, calculator arm), Sonnet reached the expected verdict in 21 of 21 and Haiku in 13 of 21 on the scorer's count: every one of Haiku's 20 written records was right on the verdict, model and effort, 7 of them broke the result block's field types, and one run wrote no record. In that harness the shell refused every Haiku attempt to run the calculator and three Haiku runs report their own session summarised mid-run, so the Haiku figure there is a hand figure taken partly under compaction (Stage F5's reading, `docs/assessment-2026-10-30-f5.md`). A Haiku-class model therefore follows the procedure but is not relied on for the machine-readable record: where one runs it, keep the calculator on and have a parser check the handoff's front matter and the record's figures before anything acts on them.

## 0. Should this skill run at all

Run it when any of these holds:

1. The coming stage is expected to take more than 10 turns.
2. The model class or the effort level is about to change.
3. The session has just been compacted, or the context is past 60
   percent of the window.
4. Work is about to be delegated to a sub-agent, a sub-session or
   another harness.
5. The operator asked for it.

Do not run it when the remaining work is under 10 turns and no other
trigger holds. Write one line in the handoff instead: "Session dispatch
not run: under 10 turns remain (estimate N), no other trigger." That
line is the whole record.

Budget for the decision: the record you write stays under 4,000 tokens
(about 16,000 characters), and the decision takes at most 10 minutes of
wall clock from the first line of step 1. Reading is not capped: the
skill, the table and the templates cost what they cost, and step 6
records that cost so the operator can judge the skill's size from it.
If you pass the cap, steps 4 and 6 still run and step 5 is cut. The
verdict is then step 2's draft where you have written it, else the
default (continue the current session, keep the current model and
effort), and you record the overrun. The reason: the default exists to
be the reversible choice, and a draft that says "fresh by class"
overridden to `continue` is not reversible in the sense that matters,
because the work then runs below its class.

## 1. Gather the inputs

Write each input with its source. "Measured" means the harness
reported it; "estimated" means you applied a rule of thumb below and
say so. Never present an estimate as a measurement.

### 1.1 The session

| Input | Symbol | How to get it |
|---|---|---|
| Context window size (tokens) | W | The harness's usage report or its documentation. Claude Code desktop: the session usage tool reports `contextWindow`. |
| Compaction point (tokens) | K | The harness's usage report (`autoCompactsAtPercent` times W in Claude Code desktop). If unknown, assume 0.9 W and say so. |
| Current context (tokens) | C0 | The usage line, status line or usage tool. If the harness shows none, estimate: 1 token per 4 characters of prose, 1 per 3.5 characters of code, summed over the system prompt, tools and every message and tool result still in context. |
| Compacted already | yes or no | Whether this session has been summarised at least once. After a compaction, the "why" behind earlier decisions is partly gone. |
| Unrecorded context | list | Facts, decisions and file knowledge this session holds that are in no file on disk. List them. Each one is either written into the handoff (costing output tokens now) or lost. |

### 1.2 The work ahead

| Input | Symbol | How to get it |
|---|---|---|
| Expected turns | T | From the plan or the handoff. One turn is one model call. A stage with 20 tool calls and a final message is about 21 turns. If unsure, give a range and compute with both ends. |
| Fresh input per turn (tokens) | F | New material entering context each turn: tool results, file reads, user messages. Default 3,000 if unmeasured. Read-heavy stages (assessment, audit): 5,000 to 8,000. |
| Output per turn (tokens) | O | Model output including reasoning. Default 1,500. Writing-heavy stages: 3,000, where writing-heavy means matrix row 3's writing (a specification, a brief, a design note) or a new module written from a blank file; row 2 work with a stated test, a refactor and a chore take the default. The defaults were measured at high effort; at xhigh or max, reasoning is longer and billed as output, so mark O as an estimate and test a larger value in step 5. |
| Re-read set (tokens) | R | What a fresh session must read before it can work: the handoff, the files it names, the project's instruction files. Sum their sizes in tokens (characters divided by 4). |
| Handoff size (tokens) | H | What you would write to hand off. Default 2,500 for a handoff under 120 lines; add the size of any unrecorded context you must write down. |
| Cache misses over the stage | M | Turns whose prompt is no longer in cache and is written again in full. Pauses longer than the cache lifetime cause them (operator review, a long tool run), and so does any change early in the prompt. Unmeasured so far: default 0, say so, and in step 5 count one miss per review pause you expect. |
| Rediscovery turns | L | Turns a fresh session would spend finding again the unrecorded context you choose not to write down. 0 when that list is empty. |
| Acceptance turns and re-read | Ta, Ra | For the split of step 2.1 only: the turns an acceptance session takes and what it reads (the brief, the diff, the files named). |
| Task type | one of the rows in step 3.1 | Decides the model class. If the stage mixes types, split it into pieces and dispatch each piece. |
| Design-heavy | yes or no | Yes when the stage involves choosing between designs, cross-module changes, evaluation design, or an assessment. Guardrail 2 depends on this. |
| Irreversible or outward-facing steps | list | Pushes, deletions, releases, messages, purchases, anything that leaves the machine. Guardrail 3 depends on this. |

### 1.3 Context growth

Context grows by G = F + O per turn until compaction: the fresh input
and the turn's own output both stay in context. Over T turns:

```
G         = F + O                            (growth per turn)
C_end     = C0 + T * G                       (where it would end without compaction)
crosses   = C_end > K                        (true means a compaction mid-stage)
C_cont    = C0 + (T * G) / 2                 (average context if you continue)
C_fresh   = B + R + (T * G) / 2              (average context in a fresh session)
```

Some harnesses drop earlier reasoning from the context; there growth is
nearer F plus the visible output. Without a measurement, keep G = F + O
and say so.

B is the fresh session's baseline: system prompt, tool definitions,
project instruction files and skills, before any work. Measure it
once per harness and project and record it; in Claude Code desktop it
is the usage tool's total minus its "Messages" category. If
unmeasured, use 25,000 and say so.

### 1.4 The price table

1. Open the newest `pricing/<date>.json` by filename.
2. Check its age: today minus `table_date`. If older than
   `max_age_days` (14), stop. Do not compute from it. Tell the operator
   the table is stale, name `node scripts/pricing-new.mjs` as the
   refresh step, and take the default (continue, same model, same
   effort) with the staleness recorded. The reason: a verdict from a
   stale price is a guess dressed as arithmetic.
3. Find the rows for the model you are on and the models you are
   considering. Each row carries `input`, `output`, `cache_read` and
   `cache_write` in USD per million tokens, and a `class` (haiku,
   sonnet, opus, fable, or null).
4. If any price you need is `null`, stop and offer the operator two
   choices, in one message: (a) give the figure now, or (b) authorise a
   live assessment: you fetch the vendor's pricing page named in the
   row's `source`, write a new `pricing/<today>.json` with the figure
   and the fetch date, run `node scripts/check.mjs`, and, if the
   operator also says so, commit it on a branch and open a pull request
   against the project's origin. Never fill a null from memory. Until
   the null is filled, compute what you can and mark the verdict as
   "incomplete: price of <model> unknown". Where the table cannot give
   you the target model (no row for the family, or no priced row in the
   class), write the target as null with that reason; guardrail 4
   forbids naming one from memory.
5. Where a table lists a long-context tier (a higher price when the
   whole prompt exceeds a threshold), use the higher price for every
   turn whose context exceeds the threshold, and only for those. An
   average context cannot do this: price turn by turn, with turn t
   reading C_start + (t - 1/2) * G. The calculator does; by hand, split
   the stage at the turn where the context passes the threshold.

Never pick a model by name from memory. Pick a class from step 3, then
the model the table lists for that class in the family the harness
runs.

## 2. Step A: continue or hand off

Do step 3.1 first: it names the class the work needs (the target).
Then price each side at the model that would run it:

- `continue` at the model this session runs on. A session never
  changes its own class (guardrail 8), so continuing means the current
  model does the work.
- `fresh` at the target class's model from the table. The handoff H is
  written by this session, so it is priced at the current model's
  output rate.

If the target class is above the current one, continuing would run the
work below its class: the verdict is fresh, by class. Compute both
sides anyway; the record shows the money. Under 10 turns, fresh by
class means a sub-agent of the target class with the brief in the
message, not a fresh session (guardrail 1).

**Run the calculator where you have it.** With the inputs of step 1 in
a JSON file (keys as the symbols; `--help` lists them) or as flags:

```
node scripts/dispatch.mjs --json inputs.json
node scripts/dispatch.mjs --current <model id> --target <class> --W .. --K .. --C0 .. --T .. --F .. --O .. --B .. --R .. --H .. --compacted no
```

It reads the table in force, refuses a stale table or a null price as
step 1.4 says (exit 2 and 3), and prints the block below filled in,
with T*, the split and the cost per piece. Paste its block into the
record. Without it, compute by hand:

```
G             = F + O
cost_continue = T * C_cont * p_cache_read          (cache reads)
              + T * G      * p_cache_write         (new context written to cache)
              + T * O      * p_output              (output, reasoning included)
              + M * C_cont * (p_cache_write - p_cache_read)   (cache misses)
              + penalty_compaction
              all at the current model's prices

cost_fresh    = H * p_output[current]              (writing the handoff, in this session)
              + (B + R) * p_cache_write            (the fresh session's first read)
              + T * C_fresh * p_cache_read
              + T * G       * p_cache_write
              + T * O       * p_output
              + M * C_fresh * (p_cache_write - p_cache_read)
              + penalty_loss
              at the target model's prices, except H
```

Prices are per token here (the table's figure divided by one million).

Every token that grows the context is written to cache once, the turn
after it appears, so the write term is T * G: the output is written as
well as the fresh input.

Cache misses: a miss writes the whole context again at the cache-write
rate instead of reading it at the cache-read rate. It costs more on the
larger context, so a stage with review pauses favours fresh more than
the other terms show. M is the number of misses over the stage, the
same on both sides, default 0 until measured.

`penalty_compaction`: if `crosses` is true, the session will be
summarised mid-stage. Price it as one more full re-read of the working
set after the compaction, `R * p_cache_write`, plus the output needed to
re-establish state, `H * p_output`, at the current model's prices. If
the stage is design-heavy, guardrail 2 applies and the arithmetic is
moot: the verdict is "fresh".

`penalty_loss`: the unrecorded context you choose not to write into the
handoff. Price it as L turns at the fresh session's average:
`L * (C_fresh * p_cache_read + G * p_cache_write + O * p_output)`. If you
cannot name the items, L is 0 and you say that the list is empty.

The fresh side omits two small terms: the handoff turn's own context read at the current model, and the turns the fresh session spends reading R in. Measured on three records (acceptance of Stage O1, finding F1-1) they are 2 to 11 percent of the smaller side. A `fresh` verdict by cost whose margin is inside that range is fragile: write it so in step 5 and keep it.

**Short path: the break-even.** When the model does not change, there is
no long-context tier in play, `crosses` is false, the session has not
compacted and L is 0, the growth terms cancel (C_cont - C_fresh = C0 -
B - R) and fresh pays off on cost only after

```
T* = (H * p_output + (B + R) * p_cache_write) / ((C0 - B - R) * p_cache_read)
```

turns. With misses, replace p_cache_read in the divisor by p_cache_read
+ (M / T) * (p_cache_write - p_cache_read). If C0 is not above B + R,
fresh never pays off on cost. If T is under T*, write "Draft verdict:
continue, by break-even, T <n> under T* <n>" and go to step 3; Step A
is settled in one line. Otherwise compute both sides in full.

Verdict rule:

1. If the target class is above the current one, fresh wins, by class.
2. If one cost is lower by more than 10 percent of the smaller, that
   side wins on cost.
3. If the costs are within 10 percent, the quality terms decide: a
   session that has compacted once, or will cross K, loses; otherwise
   continue, because a handoff is work and a fresh session starts
   colder.
4. Write the verdict as: "Draft verdict: <continue | fresh>, by <class |
   cost | quality | break-even>, margin <amount and percent of the
   smaller>."

Records dated before 2026-10-29 used the formula of 2026-10-27: growth
F, no miss term, and every fresh-side price, H included, at the target
model. `node scripts/dispatch.mjs --formula 2026-10-27` reproduces them.

### 2.1 The split comparison

When the target class is Opus or Fable, price a third plan beside
`fresh`: this session writes a brief, a fresh Sonnet-class session runs
the stage, and a fresh Opus-class session accepts it (one class above
the author, matrix row 4).

```
cost_split = H * p_output[current]                     (the brief)
           + the fresh side's terms at the sonnet model, without H
           + (B + Ra) * p_cache_write + Ta turns from B + Ra at the opus model
```

The acceptance session is priced without cache misses: M applies to the
run, not to the Ta turns. If the run includes an irreversible or
outward-facing step, the brief carries guardrail 3's approval line.

The split is an option only when the brief can carry a contract, the
oracle and an observable definition of done, so that the run becomes
matrix row 1 or 2 work (the persona's section 3.5). If it cannot, the
split is a figure in the record that shows what a sharper brief would
save, not a plan. When it is an option and is cheaper than fresh by
more than 10 percent, it is the plan for step 3, with three pieces.

Time: a handoff costs about 10 minutes to write and commit and about 5
minutes for the new session to read. Add this to the fresh side's
time projection. If the operator has to click to start the new session,
say so.

## 3. Step B: model, effort and concurrency

### 3.1 The matrix

Classes map by capability tier across providers, not by name. The price
table's `class` field says which tier each model is. If a family has no
model in the needed class, use the next class up, never down.

| Task type | Class | Effort | Why |
|---|---|---|---|
| Mechanical, fully specified text or script chores: apply a reviewed diff, rename, format, fixture cleanup, doc drift, run a checklist with the harness as oracle | Haiku | medium | The spec is the intelligence; the model executes. Where the table gives the haiku model a long-context tier and B is near its threshold (Claude Code desktop, with its tools loaded), nearly every turn pays the tier: price the stage at the tier, which narrows Haiku's advantage over Sonnet, and say so. |
| Scoped module work with a stated test: one feature inside one module, a test suite, a refactor within a module, first-pass review | Sonnet | medium; high when the module touches auth, payments, storage formats or a public interface | The workhorse tier; the test is the oracle. |
| Cross-module merges, evaluation design, specification of ambiguous work, diagnosis of intermittent failures, writing briefs a lower class executes | Opus | high | Long-horizon coherence and self-critique are the job. |
| Adversarial acceptance of another agent's work | one class above the author; Fable when the author is Opus; the top class when the author is the top class | high; xhigh when the author is the top class (the acceptor shares the class, so effort is the only lever left) or when the accepted change is a release or a merge | A reviewer at the author's class shares the author's blind spots. This row is the one effort rule for acceptance; guardrail 6 points here. |
| Whole-project assessments, roadmaps, cost models, the tiering decision itself | Fable (the top class available) | high | Mistakes here are copied into every later stage. |

Raise effort one step when any of these holds: the stage contains an
irreversible or outward-facing step; the change touches security,
credentials or money; the stage is a merge or a release; the previous
attempt at this stage failed on reasoning rather than on a typo.

Lower effort one step when all of these hold: the work is repeatable;
a test or a check script covers it; a failure is cheap to detect and
to redo. Never lower below medium for anything that writes to a
repository.

Never raise the class because the budget allows it. Raise it on a
measured failure or an escalation trigger (the persona's section 3.3).

### 3.2 Concurrency

1. Steps that share none of a gate, a file set or a branch may run at
   the same time, as parallel sub-agents in this session or as
   separate sessions.
2. Steps that share any of those run in series, in the order the
   dependency dictates. Two writers never touch the same files.
3. Every delegated piece names its oracle: the test command, the check
   script, or the observable artefact that proves it done. No oracle,
   no delegation; write the oracle first.
4. A delegated brief is self-contained: the goal, the decisions already
   made, the files that matter with spans, the oracle, the definition
   of done, the prose rules, and what to do when blocked (the five-line
   escalation of the persona's section 3.4). The receiving model reads
   nothing else, so if the brief would mostly retell this session, the
   work is not ready to delegate.
5. Time to results is the longest serial chain, not the sum. State the
   chain.
6. Sub-agents in the same session are started by this session with
   their model and effort set; a fresh session needs the operator to
   pick the model, so the handoff states the model id and the effort
   on its first lines.

### 3.3 Write the plan

For each piece: name, class and model id from the table, effort,
oracle, serial or parallel, and its cost as a fresh session by the step
2 formula (first read of B + R, then T turns) with that piece's T, F, O
and R. A sub-agent's B is its own baseline, usually smaller than a
session's; state it. The calculator prices pieces given as `pieces` in
its JSON input. Sum the pieces for the stage cost. Add the
time projection: the serial chain's wall clock plus the operator's
review time, stated separately.

## 4. Guardrails

These are hard stops. A verdict that breaks one is wrong whatever the
arithmetic says.

1. Never hand off to a fresh session for work under 10 turns at the
   same class. Writing and reading the handoff costs more than the
   work. Work under 10 turns that needs a higher class (step 2, rule 1)
   goes to a sub-agent of that class with the brief in the message, not
   to a fresh session: running work below its class is the error the
   matrix exists to prevent, and the sub-agent avoids it at no cost.
2. Never continue a design-heavy stage across a compaction. If the
   stage is design-heavy and `crosses` is true, or the session has
   compacted already, the verdict is "fresh".
3. Never give an irreversible or outward-facing step (push, delete,
   release, purchase, message, anything that leaves the machine) to a
   class below Opus without a human approval step written into the
   brief, and never to any class without naming the approval step.
4. Never pick a model by name from memory. The class comes from step
   3.1 and the model from the price table in force.
5. Never compute from a price table older than `max_age_days`, and
   never fill a null price from memory (step 1.4).
6. Acceptance runs at the class and effort of matrix row 4 (step 3.1),
   in a fresh session.
7. The record is capped at 4,000 tokens and the decision at 10 minutes
   (step 0); reading is measured in step 6, never capped. Past the cap,
   steps 4 and 6 still run, step 5 is cut, and the verdict is step 2's
   draft where it was written, else the default. Record the overrun.
8. A model never changes its own class or effort mid-session and never
   assesses its own class. The harness states it; a session that finds
   its model or effort differs from the handoff's front matter stops
   and names the value to pick.

Order, when two guardrails give different answers: guardrails 5 and 8
(nothing to compute from, the wrong class) come first, then 2, 3 and 6
(quality, approval, acceptance), then 1 and 7 (the cost of handing off
and of deciding). A cost rule never overrides a quality rule. So a
design-heavy stage under 10 turns in a compacted session goes fresh
(guardrail 2 over 1): the loss after a compaction is the "why", which no
number of turns recovers.

## 5. Step D: the adversarial pass

After the draft verdict and the draft plan, argue the other side in
writing, in the record, under the heading "Adversarial pass". The pass
has four parts and takes no more than a third of the decision budget.

1. **The opposite verdict, argued.** Two to five sentences making the
   best case for the choice you did not make.
2. **Each input, the way it could be wrong.** One line per input from
   step 1: context estimate (measured or guessed; what if it is 30
   percent off), turn count (what if it doubles), task type (is the
   stage really mechanical, or does it hide a design choice), prices
   (table age, long-context tier applied or not), the re-read set
   (what did you leave out), cache misses (how many review pauses the
   stage will have), the loss list (what else is unrecorded).
3. **Recompute with the adverse values.** Flip the input that moves the
   result most and recompute step 2. State whether the verdict holds.
4. **Change the verdict only on arithmetic from a value someone claims
   is true.** The adverse recompute changes the verdict only when the
   adverse value is inside the range the input was stated with (step
   1.2 asks for T as a range when unsure) or is a measurement the draft
   ignored, and the recomputation crosses the 10 percent line or a
   guardrail; then change it and say which input did it. A doubled T or
   a C0 30 percent off is a stress test: a verdict that flips under it
   (in practice a band verdict) is recorded as "fragile: flips at T of
   n or more" (or the input and value that flip it) and kept.
   Preference, confidence or tidiness never change the verdict, and
   neither does an input nobody claims is true. Both passes stay in the
   record.

## 6. Step E: record the decision and its cost

Fill `templates/decision-record.md` and paste it into the handoff
under the heading "Session dispatch decision". Where the project has
no handoff convention, write the record on its own to
`docs/dispatch/YYYY-MM-DD-<slug>.md`.

The cost of deciding is a six-row table in the record. Where the
harness reports the decision's usage (a usage tool, a sub-agent's token
total, a CLI's cost line), each row carries the measured figure and
names its source; a figure you estimated yourself is marked
"self-estimate".

| Row | How to fill it |
|---|---|
| Context at start | The usage figure when you began step 1. Source: usage tool, status line, or self-estimate. |
| Context at end | The usage figure after step 5. |
| Input tokens read | Everything you read for the decision: table, templates, files sized for R. Usually the difference of the two rows above, less your output. |
| Output tokens | What you wrote: the record, the adversarial pass, the handoff lines. From the harness's usage reporting where it has one; else characters divided by 4, marked as a self-estimate. The record's own size (characters divided by 4) is the figure guardrail 7 caps. |
| Wall clock | Minutes from the first line of step 1 to the end of the record, from timestamps where the harness gives them. |
| Priced | Input at the cache-write rate plus output at the output rate for the model that decided, from the table in force, with the table date. |

The operator reads this row over time to judge whether the procedure
pays for itself. A decision that costs more than the stage it dispatches
is a signal to skip the skill for stages of that size; say so when you
see it.

## 7. Where the numbers come from, per harness

Verified entries are marked; the rest name the documented place and
are to be checked on first use in that harness and corrected here.

| Harness | Context and usage | Compaction point | Delegation |
|---|---|---|---|
| Claude Code (desktop app) | Session usage tool: `tokensUsed`, `contextWindow`, `autoCompactsAtPercent`, categories (verified 2026-10-27) | From the same tool | `Agent` tool with `model` and `effort`; fresh sessions by the app's session tools, model chosen by the operator |
| Claude Code (CLI) | `/context` and the status line | Auto-compact announced in the transcript | `Agent` tool; new terminal session |
| Codex | `/status` shows context used | Documented auto-compaction near the window limit; check `/status` | Sub-agents where the build offers them; otherwise a new thread with the handoff |
| OpenCode | Token count in the session header | Documented compaction on overflow; check the session header | Sub-agents by `@` mention or a new session |
| Cline | The context window bar in the task header | Cline truncates by its own rule; treat the bar at 80 percent as K | New task with the handoff |
| Gemini CLI and Antigravity | `/stats` | Documented compression near the limit | New session with the handoff |
| Z-Code, Kimi Code, DeepSeek harness | Their status line, else estimate from characters | Unknown: assume 0.9 W and say so | New session with the handoff |

When a harness reports nothing, estimate C0 from characters (step 1.1)
and mark every figure that depends on it as an estimate.
