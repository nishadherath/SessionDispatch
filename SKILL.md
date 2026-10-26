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
- `examples/2026-10-27-fork-graft-stage-26.md`: a filled record.

Prose rules for everything you write under this skill: Australian
English, no em-dashes, no AI-telltale vocabulary (the engineering
persona's section 14.1 lists it), numbers with their units and sources.

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

Budget for the decision: at most 8,000 tokens of reading and writing
and at most 10 minutes of wall clock, measured in step 5. If you reach
the budget before step 4 is complete, stop, take the default (continue
the current session, keep the current model and effort), and record
the overrun. The default is the reversible choice.

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
| Output per turn (tokens) | O | Model output including reasoning. Default 1,500. Writing-heavy stages: 3,000. |
| Re-read set (tokens) | R | What a fresh session must read before it can work: the handoff, the files it names, the project's instruction files. Sum their sizes in tokens (characters divided by 4). |
| Handoff size (tokens) | H | What you would write to hand off. Default 2,500 for a handoff under 120 lines; add the size of any unrecorded context you must write down. |
| Task type | one of the rows in step 3.1 | Decides the model class. If the stage mixes types, split it into pieces and dispatch each piece. |
| Design-heavy | yes or no | Yes when the stage involves choosing between designs, cross-module changes, evaluation design, or an assessment. Guardrail 2 depends on this. |
| Irreversible or outward-facing steps | list | Pushes, deletions, releases, messages, purchases, anything that leaves the machine. Guardrail 3 depends on this. |

### 1.3 Context growth

Context grows by about F per turn until compaction. Over T turns:

```
C_end     = C0 + T * F                       (where it would end without compaction)
crosses   = C_end > K                        (true means a compaction mid-stage)
C_cont    = C0 + (T * F) / 2                 (average context if you continue)
C_fresh   = B + R + (T * F) / 2              (average context in a fresh session)
```

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
   "incomplete: price of <model> unknown".
5. Where a table lists a long-context tier (a higher price when the
   whole prompt exceeds a threshold), use the higher price for every
   turn whose context exceeds the threshold.

Never pick a model by name from memory. Pick a class from step 3, then
the model the table lists for that class in the family the harness
runs.

## 2. Step A: continue or hand off

Compute both costs with the prices for the class the work needs (step
3 decides the class; do step 3.1 first if the class might change,
then return here).

```
cost_continue = T * C_cont * p_cache_read
              + T * F      * p_cache_write
              + T * O      * p_output
              + penalty_compaction

cost_fresh    = H * p_output                      (writing the handoff, in this session)
              + (B + R) * p_cache_write           (the fresh session's first read)
              + T * C_fresh * p_cache_read
              + T * F       * p_cache_write
              + T * O       * p_output
              + penalty_loss
```

Prices are per token here (the table's figure divided by one million).

`penalty_compaction`: if `crosses` is true, the session will be
summarised mid-stage. Price it as one more full re-read of the working
set after the compaction, `R * p_cache_write`, plus the output needed to
re-establish state, `H * p_output`. If the stage is design-heavy,
guardrail 2 applies and the arithmetic is moot: the verdict is "fresh".

`penalty_loss`: the unrecorded context you choose not to write into the
handoff. Price each item as the turns needed to rediscover it times
`(C_fresh * p_cache_read + F * p_cache_write + O * p_output)`. If you
cannot name the items, the penalty is zero and you say that the list is
empty.

Verdict rule:

1. If one cost is lower by more than 10 percent of the smaller, that
   side wins on cost.
2. If the costs are within 10 percent, the quality terms decide: a
   session that has compacted once, or will cross K, loses; otherwise
   continue, because a handoff is work and a fresh session starts
   colder.
3. Write the verdict as: "Draft verdict: <continue | fresh>, by <cost |
   quality>, margin <amount and percent>."

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
| Mechanical, fully specified text or script chores: apply a reviewed diff, rename, format, fixture cleanup, doc drift, run a checklist with the harness as oracle | Haiku | medium | The spec is the intelligence; the model executes. |
| Scoped module work with a stated test: one feature inside one module, a test suite, a refactor within a module, first-pass review | Sonnet | medium; high when the module touches auth, payments, storage formats or a public interface | The workhorse tier; the test is the oracle. |
| Cross-module merges, evaluation design, specification of ambiguous work, diagnosis of intermittent failures, writing briefs a lower class executes | Opus | high | Long-horizon coherence and self-critique are the job. |
| Adversarial acceptance of another agent's work | one class above the author; Fable when the author is Opus | high; xhigh for acceptance of a release or a merge | A reviewer at the author's class shares the author's blind spots. |
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
oracle, serial or parallel, and its cost by the step 2 formula with
that piece's T, F and O. Sum the pieces for the stage cost. Add the
time projection: the serial chain's wall clock plus the operator's
review time, stated separately.

## 4. Guardrails

These are hard stops. A verdict that breaks one is wrong whatever the
arithmetic says.

1. Never hand off to a fresh session for work under 10 turns. Writing
   and reading the handoff costs more than the work.
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
6. Acceptance runs one class above the author. When the author is the
   top class, acceptance runs at the top class in a fresh session with
   `xhigh` effort.
7. The decision itself is capped at 8,000 tokens and 10 minutes. Past
   the cap, take the default and record the overrun.
8. A model never changes its own class or effort mid-session and never
   assesses its own class. The harness states it; a session that finds
   its model or effort differs from the handoff's front matter stops
   and names the value to pick.

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
   (what did you leave out), the loss list (what else is unrecorded).
3. **Recompute with the adverse values.** Flip the input that moves the
   result most and recompute step 2. State whether the verdict holds.
4. **Change the verdict only on arithmetic.** If the recomputation
   crosses the 10 percent line or a guardrail, change the verdict and
   say which input did it. Preference, confidence or tidiness never
   change it. Both passes stay in the record.

## 6. Step E: record the decision and its cost

Fill `templates/decision-record.md` and paste it into the handoff
under the heading "Session dispatch decision". Where the project has
no handoff convention, write the record on its own to
`docs/dispatch/YYYY-MM-DD-<slug>.md`.

The cost of deciding is a six-row table in the record:

| Row | How to fill it |
|---|---|
| Context at start | The usage figure when you began step 1. Source: usage tool, status line, or estimate. |
| Context at end | The usage figure after step 5. |
| Input tokens read | Everything you read for the decision: table, templates, files sized for R. Usually the difference of the two rows above, less your output. |
| Output tokens | What you wrote: the record, the adversarial pass, the handoff lines. From the harness's usage reporting where it has one; else characters divided by 4, marked as an estimate. |
| Wall clock | Minutes from the first line of step 1 to the end of the record. |
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
