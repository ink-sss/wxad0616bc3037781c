# hide debug floating panels

## Goal

Hide user-visible debug floating panels in the uni-app source so normal Mini Program/H5 pages no longer show diagnostic overlays.

## What I already know

* User requested: "将调试浮窗都隐藏掉".
* Project default target is `uniapp-src`; root Mini Program source is reference-only unless explicitly requested.
* Visible debug overlays found in `uniapp-src/src`:
  * Live room IM debug float: `pages/broadcast/entry.vue` + `LiveImDebugFloat.vue`.
  * Live mini-window debug float: `components/live-mini-window.vue` + `useLiveMiniWindow.js`.
  * Invitation poster debug float: `pagesPlus/main/invitation/index.vue` + `debug.js`.
  * Live playback debug badge: `useLiveDisplayState.js` formats `videoDebugBadge`; it is a visible debug marker if rendered by stage components.

## Assumptions

* Keep internal debug data collection and copy helpers unless directly required to remove them; the immediate goal is hiding visible floating UI.
* Do not modify `uniapp-src/dist/` or root legacy Mini Program files.

## Requirements

* Debug floating panels must not render even if URL/storage debug flags are present.
* The fix should be narrowly scoped and avoid unrelated refactors.
* Existing runtime logic should remain intact where it may still be used for diagnostics or logging.

## Acceptance Criteria

* [ ] `rg` no longer finds visible debug float bindings that can render with `show=true` in `uniapp-src/src`.
* [ ] Focused source inspection confirms live room, mini-window, invitation debug panels are hidden.
* [ ] A relevant build/check is run, or any inability to run it is reported.

## Out of Scope

* Removing diagnostic helper code entirely.
* Modifying root legacy Mini Program source.
* Changing debug logging, socket snapshots, or poster generation behavior.

## Technical Notes

* CodeGraph is not initialized for this repository; local `rg`/file reads were used for literal debug overlay lookup.
* Relevant specs read: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/hook-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`.
