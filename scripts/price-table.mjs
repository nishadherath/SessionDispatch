// The one owner of the price-table rules: what makes a pricing/<date>.json valid, which of
// its families are stale on a given day, and which file is the table in force. The gate
// (scripts/check.mjs), the installed validator (scripts/check-pricing.mjs) and the callers
// that judge one model's age all import it, so a rule changes in one place.
//
// Not here: reading or printing anything, exit codes, the prices' arithmetic
// (scripts/dispatch-core.mjs), or choosing a model. Every function is pure except
// newestTableFile, which lists one folder.
//
// Non-obvious: staleness counts from each family's own `fetched` date, never from
// `table_date`, which only names the file (it must equal the filename and not be after
// today). A family with no numeric figure has nothing to go stale, so an all-null family
// is never listed. Unpriced is not stale; a numeric figure beside a null `fetched` is an
// error, not a staleness. A staleness is returned apart from the errors so a caller can
// map "stale and nothing else" to its own exit code.
import fs from "node:fs";
import path from "node:path";

/** The four figures every row carries, USD per million tokens (null until filled). */
export const PRICE_KEYS = ["input", "output", "cache_read", "cache_write"];
const CLASSES = ["haiku", "sonnet", "opus", "fable"];
const DAY_MS = 86400000;
const TABLE_NAME_RE = /^\d{4}-\d{2}-\d{2}\.json$/;

const two = (n) => String(n).padStart(2, "0");

export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = Date.parse(value);
  return !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 10) === value;
}

const show = (v) => (v === undefined ? "nothing" : JSON.stringify(v));
const isFigure = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0;
const numeric = (v) => typeof v === "number";

/**
 * Today as YYYY-MM-DD in the local calendar, the convention the table filenames, the
 * handoff names and the status file share (not toISOString, which is UTC).
 */
