# fix broadcast complaint cover echo

## Goal

Fix the uni-app broadcast entry personal-center complaint/report flow so the current live room cover image is echoed on the complaint form.

## What I already know

* User reports `uniapp-src` page `pages/broadcast/entry` -> personal center -> complaint -> report form shows live name and ID, but the current live cover is blank.
* `uniapp-src/src/pagesPlus/main/report/report-form.vue` already renders `<image class="live-cover" :src="cover" />` and submits cover aliases.
* `report-home.vue`, `report-type.vue`, and `report-form.vue` only read `loadLiveRoomContext()` when ID/roomCode/fromPath are missing, so a missing cover is not recovered when ID/name are already present.
* `useLiveEntryInitializer.js` saves detail context after resolving `liveCover`, but only persists `cover`, not the other cover aliases expected by different consumers.

## Assumptions

* The expected behavior is to show the same cover currently used by the broadcast entry poster/live card.
* If route params contain no cover, report pages should recover it from the latest live-room context for the same room.

## Requirements

* Preserve existing report form layout and complaint submit payload.
* Add cover fallback without changing unrelated report, order, login, or share flows.
* Keep compatibility with `cover`, `liveCover`, `coverImage`, and snake_case aliases.

## Acceptance Criteria

* [ ] Opening complaint report from broadcast entry can display the current live cover when `liveId` and name already exist.
* [ ] Cover aliases are normalized in the shared live room context helper.
* [ ] Targeted live-entry tests pass.

## Out of Scope

* Redesigning complaint/report UI.
* Changing backend complaint API contracts.
* Modifying legacy root mini-program source or `/Users/apple/Desktop/code/live_h5`.

## Technical Notes

* Relevant files: `uniapp-src/src/utils/live-room-context.js`, `uniapp-src/src/pages/broadcast/composables/useLiveEntryInitializer.js`, `uniapp-src/src/pagesPlus/main/report/report-home.vue`, `report-type.vue`, `report-form.vue`.
* `CodeGraph` is not initialized for this repository in the current session, so local `rg`/file reads were used.
