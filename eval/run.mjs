#!/usr/bin/env node
// The evaluation runner: prepares one sandbox and one prompt per run, collects
// the records the subjects wrote, and scores them into eval/results-<date>.md
// (eval/rubric.md). Standard library only, Node 20 or later.
//
//   node eval/run.mjs prepare --date YYYY-MM-DD --subjects haiku,sonnet --arms calculator,hand [--only 03,04] [--skill <dir>] [--repeat <n>]
//   node eval/run.mjs run     --date YYYY-MM-DD --runner cli [--only 03,04] [--force] [--concurrency <n>] [--max-turns <n>] [--max-budget-usd <x>] [--timeout-min <n>] [--models haiku=<id>,sonnet=<id>]
//   node eval/run.mjs usage   --date YYYY-MM-DD --file <usage.json> --models haiku=<id>,sonnet=<id>
//   node eval/run.mjs collect --date YYYY-MM-DD
//   node eval/run.mjs score   --date YYYY-MM-DD
//
// Two ways to run the subjects. `run --runner cli` (H3 onwards) drives
// `claude -p` from each sandbox and writes usage.json from the figures the CLI
// measures. The `Agent` path (H1 and H2, kept for their comparability) cannot
// be scripted: the orchestrating session reads each prompt.txt, runs it on a
// sub-agent of the subject's class and writes usage.json with `usage` between
// `prepare` and `collect`. Either way the subject writes record.md in its
// sandbox and replies "done", so no record enters the orchestrator's context.
//
// Non-obvious: sandboxes live under os.tmpdir(), outside the repository, so a
// subject cannot stumble on eval/scenarios/ and its expectations. Each sandbox
// table is re-dated so its age on the run day equals its age on the scenario's
// own day; prices are untouched.
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { scoreRun, renderReport } from "./score.mjs";
import { findModel, modelForClass, roundTo } from "../scripts/dispatch-core.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUBJECT_CLASSES = ["haiku", "sonnet"];
const ARMS = ["calculator", "hand"];
const CALCULATOR_FILES = ["dispatch.mjs", "dispatch-core.mjs"];
const SKILL_ENTRIES = ["SKILL.md", "templates", "examples"];
const DAY_MS = 86400000;

const die = (msg) => { console.error(`run: ${msg}`); process.exit(1); };
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const isDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
const shiftDays = (date, days) => new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);

function scenariosOf(repoRoot, only) {
  const dir = path.join(repoRoot, "eval", "scenarios");
  const all = fs.readdirSync(dir).filter((n) => n.endsWith(".json")).sort().map((n) => readJson(path.join(dir, n)));
  if (!only?.length) return all;
  const picked = all.filter((s) => only.some((o) => s.id === o || s.id.startsWith(`${o}-`)));
  const unknown = only.filter((o) => !picked.some((s) => s.id === o || s.id.startsWith(`${o}-`)));
  if (unknown.length) throw new Error(`--only names no scenario: ${unknown.join(", ")}; ids are ${all.map((s) => s.id).join(", ")}`);
  return picked;
}

