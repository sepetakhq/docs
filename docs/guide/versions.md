---
title: Versions
description: Each API version is a date. Old versions stay served; X-API-Version picks one.
sidebar_position: 6
---

# Versions

Each API version is a date. Old versions stay served; `X-API-Version` picks one. An unpinned request gets the baseline, which stays fixed.

- [Changelog](/changelog): what each version changed.
- [Reference](/api): the current version opens first; pick an older one in the document switcher.
- Spec for any version: `https://sepetak.com/openapi.json?version=YYYY-MM-DD`. `info.x-versions` lists them all.

We change a response shape by cutting a new date. Under a date that has shipped, fields keep their names and types; we add, we do not rename or remove.
