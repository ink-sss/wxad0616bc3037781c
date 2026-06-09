# Fix Uniapp Broadcast Entry Destroy Mini Window

## Goal

When `uniapp-src/src/pages/broadcast/entry.vue` is destroyed, secondary pages should no longer show the live mini window. The mini window is only valid while the broadcast entry page remains in the page stack and is merely hidden behind a secondary page.

## What I Already Know

* The user wants this behavior in the `uniapp-src` project.
* Secondary pages mount `LiveMiniWindow` from `uniapp-src/src/components/live-mini-window.vue`.
* The secondary mini window reads cached playback state from `uniapp-src/src/utils/live-mini-state.js`.
* `uniapp-src/src/pages/broadcast/composables/useLiveMiniWindow.js` writes that cached state from the broadcast entry page.
* `uniapp-src/src/pages/broadcast/composables/useLiveEntryLifecycle.js` currently calls `syncLiveMiniWindowState({ force: true })` in `onBeforeUnmount`, which can preserve mini-window state after entry destruction.
* CodeGraph is not available in this session: neither the repo root nor `uniapp-src/` contains a `.codegraph/` directory.

## Assumptions

* `onHide` should keep the existing behavior: navigating from the live room to an order/user/product secondary page may show the mini window.
* `onBeforeUnmount` means the entry page is leaving the page stack, so any cached mini-window playback state for that room should be cleared.
* Closing the mini window manually should keep existing behavior.

## Requirements

* Do not show the secondary-page mini window after `pages/broadcast/entry` has been destroyed.
* Preserve secondary-page mini-window behavior when `pages/broadcast/entry` is only hidden.
* Keep changes scoped to `uniapp-src/src/`.
* Do not modify root legacy mini-program source or `uniapp-src/dist/`.

## Acceptance Criteria

* [ ] Entry `onHide` still saves playback state for secondary-page mini window use.
* [ ] Entry `onBeforeUnmount` clears mini-window cached state for the current room instead of refreshing it.
* [ ] Secondary pages no longer restore/show a mini window from stale entry state after entry destruction.
* [ ] Relevant uni-app build or focused verification passes, or any inability to run it is documented.

## Out of Scope

* Redesigning the mini-window UI.
* Changing old root mini-program pages.
* Changing H5 source under `/Users/apple/Desktop/code/live_h5`.
* Reworking live playback initialization or stream selection.

## Technical Notes

* Relevant files inspected:
  * `uniapp-src/src/pages/broadcast/composables/useLiveEntryLifecycle.js`
  * `uniapp-src/src/pages/broadcast/composables/useLiveMiniWindow.js`
  * `uniapp-src/src/composables/useLiveMiniWindow.js`
  * `uniapp-src/src/utils/live-mini-state.js`
  * secondary page mounts under `uniapp-src/src/pages/order/` and `uniapp-src/src/pages/user/`