export function localToday(now = new Date()) {
  return `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
}

/** The absolute path of the newest YYYY-MM-DD.json in `dir` by name, or null when there is none. */
export function newestTableFile(dir) {
  let names;
  try { names = fs.readdirSync(dir); } catch { return null; }
  const table = names.filter((n) => TABLE_NAME_RE.test(n)).sort();
  return table.length ? path.resolve(dir, table[table.length - 1]) : null;
}

/** Whole days from the family's `fetched` date to `today`, or null when fetched is null or either date is invalid. */
export function familyAgeDays(table, family, today) {
  const fetched = table?.families?.[family]?.fetched;
  if (!validDate(fetched) || !validDate(today)) return null;
  return Math.round((Date.parse(today) - Date.parse(fetched)) / DAY_MS);
}

/** True when the row, or its long_context block, holds at least one numeric figure. */
function isPriced(model) {
  if (!model || typeof model !== "object") return false;
  const figures = (o) => Boolean(o) && typeof o === "object" && [...PRICE_KEYS, "cache_write_1h"].some((k) => numeric(o[k]));
  return figures(model) || figures(model.long_context);
}

const familyIsPriced = (info) => Object.values(info?.models ?? {}).some(isPriced);

function maxAge(table) {
  return Number.isInteger(table?.max_age_days) && table.max_age_days >= 1 ? table.max_age_days : null;
}

/**
 * The families that hold a numeric figure and were fetched more than `max_age_days` before
 * `today`: [{ family, fetched, ageDays }]. Empty when max_age_days is not a positive integer
 * (validateTable reports that) or when `today` is not a date.
 */
export function staleFamilies(table, today) {
  const limit = maxAge(table);
  if (limit === null) return [];
  const out = [];
  for (const [family, info] of Object.entries(table?.families ?? {})) {
    if (!familyIsPriced(info)) continue;
    const ageDays = familyAgeDays(table, family, today);
    if (ageDays !== null && ageDays > limit) out.push({ family, fetched: info.fetched, ageDays });
  }
  return out;
}

/**
 * The staleness of one model id (an exact id, in any family): { stale, family, fetched,
 * ageDays }, or null when the id is not listed. A model with no numeric figure, or whose
 * family has no fetched date, is not stale (ageDays null in the second case).
 */
export function modelStaleness(table, modelId, today) {
  for (const [family, info] of Object.entries(table?.families ?? {})) {
    if (!Object.hasOwn(info?.models ?? {}, modelId)) continue;
    const limit = maxAge(table);
    const ageDays = familyAgeDays(table, family, today);
    const stale = isPriced(info.models[modelId]) && limit !== null && ageDays !== null && ageDays > limit;
    return { stale, family, fetched: info.fetched ?? null, ageDays };
  }
  return null;
}

/**
 * Every rule a price table must meet, applied to a parsed table. `fileName` is the table's
 * file name (for the table_date check), `today` is YYYY-MM-DD. Returns { errors, warnings,
 * stale }: errors are faults, warnings are nulls the operator has yet to fill, and stale
 * lists the priced families past max_age_days (not an error; the caller decides the exit).
 * Every message names the field, the value found and what is accepted.
 */
export function validateTable(table, { fileName, today }) {
  const errors = [], warnings = [];
  const fail = (m) => errors.push(m);
  if (!table || typeof table !== "object" || Array.isArray(table)) {
    return { errors: [`the table must be a JSON object, found ${show(table)}`], warnings, stale: [] };
  }
  const todayOk = validDate(today);
  if (!todayOk) fail(`today must be a valid YYYY-MM-DD date, found ${show(today)}`);
  if (!validDate(table.table_date)) fail(`table_date must be a valid YYYY-MM-DD date, found ${show(table.table_date)}`);
  else {
    const fileDate = typeof fileName === "string" ? path.basename(fileName).replace(/\.json$/, "") : null;
    if (fileDate !== null && table.table_date !== fileDate) fail(`table_date ${table.table_date} must equal the filename date ${fileDate}`);
    if (todayOk && table.table_date > today) fail(`table_date ${table.table_date} is in the future (today is ${today}); a table is named for the day it is made`);
  }
  if (!Number.isInteger(table.max_age_days) || table.max_age_days < 1) fail(`max_age_days must be a positive integer, found ${show(table.max_age_days)}`);
  if (table.currency !== "USD") fail(`currency must be "USD" (the skill's arithmetic assumes it), found ${show(table.currency)}`);
  if (table.unit !== "per million tokens") fail(`unit must be "per million tokens", found ${show(table.unit)}`);
  if (!table.families || typeof table.families !== "object" || Array.isArray(table.families)) {
    fail(`families must be an object keyed by family name, found ${show(table.families)}`);
    return { errors, warnings, stale: [] };
  }

  const ids = new Set();
  for (const [family, info] of Object.entries(table.families)) {
    const where = `families.${family}`;
    if (!info || typeof info !== "object" || Array.isArray(info)) { fail(`${where} must be an object, found ${show(info)}`); continue; }
    if (typeof info.source !== "string" || !/^https:\/\//.test(info.source)) fail(`${where}.source must be the vendor pricing page URL starting https://, found ${show(info.source)}`);
    if (!info.models || typeof info.models !== "object" || Array.isArray(info.models)) { fail(`${where}.models must be an object keyed by model id, found ${show(info.models)}`); continue; }
    const fetchedSet = info.fetched !== null && info.fetched !== undefined;
    if (info.fetched !== null && !validDate(info.fetched)) fail(`${where}.fetched must be null or a valid YYYY-MM-DD date, found ${show(info.fetched)}`);
    else if (fetchedSet && todayOk && info.fetched > today) fail(`${where}.fetched ${info.fetched} is in the future (today is ${today}); set it to the day the page was read`);
    const entries = Object.entries(info.models);
    if (!entries.length) warnings.push(`${where}: no models listed`);
    for (const [id, m] of entries) {
      const at = `${where}.models.${id}`;
      if (ids.has(id)) fail(`${at}: model id appears in more than one place; ids must be unique across families`);
      ids.add(id);
      if (!m || typeof m !== "object" || Array.isArray(m)) { fail(`${at} must be an object, found ${show(m)}`); continue; }
      if (!(m.class === null || CLASSES.includes(m.class))) fail(`${at}.class must be ${CLASSES.join(", ")} or null, found ${show(m.class)}`);
      if (m.class === null) warnings.push(`${at}.class is null`);
      const figureCheck = (obj, label) => {
        const keys = [...PRICE_KEYS, ...(Object.hasOwn(obj, "cache_write_1h") ? ["cache_write_1h"] : [])];
        for (const k of keys) {
          const v = obj[k];
          if (v === null) warnings.push(`${label}.${k} is null`);
          else if (!isFigure(v)) fail(`${label}.${k} must be a non-negative number or null, found ${show(v)}`);
        }
        return keys.filter((k) => obj[k] === null).length;
      };
      const nulls = figureCheck(m, at);
      const considered = PRICE_KEYS.length + (Object.hasOwn(m, "cache_write_1h") ? 1 : 0);
      if (nulls > 0 && fetchedSet && nulls < considered) fail(`${at} has ${nulls} null price(s) although the family was fetched on ${info.fetched}; fill them or set fetched to null`);
      if (m.long_context !== undefined) {
        const lc = m.long_context;
        if (!lc || typeof lc !== "object" || Array.isArray(lc)) fail(`${at}.long_context must be an object, found ${show(lc)}`);
        else {
          if (!Number.isInteger(lc.threshold_tokens) || lc.threshold_tokens <= 0) fail(`${at}.long_context.threshold_tokens must be a positive integer, found ${show(lc.threshold_tokens)}`);
          const lcNulls = figureCheck(lc, `${at}.long_context`);
          if (lcNulls > 0 && fetchedSet) fail(`${at}.long_context has ${lcNulls} null price(s) although the family was fetched on ${info.fetched}; fill them or set fetched to null`);
        }
      }
      if (isPriced(m) && info.fetched === null) fail(`${where}: ${id} holds a numeric figure but fetched is null; set fetched to the day the page was read`);
    }
  }
  return { errors, warnings, stale: todayOk ? staleFamilies(table, today) : [] };
}
