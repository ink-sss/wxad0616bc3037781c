# fix uniapp broadcast landscape collapsed video parity

## Goal

Make `uniapp-src` broadcast entry landscape collapsed-video state match the existing uni-h5 behavior: when the landscape video is collapsed, the page should show the H5-style purple collapsed header with only the fire/viewer count on the left and the restore button on the right, instead of retaining the Mini Program landscape title/top tool row shown in the current screenshot.

## What I already know

* The user explicitly wants a 1:1 copy of the uni-h5 collapsed interaction.
* Current work scope is `uniapp-src/`, not the root legacy Mini Program source and not `uniapp-src/dist/`.
* The current uniapp landscape stage is `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`.
* The H5 reference is `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/components/LiveLandscapeStage.vue`.
* The H5 stage does not render `landscape-navbar-placeholder`, and it renders `live-landscape-collapsed-header` as the first child of `interact-section` when `stageCollapsed` is true.
* The uniapp stage already has most collapsed-header markup and control SCSS, but its landscape navbar placeholder and `video-top` state can still leak Mini Program title/tools in collapsed state.

## Requirements

* In landscape collapsed state, hide the custom landscape navbar/title area so the H5 collapsed state is not preceded by `0604测试专用` / `直播间` title chrome from the page.
* In landscape collapsed state, destroy or fully remove the video top tool row rather than leaving it hidden via a Mini Program-fragile display state.
* Keep the collapsed header content aligned with H5: fire icon + `displayViewerCount` left, restore/collapse image button right.
* Preserve existing video mini-window behavior, including `visibility` hiding for the mini window and not reconnecting video unnecessarily.
* Do not alter portrait mode, normal landscape expanded state, root legacy Mini Program files, H5 source, or build output.

## Acceptance Criteria

* [ ] `LiveLandscapeStage.vue` collapsed state no longer renders the landscape navbar placeholder/title.
* [ ] `LiveLandscapeStage.vue` video top toolbar is not rendered while `stageCollapsed` is true.
* [ ] Static tests assert the collapsed header exists and the fragile collapsed toolbar/title behavior does not regress.
* [ ] Focused live style tests pass.

## Out of Scope

* Rebuilding the full live room layout.
* Changing live video playback, IM, products, lottery, payment, or share behavior.
* Editing root legacy Mini Program source or `/Users/apple/Desktop/code/live_h5`.

## Technical Notes

* Relevant specs read: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/directory-structure.md`, `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/guides/index.md`.
* `v-show` can be fragile in mp-weixin for mutually exclusive flex/display UI, per local component guidelines; use `v-if` for the collapsed toolbar boundary.
