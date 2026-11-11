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
