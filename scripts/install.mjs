#!/usr/bin/env node
// Installs the skill folder (SKILL.md, pricing/, templates/, examples/)
// where each harness looks for skills, and prints the pointer block to
// paste into that harness's instruction file. Never edits an instruction
// file and never creates links: copies only, so moving this repository
// breaks nothing. Standard library only, Node 20 or later.
//
//   node scripts/install.mjs                     user level (Claude Code)
//   node scripts/install.mjs --project <repo>    <repo>/.claude/skills/
//   node scripts/install.mjs --harness codex,zcode,opencode,cline,gemini
//   node scripts/install.mjs --harness all --dry-run
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAME = "session-dispatch";
const PAYLOAD = ["SKILL.md", "pricing", "templates", "examples"];
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

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const dryRun = flag("--dry-run");
if (flag("--help") || flag("-h")) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
  process.exit(0);
}

let harnesses = (value("--harness") ?? "").split(",").filter(Boolean);
if (harnesses.includes("all")) harnesses = Object.keys(HARNESSES);
const project = value("--project");
if (harnesses.length === 0 && !project) harnesses = ["claude"];
const unknown = harnesses.filter((h) => !HARNESSES[h]);
if (unknown.length) { console.error(`install: unknown harness ${unknown.join(", ")}; known: ${Object.keys(HARNESSES).join(", ")}, all`); process.exit(1); }
for (const p of PAYLOAD) if (!fs.existsSync(path.join(ROOT, p))) { console.error(`install: ${p} missing from ${ROOT}; run from a complete checkout`); process.exit(1); }

function copyPayload(target) {
  console.log(`${dryRun ? "would copy" : "copy"} ${PAYLOAD.join(", ")} -> ${target}`);
  if (dryRun) return;
  fs.mkdirSync(target, { recursive: true });
  for (const p of PAYLOAD) fs.cpSync(path.join(ROOT, p), path.join(target, p), { recursive: true, force: true });
}

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
    if (!dryRun) { fs.mkdirSync(path.dirname(spec.rule), { recursive: true }); fs.writeFileSync(spec.rule, block + "\n"); }
  } else {
    console.log(`\n[${h}] paste into ${spec.file}:\n\n${block}\n`);
  }
}

if (project) {
  const target = path.join(path.resolve(project), ".claude", "skills", NAME);
  copyPayload(target);
  console.log(`\n[project] paste into ${path.join(path.resolve(project), "AGENTS.md")} (or CLAUDE.md):\n\n${HARNESSES.claude.pointer}\n`);
}
console.log(dryRun ? "install: dry run, nothing written" : "install: done; instruction files were not edited");
