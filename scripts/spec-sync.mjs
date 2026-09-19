#!/usr/bin/env node
// Pull every released API version from the platform into specs/, or with
// --check, fail when specs/ differs from what the platform serves.
//
//   npm run spec:sync     # writes specs/<version>.json for each x-versions entry
//   npm run spec:check    # CI: exit 1 on any difference, prints what differs
//
// Committed copies are the point: a spec change shows up as a reviewable
// diff in a PR, and the site builds offline from what was reviewed.
import {readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {LIVE_SPEC_URL, SPEC_DIR, canonical, specVersions} from './specs.mjs';

export async function fetchLive(fetchImpl = fetch, base = LIVE_SPEC_URL) {
  const latest = await getJSON(fetchImpl, base);
  const versions = latest?.info?.['x-versions'];
  if (!Array.isArray(versions) || versions.length === 0) {
    throw new Error(`${base}: info.x-versions missing`);
  }
  const docs = {};
  for (const v of versions) {
    docs[v] = await getJSON(fetchImpl, `${base}?version=${v}`);
  }
  return docs;
}

async function getJSON(fetchImpl, url) {
  const res = await fetchImpl(url, {headers: {accept: 'application/json'}});
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

// What --check reports: versions only on one side, and versions whose
// canonical text differs. Empty means in sync.
export function diff(live, dir = SPEC_DIR) {
  const local = specVersions(dir);
  const out = [];
  for (const v of Object.keys(live)) {
    if (!local.includes(v)) out.push(`missing locally: ${v} (run spec:sync)`);
    else if (readFileSync(join(dir, `${v}.json`), 'utf8') !== canonical(live[v])) out.push(`changed: ${v}`);
  }
  for (const v of local) if (!(v in live)) out.push(`retired upstream: ${v} (delete specs/${v}.json)`);
  return out;
}

export function write(live, dir = SPEC_DIR) {
  for (const v of specVersions(dir)) if (!(v in live)) unlinkSync(join(dir, `${v}.json`));
  for (const [v, doc] of Object.entries(live)) writeFileSync(join(dir, `${v}.json`), canonical(doc));
  return Object.keys(live).sort().reverse();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const live = await fetchLive();
  if (process.argv.includes('--check')) {
    const problems = diff(live);
    if (problems.length) {
      console.error('specs/ is out of sync with ' + LIVE_SPEC_URL + ':\n  ' + problems.join('\n  '));
      process.exit(1);
    }
    console.log(`specs/ in sync: ${Object.keys(live).join(', ')}`);
  } else {
    console.log('wrote ' + write(live).join(', '));
  }
}
