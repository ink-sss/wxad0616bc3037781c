# Use miniProgramQrCode for distributor share QR

## Goal

When `/h5/live/distributorShareUrl` returns a non-empty `miniProgramQrCode`, use that base64 QR image everywhere the distributor share QR is shown or embedded. Fall back to the existing generated QR behavior when the field is missing.

## What I already know

* The distributor share popup calls `getLiveDistributorShareUrl(roomId)` from `uniapp-src/src/api/live.js`.
* The existing popup stores returned `shareUrl/shareCode`, then generates QR images from the final share link.
* The invitation page receives share data via `invitation_payload` in storage.
* The invitation poster canvas currently draws a QR matrix from `qrcodeText`.

## Requirements

* Read `miniProgramQrCode` and `mini_program_qr_code` from `/h5/live/distributorShareUrl`.
* Support both raw base64 and `data:image/...;base64,...` formats.
* Prefer `miniProgramQrCode` over locally generated QR and remote QR image URLs.
* Pass the preferred QR image through `invitation_payload`.
* Use the preferred QR image in invitation preview and poster canvas.
* Keep existing share URL, `shareCode`, replay parameters, and attribution behavior unchanged.
* Preserve current fallback behavior for non-distributor users, interface failures, or missing `miniProgramQrCode`.

## Acceptance Criteria

* [ ] Distributor QR popup displays and saves `miniProgramQrCode` when returned.
* [ ] Invitation preview uses `miniProgramQrCode` when present.
* [ ] Invitation generated poster draws `miniProgramQrCode` when present.
* [ ] Existing generated QR fallback still works when `miniProgramQrCode` is empty.
* [ ] Replay link parameters and share attribution are not changed.

## Definition of Done

* Minimal relevant code changes under `uniapp-src`.
* Run a focused static/build check where practical.
* Document any verification that cannot be run locally.

## Out of Scope

* Changing backend interfaces beyond consuming the new field.
* Changing ordinary non-distributor share behavior.
* Reworking invitation poster cache/performance beyond what is required for this QR source.

## Technical Notes

* Main files: `uniapp-src/src/components/share-popup.vue`, `uniapp-src/src/pagesPlus/main/invitation/index.vue`, `uniapp-src/src/pagesPlus/main/invitation/poster.js`.
* Existing helper `writeBase64ImageToTempFile` can convert data URLs for mini-program saving/display.
