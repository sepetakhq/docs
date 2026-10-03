---
title: Versions
description: Each API version is a date. Old versions stay served; X-API-Version picks one.
sidebar_position: 7
---

# Versions

Each API version is a date. Old versions stay served; `X-API-Version` picks one. An unpinned request, or an empty header, gets the baseline.

- [Changelog](/changelog): what each version changed.
- [Reference](/api): the current version opens first; pick an older one in the document switcher.
- Spec for any version: `https://sepetak.com/openapi.json?version=YYYY-MM-DD`. `info.x-versions` lists them all. Without `?version`, you get the latest.

We change a response shape by cutting a new date. Under a date that has shipped, fields keep their names and types; we add, we do not rename or remove.

One exception: since 2026-09-09, `POST /checkout/draft` requires `phone` on every version, the baseline and unpinned requests included. A draft without one answers `400 bad_request`.

An unknown date, or `latest`, answers `400 unsupported_api_version`. A version scheduled for removal adds `Deprecation` and `Sunset` headers to its responses; none does today.
