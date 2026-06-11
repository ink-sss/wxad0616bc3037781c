# implement: broadcast navigation safe offset

## Goal

Add a shared custom navigation bar height utility and use it to offset the top overlays in the broadcast room.

## What I already know

* The broadcast entry page uses `navigationStyle: "custom"`.
* The user requires the nav height algorithm `statusBarHeight + (iPhone ? 44 : 48)`.
* The broadcast room title and the comment lottery / watch reward entry are currently positioned with fixed `top` values.

## Requirements

* Provide `addUnit`, `getCustomNavBarHeight`, and `getCustomNavBarHeightStyle` from a shared utility.
* Pass the computed height through the broadcast stage state.
* Offset the portrait broadcast room title and right-side lottery/reward tools by the nav height.
* Do not show the "click to enter live room" overlay in mp-weixin; Mini Program live rooms should auto-enter and auto-report entry.
* Do not change landscape layout or batch-migrate other pages.

## Acceptance Criteria

* [ ] `npm run build:mp-weixin` passes from `uniapp-src/`.
* [ ] Portrait broadcast room title top position includes the custom nav height.
* [ ] Comment lottery and watch reward entry top positions include the custom nav height.
* [ ] mp-weixin broadcast room does not require tapping the entry overlay before playback/entry reporting.

## Out of Scope

* Replacing the existing global `getNavHeight` helper.
* Updating unrelated custom-navigation pages.
* Reworking all broadcast overlay layout.

## Technical Notes

* Source files touched: `src/utils/navigation-bar.js`, broadcast entry/stage binding, portrait stage, and top overlay styles.
* Existing working tree contains unrelated user changes; this task only adds the scoped source changes above.
