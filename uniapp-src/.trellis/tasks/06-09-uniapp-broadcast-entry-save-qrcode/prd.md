# fix uniapp broadcast entry save qrcode

## Goal

Fix the `uniapp-src` live-room share popup so the "保存二维码" action in `pages/broadcast/entry` works in the WeChat Mini Program path, and so long-pressing the QR image uses WeChat's native image menu.

## What I already know

* The user reported that `uniapp-src` `pages/broadcast/entry` "保存二维码" button and long press both do nothing.
* The live-room entry page renders `uniapp-src/src/components/share-popup.vue`.
* The QR panel currently renders a remote image from `https://api.qrserver.com/...`.
* Clicking save calls `saveImageUrlToAlbum` from `uniapp-src/src/platform/weixin/file.js`.
* The image node has `@longpress="saveQrcode"` but does not enable the WeChat Mini Program native long-press image menu.
* The existing platform file helper has no album permission recovery when `saveImageToPhotosAlbum` is denied.
* Old Mini Program poster saving writes a local file first and opens settings when album permission is denied.

## Assumptions

* We should keep the existing no-QR-library approach to avoid increasing the live-room main package.
* The fix should stay in `uniapp-src`, using root Mini Program sources only as behavior reference.
* High-risk WeChat APIs should remain behind `src/platform/weixin/`.

## Requirements

* In the QR-code panel, long pressing the QR image should trigger the Mini Program native image menu where supported.
* Clicking "保存二维码" should keep using the shared platform helper and surface album permission recovery when needed.
* Existing H5/other-platform behavior should not regress.

## Acceptance Criteria

* [ ] `share-popup.vue` enables the WeChat Mini Program long-press image menu for the QR image.
* [ ] `saveImageUrlToAlbum` can prompt/open settings when album permission is denied.
* [ ] `npm run build:mp-weixin` passes from `uniapp-src/`.

## Out of Scope

* Reintroducing the `qrcode` npm package to the live-room main package.
* Changing invitation poster design or unrelated share flows.
* Editing root legacy Mini Program source.

## Technical Notes

* Relevant files: `uniapp-src/src/components/share-popup.vue`, `uniapp-src/src/platform/weixin/file.js`.
* Reference: root legacy `pages/live/commponents/share-live.js` opens settings after album auth denial.
