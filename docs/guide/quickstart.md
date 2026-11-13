---
title: Quickstart
description: One fetch against the catalogue, pinned to an API version.
sidebar_position: 2
---

# Quickstart

```js
const BASE = 'https://<shop>.sepetak.com/api/v1';

const res = await fetch(`${BASE}/products?limit=12`, {
  headers: {'X-API-Version': '2026-10-20'},
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

## Rentals

A rental is booked on the shop's booking page, never bought: rental products stay off `/products`, product pages, the sitemap and checkout. `GET /storefront/rentals` lists what renters can book online as `{book_url, items}`. Each item has `name`, the image fields, `from_price` (the cheapest price), `from_label` (its length, such as `12 jam`) and its own `book_url`, which opens the booking page with that item picked.

Link to the `book_url`s; never put an item in a cart. An empty `items` means the shop takes no online bookings or has nothing to book, so draw no section. The heading and button words are `brand.section_copy.rentals_title` and `rental_button` in `/storefront/config`; empty means your own default.

## Images and countdowns

Use `image` as `src` and `image_srcset` as `srcset`. `image_srcset` can be empty. So can `image`, when the product has no usable photo: render a placeholder.

A sale counts down to `ends_at`. Correct the device clock with `server_time` from `GET /storefront/home`: a page on another origin cannot read the `Date` header.

## Using the kit

For a JavaScript site, the client our templates use ships as [`@sepetakhq/storefront-kit`](https://www.npmjs.com/package/@sepetakhq/storefront-kit). Import `configureApi` from `@sepetakhq/storefront-kit/api/client` and call `configureApi({ baseUrl: BASE })`. Each endpoint in `@sepetakhq/storefront-kit/api/endpoints` is one function, throws one `ApiError` type, and pins `X-API-Version` for you. `useRentals()` in `hooks/queries` reads the rentals list, and `rentalLine(item)` in `shared/format` writes its price line: `Sewa mulai Rp 350.000 / 12 jam`.
