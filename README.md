# Sepetak docs

The source of [docs.sepetak.com](https://docs.sepetak.com): how to build a storefront on a Sepetak shop with the storefront API. Docusaurus for the guide, [Scalar](https://scalar.com) for the reference at `/api` (rendered in the browser from the committed specs, pinned CDN version), static, deployed by Cloudflare Pages on every push to `main`.

## What is where

| Path                                                                               | What                                                                                              | Edited by           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| `docs/index.md`, `docs/guide/*.md`                                                 | The guide                                                                                         | hand                |
| `specs/<version>.json`                                                             | The OpenAPI document per API version, copied from `https://sepetak.com/openapi.json`              | `npm run spec:sync` |
| `docs/changelog.md`                                                                | What each version changed (`info.x-changes`)                                                      | `npm run generate`  |
| `build/**/*.md`, `build/llms.txt`, `build/llms-full.txt`, `build/api/reference.md` | The site for machines: every page as Markdown at its route plus `.md`, plus the index agents read | `npm run build`     |

Nothing about the API's shape is written here by hand. The platform generates the spec from its own types; this repo renders it. If the reference is wrong, the fix is in the platform.

## Working on it

```sh
npm ci
npm start            # generates, then http://localhost:3000
npm run build        # what Cloudflare Pages runs; output in build/
npm test             # the scripts
npm run lint         # prettier + markdownlint on hand-written pages
```

When the platform releases a new API version:

```sh
npm run spec:sync    # pulls every version sepetak.com serves into specs/
npm run generate     # regenerates the changelog
git add specs docs && git commit
```

CI fails when `specs/` differs from the live API or when the changelog is stale, so a spec change always lands as a reviewable diff.

## Versions

`X-API-Version: YYYY-MM-DD`. Every served version is in the reference's document switcher at `/api`, newest selected; a deep link carries the version in its hash (`/api#2026-09-05/...`). See [Versions](https://docs.sepetak.com/guide/versions) and the [Changelog](https://docs.sepetak.com/changelog).

## For AI agents

`https://docs.sepetak.com/llms.txt` is the index; every guide page exists as Markdown at its URL plus `.md` (the home page is `/index.md`); `/api/reference.md` is the whole current API as plain Markdown; the OpenAPI document itself is served by the platform at `https://sepetak.com/openapi.json`.

## License

MIT.
