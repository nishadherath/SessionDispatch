#!/usr/bin/env node
// SessionStart hook: announces the operator protocol, the active handoff,
// the live status document and any operator question still unanswered,
// so a fresh session knows where to resume and what to ask before it
// reads anything else. Prints nothing fatal: a missing directory or a
// malformed file degrades to the one-line reminder, never to a crash
// (a hook that throws would hide the reminder it exists to give).
//
// Wired from .claude/settings.json; see docs/operator-protocol.md
// sections 1.3 and 5.
const fs = require("node:fs");
const path = require("node:path");

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const docs = path.join(root, "docs");
const dir = path.join(docs, "handoffs");
const FIELDS = ["stage", "model", "effort", "status"];

// The newest handoff by filename (names start with an ISO date, so a
// plain string sort is a date sort). README.md is the template.
function newestHandoff() {
  let names;
  try {
    names = fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(n));
  } catch {
    return null;
  }
  if (names.length === 0) return null;
  names.sort();
  return names[names.length - 1];
}

// The front-matter fields we announce, read without a YAML parser:
// one `key: value` per line between the first two `---` fences.
function frontMatter(file) {
  const out = {};
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return out;
  }
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*"?([^"#]*?)"?\s*(#.*)?$/i);
    if (kv && FIELDS.includes(kv[1])) out[kv[1]] = kv[2].trim();
  }
  return out;
}

// The operator questions of protocol section 1.3. Each one still
// unanswered (answer === null) is named so the session asks it once.
function unanswered() {
  try {
    const prefs = JSON.parse(fs.readFileSync(path.join(docs, "operator-preferences.json"), "utf8"));
    return Object.entries(prefs.questions || {})
      .filter(([, q]) => q && q.answer === null)
      .map(([key, q]) => `${key}: ${q.question}`);
  } catch {
    return [];
  }
}

const lines = [
  "[operator-protocol] docs/operator-protocol.md is in force: handoff file + API cost and time projection on every model/effort change or new agent; decisions in the five-part format; commit before handoff.",
];
const name = newestHandoff();
if (name) {
  const fm = frontMatter(path.join(dir, name));
  const summary = FIELDS.filter((k) => fm[k]).map((k) => `${k}=${fm[k]}`).join(", ");
  lines.push(`[operator-protocol] Active handoff: docs/handoffs/${name}${summary ? ` (${summary})` : ""}. If you are the session taking it over, read it first and check your own model/effort against its front matter before doing anything else.`);
} else {
  lines.push("[operator-protocol] No handoff on file yet (docs/handoffs/ holds only the template).");
}
if (fs.existsSync(path.join(docs, "status.md"))) {
  lines.push("[operator-protocol] Live status: docs/status.md. Update it at every stage boundary (AGENTS.md rule 11).");
}
for (const q of unanswered()) {
  lines.push(`[operator-protocol] Unanswered operator question (${q}) Ask it once in your first reply; record the answer with the date in docs/operator-preferences.json and commit (protocol section 1.3).`);
}
process.stdout.write(lines.join("\n") + "\n");
