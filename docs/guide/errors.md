---
title: Errors
description: One envelope for every error; message is Indonesian and safe to show.
sidebar_position: 4
---

# Errors

Every error is `{ "error": { "code", "message", "details" } }`. `message` is Indonesian and safe to show to the buyer.

```json
{
  "error": {
    "code": "plan_limit",
    "message": "Akses API belum termasuk paket toko ini.",
    "details": {"quota": "api_access", "plan": "tumbuh", "need": "write"}
  }
}
```

| Status · code                 | Meaning                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `403 plan_limit`              | Your plan does not cover this cross-origin request; `details.need` is `read` or `write` |
| `403 forbidden`               | Your origin is not one of the shop's domains                                            |
| `400 unsupported_api_version` | Unknown date; `details.supported` lists the served ones                                 |
| `400` on a code               | Wrong, expired or too many tries; the server gives one answer for all three             |
| `409`                         | The order already moved; reload it from `/orders/track/{token}`                         |
