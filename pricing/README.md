# Price tables

One JSON file per refresh, named `YYYY-MM-DD.json`. The newest file by
name is the table in force. The skill reads it in step 1.4 and refuses
to compute from a table older than its `max_age_days` (14) or from any
`null` figure.

## Refresh

```bash
node scripts/pricing-new.mjs
```

That copies the newest table to today's date and lists every null. Fill
the figures from each family's `source` page, set that family's
`fetched` to the day you read the page, place each model in a `class`,
then run `node scripts/check.mjs`. Commit the new file; never edit an
old one, because handoffs cite tables by date.

When a model meets a null mid-decision, it offers the operator the
choice of supplying the figure or authorising a live read of the source
page. With a further yes it commits the new table on a branch
`pricing/<date>` and opens a pull request against this repository's
origin through the REST API with the stored credential (there is no
`gh` CLI on the operator's machine).

## Schema

| Field | Meaning |
|---|---|
| `table_date` | Must equal the filename's date. Not in the future. |
| `max_age_days` | Age past which the skill refuses the table. |
| `families.<name>.source` | The vendor page the figures came from. |
| `families.<name>.fetched` | The date the page was read, or null. |
| `families.<name>.models.<id>.class` | `haiku`, `sonnet`, `opus`, `fable` or null. The skill's tiers; providers' names do not matter. |
| `input`, `output`, `cache_read`, `cache_write` | USD per million tokens, or null. |
| `long_context` | Optional. `threshold_tokens` and the four prices that apply once a request's prompt exceeds it. |

## Provenance of the first table

`2026-10-18.json` carries the Anthropic figures the operator verified
against the live pricing page on 2026-10-18 for the fork_graft
protocol. Every other family is null until the operator fills it; the
model ids listed for OpenAI and Kimi are the ones the operator's own
Codex and OpenCode configurations named on 2026-10-27.
