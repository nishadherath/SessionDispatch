#!/usr/bin/env node
// Installs the skill folder (SKILL.md, pricing/, templates/, examples/ and
// the scripts an installed copy can run) where each harness looks for
// skills, and prints the pointer block to paste into that harness's
// instruction file. Never edits an instruction file and never creates
// links: copies only, so moving this repository breaks nothing. Standard
// library only, Node 20 or later.
//
//   node scripts/install.mjs                     user level (Claude Code)
//   node scripts/install.mjs --user              the same, spelt out
//   node scripts/install.mjs --project <repo>    <repo>/.claude/skills/
//   node scripts/install.mjs --harness codex,zcode,opencode,cline,gemini
//   node scripts/install.mjs --harness all --dry-run
//   node scripts/install.mjs --check             which installed files are behind
//   node scripts/install.mjs --check --project <repo>
//   node scripts/install.mjs --seed <repo>       protocol kit into a new project
//   node scripts/install.mjs --seed <repo> --force   replace what differs
//
// --dry-run works for every mode and writes nothing. --check exits 1 when
// any installed file is missing or differs from the repository. --seed
// refuses to overwrite a file that differs unless --force; with --force
// AGENTS.md and .claude/settings.json are merged, never replaced.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), "..");
const NAME = "session-dispatch";
const PAYLOAD_ITEMS = ["SKILL.md", "pricing", "templates", "examples", "scripts"];
// The gate and this installer need the whole repository around them, and
// tests are development only, so none of them ships in the skill folder.
// Everything else in scripts/ (the price refresh, the calculator and its
// core module) runs from an installed copy because it finds its siblings
// by its own location.
const SCRIPTS_NOT_SHIPPED = new Set(["check.mjs", "install.mjs"]);
const isShippedScript = (name) => name.endsWith(".mjs") && !SCRIPTS_NOT_SHIPPED.has(name) && !name.endsWith(".test.mjs");
const HOME = os.homedir();
const DOCS = path.join(HOME, "Documents");

// Where each harness keeps skills (copy target) and, where it has no skill
// folder, which instruction file the pointer block is for. `pointer` is
// the block printed; `{path}` is replaced by the absolute SKILL.md path.
const HARNESSES = {
  claude: {
    target: path.join(HOME, ".claude", "skills", NAME),
    file: "the project's AGENTS.md or CLAUDE.md",
    pointer: "Session dispatch: before a stage of more than ten turns, at any model or\neffort change, after a compaction, or before delegating, run the\n`session-dispatch` skill and paste its record into the handoff.",
  },
  codex: {
    target: path.join(HOME, ".codex", "skills", NAME),
    file: path.join(HOME, ".codex", "AGENTS.md"),
    pointer: "## Session dispatch\n\nBefore a stage of more than ten turns, at any model or reasoning-effort\nchange, after the thread is compacted, or before delegating, read\n`{path}` and follow it. Paste its decision record into the handoff.",
  },
  zcode: {
    target: path.join(HOME, ".zcode", "skills", NAME),
    file: "the project's AGENTS.md or CLAUDE.md",
    pointer: "Session dispatch: before a stage of more than ten turns, at any model or\neffort change, after a compaction, or before delegating, run the\n`session-dispatch` skill and paste its record into the handoff.",
  },
  opencode: {
    target: path.join(HOME, ".config", "opencode", "skill", NAME),
    file: path.join(HOME, ".config", "opencode", "AGENTS.md"),
    pointer: "## Session dispatch\n\nBefore a stage of more than ten turns, at any model or effort change,\nafter a compaction, or before delegating to a sub-agent, load the\n`session-dispatch` skill and follow it. Paste its decision record into\nthe handoff.",
  },
  cline: {
    target: null,
    rule: path.join(DOCS, "Cline", "Rules", `${NAME}.md`),
    file: path.join(DOCS, "Cline", "Rules", `${NAME}.md`),
    pointer: "# Session dispatch\n\nBefore a task of more than ten turns, at any model change, when the\ncontext window bar passes 60 percent, or before starting a new task\nto continue this work, read `{path}` and follow it. Paste its decision\nrecord into the handoff file.",
  },
  gemini: {
    target: null,
    file: path.join(HOME, ".gemini", "GEMINI.md"),
    pointer: "## Session dispatch\n\nBefore a stage of more than ten turns, at any model change, when\n`/stats` shows the context past 60 percent, or before delegating, read\n`{path}` and follow it. Paste its decision record into the handoff.",
  },
};

