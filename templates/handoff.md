---
stage: "<short stage name>"
model: claude-sonnet-5-5        # exact model id the stage should run on
effort: medium                  # low | medium | high | xhigh | max
status: ready                   # ready | in-progress | done | blocked
created: YYYY-MM-DD
from: "<session or stage that wrote this>"
---

# <stage name>

## Goal
One paragraph. What done looks like, observably.

## Decisions already made
Bullets. Each with the one-line reason. Do not reopen these.

## Files and links that matter
Bullets with paths and, where useful, line spans.

## Verified facts
Bullets. Each with the command that verified it and the date.

## Work completed
Bullets. Commits by hash.

## Unresolved questions
Bullets. Each with who can answer it (operator, maintainer, a later stage).

## Exact next action
The first command or edit the new session performs. One item.

## Cost projection
Model, assumed turns and context, the arithmetic, the number. API list price.

## Time projection
Wall clock for the stage, and the operator review time separately.

## Session dispatch decision
Paste the filled `templates/decision-record.md` here, or the one-line
"not run" record from the skill's step 0.
