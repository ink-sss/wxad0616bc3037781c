# fix: uniapp broadcast landscape navbar title

## Goal

Add a centered title to the landscape navigation area of `uniapp-src/src/pages/broadcast/entry`, matching the title value used by the H5 live entry.

## What I Already Know

* The user wants the `pages/broadcast/entry` landscape style navbar to show a centered title.
* H5 `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/composables/useLiveEntryInitializer.js` sets `liveName` from entry options first, then updates it from live detail `d.roomName`.
* The current uni-app initializer already resolves the live detail title from `roomName`, `room_name`, `liveName`, `live_name`, `title`, then falls back to the existing `liveName`.
* `LiveLandscapeStage.vue` already receives `liveName` through stage state props.

## Requirements

* Show the landscape navbar title only for the live landscape visual style.
* Use the current `liveName` value so the field priority remains aligned with H5 while preserving uni-app's broader fallback handling.
* Keep the title centered and ellipsized without blocking the existing left status/anchor area or right tool group.

## Acceptance Criteria

* [ ] Landscape live navigation contains a centered title using `liveName`.
* [ ] Missing `liveName` falls back to `直播间`.
* [ ] Existing left status/anchor controls and right tool group remain clickable.
* [ ] Focused live style verification passes or any blocker is documented.

## Out of Scope

* Do not change root legacy mini-program files.
* Do not change H5 source files.
* Do not alter live detail API field mapping beyond using the existing uni-app `liveName`.

## Technical Notes

* CodeGraph is not initialized for this project; used `rg` and direct file reads for this narrow task.
* Relevant files:
  * `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`
  * `uniapp-src/src/pages/broadcast/styles/entry-landscape-live.scss`
  * `uniapp-src/src/pages/broadcast/composables/useLiveEntryInitializer.js`
  * `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/composables/useLiveEntryInitializer.js`