const VALUE_FLAGS = ["--harness", "--project", "--seed"];
const BOOLEAN_FLAGS = ["--dry-run", "--user", "--check", "--force", "--help", "-h"];

function die(message) { console.error(`install: ${message}`); process.exit(1); }

// Strict parse: a mistyped flag fails with the accepted list instead of
// silently falling back to the default install.
function parseArgs(argv) {
  const out = { flags: new Set(), values: {} };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (VALUE_FLAGS.includes(a)) {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) die(`${a} needs a value (for example ${a} ${a === "--harness" ? "codex,zcode" : "<path>"})`);
      out.values[a] = v;
      i += 1;
    } else if (BOOLEAN_FLAGS.includes(a)) out.flags.add(a);
    else die(`unknown argument "${a}"; accepted: ${[...VALUE_FLAGS, ...BOOLEAN_FLAGS].join(", ")}`);
  }
  return out;
}

const { flags, values } = parseArgs(process.argv.slice(2));
const dryRun = flags.has("--dry-run");
const force = flags.has("--force");
if (flags.has("--help") || flags.has("-h")) {
  console.log(fs.readFileSync(SELF, "utf8").split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
  process.exit(0);
}

const seedRepo = values["--seed"];
const check = flags.has("--check");
if (seedRepo && check) die("--seed and --check are separate modes; run them one at a time");
if (force && !seedRepo) die("--force applies to --seed only; install and --check never overwrite anything but the skill copy");
if (seedRepo && (values["--harness"] || values["--project"] || flags.has("--user"))) die("--seed copies the protocol kit into a repository and installs no skill; drop --harness, --project and --user");

const dateIso = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const abs = (root, rel) => path.join(root, ...rel.split("/"));

// Every file the installed copy holds, as repository-relative paths with
// forward slashes, sorted so two runs print the same lines.
function walk(dir, prefix, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (e.isDirectory()) walk(path.join(dir, e.name), `${prefix}${e.name}/`, out);
    else if (e.isFile()) out.push(`${prefix}${e.name}`);
  }
  return out;
}
function payloadFiles() {
  const out = [];
  for (const item of PAYLOAD_ITEMS) {
    const p = path.join(ROOT, item);
    if (!fs.existsSync(p)) die(`${item} missing from ${ROOT}; run from a complete checkout`);
    if (item === "scripts") {
      for (const n of fs.readdirSync(p).sort()) if (isShippedScript(n) && fs.statSync(path.join(p, n)).isFile()) out.push(`scripts/${n}`);
    } else if (fs.statSync(p).isDirectory()) walk(p, `${item}/`, out);
    else out.push(item);
  }
  return out;
}

// Temp file then rename, so an interrupted run never leaves half a file.
function writeAtomic(dest, data) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, dest);
}

function copyPayload(target) {
  const files = payloadFiles();
  console.log(`${dryRun ? "would copy" : "copy"} ${files.length} file(s) (SKILL.md, pricing/, templates/, examples/, scripts/) -> ${target}`);
  if (dryRun) return;
  for (const rel of files) writeAtomic(abs(target, rel), fs.readFileSync(abs(ROOT, rel)));
}

// --- --check -------------------------------------------------------------

const fingerprint = (file) => {
  const data = fs.readFileSync(file);
  return { size: data.length, sha: crypto.createHash("sha256").update(data).digest("hex") };
};

