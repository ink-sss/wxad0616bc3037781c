# fix uniapp broadcast lottery records button

## Goal

Fix the `uniapp-src` live broadcast entry page so tapping the winning record button in the scrolling/comment lottery win modal navigates to the winning record list page.

## What I already know

* User reports the issue in `uniapp-src` under `pages/broadcast/entry`.
* The expected destination is the winning record list page.
* `uniapp-src/src/pages.json` registers `/pagesPlus/main/prize-record/index` with title `中奖记录`.
* `useLiveSidePanels` already maps `prizeRecord` to `/pagesPlus/main/prize-record/index` and uses `navigateToPrizeRecord`.

## Assumptions

* The broken button is in the live lottery result modal/component rather than the side panel entry.
* Existing route query preservation should be reused where available.

## Requirements

* Tapping the winning record button from the lottery win/result modal navigates to `/pagesPlus/main/prize-record/index`.
* Keep the change scoped to `uniapp-src` source files.
* Do not alter legacy root mini-program source or generated `dist`.

## Acceptance Criteria

* [ ] The modal button has an actual click handler.
* [ ] The handler reaches the existing winning record page route.
* [ ] Existing close/result modal behavior remains intact.
* [ ] Relevant minimal test/build check passes, or any inability to run it is documented.

## Definition of Done

* Code change is minimal and follows existing uni-app patterns.
* Related test or build command is run from `uniapp-src`.
* No unrelated dirty worktree changes are reverted.

## Out of Scope

* Redesigning lottery modal UI.
* Changing backend lottery APIs.
* Modifying old root mini-program source.

## Technical Notes

* CodeGraph is not initialized for this project, so source inspection is via `rg` and targeted reads.
* Relevant current files include `uniapp-src/src/components/live-lottery/CommentLotteryResultModals.vue`, `uniapp-src/src/pages/broadcast/entry.vue`, `uniapp-src/src/pages/broadcast/composables/useLiveSidePanels.js`, and `uniapp-src/src/pages.json`.
