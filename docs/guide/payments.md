---
title: Payments
description: What to render for each payment kind, how to reopen a charge, and how a buyer reports a manual transfer.
sidebar_position: 4
---

# Payments

The buyer picks a method from `commerce.payment_methods` in `GET /storefront/config`: send its `code` as `payment_method` in the draft and show its `name` as given. A merchant's own bank slots arrive already named, for example `Transfer SeaBank`. A method the platform has a badge for carries `logo_url`, an SVG you can draw with `name` as its alt text. Bank slots never have one, so fall back to `name` when it is missing. Use the URL as given: it carries a version, and the file behind it never changes.

The verify answer and `GET /orders/track/{token}` carry a `payment`. Branch on `payment.kind` and show `payment.amount` exactly: for manual methods other than WhatsApp it includes `order.unique_code`, which is how the merchant tells one transfer from another.

| `kind`            | Render                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `qr`              | Encode `qr_payload` as a QR code                                                                     |
| `qr_image`        | Show the image at `qr_image_url`; do not encode the URL                                              |
| `va`              | `va_bank` and `va_number`                                                                            |
| `redirect`        | Send the buyer to `redirect_url`                                                                     |
| `manual_transfer` | `manual_bank`, `manual_account_number`, `manual_account_holder`                                      |
| `manual_qris`     | Show the image at `manual_qr_image_url`; ask for the exact `amount`                                  |
| `manual_whatsapp` | Build a `wa.me` link to `manual_whatsapp_phone` (bare `62…` digits) and compose the message yourself |

`expires_at` is the payment deadline when there is one. Treat an unknown kind as a new value and fall back to your order page.

## No payment, or an empty kind

The order exists even when its charge did not open: `payment` is missing, or its `kind` is empty. Call `POST /orders/track/{token}/payment` with no body to open it again. It answers `{payment}`, returns the open charge when one is still payable, and allows five calls per order per hour. Its refusals (`payment_in_progress`, `payment_window_closing` and others) are in [Errors](/guide/errors).

## Manual methods

The `manual_*` kinds have no gateway: the merchant confirms the money against their own account. When the buyer says they paid, call `POST /orders/track/{token}/payment/claim` with no body. It answers `{order, payment}` like tracking, sets `buyer_claimed_at`, and extends the payment deadline once by 24 hours. The status changes when the merchant confirms. Repeating the claim changes nothing; a non-manual order, or one no longer awaiting payment, answers `409 conflict`.