// Compares one installed copy with the repository, file by file. Returns
// the number of files behind (missing or different). Files present only in
// the installed copy (an older price table, a refresh made there) are
// listed but never counted: the newest table by name is in force.
function checkCopy(label, target, fixHint, mustExist) {
  if (!fs.existsSync(target)) {
    if (!mustExist) return { behind: 0, checked: false };
    console.log(`${label}: ${target} is not installed; run ${fixHint}`);
    return { behind: 1, checked: true };
  }
  const files = payloadFiles();
  const lines = [];
  for (const rel of files) {
    const installed = abs(target, rel);
    if (!fs.existsSync(installed)) { lines.push(`  missing ${rel}`); continue; }
    const a = fingerprint(abs(ROOT, rel));
    const b = fingerprint(installed);
    if (a.size !== b.size || a.sha !== b.sha) lines.push(`  behind  ${rel} (repository ${a.size} bytes sha256 ${a.sha.slice(0, 12)}, installed ${b.size} bytes sha256 ${b.sha.slice(0, 12)})`);
  }
  const known = new Set(files);
  const extra = [];
  for (const sub of ["pricing", "templates", "examples", "scripts"]) {
    const dir = path.join(target, sub);
    if (fs.existsSync(dir)) for (const rel of walk(dir, `${sub}/`, [])) if (!known.has(rel)) extra.push(rel);
  }
  console.log(`${label}: ${target}: ${lines.length === 0 ? "current" : `${lines.length} of ${files.length} file(s) behind`}`);
  for (const l of lines) console.log(l);
  for (const rel of extra) console.log(`  extra   ${rel} (installed only, not counted)`);
  if (lines.length) console.log(`  fix: ${fixHint}`);
  return { behind: lines.length, checked: true };
}

function runCheck() {
  const named = (values["--harness"] ?? "").split(",").filter(Boolean);
  if (flags.has("--user")) named.push("claude");
  const project = values["--project"];
  const everything = named.length === 0 && !project;
  const wanted = everything ? Object.keys(HARNESSES) : named;
  const unknown = wanted.filter((h) => !HARNESSES[h] && h !== "all");
  if (unknown.length) die(`unknown harness ${unknown.join(", ")}; known: ${Object.keys(HARNESSES).join(", ")}, all`);
  const names = wanted.includes("all") ? Object.keys(HARNESSES) : wanted;
  // Harnesses without a skill folder of their own read the Claude copy.
  const targets = new Map();
  for (const h of names) {
    const t = HARNESSES[h].target ?? HARNESSES.claude.target;
    const key = t.toLowerCase();
    if (!targets.has(key)) targets.set(key, { label: h === "cline" || h === "gemini" ? "claude" : h, target: t, hint: h === "claude" || h === "cline" || h === "gemini" ? "node scripts/install.mjs" : `node scripts/install.mjs --harness ${h}` });
  }
  let behind = 0;
  let checked = 0;
  for (const { label, target, hint } of targets.values()) {
    const r = checkCopy(label, target, hint, !everything);
    behind += r.behind;
    if (r.checked) checked += 1;
  }
  if (project) {
    const t = path.join(path.resolve(project), ".claude", "skills", NAME);
    const r = checkCopy("project", t, `node scripts/install.mjs --project ${path.resolve(project)}`, true);
    behind += r.behind;
    checked += 1;
  }
  console.log(`install: checked ${checked} installed cop${checked === 1 ? "y" : "ies"}, ${behind} file(s) behind${checked === 0 ? " (nothing is installed; run node scripts/install.mjs)" : ""}`);
  process.exit(behind > 0 ? 1 : 0);
}

// --- --seed --------------------------------------------------------------

const PERSONA_CLASSES = ["fable", "haiku", "opus", "sonnet"];
const AGENTS_SECTION = "## Operator protocol (always on)";

const lf = (s) => s.replace(/\r\n/g, "\n");

// The first paragraph of AGENTS.md (the persona and protocol pointer) and
// the "Operator protocol" section, which runs to the next "## " heading.
function agentsParts() {
  const text = lf(fs.readFileSync(path.join(ROOT, "AGENTS.md"), "utf8"));
  const paragraph = text.split("\n\n")[0].trim();
  const section = sectionOf(text);
  if (!section || !paragraph.startsWith("Model class:")) die(`AGENTS.md in ${ROOT} needs a first paragraph starting "Model class:" and a "${AGENTS_SECTION}" section to seed from`);
  return { paragraph, section };
}
function sectionBounds(text) {
  const start = text.indexOf(AGENTS_SECTION);
  if (start < 0) return null;
  const rest = text.slice(start + AGENTS_SECTION.length);
  const next = rest.search(/\n## /);
  return { start, end: next < 0 ? text.length : start + AGENTS_SECTION.length + next };
}
function sectionOf(text) {
  const b = sectionBounds(text);
  return b ? text.slice(b.start, b.end).trim() : null;
}

function hookEntry() {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "settings.json"), "utf8"));
  const entry = (s.hooks?.SessionStart ?? []).find((e) => JSON.stringify(e).includes("operator-protocol.cjs"));
  if (!entry) die(`.claude/settings.json in ${ROOT} has no SessionStart entry running operator-protocol.cjs to seed from`);
  return entry;
}

