---
title: Versions
description: Each API version is a date. Old versions stay served; X-API-Version picks one.
sidebar_position: 6
---

# Versions

Each API version is a date. Old versions stay served; `X-API-Version` picks one. An unpinned request gets the baseline, which never changes.

- What each version changed: [Changelog](/changelog).
- The reference for the current version is at [/api](/api); older versions have their own pages, linked from the changelog.
- The spec for any version: `https://sepetak.com/openapi.json?version=YYYY-MM-DD`; `info.x-versions` lists them all.

A response shape only ever changes by cutting a new date. A field is never renamed or removed under a date that has shipped.
