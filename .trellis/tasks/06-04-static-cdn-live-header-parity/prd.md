# implement: static cdn and live header parity

## Goal

Unify uni-app static resource usage on `https://man.lqjy.cc/static` after mirroring the source assets into the H5 project's `src/static`, and align the live/replay portrait header hot-count and complaint entry with the H5 implementation without changing warm-up video playback behavior.

## What I already know

* The H5 static root is `/Users/apple/Desktop/code/live_h5/src/static`, published as `https://man.lqjy.cc/static`.
* `uniapp-src/src/env/config.js` currently uses `pic_url: "https://cos.images.guankeyun.net"` and `font_url: "https://at.alicdn.com/t/c/font_4197023_cp26qx5fd6.ttf?t=1703641583677"`.
* Runtime static domains found in `uniapp-src/src` are `cos.images.guankeyun.net`, `at.alicdn.com`, `weilive.yukelive.com`, and `nyfs-oss.bcvdata.com`.
* API/test/non-static domains must not be rewritten as static assets.

## Requirements

* Mirror required remote static files into `/Users/apple/Desktop/code/live_h5/src/static` before replacing references.
* Add a unified static base in uni-app config and keep `pic_url` compatible.
* Replace uni-app runtime static resource references so they resolve to `https://man.lqjy.cc/static/...` and never create `/static/static/...`.
* Replace local `uniapp-src` static image/font references used at runtime with CDN URLs after confirming the assets exist under the H5 static root.
* Copy H5 portrait live header behavior for hot count and complaint entry into the uni-app broadcast portrait stage.
* Do not modify warm-up video playback, wait-state branching, stream URL selection, or video event handling.

## Acceptance Criteria

* [ ] Required mirrored files exist in H5 `src/static` and are non-empty.
* [ ] `uniapp-src/src` no longer references `cos.images.guankeyun.net`, `at.alicdn.com`, `weilive.yukelive.com`, or `nyfs-oss.bcvdata.com`.
* [ ] `uniapp-src/src` does not contain `https://man.lqjy.cc/static/static/`.
* [ ] Live/replay portrait header shows H5-style hot count and complaint entry.
* [ ] Complaint click continues to open the existing complaint flow.
* [ ] Warm-up video behavior is unchanged.

## Definition of Done

* `npm run test:live-entry-bootstrap` passes in `uniapp-src`.
* `npm run build:mp-weixin` passes in `uniapp-src`.
* Static reference scans pass.
* Changes are limited to source/static/task files needed for this work.

## Out of Scope

* Removing `uniapp-src/src/static` from the repository.
* Rewriting dynamic backend image URLs, user uploads, product images, live covers, or video stream URLs.
* Reworking the complaint API or warm-up video/player architecture.

## Technical Notes

* H5 reference for the header: `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/components/LivePortraitStage.vue`.
* Uni-app target: `uniapp-src/src/pages/broadcast/components/LivePortraitStage.vue`.
* Non-static domains to leave alone include `https://api.guankeyun.net`, `https://man.lqjy.cc/api`, WeChat SDK/auth URLs, payment URLs, debug/test URLs, and SVG XML namespaces.
