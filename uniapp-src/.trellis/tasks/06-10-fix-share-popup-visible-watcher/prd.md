# Fix share popup visible watcher

## Goal

When the live-room share popup opens, `share-popup.vue` must run the same open logic that currently lives in the `props.visible` watcher, including refreshing the distributor share URL on every popup open.

## What I already know

* The user reports that the `watch(() => props.visible, ...)` callback in `uniapp-src/src/components/share-popup.vue` does not run when the share popup appears.
* `LivePortraitStage.vue` and `LiveLandscapeStage.vue` render the popup with `v-if="renderSharePopup"` and pass `:visible="showShare"`.
* `renderSharePopup` comes from `useDelayedRender(showShare)`, whose initial value is `Boolean(showShare.value)` and whose source watcher uses `{ immediate: true }`.
* On first open, `showShare` can already be `true` when `<share-popup>` is mounted, so a non-immediate watcher in the child sees `props.visible` as an initial true value rather than a changed value.

## Assumptions

* The intended behavior is to load `distributorShareUrl` on initial mount when `visible` is already true and on every later false-to-true open.
* No parent rendering behavior should be changed for this bug.

## Requirements

* Run the open branch of `share-popup.vue`'s visible watcher when the component mounts with `props.visible === true`.
* Preserve the existing close/reset behavior when `visible` becomes false.
* Keep the change narrowly scoped to the share popup behavior.

## Acceptance Criteria

* [ ] Opening the share popup after `showShare` toggles true calls `loadShareUrl()` even when the component is freshly mounted by `v-if`.
* [ ] Closing the popup still resets `activePanel`, link state, QR state, and loaded share URL/code.
* [ ] No unrelated live-room or popup behavior is changed.

## Definition of Done

* Focused source inspection confirms the parent `v-if` + child watcher timing issue is addressed.
* Run the smallest practical validation for this frontend change; prefer `npm run build:mp-weixin` from `uniapp-src` if feasible.

## Out of Scope

* Reworking `useDelayedRender` or popup architecture.
* Changing share URL API behavior or distributor permission logic.

## Technical Notes

* Relevant files: `uniapp-src/src/components/share-popup.vue`, `uniapp-src/src/pages/broadcast/components/LivePortraitStage.vue`, `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`.
* Relevant frontend specs: `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`.
