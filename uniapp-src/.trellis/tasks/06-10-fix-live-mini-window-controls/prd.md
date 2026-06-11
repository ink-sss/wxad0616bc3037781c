# Fix live mini window fixed controls

## Goal

Fix the cross-page live mini-window so the close button and "return to live" control stay visually attached to the floating mini-window while secondary pages scroll.

## What I already know

- User reports that when scrolling a page, the live mini-window close button and return-to-live control move with the page.
- The shared component is `uniapp-src/src/components/live-mini-window.vue`.
- The component is used by order, receipt, user center, and prize-record pages.
- The mini-window itself is fixed, while mp-weixin controls are rendered as `cover-view` children with absolute positioning inside a normal `view` tree.

## Assumptions

- The bug is specific to the cross-page live mini-window, not the landscape in-room collapsed mini-window.
- Fixing the shared component should cover all secondary pages that render `<live-mini-window>`.

## Requirements

- Keep the mini-window video and overlay controls fixed relative to the viewport during page scroll.
- Keep the close, return-to-live, and play controls tappable in mp-weixin.
- Avoid page-by-page fixes and avoid changing the live-room playback state logic.

## Acceptance Criteria

- [ ] `live-mini-window.vue` uses a stable fixed overlay layout for the mp-weixin `cover-view` controls.
- [ ] Existing drag, close, play, and return-to-live handlers remain wired.
- [ ] `npm run build:mp-weixin` passes or any failure is clearly explained.

## Out of Scope

- Changing live-room navigation behavior.
- Changing video source selection or mini-window caching behavior.
- Editing generated `uniapp-src/dist/` output.

## Technical Notes

- Relevant component guidelines: `.trellis/spec/frontend/component-guidelines.md`.
- Relevant quality guidelines: `.trellis/spec/frontend/quality-guidelines.md`.
- CodeGraph is not initialized for this repository in this session, so repo inspection used `rg` and direct file reads.