function statusSkeleton() {
  return [
    "# Live status",
    "",
    "The rolling view of the work: done, in progress, left to do, each with a",
    "time estimate, and the decisions waiting on the operator. The session",
    "doing the work updates it at every stage boundary and whenever an",
    "estimate moves by more than a quarter. Handoffs in `docs/handoffs/` are",
    "the per-stage snapshots.",
    "",
    `Last updated: ${dateIso()} by the seed command.`,
    "",
    "## Done", "", "None yet.", "",
    "## In progress", "", "None.", "",
    "## To do", "", "None recorded.", "",
    "## Decisions waiting", "", "The two questions in `docs/operator-preferences.json`, until answered.", "",
  ].join("\n");
}

function preferencesSkeleton() {
  const prefs = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "operator-preferences.json"), "utf8"));
  for (const q of Object.values(prefs.questions ?? {})) { q.answer = null; q.asked = null; q.recorded = null; q.note = null; }
  return JSON.stringify(prefs, null, 2) + "\n";
}

// One entry per file of protocol section 9. `want` is the bytes to leave
// at `rel`; `merge(existingText)` returns what --force leaves instead for
// the two files that may already hold the project's own content.
function seedItems(repo) {
  const items = [];
  const copy = (rel) => items.push({ rel, want: fs.readFileSync(abs(ROOT, rel)) });
  const { paragraph, section } = agentsParts();
  const entry = hookEntry();
  items.push({
    rel: "AGENTS.md",
    want: Buffer.from(`${paragraph}\n\n# AGENTS.md: ${path.basename(repo)}\n\n${section}\n`),
    // Unchanged when the pointer paragraph and the section are already there.
    same: (text) => lf(text).includes(paragraph) && sectionOf(lf(text)) === section,
    merge: (existing) => {
      let text = lf(existing);
      const b = sectionBounds(text);
      text = b ? `${text.slice(0, b.start)}${section}\n${text.slice(b.end)}` : `${text.replace(/\s*$/, "")}\n\n${section}\n`;
      return text.includes(paragraph) ? text : `${paragraph}\n\n${text}`;
    },
  });
  copy("docs/operator-protocol.md");
  copy("docs/handoffs/README.md");
  copy(".claude/helpers/operator-protocol.cjs");
  items.push({
    rel: ".claude/settings.json",
    want: Buffer.from(JSON.stringify({ hooks: { SessionStart: [entry] } }, null, 2) + "\n"),
    same: (text) => { try { return JSON.stringify(JSON.parse(text).hooks?.SessionStart ?? []).includes("operator-protocol.cjs"); } catch { return false; } },
    merge: (existing) => {
      let s;
      try { s = JSON.parse(existing); } catch (e) { die(`.claude/settings.json in ${repo} is not valid JSON (${e.message}); fix it by hand, then rerun, because merging would discard it`); }
      s.hooks ??= {};
      s.hooks.SessionStart ??= [];
      s.hooks.SessionStart.push(entry);
      return JSON.stringify(s, null, 2) + "\n";
    },
  });
  for (const c of PERSONA_CLASSES) {
    if (!fs.existsSync(path.join(ROOT, `ENGINEERING_PERSONA.${c}.md`))) die(`ENGINEERING_PERSONA.${c}.md missing from ${ROOT}; the seed needs all four class editions`);
    copy(`ENGINEERING_PERSONA.${c}.md`);
  }
  for (const rel of walk(path.join(ROOT, "ENGINEERING_PERSONA_LANGUAGES"), "ENGINEERING_PERSONA_LANGUAGES/", [])) copy(rel);
  items.push({ rel: "docs/status.md", want: Buffer.from(statusSkeleton()) });
  items.push({ rel: "docs/operator-preferences.json", want: Buffer.from(preferencesSkeleton()) });
  return items;
}

