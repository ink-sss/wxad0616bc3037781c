# fix uniapp broadcast invitation page style

## Goal

Fix the uni-app Mini Program invitation page at `uniapp-src/src/pagesPlus/main/invitation/index.vue` so the generated invitation preview visually matches the H5 invitation page reference: the poster fills a centered phone-width card, the inviter avatar remains circular at the template slot, the room/time text sits inside the poster information panel, and the QR code stays within the designed QR frame.

## What I already know

* User reported `uniapp-src` broadcast entry invitation page is visually broken in Mini Program screenshot 1.
* H5 reference screenshot 2 matches `/Users/apple/Desktop/code/live_h5/src/pages/invitation/index.vue`.
* Current uni-app invitation page renders template background plus dynamic avatar/text/QR layers instead of the H5-only Canvas data URL path.
* Existing dirty changes before this task include `uniapp-src/src/pages.json`, `uniapp-src/src/pages/broadcast/components/LiveChatBar.vue`, and `uniapp-src/src/pagesPlus/main/invitation/index.vue`; do not revert unrelated/user changes.

## Assumptions

* Preserve the current uni-app layered implementation rather than importing H5 Canvas/QRCode dependency into mp-weixin.
* Keep template selection and action buttons unless they directly cause the broken poster layout; the user request is style parity for the visible invitation poster.
* The first template `tpl601` is the main target because both user screenshots show the purple live invitation background.

## Requirements

* Avatar overlay must remain circular and use template slot sizing based on poster width, not poster height or distorted image sizing.
* QR code overlay must remain square and fit inside the QR placeholder for the selected template.
* Poster card should match H5 screenshot proportions and centered margins on a 375px-width viewport.
* Text overlays should use the same proportional sizing as H5 Canvas slots as closely as uni-app CSS allows.
* Do not change invitation payload, sharing, QR generation, or save/copy business logic unless required for layout.

## Acceptance Criteria

* [ ] On `tpl601`, avatar is a circle near the top-right badge area instead of a tall oval.
* [ ] On `tpl601`, QR code is contained in the poster QR frame instead of oversized and spilling downward.
* [ ] Poster width and spacing visually align with H5 reference: centered card with modest gray side margins and no custom fake nav bar.
* [ ] Mini Program build still compiles after the change.

## Definition of Done

* Minimal source changes in `uniapp-src/src/pagesPlus/main/invitation/`.
* Run `npm run build:mp-weixin` or explain any failure.
* No edits to root legacy Mini Program source or `/Users/apple/Desktop/code/live_h5`.

## Out of Scope

* Rebuilding the full H5 Canvas poster pipeline in Mini Program.
* Changing invitation record, share popup business flow, or live-room entry logic.
* Editing generated files under `uniapp-src/dist/`.

## Technical Notes

* Relevant specs read: `.trellis/spec/frontend/index.md`, `component-guidelines.md`, `quality-guidelines.md`, `.trellis/spec/guides/index.md`.
* H5 source reference: `/Users/apple/Desktop/code/live_h5/src/pages/invitation/index.vue`.
* Uni-app source target: `uniapp-src/src/pagesPlus/main/invitation/index.vue` and template slots in `uniapp-src/src/pagesPlus/main/invitation/templates.js` if needed.
