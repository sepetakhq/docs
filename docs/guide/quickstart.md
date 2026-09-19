---
title: Quickstart
description: One fetch against the catalogue, pinned to an API version.
sidebar_position: 2
---

# Quickstart

```js
const BASE = 'https://<shop>.sepetak.com/api/v1';

const res = await fetch(`${BASE}/products?limit=12`, {
  headers: {'X-API-Version': '2026-09-09'},
  credentials: 'omit',
});
const {products} = await res.json();
```

Pin `X-API-Version` to the date you wrote against; that shape stays fixed. Without the header you get the baseline, `2026-09-05`. See [Versions](/guide/versions).

For a JavaScript site, the client our templates use ships as [`@sepetakhq/storefront-kit`](https://www.npmjs.com/package/@sepetakhq/storefront-kit): call `configureApi({ baseUrl })`, then each endpoint is one function with one error type.
