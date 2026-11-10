# Calibration ledger

One row per piece and per coordinator, appended when a stage closes: the figures the record
projected beside the figures the transcript measured. It is the only place a default in
`SKILL.md` step 1.2 can be moved from, and then only in a formula stage with its own worked
example (`AGENTS.md` rule 8). Nothing here moves a default.

Measure a row with `node scripts/session-cost.mjs <transcript or session id> --table pricing/<date>.json`
(sub-agent transcripts are priced and listed apart). Name the table the stage was projected
with: a session on a model the newest table no longer lists needs the older one.

| Stage | Piece | Class | Effort | T projected | Calls measured | Cache write per call | Output per call | Projected USD | Measured USD | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Tsunami 2026-11-02 | A content | opus | high | 50 | n/a | n/a | n/a | 8.60 | 4.27 | Tsunami D-112 item 4; projected by `docs/dispatch/2026-11-10-example-tsunami.json` |
| Tsunami 2026-11-02 | B build | sonnet | high | 100 | n/a | n/a | n/a | 9.85 | 4.89 | the same |
| Tsunami 2026-11-02 | C content acceptance | fable | high | 30 | n/a | n/a | n/a | 9.08 | 6.53 | the same |
| Tsunami 2026-11-02 | D page acceptance | opus | high | 40 | n/a | n/a | n/a | 5.83 | 9.80 | the same |
| Tsunami 2026-11-02 | coordinator | fable | high | 25 by hand (handoff 38); 120 under formula 2026-11-10 (To 30 x 4) | 166 | 6,446 | 2,825 | 5.30 by hand; 42.35 under formula 2026-11-10 | about 56 | Tsunami D-112 item 4: 52.42 measured at 14:06 plus about 4 for the rest of the turn; per-call figures from `SKILL.md` step 1.2 (Fo, Oo) |
| SessionDispatch O1 2026-10-29 | formula, calculator, example | opus | high | 60 | 49 | 4,856 (4,177 after the first call) | 2,088 | 8.43 (quote 7 to 12) | 5.34 | session 4a645017, table 2026-10-29 |
| SessionDispatch F1 2026-10-29 | adversarial acceptance of O1 | fable | xhigh | 15 | 24 | 11,282 (10,061 after the first call) | 4,263 | 5.89 (quote 5 to 15) | 9.97 | session 99f38ac8, table 2026-10-29 |
| SessionDispatch O5 2026-11-10 | coordinator term, formula, example, two scenarios | opus | high | 60 to 90 | 101 | 3,596 (3,220 after the first call) | 1,371 | 10.06 to 16.34 | 10.71 | session 69a179e5, table 2026-11-10, priced by F7 after the session's last turn (S6 priced it at 20:04 local, before them: 96 calls, 10.25) |
| SessionDispatch S6 2026-11-10 | transcript pricer, ledger | sonnet | medium | 40 to 60 | 72 | 2,356 (1,809 after the first call) | 623 | 2.21 to 3.43 | 2.09 | transcript d715dfd0 (app session 64c9f68d), table 2026-11-10, the Sonnet calls; six more calls on claude-fable-5-2 after the stage cost 2.06 (see the notes) |
| SessionDispatch F7 2026-11-10 | adversarial acceptance of O5, S6 and `1ae8c0d`; release | fable | xhigh | 20 | 49 | 6,594 (5,896 after the first call) | 1,909 | 6.33 | 8.78 | transcript 95cd0d09 (app session 3066f14f), table 2026-11-10, priced just before the stage's commit, later turns not counted; 3 calls on claude-sonnet-5-5 before the operator switched the model (0.14 USD), 46 on claude-fable-5-2 (8.64), one Haiku sub-agent read of the price page (0.004) |

## Notes on the rows

