import type * as Preset from '@docusaurus/preset-classic';
import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

import {readSpec, specVersions} from './scripts/specs.mjs';

// The site is static (Cloudflare Pages). Everything about the API comes from
// specs/<version>.json -- committed copies of what the platform serves at
// https://sepetak.com/openapi.json -- never from hand-written schemas. See
// scripts/spec-sync.mjs and CONTRIBUTING.md.
const versions = specVersions();
const [current] = versions;

// The reference renderer, pinned: what the site shows must not change under
// a review because a CDN moved. Bump deliberately, with the changelog.
const SCALAR_CDN = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.69.2';

const config: Config = {
  title: 'Sepetak Docs',
  tagline: 'Build your own storefront on a Sepetak shop.',
  favicon: 'img/favicon.svg',
  future: {v4: true},

  url: 'https://docs.sepetak.com',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'sepetakhq',
  projectName: 'docs',

  // A rename that leaves a dangling link is a build failure, not a 404.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},

  i18n: {defaultLocale: 'en', locales: ['en']},

  // Every page also exists as Markdown at the same path (scripts/postbuild.mjs).
  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'alternate', type: 'text/markdown', href: '/llms.txt', title: 'llms.txt'},
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/sepetakhq/docs/edit/main/',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // The API reference: every version's spec rendered by Scalar at /api,
    // newest selected, the others in its document switcher. The documents
    // are the committed copies, inlined at build -- what was reviewed is
    // what is shown.
    [
      '@scalar/docusaurus',
      {
        label: 'API reference',
        route: '/api',
        showNavLink: false,
        cdn: SCALAR_CDN,
        configuration: {
          sources: versions.map((v) => ({
            title: v === current ? `${v} (current)` : v,
            slug: v,
            content: readSpec(v),
            default: v === current,
          })),
          hideTestRequestButton: true,
          hideClientButton: true,
          showToolbar: 'never',
          showDeveloperTools: 'never',
          telemetry: false,
          // No Scalar promo in the sidebar: the MCP/agent buttons and badge.
          mcp: {disabled: true},
          // Code samples in the clients a merchant's site is actually written
          // in. Everything else is noise in a 20-language dropdown.
          hiddenClients: {
            c: true,
            r: true,
            rust: true,
            http: true,
            clojure: true,
            csharp: true,
            dart: true,
            fsharp: true,
            java: true,
            julia: true,
            kotlin: true,
            objc: true,
            ocaml: true,
            powershell: true,
            ruby: true,
            swift: true,
            shell: ['httpie', 'wget'],
            js: ['axios', 'jquery', 'ofetch', 'xhr'],
            node: ['axios', 'native', 'ofetch', 'undici'],
            php: ['laravel', 'http1.1', 'curl'],
            python: ['python3', 'aiohttp', 'httpx_sync', 'httpx_async'],
          },
          defaultHttpClient: {targetKey: 'shell', clientKey: 'curl'},
          // Scalar's own promo: the "Powered by" footer, the sidebar "Ask AI"
          // button and the "Ask AI Agent" box on every code sample. Class names
          // are Scalar's, so re-check them when SCALAR_CDN moves.
          customCss: [
            '.t-doc__sidebar .darklight-reference { display: none }',
            '.t-doc__sidebar button.bg-sidebar-b-search.whitespace-nowrap { display: none }',
            '.agent-button-container { display: none }',
          ].join(' '),
          documentDownloadType: 'json',
          servers: [{url: 'https://toko.sepetak.com/api/v1', description: 'Any host the shop answers on'}],
          theme: 'default',
          metaData: {title: 'API reference — Sepetak Docs'},
        },
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        docsRouteBasePath: '/',
        indexBlog: false,
      },
    ],
  ],

  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: 'sepetak docs',
      items: [
        {type: 'docSidebar', sidebarId: 'guide', position: 'left', label: 'Guide'},
        {to: '/api', label: 'API reference', position: 'left'},
        {to: '/changelog', label: 'Changelog', position: 'left'},
        {href: 'https://sepetak.com', label: 'sepetak.com', position: 'right'},
        {href: 'https://github.com/sepetakhq/docs', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'For machines',
          items: [
            {label: 'llms.txt', href: 'pathname:///llms.txt'},
            {label: 'llms-full.txt', href: 'pathname:///llms-full.txt'},
            {label: 'openapi.json', href: 'https://sepetak.com/openapi.json'},
          ],
        },
        {
          title: 'Sepetak',
          items: [
            {label: 'Sign in', href: 'https://sepetak.com/masuk'},
            {label: 'Sign up', href: 'https://sepetak.com/daftar'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Sepetak · Made in Indonesia`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
