import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// One sidebar: the guide, in reading order. The API reference is Scalar's
// own page at /api (docusaurus.config.ts) and carries its own navigation.
const sidebars: SidebarsConfig = {
  guide: [
    'index',
    {
      type: 'category',
      label: 'Guide',
      collapsed: false,
      items: [
        'guide/access',
        'guide/quickstart',
        'guide/checkout',
        'guide/errors',
        'guide/limits',
        'guide/versions',
      ],
    },
    'changelog',
  ],
};

export default sidebars;