- **Identification (estimate).** The O1 and F1 transcripts are identified by model, by the commit
  times of `0cc7d52` (22:09 on 2026-10-29, UTC+11) and `17c9526` (22:37), and by the session
  windows (10:47 to 11:13 UTC and 11:16 to 11:54 UTC). No transcript names its stage in its
  first message. The costs are right for those sessions; the stage labels are inferred.
- **Cache writes are priced at the table's `cache_write`.** Every write in these transcripts is
  marked as a 1-hour write, which the table does not price separately, so each measured cost is a
  lower bound by that difference. The ratios below carry the same bias in the measured column.
- **The size of the 1-hour bias (F7, 2026-11-10).** The vendor's page, read that day, prices a
  1-hour write at twice base input; the table's `cache_write` is the 5-minute figure (1.25 times).
  At the 1-hour figure the measured costs rise by 0.71 USD for O1 (13.4 percent), 2.03 for F1
  (20.4), 1.09 for O5 (10.2) and 0.25 for S6's Sonnet calls (12.2). The table has no field for
  it, so the Measured column stays at the table's figure (`docs/acceptance-2026-11-10-f7.md`,
  finding F7-1, decision D15).
- **A model switch is a cache miss of the whole context.** The S6 session was switched from
  Sonnet to Fable 5.2 after its stage, so that it could set F7's model: the first call on the new
  model wrote 160,458 tokens and the six calls cost 2.06 USD, as much as the stage's 72. F7
  began on Sonnet and was switched the same way; its Source cell gives the split.
- **Transcript ids are not the app's session ids.** The pricer finds `<transcript id>.jsonl`
  under `~/.claude/projects/<folder>/`; a handoff that names the app's id (`local_...`) does not
  locate it. The Source cells give the transcript id first.
- **Per-call figures for the Tsunami pieces were not recorded**, only costs. The coordinator's
  per-call figures are the ones `SKILL.md` step 1.2 already cites.
- **Cache write per call is not F.** The first call writes the whole base (B), so the figure
  after the first call is the closer estimate of growth per turn (F + O).

## What the rows say so far (n = 10 measured rows, estimates of the spread, not findings)

| Quantity | Value | Reading |
|---|---|---|
| Measured over projected, six pieces (Tsunami A to D, O1, F1) | 0.50, 0.50, 0.72, 1.68, 0.63, 1.69; mean 0.95; pooled 40.79 over 47.68 = 0.86 | The pooled projection runs about 14 percent high; the spread is 0.5 to 1.7, so one piece is not predictable within a factor of 2. |
| Measured over projected, O5 | 1.06 at T 60; 0.66 at T 90 | Inside the quoted range. |
| Measured over projected, S6 | 0.94 at T 40; 0.61 at T 60 | Under the range, on 72 calls against 40 to 60: output per call was 623 against the 1,500 assumed. |
| Measured over projected, F7 | 1.39 at T 20 | Over the projection and a little over the handoff's adverse case of about 8: 49 calls against 20, at 1,909 output per call against the 3,000 assumed. |
| Calls over T projected | O1 49 over 60; F1 24 over 15; O5 101 over 60 to 90; S6 72 over 40 to 60; F7 49 over 20; Tsunami coordinator 166 over 25 by hand | T is the input that moves most. The two acceptance stages (F1, Tsunami C and D by cost) ran over; the two build stages ran under. |
| Output per call, four sessions | 2,088 (O1); 4,263 (F1); 1,371 (O5); 623 (S6, Sonnet at medium) | The 1,500 default holds for O5, is low for O1 and F1 (one of them an xhigh acceptance: reasoning is billed as output) and is more than twice S6. |
| Cache write per call after the first, four sessions | 4,177; 10,061; 3,220; 1,809 (S6) | Against F + O of 4,500 (defaults 3,000 + 1,500) and 6,000 (3,000 + 3,000): three of four are inside it; F1, a read-heavy acceptance, is above. |

No default moves on ten rows of mixed class and effort. The next formula stage that wants one
moved brings its rows split by class and effort, with a sample size for each.