/** The subject prompt template: the text inside the text fence of eval/subject-prompt.md. */
function promptTemplate(repoRoot) {
  const text = fs.readFileSync(path.join(repoRoot, "eval", "subject-prompt.md"), "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/````text\n([\s\S]*?)\n````/);
  if (!m) throw new Error("eval/subject-prompt.md has no text fence of four backticks to read the prompt from");
  return { template: m[1], sha256: sha256(m[1]) };
}

const fill = (template, values) => template.replace(/\{\{(\w+)\}\}/g, (whole, k) => (k in values ? values[k] : whole));

/** The newest pricing file name in a folder, for the manifest. */
const newestTable = (dir) => fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().pop();

/**
 * Prepares sandboxes, prompts and the manifest. Returns { runs, manifestFile }.
 * `skillRoot` is where the skill payload is read from (the repository, or a
 * variant's folder); `repoRoot` where scenarios and the prompt template live.
 * `repeat` runs each scenario, subject and arm that many times: the first keeps
 * the id `<scenario>.<subject>.<arm>`, the nth after it takes the suffix `.n`.
 * A day's manifest that already exists is merged into, not rewritten (F2-10): runs
 * with new ids are added, a run prepared again with `force` replaces its entry, and
 * the call refuses when the skill text or the prompt differs from the manifest's, since
 * one manifest records one text under test. The result's `runs` are this call's own.
 */
export function prepare({ date, subjects, arms, only, skillRoot = REPO, repoRoot = REPO, runsRoot = path.join(REPO, "eval", "runs"), sandboxRoot = path.join(os.tmpdir(), "sd-eval"), force = false, repeat = 1 }) {
  if (!Number.isInteger(repeat) || repeat < 1) throw new Error(`--repeat must be a whole number of 1 or more, found ${JSON.stringify(repeat)}`);
  if (!isDate(date)) throw new Error(`--date must be YYYY-MM-DD, found ${JSON.stringify(date)}`);
  for (const s of subjects) if (!SUBJECT_CLASSES.includes(s)) throw new Error(`subject ${JSON.stringify(s)} must be one of ${SUBJECT_CLASSES.join(", ")}`);
  for (const a of arms) if (!ARMS.includes(a)) throw new Error(`arm ${JSON.stringify(a)} must be one of ${ARMS.join(", ")}`);
  if (!subjects.length || !arms.length) throw new Error("--subjects and --arms must each name at least one value");
  const skillMd = path.join(skillRoot, "SKILL.md");
  if (!fs.existsSync(skillMd)) throw new Error(`${skillMd} not found; --skill must be a folder holding SKILL.md, templates/ and examples/`);
  const { template, sha256: promptSha } = promptTemplate(repoRoot);
  const dayDir = path.join(runsRoot, date);
  const runs = [];
  for (const sc of scenariosOf(repoRoot, only)) {
    const table = readJson(path.join(repoRoot, ...sc.table.split("/")));
    const age = Math.round((Date.parse(sc.today) - Date.parse(table.table_date)) / DAY_MS);
    if (!Number.isFinite(age)) throw new Error(`${sc.id}: cannot date table ${sc.table} against ${sc.today}`);
    const redated = { ...table, table_date: shiftDays(date, -age) };
    for (const subject of subjects) for (const arm of arms) for (let rep = 1; rep <= repeat; rep++) {
      const id = `${sc.id}.${subject}.${arm}${rep > 1 ? `.${rep}` : ""}`;
      const runDir = path.join(dayDir, id), sandbox = path.join(sandboxRoot, date, id), skillDir = path.join(sandbox, "skill");
      if (!force && fs.existsSync(path.join(runDir, "record.txt"))) throw new Error(`${runDir} already holds a record; pass --force to prepare it again`);
      fs.rmSync(sandbox, { recursive: true, force: true });
      fs.mkdirSync(path.join(skillDir, "pricing"), { recursive: true });
      for (const entry of SKILL_ENTRIES) {
        const src = path.join(skillRoot, entry);
        if (fs.existsSync(src)) fs.cpSync(src, path.join(skillDir, entry), { recursive: true });
      }
      fs.writeFileSync(path.join(skillDir, "pricing", `${redated.table_date}.json`), `${JSON.stringify(redated, null, 2)}\n`);
      if (arm === "calculator") {
        fs.mkdirSync(path.join(skillDir, "scripts"));
        for (const f of CALCULATOR_FILES) fs.copyFileSync(path.join(skillRoot, "scripts", f), path.join(skillDir, "scripts", f));
      }
      const recordPath = path.join(sandbox, "record.md");
      const brief = sc.brief.map((l) => fill(l, { TODAY: date })).join("\n\n");
      const prompt = fill(template, { SKILL_DIR: skillDir, RECORD_PATH: recordPath, TODAY: date, BRIEF: brief });
      fs.mkdirSync(runDir, { recursive: true });
      fs.writeFileSync(path.join(runDir, "prompt.txt"), `${prompt}\n`);
      runs.push({ run: id, scenario: sc.id, subject, arm, sandbox, record: recordPath, prompt: path.join(runDir, "prompt.txt") });
    }
  }
  let commit = "unknown";
  try { commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim(); } catch { /* not a git checkout */ }
  const manifestFile = path.join(dayDir, "manifest.json");
  fs.mkdirSync(dayDir, { recursive: true });
  const head = { date, commit, table_in_force: newestTable(path.join(repoRoot, "pricing")), skill_source: skillRoot === REPO ? "repository" : skillRoot, skill_sha256: sha256(fs.readFileSync(skillMd)), prompt_sha256: promptSha };
  let all = runs;
  if (fs.existsSync(manifestFile)) {
    const old = readJson(manifestFile);
    for (const k of ["skill_sha256", "prompt_sha256", "skill_source"]) if (old[k] !== head[k]) throw new Error(`${manifestFile} records a different ${k}; one manifest records one text under test, so prepare this set under another --date`);
    const fresh = new Map(runs.map((r) => [r.run, r]));
    all = [...old.runs.map((r) => fresh.get(r.run) ?? r), ...runs.filter((r) => !old.runs.some((o) => o.run === r.run))];
  }
  // One line per run, so a diff of two manifests reads run by run.
  const body = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
  fs.writeFileSync(manifestFile, `{\n${body}\n  "runs": [\n${all.map((r) => `    ${JSON.stringify(r)}`).join(",\n")}\n  ]\n}\n`);
  return { runs, manifestFile };
}

function loadManifest(runsRoot, date) {
  const file = path.join(runsRoot, date, "manifest.json");
  if (!fs.existsSync(file)) throw new Error(`${file} not found; run prepare --date ${date} first`);
  return readJson(file);
}

/**
 * Writes usage.json for each run named in `entries`, a list of
 * { run, total_tokens, tool_uses, duration_ms }, as the Agent result reports
 * them. The Agent result carries no model id, so `models` maps each subject
 * class to the id the orchestrator ran it as, and the file says so.
 */
export function recordUsage({ date, entries, models, runsRoot = path.join(REPO, "eval", "runs") }) {
  const m = loadManifest(runsRoot, date);
  if (!Array.isArray(entries)) throw new Error("--file must hold a JSON array of { run, total_tokens, tool_uses, duration_ms }");
  for (const e of entries) {
    const r = m.runs.find((x) => x.run === e.run);
    if (!r) throw new Error(`usage entry names run ${JSON.stringify(e.run)}, which is not in the manifest of ${date}`);
    if (!models[r.subject]) throw new Error(`--models has no id for subject ${r.subject}; give ${r.subject}=<model id>`);
    const num = (k) => (typeof e[k] === "number" ? e[k] : null);
    const usage = { model: models[r.subject], model_source: "named by the orchestrator; the Agent result reports no model", total_tokens: num("total_tokens"), tool_uses: num("tool_uses"), duration_ms: num("duration_ms"), input_tokens: num("input_tokens"), output_tokens: num("output_tokens") };
    fs.writeFileSync(path.join(runsRoot, date, r.run, "usage.json"), `${JSON.stringify(usage, null, 2)}
`);
  }
  return { written: entries.length };
}

// ---- The CLI runner ----

// What every CLI subject runs with. The probe of Stage S4 (eval/README.md, "The CLI runner") found
// that a default `claude -p` loads the user's installed skills, the installed copy of this skill
// among them, and the user's hooks. --disable-slash-commands drops the skills and
// --setting-sources project the user-level settings and hooks; the sandbox sits outside any
// repository, so no project settings, CLAUDE.md or AGENTS.md is found either.
const CLI_ISOLATION = ["--disable-slash-commands", "--setting-sources", "project", "--no-session-persistence"];
// The hand arm needs no shell. The calculator arm gets Bash for the one script its sandbox holds.
const CLI_TOOLS = { hand: { tools: "Read,Write", allowed: "Read,Write" }, calculator: { tools: "Read,Write,Bash", allowed: "Read,Write,Bash(node *dispatch.mjs*)" } };

/** The subject's model id per class: the table in force's row for the class, unless `models` overrides it. */
function subjectModelIds(pricing, subjects, models = {}) {
  const ids = {};
  for (const s of subjects) {
    ids[s] = models[s] ?? modelForClass(pricing, "anthropic", s)?.id;
    if (!ids[s]) throw new Error(`no model id for subject class ${s}: the table in force has no ${s} row; pass --models ${s}=<id>`);
  }
  return ids;
}

/** The `claude -p` arguments for one run. The prompt goes in on stdin, so a variadic flag cannot swallow it. */
export function cliArgs({ model, arm, maxTurns = 40, maxBudgetUsd = null }) {
  const grant = CLI_TOOLS[arm];
  if (!grant) throw new Error(`arm ${JSON.stringify(arm)} must be one of ${ARMS.join(", ")}`);
  const args = ["-p", "--model", model, "--output-format", "json", "--max-turns", String(maxTurns), ...CLI_ISOLATION,
    "--tools", grant.tools, "--allowedTools", grant.allowed, "--permission-mode", "dontAsk"];
  if (maxBudgetUsd !== null) args.push("--max-budget-usd", String(maxBudgetUsd));
  return args;
}

/**
 * usage.json from the object `claude -p --output-format json` prints. The CLI reports
 * its own cost with a `costBasis`; for a model its price list does not know that figure
 * is a guess ("unknown" for claude-haiku-5-5 on CLI 2.1.289), so `usd_priced` prices the
 * same tokens from the table in force and is the figure to read. The long-context tier
 * is not applied (the CLI reports per run, not per request); `long_context_possible`
 * flags a run whose average request could have crossed it.
 */
export function usageFromCli(result, pricing, { requested = null, wallMs = null } = {}) {
  const u = result?.usage ?? {};
  const n = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  const input = n(u.input_tokens), written = n(u.cache_creation_input_tokens), read = n(u.cache_read_input_tokens), output = n(u.output_tokens);
  const modelIds = Object.keys(result?.modelUsage ?? {});
  const model = modelIds.length === 1 ? modelIds[0] : requested;
  const row = model ? findModel(pricing, model) : null;
  const rate = (k) => (typeof row?.[k] === "number" ? row[k] : null);
  const priced = row && ["input", "output", "cache_read", "cache_write"].every((k) => rate(k) !== null)
    ? roundTo((input * rate("input") + written * rate("cache_write") + read * rate("cache_read") + output * rate("output")) * 1e-6, 4) : null;
  const turns = Math.max(1, n(result?.num_turns));
  const threshold = row?.long_context?.threshold_tokens ?? null;
  return {
    model, model_source: modelIds.length === 1 ? "reported by claude -p (modelUsage)" : `requested with --model; claude -p reported ${modelIds.length} models`,
    total_tokens: input + written + read + output, tool_uses: null, num_turns: n(result?.num_turns) || null,
    duration_ms: n(result?.duration_ms) || wallMs,
    input_tokens: input + written, output_tokens: output, cache_creation_input_tokens: written, cache_read_input_tokens: read, uncached_input_tokens: input,
    usd_cli: typeof result?.total_cost_usd === "number" ? result.total_cost_usd : null,
    cost_basis: result?.modelUsage?.[model]?.costBasis ?? null,
    usd_priced: priced, price_basis: row ? "table in force, standard rates on the aggregate usage" : "model not in the table in force",
    long_context_possible: threshold !== null && (input + written + read) / turns > threshold,
    is_error: result?.is_error === true, stop_reason: result?.stop_reason ?? null, terminal_reason: result?.terminal_reason ?? null,
  };
}

/** Runs one prepared run through the CLI. Resolves { run, ok, usage, error }. `command` is [binary, ...leading args]. */
function runOneCli({ r, runDir, model, command, args, timeoutMs, pricing }) {
  const prompt = fs.readFileSync(r.prompt, "utf8");
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn(command[0], [...command.slice(1), ...args], { cwd: r.sandbox, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let out = "", err = "", timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutMs);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", (e) => { clearTimeout(timer); resolve({ run: r.run, ok: false, error: `could not start ${command[0]}: ${e.message}` }); });
    child.on("close", (code) => {
      clearTimeout(timer);
      fs.writeFileSync(path.join(runDir, "cli-stderr.txt"), err);
      const line = out.trim().split(/\r?\n/).pop() ?? "";
      let result = null;
      try { result = JSON.parse(line); } catch { /* reported below */ }
      if (result) fs.writeFileSync(path.join(runDir, "cli-result.json"), `${JSON.stringify(result, null, 2)}\n`);
      if (!result) return resolve({ run: r.run, ok: false, error: timedOut ? `timed out after ${Math.round(timeoutMs / 60000)} minutes` : `exit ${code}, no JSON result on stdout (see cli-stderr.txt)` });
      const usage = usageFromCli(result, pricing, { requested: model, wallMs: Date.now() - started });
      fs.writeFileSync(path.join(runDir, "usage.json"), `${JSON.stringify(usage, null, 2)}\n`);
      resolve({ run: r.run, ok: !usage.is_error, usage, error: usage.is_error ? `the CLI reported an error (${usage.terminal_reason ?? usage.stop_reason})` : null });
    });
    child.stdin.end(prompt);
  });
}

