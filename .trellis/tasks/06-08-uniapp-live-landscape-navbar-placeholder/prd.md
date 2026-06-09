# fix uniapp live landscape navbar placeholder

## Goal

Align the uni-app broadcast landscape live room with the H5 reference: landscape mode must reserve a white navigation/status-bar placeholder above the video, so the video starts below the device top area instead of being flush with the notch/status area.

## What I already know

- The user provided screenshots: H5 has a white top placeholder; current uni-app landscape mode starts video at the top edge.
- The target source is `uniapp-src`, not root legacy Mini Program output or `uniapp-src/dist`.
- `uniapp-src/src/pages/broadcast/entry.vue` already computes `broadcastNavHeight` through `getCustomNavBarHeightStyle()`.
- Portrait stage already uses `--broadcast-nav-height`; landscape stage currently does not.
- The landscape stage root is `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`.
- Landscape styles are under `uniapp-src/src/pages/broadcast/styles/entry-landscape*.scss`.

## Assumptions

- The placeholder should be visible in landscape mode only, white, and should occupy the existing custom navigation height.
- The video height should remain stable; the page gets an extra top spacer rather than shrinking the player.
- Collapsed mini-window and fake fullscreen states should not gain the top spacer inside the floating/fullscreen player.

## Requirements

- Add a top navigation placeholder to landscape broadcast mode.
- The placeholder background must be white.
- The landscape video section must render below the placeholder in the normal, non-fullscreen state.
- Reuse existing navigation-height state where possible.
- Do not modify root legacy Mini Program files or generated `dist`.
- Scope the follow-up fixes to landscape live style only (`.live-room--live.live-landscape.live-landscape--live`).
- Keep the live status badge inside the video area after the white navigation placeholder is present.
- Review and fix other landscape-live absolute/fixed positioning that still assumes the video starts at page top.
- Match the H5 landscape live input bar style and icons one-to-one, using Mini Program-safe CDN assets.
- Compute the landscape comment area height from viewport, nav placeholder, video, tabs, and bottom bar height instead of relying only on flex collapse.

## Acceptance Criteria

- [ ] `LiveLandscapeStage.vue` exposes `--broadcast-nav-height` to landscape styles.
- [ ] Landscape mode has a white top placeholder matching `--broadcast-nav-height`.
- [ ] Video remains 750rpx by 422rpx in normal landscape layout.
- [ ] Fake fullscreen and collapsed mini-window behavior are not offset by the placeholder.
- [ ] Landscape live status badge renders at `nav height + video top offset`, not inside the white nav placeholder.
- [ ] Landscape live lottery/comment floating tools account for the nav placeholder.
- [ ] Landscape live input bar matches the H5 dimensions, spacing, icon backgrounds, and like badge placement.
- [ ] Landscape live comment area height is a CSS calc using `--broadcast-nav-height`, video height, tab height, and measured bottom bar height.
- [ ] `npm run build:mp-weixin` passes, or any failure is documented.

## Definition of Done

- Source changes are scoped to `uniapp-src`.
- Minimal verification is run from `uniapp-src/`.
- No unrelated dirty files are reverted or reformatted.

## Out of Scope

- Changing root legacy Mini Program pages.
- Redesigning the landscape live UI beyond the top placeholder.
- H5 code changes.

## Technical Notes

- H5 source is only a visual reference for the top white placeholder behavior.
- CodeGraph was unavailable because the project is not initialized for this session, so local `rg`/file reads were used for this small layout change.
