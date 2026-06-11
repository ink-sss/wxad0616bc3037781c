# Fix Broadcast Entry Share Copy Link Popup

## Goal

Fix the `uniapp-src` broadcast entry share dialog so showing the copy-link action does not close or remove the entire popup.

## What I Already Know

- The affected page is `uniapp-src/src/pages/broadcast/entry.vue`.
- The user reports that when the share popup's copy-link button appears, the whole popup disappears.
- The target project is the uni-app Vue 3 Mini Program frontend under `uniapp-src/`.
- `CodeGraph` is not initialized in this checkout, so symbol lookup will use focused local file inspection for this narrow page bug.

## Assumptions

- The intended behavior is that the share popup stays visible when the copy-link action becomes available.
- Tapping copy link should copy the share URL and only close the popup if the existing UX explicitly does that after a successful tap.
- The fix should be scoped to the broadcast entry share popup state/event handling.

## Requirements

- Keep the share popup visible when the copy-link button is rendered.
- Avoid broad refactors or unrelated visual changes.
- Preserve existing share/copy behavior where possible.
- Keep changes in `uniapp-src`, not root legacy Mini Program source or generated `dist`.

## Acceptance Criteria

- [ ] The copy-link button can be present without making the share dialog disappear.
- [ ] Existing share poster/link actions still have valid handlers.
- [ ] The change compiles for the Mini Program target or has a clear verification limitation.

## Out Of Scope

- Redesigning the share dialog.
- Changing share URL generation contracts.
- Modifying root legacy Mini Program source or `uniapp-src/dist/`.

## Technical Notes

- Relevant specs read: `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/state-management.md`, `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/guides/index.md`.
