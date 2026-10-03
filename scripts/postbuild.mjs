#!/usr/bin/env node
// After `docusaurus build`: the machine-readable side of the site.
//
//   build/<route>.md       the Markdown source of every hand-written page,
//                          at its route plus .md (the home page is index.md)
//   build/api/reference.md the current API as plain Markdown, derived from
//                          the spec (Scalar renders /api in the browser, so
//                          there is no page source to mirror)
//   build/api.md           a pointer to api/reference.md, for the guessed URL
//   build/llms.txt         the index (llmstxt.org)
//   build/llms-full.txt    everything above in one file
//
// Routes and sources come from what Docusaurus itself resolved, not from a
// second walk of docs/, so a slug in front matter cannot desync the two.
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {readSpec, specVersions} from './specs.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SITE = 'https://docs.sepetak.com';

// Docusaurus leaves one JSON per doc under .docusaurus/.../default/, each
// naming its permalink, source file and sidebar position.
export function docRoutes(root = ROOT) {
  const dir = join(root, '.docusaurus/docusaurus-plugin-content-docs/default');
  if (!existsSync(dir)) throw new Error('run `docusaurus build` first');
  return (
    readdirSync(dir)
      .filter((f) => f.startsWith('site-docs-') && f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
      .filter((m) => m.permalink && m.source)
      // A metadata file can outlive its doc (the cache is not cleared on delete).
      .filter((m) => existsSync(join(root, m.source.replace(/^@site\//, ''))))
      .map((m) => ({
        permalink: m.permalink,
        title: m.title,
        description: m.description ?? '',
        file: m.source.replace(/^@site\//, ''),
        position: m.sidebarPosition ?? Infinity,
      }))
      // Reading order, as the sidebar shows it; permalink breaks ties.
      .sort((a, b) => a.position - b.position || a.permalink.localeCompare(b.permalink))
  );
}

// Front matter and MDX-only lines removed; the prose stays as written. A
// component that carries its words in `text` (CopyPrompt) keeps them as a
// fenced block, and site links point at the Markdown mirrors, so an agent
// reading one .md file can follow every link without landing on HTML.
export function toPlainMarkdown(src) {
  return (
    src
      .replace(/^---\n[\s\S]*?\n---\n/, '')
      .split('\n')
      .filter((l) => !/^import .* from ['"].*['"];?$/.test(l))
      .map((l) => {
        const c = l.trim().match(/^<[A-Z][A-Za-z]* .*\/>$/);
        if (!c) return l;
        const text = l.match(/\btext="([^"]*)"/);
        return text ? '```text\n' + text[1] + '\n```' : null;
      })
      .filter((l) => l !== null)
      .join('\n')
      .replace(/\(pathname:\/\/\//g, `(${SITE}/`)
      .replace(/\]\(\/([^)#\s]*)(#[^)\s]*)?\)/g, (_, path, hash = '') =>
        path === 'api' ? `](${SITE}/api/reference.md${hash})` : `](${SITE}/${path || 'index'}.md${hash})`,
      )
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

// The spec as Markdown: every operation, its summary, and the fields of its
// request and 200 response flattened to dotted paths -- the shape a model
// needs to write a correct call.
export function referenceMarkdown(spec) {
  const out = [`# Sepetak storefront API ${spec.info.version}`, '', spec.info.description, ''];
  out.push('Base URL: `https://<shop>.sepetak.com/api/v1`. Every error is the `Error` schema below.', '');
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(item)) {
      out.push(`## ${method.toUpperCase()} ${path}`, '');
      if (op.summary) out.push(op.summary, '');
      const req = op.requestBody?.content?.['application/json']?.schema;
      if (req) out.push('Request:', '', ...fieldLines(req), '');
      const res = op.responses?.['200']?.content?.['application/json']?.schema;
      if (res) out.push('Response 200:', '', ...fieldLines(res), '');
    }
  }
  for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
    out.push(`## Schema: ${name}`, '', ...fieldLines(schema), '');
  }
  return out.join('\n');
}

export function fieldLines(schema, prefix = '') {
  if (schema.type === 'object' && schema.properties) {
    return Object.entries(schema.properties).flatMap(([k, v]) =>
      fieldLines(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  if (schema.type === 'array') return fieldLines(schema.items ?? {}, `${prefix}[]`);
  const type = schema.format ? `${schema.type} (${schema.format})` : (schema.type ?? 'any');
  return [`- \`${prefix || '(body)'}\`: ${type}`];
}

export function llmsIndex(routes, current) {
  const home = routes.find((r) => r.permalink === '/');
  const guide = routes.filter((r) => r.permalink.startsWith('/guide'));
  const rest = routes.filter((r) => !r.permalink.startsWith('/guide') && r.permalink !== '/');
  const line = (r) => `- [${r.title}](${SITE}${r.permalink}.md)${r.description ? `: ${r.description}` : ''}`;
  return [
    '# Sepetak',
    '',
    "> Sepetak is a hosted storefront platform for Indonesian small shops. Each shop has a public storefront API at https://<shop>.sepetak.com/api/v1; a merchant's own site (headless) calls it from a domain registered to the shop. No API key.",
    '',
    '## Guide',
    '',
    ...(home ? [`- [Overview](${SITE}/index.md)${home.description ? `: ${home.description}` : ''}`] : []),
    ...guide.map(line),
    '',
    '## API reference',
    '',
    `- [Every operation and field, current version ${current}](${SITE}/api/reference.md)`,
    `- [OpenAPI 3.1 document](https://sepetak.com/openapi.json): \`?version=YYYY-MM-DD\` for an older shape; \`info.x-versions\` lists them`,
    '',
    '## Other',
    '',
    ...rest.map(line),
    `- [JavaScript client](https://www.npmjs.com/package/@sepetakhq/storefront-kit): the fetch layer the hosted templates use`,
    '',
  ].join('\n');
}

export function run(root = ROOT) {
  const build = join(root, 'build');
  const routes = docRoutes(root);
  const pages = [];
  for (const r of routes) {
    const md = toPlainMarkdown(readFileSync(join(root, r.file), 'utf8'));
    const target = join(build, r.permalink === '/' ? 'index.md' : `${r.permalink}.md`);
    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, md);
    pages.push({...r, md});
  }
  const [current] = specVersions();
  const reference = referenceMarkdown(readSpec(current));
  mkdirSync(join(build, 'api'), {recursive: true});
  writeFileSync(join(build, 'api/reference.md'), reference);
  writeFileSync(
    join(build, 'api.md'),
    `# Sepetak storefront API reference\n\nThe reference as Markdown is at ${SITE}/api/reference.md.\n`,
  );
  writeFileSync(join(build, 'llms.txt'), llmsIndex(routes, current));
  writeFileSync(
    join(build, 'llms-full.txt'),
    [
      llmsIndex(routes, current),
      ...pages.map((p) => `\n---\n\n<!-- ${SITE}${p.permalink} -->\n\n${p.md}`),
      '\n---\n\n' + reference,
    ].join('\n'),
  );
  return {pages: pages.length, current};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {pages, current} = run();
  console.log(`postbuild: ${pages} markdown mirrors, api/reference.md (${current}), llms.txt, llms-full.txt`);
}