/**
 * Runs the prepared runs of `date` through `claude -p` from each run's sandbox, `concurrency` at a
 * time, and writes usage.json (measured tokens and cost) and cli-result.json beside each prompt.
 * A run whose usage.json exists is skipped unless `force`. Returns { ran, skipped, failed }.
 */
export async function runCli({ date, only, force = false, concurrency = 2, maxTurns = 40, maxBudgetUsd = null, timeoutMin = 20, models = {}, command = ["claude"], runsRoot = path.join(REPO, "eval", "runs"), repoRoot = REPO, onRun = () => {} }) {
  const m = loadManifest(runsRoot, date);
  const pricing = readJson(path.join(repoRoot, "pricing", newestTable(path.join(repoRoot, "pricing"))));
  const ids = subjectModelIds(pricing, [...new Set(m.runs.map((r) => r.subject))], models);
  const chosen = m.runs.filter((r) => !only?.length || only.some((o) => r.run === o || r.scenario === o || r.scenario.startsWith(`${o}-`)));
  if (only?.length && !chosen.length) throw new Error(`--only names no prepared run in ${date}: ${only.join(", ")}`);
  const todo = chosen.filter((r) => force || !fs.existsSync(path.join(runsRoot, date, r.run, "usage.json")));
  const skipped = chosen.length - todo.length, failed = [];
  let next = 0, ran = 0;
  const worker = async () => {
    while (next < todo.length) {
      const r = todo[next++];
      const res = await runOneCli({ r, runDir: path.join(runsRoot, date, r.run), model: ids[r.subject], command, args: cliArgs({ model: ids[r.subject], arm: r.arm, maxTurns, maxBudgetUsd }), timeoutMs: timeoutMin * 60000, pricing });
      ran += 1;
      if (!res.ok) failed.push({ run: res.run, error: res.error });
      onRun(res);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, todo.length)) }, worker));
  return { ran, skipped, failed };
}