function runSeed() {
  const repo = path.resolve(seedRepo);
  if (!fs.existsSync(repo) || !fs.statSync(repo).isDirectory()) die(`${repo} is not a directory; create the project folder (and git init it) first`);
  if (repo.toLowerCase() === ROOT.toLowerCase()) die("the seed target is this repository; give the new project's folder");
  const plan = seedItems(repo).map((it) => {
    const dest = abs(repo, it.rel);
    if (!fs.existsSync(dest)) return { ...it, dest, state: "create" };
    const existing = fs.readFileSync(dest);
    if (it.same ? it.same(existing.toString("utf8")) : existing.equals(it.want)) return { ...it, dest, state: "unchanged" };
    return { ...it, dest, state: "conflict" };
  });
  const conflicts = plan.filter((p) => p.state === "conflict");
  const verb = (p) => {
    if (p.state === "conflict") return force ? (p.merge ? "merge into" : "overwrite") : "differs, refuse";
    return p.state;
  };
  for (const p of plan) console.log(`${dryRun ? "would " : ""}${verb(p).padEnd(16)} ${p.rel}`);
  if (conflicts.length && !force) {
    console.error(`install: ${conflicts.length} file(s) in ${repo} already differ: ${conflicts.map((c) => c.rel).join(", ")}; nothing written. Review them, or rerun with --force (AGENTS.md and .claude/settings.json are merged, the rest replaced)`);
    process.exit(1);
  }
  const writes = plan.filter((p) => p.state !== "unchanged");
  if (dryRun) { console.log(`install: dry run, ${writes.length} of ${plan.length} file(s) would be written to ${repo}`); return; }
  for (const p of writes) writeAtomic(p.dest, p.state === "conflict" && p.merge ? p.merge(fs.readFileSync(p.dest, "utf8")) : p.want);
  console.log(`install: seeded ${repo}: ${writes.length} written, ${plan.length - writes.length} unchanged`);
  console.log("next: put the project's name and purpose into AGENTS.md, ask the operator the two questions in docs/operator-preferences.json, run node .claude/helpers/operator-protocol.cjs in the project to see the reminder lines, commit");
}

// --- install -------------------------------------------------------------

function runInstall() {
  let harnesses = (values["--harness"] ?? "").split(",").filter(Boolean);
  if (harnesses.includes("all")) harnesses = Object.keys(HARNESSES);
  const project = values["--project"];
  // --user is the explicit form of the default: the Claude Code user copy.
  if (flags.has("--user") && !harnesses.includes("claude")) harnesses.unshift("claude");
  if (harnesses.length === 0 && !project) harnesses = ["claude"];
  const unknown = harnesses.filter((h) => !HARNESSES[h]);
  if (unknown.length) die(`unknown harness ${unknown.join(", ")}; known: ${Object.keys(HARNESSES).join(", ")}, all`);
  payloadFiles();

  // The user copy is the path every pointer block refers to when a harness
  // has no skill folder of its own.
  const userSkill = path.join(HARNESSES.claude.target, "SKILL.md");
  for (const h of harnesses) {
    const spec = HARNESSES[h];
    const skillPath = spec.target ? path.join(spec.target, "SKILL.md") : userSkill;
    if (spec.target) copyPayload(spec.target);
    else if (!fs.existsSync(userSkill) && !dryRun) copyPayload(HARNESSES.claude.target);
    const block = spec.pointer.replace("{path}", skillPath);
    if (spec.rule) {
      console.log(`${dryRun ? "would write" : "write"} rule file ${spec.rule}`);
      if (!dryRun) writeAtomic(spec.rule, block + "\n");
    } else {
      console.log(`\n[${h}] paste into ${spec.file}:\n\n${block}\n`);
    }
  }
  if (project) {
    const root = path.resolve(project);
    copyPayload(path.join(root, ".claude", "skills", NAME));
    console.log(`\n[project] paste into ${path.join(root, "AGENTS.md")} (or CLAUDE.md):\n\n${HARNESSES.claude.pointer}\n`);
  }
  console.log(dryRun ? "install: dry run, nothing written" : "install: done; instruction files were not edited");
}

if (check) runCheck();
else if (seedRepo) runSeed();
else runInstall();
