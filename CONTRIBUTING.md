# Contributing

## Adding or changing a guide page

1. Add `docs/guide/<name>.md` with front matter: `title`, `description` (one sentence; it lands in `llms.txt` and search), `sidebar_position`.
2. Add its id to `sidebars.ts` under `guide`, in reading order.
3. Link with site-absolute paths (`/guide/errors`), not relative files; the build fails on a broken link.
4. Keep the page short. State rules the server enforces; put explanations in the reference, where the shape is.
5. `npm run lint && npm run build`.

## When the API changes

The platform is the source of truth. After it deploys:

```sh
npm run spec:sync && npm run generate
```

Review the diff in `specs/`; that diff is the change. Commit it. When the platform cut a new version, `docs/changelog.md` gains a section from the version's `x-changes`, with nothing to write by hand.

Wording of an operation (its title, sentence, group) comes from the platform's generator, not from this repo. Fix it there.

## Rules

- Never edit `docs/changelog.md`: regenerated on every build. The reference has no source here at all; it is `specs/` rendered by Scalar, pinned by version in `docusaurus.config.ts`.
- Never hand-write a schema. If the reference is wrong, the spec is wrong.
- Components stay on the index page. Every other page is plain Markdown so its `.md` mirror reads cleanly for agents.
- `main` deploys. Open a PR; CI is the gate.
