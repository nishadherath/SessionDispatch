# Subject prompt

The prompt each subject receives, once per run. The runner reads the text
inside the fence below, replaces the four placeholders and passes the result
as the whole prompt: nothing else from this repository reaches the subject
except the skill folder it names.

| Placeholder | Filled with |
|---|---|
| `{{SKILL_DIR}}` | The run's sandbox copy of the skill: `SKILL.md`, `templates/`, `examples/`, `pricing/` holding only the run's table, and `scripts/` (only `dispatch.mjs` and `dispatch-core.mjs`) in the calculator arm |
| `{{RECORD_PATH}}` | `record.md` in the run's sandbox, outside the skill folder |
| `{{TODAY}}` | The run day, `YYYY-MM-DD`, local calendar |
| `{{BRIEF}}` | The scenario's `brief` lines joined by a blank line, with `{{TODAY}}` filled |

Changing this text changes what every run measures: rerun the whole set
after any edit and record the edit in the results file's header.

Edited 2026-10-30 (Stage O3): `target` may be null where the table cannot
give one, and `final.model` for a `not-run` is the session's own model.
Runs before this edit (H1) used the earlier text.

````text
You are the subject in an evaluation of the session-dispatch skill. Its folder is {{SKILL_DIR}}. Read {{SKILL_DIR}}/SKILL.md and follow it as written, using only the files in that folder. Do not open any other folder.

The situation below is another agent session at a stage boundary. Decide for that session. Its harness, model, effort and figures are the ones the situation states, not your own. Where the situation gives no figure, apply the skill's rules and defaults and say which. Start at the skill's step 0. Today is {{TODAY}}.

<situation>
{{BRIEF}}
</situation>

Write what the skill asks you to record (the filled decision record, or the single line of step 0 when the skill does not run) to the file {{RECORD_PATH}}. Nobody will answer questions during this run: where the skill says to ask the operator or to stop, write in the record what you would ask and the verdict the skill says to take meanwhile, then finish.

End the file with one fenced block whose opening line is ```json dispatch-result and which holds one JSON object with exactly these keys:

- "skill_ran": false only when the record is the step 0 line.
- "inputs": the step 1 inputs you used, or null if you used none: "current" and "target" (model ids; "target" is null when the price table cannot give you one), "W", "K", "C0", "T", "F", "O", "B", "R", "H", "M", "L" (numbers), "compacted" (true or false), "Ta" and "Ra" (numbers, or null), "G" (the growth per turn you used if it is not F + O, else null).
- "table_age_days": the price table's age in days as you found it, or null.
- "totals": "cost_continue", "cost_fresh" and "cost_split" as strings in USD exactly as the record writes them (for example "20.01"), and "t_star" as a string of turns or "never"; null for each figure you did not compute, or null for the whole object.
- "draft": "side" ("continue", "fresh" or "incomplete") and "by" ("class", "cost", "quality", "break-even" or null), or null if the record has no draft verdict.
- "guardrails_triggered": the numbers of the step 4 guardrails that changed your verdict, model or effort, or required a line in the plan. Leave out guardrails you checked that did not bind.
- "final": "outcome" ("continue", "fresh", "split", "not-run", "incomplete" or "stop"); "model", the model id that runs the next piece of work (for a split, the run piece; for a not-run, the session's own model; for a stop, the model the session should be on), or null; "effort" for it, or null; "approval_step", the human approval step the plan names, or null.
- "cost_of_deciding": "input_tokens", "output_tokens" and "minutes" as numbers and "usd" as a string, from the record's cost-of-deciding table, or null if it has none.

When the file is written, reply with the one word: done.
````
