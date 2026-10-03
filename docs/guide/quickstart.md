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

## Listing products

`GET /products` takes:

- `limit` (default 24, at most 60) and `offset`
- `sort`: `featured` (default), `priceAsc`, `priceDesc` or `nameAsc`; anything else answers `400`
- `cat`, `tag` and `q` to filter; `on_sale=1` keeps what is discounted right now

The response has no total. A page shorter than `limit` is the last one.

## Images and countdowns

Use `image` as `src` and `image_srcset` as `srcset`. `image_srcset` can be empty. So can `image`, when the product has no usable photo: render a placeholder.

A sale counts down to `ends_at`. Correct the device clock with `server_time` from `GET /storefront/home`: a page on another origin cannot read the `Date` header.

## Using the kit

For a JavaScript site, the client our templates use ships as [`@sepetakhq/storefront-kit`](https://www.npmjs.com/package/@sepetakhq/storefront-kit). Import `configureApi` from `@sepetakhq/storefront-kit/api/client` and call `configureApi({ baseUrl: BASE })`. Each endpoint in `@sepetakhq/storefront-kit/api/endpoints` is one function, throws one `ApiError` type, and pins `X-API-Version` for you.
