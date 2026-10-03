import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';

import {render} from './changelog.mjs';
import {fieldLines, llmsIndex, referenceMarkdown, toPlainMarkdown} from './postbuild.mjs';
import {diff, fetchLive, write} from './spec-sync.mjs';
import {canonical, specVersions} from './specs.mjs';

const doc = (version, extra = {}) => ({
  openapi: '3.1.0',
  info: {version, 'x-versions': ['2026-09-05', '2026-09-09'], 'x-changes': [], ...extra},
  paths: {},
});

function tmpSpecs(docs) {
  const dir = mkdtempSync(join(tmpdir(), 'specs-')) + '/';
  for (const [v, d] of Object.entries(docs)) writeFileSync(join(dir, `${v}.json`), canonical(d));
  return dir;
}

test('specVersions lists dated files newest first and ignores the rest', () => {
  const dir = tmpSpecs({'2026-09-05': doc('2026-09-05'), '2026-09-09': doc('2026-09-09')});
  writeFileSync(join(dir, 'notes.json'), '{}');
  assert.deepEqual(specVersions(dir), ['2026-09-09', '2026-09-05']);
});

test('canonical sorts keys at every level, so origin never counts as drift', () => {
  assert.equal(
    canonical({b: 1, a: {d: [{z: 1, y: 2}], c: 2}}),
    canonical({a: {c: 2, d: [{y: 2, z: 1}]}, b: 1}),
  );
});

test('fetchLive asks for the latest, then every version it names', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const v = new URL(url).searchParams.get('version') ?? '2026-09-09';
    return {ok: true, json: async () => doc(v)};
  };
  const live = await fetchLive(fetchImpl, 'https://x.test/openapi.json');
  assert.deepEqual(Object.keys(live), ['2026-09-05', '2026-09-09']);
  assert.deepEqual(calls, [
    'https://x.test/openapi.json',
    'https://x.test/openapi.json?version=2026-09-05',
    'https://x.test/openapi.json?version=2026-09-09',
  ]);
  await assert.rejects(
    fetchLive(async () => ({ok: false, status: 503}), 'https://x.test/o'),
    /HTTP 503/,
  );
});

test('diff names what is missing, changed and retired; write makes it empty', () => {
  const dir = tmpSpecs({'2026-09-05': doc('2026-09-05'), '2026-08-01': doc('2026-08-01')});
  const live = {'2026-09-05': doc('2026-09-05', {title: 'changed'}), '2026-09-09': doc('2026-09-09')};
  assert.deepEqual(diff(live, dir), [
    'changed: 2026-09-05',
    'missing locally: 2026-09-09 (run spec:sync)',
    'retired upstream: 2026-08-01 (delete specs/2026-08-01.json)',
  ]);
  assert.deepEqual(write(live, dir), ['2026-09-09', '2026-09-05']);
  assert.deepEqual(diff(live, dir), []);
  assert.equal(readFileSync(join(dir, '2026-09-05.json'), 'utf8'), canonical(live['2026-09-05']));
});

test('changelog renders newest first, marks current and baseline, links each reference', () => {
  const read = (v) =>
    v === '2026-09-09' ? doc(v, {'x-changes': ['checkout draft requires a buyer phone']}) : doc(v);
  const md = render(['2026-09-09', '2026-09-05'], read);
  assert.match(md, /## 2026-09-09 \(current\)\n\n- checkout draft requires a buyer phone/);
  assert.match(md, /## 2026-09-05\n\n- Baseline\./);
  assert.match(md, /\[2026-09-09\]\(\/api\)/);
  assert.match(md, /\[2026-09-05\]\(\/api\)/);
  assert.match(md, /GENERATED/);
});

test('toPlainMarkdown drops front matter and MDX lines, keeps prose', () => {
  const src =
    '---\ntitle: X\n---\n\nimport C from "@site/c";\n\n# X\n\n<D />\n<C text="y" />\n\nBody `code`.\n';
  assert.equal(toPlainMarkdown(src), '# X\n\n```text\ny\n```\n\nBody `code`.\n');
});

test('toPlainMarkdown points site links at the Markdown mirrors', () => {
  const md = toPlainMarkdown(
    '[A](/guide/access) [R](/api) [H](/) [S](/guide/limits#codes) [L](pathname:///llms.txt) [X](https://x.test/a)\n',
  );
  assert.equal(
    md,
    '[A](https://docs.sepetak.com/guide/access.md) [R](https://docs.sepetak.com/api/reference.md) ' +
      '[H](https://docs.sepetak.com/index.md) [S](https://docs.sepetak.com/guide/limits.md#codes) ' +
      '[L](https://docs.sepetak.com/llms.txt) [X](https://x.test/a)\n',
  );
});

test('reference flattens request and response fields with dotted paths', () => {
  const spec = {
    info: {version: '2026-09-09', description: 'D'},
    paths: {
      '/checkout/draft': {
        post: {
          summary: 'Create draft',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {type: 'array', items: {type: 'object', properties: {qty: {type: 'integer'}}}},
                  },
                },
              },
            },
          },
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {type: 'object', properties: {expires_at: {type: 'string', format: 'date-time'}}},
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {type: 'object', properties: {error: {type: 'object', properties: {code: {type: 'string'}}}}},
      },
    },
  };
  const md = referenceMarkdown(spec);
  assert.match(md, /## POST \/checkout\/draft\n\nCreate draft\n\nRequest:\n\n- `items\[\]\.qty`: integer/);
  assert.match(md, /Response 200:\n\n- `expires_at`: string \(date-time\)/);
  assert.match(md, /## Schema: Error\n\n- `error\.code`: string/);
  assert.deepEqual(fieldLines({type: 'object', additionalProperties: true}), ['- `(body)`: object']);
});

test('llms index groups guide pages, the reference and the rest', () => {
  const routes = [
    {permalink: '/', title: 'Home', description: ''},
    {permalink: '/guide/access', title: 'Access', description: 'No key.'},
    {permalink: '/changelog', title: 'Changelog', description: 'Changes.'},
  ];
  const txt = llmsIndex(routes, '2026-09-09');
  assert.match(txt, /\n- \[Access\]\(https:\/\/docs\.sepetak\.com\/guide\/access\.md\): No key\./);
  assert.match(txt, /current version 2026-09-09\]\(https:\/\/docs\.sepetak\.com\/api\/reference\.md\)/);
  assert.match(txt, /## Other\n\n- \[Changelog\]/);
  assert.doesNotMatch(txt, /Home/);
});

test('llms index opens the guide with the home page and keeps the given order', () => {
  const routes = [
    {permalink: '/', title: 'Home', description: 'Start here.'},
    {permalink: '/guide/quickstart', title: 'Quickstart', description: ''},
    {permalink: '/guide/checkout', title: 'Checkout', description: ''},
  ];
  const txt = llmsIndex(routes, '2026-09-09');
  assert.match(
    txt,
    /## Guide\n\n- \[Overview\]\(https:\/\/docs\.sepetak\.com\/index\.md\): Start here\.\n- \[Quickstart\][^\n]*\n- \[Checkout\]/,
  );
});
