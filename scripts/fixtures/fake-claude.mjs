// A stand-in for `claude -p --output-format json` used by scripts/eval-run.test.mjs.
// Reads the prompt on stdin, writes the record the prompt names, prints one JSON line
// shaped like the CLI's result. FAKE_CLAUDE_MODE: "ok" (default), "error" (no JSON), "haiku" (unknown-basis cost).
import fs from "node:fs";

let prompt = "";
for await (const chunk of process.stdin) prompt += chunk;
const mode = process.env.FAKE_CLAUDE_MODE ?? "ok";
const arg = (k) => process.argv[process.argv.indexOf(k) + 1];
if (mode === "error") { console.error("boom"); process.exit(3); }
const record = prompt.match(/to the file (\S+record\.md)/)?.[1];
if (record) fs.writeFileSync(record, "Session dispatch not run: fixture.\n");
const model = arg("--model");
console.log(JSON.stringify({
  type: "result", subtype: "success", is_error: false, num_turns: 4, duration_ms: 2500, stop_reason: "end_turn", terminal_reason: "completed",
  total_cost_usd: mode === "haiku" ? 9 : 0.5, result: "done", cwd: process.cwd(), args: process.argv.slice(2),
  usage: { input_tokens: 10, cache_creation_input_tokens: 1000, cache_read_input_tokens: 20000, output_tokens: 500 },
  modelUsage: { [model]: { costUSD: 0.5, costBasis: mode === "haiku" ? "unknown" : "list" } },
}));
