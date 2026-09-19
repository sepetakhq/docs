// The committed OpenAPI documents, one per released API version, and the
// rules the other scripts and the site config share about them.
import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

export const SPEC_DIR = new URL('../specs/', import.meta.url).pathname;
export const LIVE_SPEC_URL = 'https://sepetak.com/openapi.json';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Versions on disk, newest first. The newest is the site's "current" API.
export function specVersions(dir = SPEC_DIR) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && DATE.test(f.slice(0, -5)))
    .map((f) => f.slice(0, -5))
    .sort()
    .reverse();
}

export function readSpec(version, dir = SPEC_DIR) {
  return JSON.parse(readFileSync(join(dir, `${version}.json`), 'utf8'));
}

// Canonical text for a document: what is written to disk and what is
// compared, so key order or whitespace from the server never counts as
// drift. Keys sorted at every level -- the same bytes Go's encoding/json
// emits for the platform's copy.
export function canonical(doc) {
  return JSON.stringify(sortKeys(doc), null, 2) + '\n';
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, sortKeys(v[k])]),
    );
  }
  return v;
}
