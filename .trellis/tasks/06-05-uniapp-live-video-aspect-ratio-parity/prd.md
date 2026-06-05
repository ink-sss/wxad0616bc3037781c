# fix: uniapp live video aspect ratio parity

## Goal

Fix the mp-weixin broadcast room video rendering so the portrait live stage matches the H5 visual crop and does not show stretched or wrongly selected playback content.

## What I Already Know

- The user compared two screenshots: mp-weixin portrait live video is visibly distorted while H5 appears correctly cropped.
- H5 `LivePortraitStage.vue` uses a plain `video` with `object-fit="cover"`.
- uni-app mp-weixin portrait stage can render either `video` or `live-player`.
- `live-player` uses a different Mini Program-native object-fit contract than H5 `video`.
- Current uni-app source selection was recently changed to prefer `adaptiveHlsUrl`, while current H5 quality logic is `origin-first` unless adaptive HLS is explicitly active.

## Requirements

- Keep portrait `video` rendering equivalent to H5 cover behavior.
- Use a Mini Program-valid crop mode for portrait `live-player`.
- Do not let `adaptiveHlsUrl` override the selected origin/default stream unless it is the only viable HLS source.
- Keep edits scoped to `uniapp-src` broadcast source and focused playback tests.

## Acceptance Criteria

- [ ] mp-weixin compiled portrait `live-player` uses `object-fit="fillCrop"`.
- [ ] portrait video internal container remains full-size with cover crop.
- [ ] source selection tests confirm HLS/video is preferred in devtools but adaptive HLS does not override normal/default HLS when both exist.
- [ ] `npm run build:mp-weixin` passes from `uniapp-src/`.

## Technical Notes

- CodeGraph was not initialized for this repo, so local `rg`/file reads were used.
- H5 references:
  - `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/components/LivePortraitStage.vue`
  - `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/utils/live-source.js`
  - `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/composables/useLiveAdaptiveQuality.js`
- Uni-app source:
  - `uniapp-src/src/pages/broadcast/components/LivePortraitStage.vue`
  - `uniapp-src/src/pages/broadcast/styles/entry-portrait.scss`
  - `uniapp-src/src/pages/broadcast/utils/live-source.js`
  - `uniapp-src/src/pages/broadcast/composables/live-entry-initializer-helpers.js`
  - `uniapp-src/tests/live-playback-source.test.mjs`
