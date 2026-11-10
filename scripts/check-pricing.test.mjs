import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('portable checker validates tables and rejects invalid, future and stale figures', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-price-check-'));
  assert.equal(path.dirname(fs.realpathSync(temp)), fs.realpathSync(os.tmpdir()));
  try {
    const scripts = path.join(temp, 'scripts'), pricing = path.join(temp, 'pricing');
    fs.mkdirSync(scripts); fs.mkdirSync(pricing);
    const original = path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-pricing.mjs');
    fs.copyFileSync(original, path.join(scripts, 'check-pricing.mjs'));
    const file = path.join(pricing, '2026-11-04.json');
    const table = { table_date:'2026-11-04', max_age_days:8, currency:'USD', unit:'per million tokens', families:{ test:{ source:'https://example.com', fetched:'2026-11-04', models:{ model:{ class:'opus', input:2, output:10, cache_read:0.1, cache_write:2.5, long_context:{ threshold_tokens:100, input:4, output:15, cache_read:0.2, cache_write:5 } }, unknown:{ class:null, input:null, output:null, cache_read:null, cache_write:null } } } } };
    const run = value => { fs.writeFileSync(file, JSON.stringify(value)); return spawnSync(process.execPath, [path.join(scripts, 'check-pricing.mjs'), '--today', '2026-11-04'], { encoding:'utf8' }); };
    assert.equal(run(table).status, 0);
    for (const mutate of [
      t => { t.families.test.models.model.input = -1; },
      t => { delete t.families.test.models.model.output; },
      t => { t.families.test.models.model.long_context.threshold_tokens = 0; },
      t => { t.families.test.fetched = '2026-11-05'; },
      t => { t.families.test.fetched = '2026-10-01'; },
      t => { t.table_date = '2026-02-30'; },
    ]) {
      const bad = structuredClone(table); mutate(bad);
      assert.notEqual(run(bad).status, 0);
    }
  } finally { fs.rmSync(temp, { recursive:true, force:true }); }
});