/** Copies each sandbox's record.md to record.txt. Returns the runs with no record. */
export function collect({ date, runsRoot = path.join(REPO, "eval", "runs") }) {
  const m = loadManifest(runsRoot, date), missing = [];
  for (const r of m.runs) {
    if (!fs.existsSync(r.record)) { missing.push(r.run); continue; }
    fs.copyFileSync(r.record, path.join(runsRoot, date, r.run, "record.txt"));
  }
  return { collected: m.runs.length - missing.length, missing };
}

/** Scores every run with a record, writes score.json per run and the results file. */
export function score({ date, runsRoot = path.join(REPO, "eval", "runs"), repoRoot = REPO, resultsFile = path.join(repoRoot, "eval", `results-${date}.md`) }) {
  const m = loadManifest(runsRoot, date);
  const pricingName = newestTable(path.join(repoRoot, "pricing"));
  const pricing = readJson(path.join(repoRoot, "pricing", pricingName));
  const scores = [], subjectModels = {}, skipped = [];
  for (const r of m.runs) {
    const dir = path.join(runsRoot, date, r.run);
    if (!fs.existsSync(path.join(dir, "record.txt"))) { skipped.push(r.run); continue; }
    const sc = readJson(path.join(repoRoot, "eval", "scenarios", `${r.scenario}.json`));
    const table = readJson(path.join(repoRoot, ...sc.table.split("/")));
    const usageFile = path.join(dir, "usage.json");
    const usage = fs.existsSync(usageFile) ? readJson(usageFile) : null;
    if (typeof usage?.model === "string") subjectModels[r.subject] = usage.model;
    const result = scoreRun({ scenario: sc, table, record: fs.readFileSync(path.join(dir, "record.txt"), "utf8"), usage, pricing, subject: r.subject, arm: r.arm });
    fs.writeFileSync(path.join(dir, "score.json"), `${JSON.stringify(result, null, 2)}\n`);
    scores.push(result);
  }
  if (!scores.length) throw new Error(`no run under ${path.join(runsRoot, date)} has a record.txt; run collect first`);
  const earlier = fs.readdirSync(path.join(repoRoot, "eval")).filter((n) => /^results-\d{4}-\d{2}-\d{2}\.md$/.test(n) && n !== path.basename(resultsFile)).sort().pop();
  const earlierSha = earlier ? fs.readFileSync(path.join(repoRoot, "eval", earlier), "utf8").match(/Subject prompt SHA-256: ([0-9a-f]{64})/)?.[1] : null;
  const promptNote = `Subject prompt SHA-256: ${m.prompt_sha256}; ${earlier ? (earlierSha === m.prompt_sha256 ? `unchanged since ${earlier}` : `changed since ${earlier}`) : "no earlier results file"}. Skill source: ${m.skill_source}, SKILL.md SHA-256 ${m.skill_sha256}`;
  const text = renderReport({ header: { date, commit: m.commit, tableName: `pricing/${pricingName}`, subjectModels, promptNote }, scores });
  fs.writeFileSync(resultsFile, text);
  return { scored: scores.length, skipped, resultsFile };
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  let v;
  try {
    v = parseArgs({ args: rest, strict: true, options: { date: { type: "string" }, subjects: { type: "string" }, arms: { type: "string" }, only: { type: "string" }, skill: { type: "string" }, force: { type: "boolean" }, file: { type: "string" }, models: { type: "string" }, repeat: { type: "string" }, runner: { type: "string" }, concurrency: { type: "string" }, "max-turns": { type: "string" }, "max-budget-usd": { type: "string" }, "timeout-min": { type: "string" } } }).values;
  } catch (e) { die(`${e.message}; usage: prepare|run|usage|collect|score --date YYYY-MM-DD [--subjects haiku,sonnet] [--arms calculator,hand] [--only 03,04] [--skill <dir>] [--repeat <n>] [--force]`); }
  const date = v.date ?? die("--date YYYY-MM-DD is required");
  const list = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : undefined);
  try {
    if (cmd === "prepare") {
      const { runs, manifestFile } = prepare({ date, subjects: list(v.subjects) ?? SUBJECT_CLASSES, arms: list(v.arms) ?? ARMS, only: list(v.only), skillRoot: v.skill ? path.resolve(v.skill) : REPO, force: v.force, repeat: v.repeat === undefined ? 1 : Number(v.repeat) });
      for (const r of runs) console.log(`${r.run}\t${r.subject}\t${r.prompt}`);
      console.log(`prepared ${runs.length} run(s); manifest ${manifestFile} now lists ${readJson(manifestFile).runs.length}`);
    } else if (cmd === "run") {
      if (v.runner !== "cli") die("run needs --runner cli; the Agent path is driven by the orchestrating session (prompt.txt, then `usage`), not by this script");
      const num = (x, d) => (x === undefined ? d : Number(x));
      const models = v.models ? Object.fromEntries(list(v.models).map((p) => p.split("="))) : {};
      runCli({ date, only: list(v.only), force: v.force, concurrency: num(v.concurrency, 2), maxTurns: num(v["max-turns"], 40), maxBudgetUsd: v["max-budget-usd"] === undefined ? null : Number(v["max-budget-usd"]), timeoutMin: num(v["timeout-min"], 20), models,
        onRun: (res) => console.log(res.ok ? `${res.run}	ok	${res.usage.total_tokens} tokens	${res.usage.usd_priced ?? "n/a"} USD priced	${res.usage.usd_cli ?? "n/a"} USD by the CLI (${res.usage.cost_basis ?? "n/a"})` : `${res.run}	FAILED	${res.error}`) })
        .then(({ ran, skipped, failed }) => { console.log(`ran ${ran} run(s), skipped ${skipped} with a usage.json; ${failed.length} failed`); if (failed.length) process.exit(1); }).catch((e) => die(e.message));
    } else if (cmd === "usage") {
      if (!v.file || !v.models) die("usage needs --file <json array> and --models haiku=<id>,sonnet=<id>");
      const models = Object.fromEntries(list(v.models).map((p) => p.split("=")));
      console.log(`wrote usage.json for ${recordUsage({ date, entries: readJson(v.file), models }).written} run(s)`);
    } else if (cmd === "collect") {
      const { collected, missing } = collect({ date });
      console.log(`collected ${collected} record(s)`);
      if (missing.length) { console.error(`run: no record.md for: ${missing.join(", ")}`); process.exit(1); }
    } else if (cmd === "score") {
      const { scored, skipped, resultsFile } = score({ date });
      console.log(`scored ${scored} run(s); wrote ${resultsFile}${skipped.length ? `; no record for ${skipped.join(", ")}` : ""}`);
    } else die(`unknown command ${JSON.stringify(cmd)}; use prepare, run, usage, collect or score`);
  } catch (e) { die(e.message); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
