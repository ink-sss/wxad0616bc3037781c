# Remove uniapp debug floating panels

## Goal

Remove visible debug floating panels from the `uniapp-src` user interface while preserving internal diagnostics that are still used by live-room and invitation-poster flows.

## What I already know

* The active project is `uniapp-src`, not the legacy root Mini Program source.
* Visible debug floating UI currently appears in the live broadcast entry, the cross-page live mini-window, and the invitation page.
* Internal debug event recording is still used by playback, IM/WebSocket, and invitation poster rendering code.

## Requirements

* Remove the broadcast live debug float from `src/pages/broadcast/entry.vue`.
* Remove the live mini-window debug float from `src/components/live-mini-window.vue`.
* Remove the invitation debug float from `src/pagesPlus/main/invitation/index.vue`.
* Keep non-UI debug state/event recording when existing business logic depends on it.
* Update focused tests that currently assert the removed floating UI exists.

## Acceptance Criteria

* [ ] Searching `uniapp-src/src` no longer finds visible debug float component tags/classes/titles.
* [ ] Focused tests for live mini-window and invitation poster debug behavior pass after being updated.
* [ ] A minimal build/test check is run, or any inability to run it is documented.

## Out of Scope

* Removing all diagnostic state from IM/WebSocket/playback/poster internals.
* Editing `uniapp-src/dist/`.
* Editing the legacy root Mini Program source or `/Users/apple/Desktop/code/live_h5`.

## Technical Notes

* `src/pages/broadcast/components/LiveImDebugFloat.vue` and `src/components/live-mini-debug-float.vue` are floating debug UI components.
* `src/pagesPlus/main/invitation/debug.js` provides both the previous float state and useful poster debug event/report helpers.
