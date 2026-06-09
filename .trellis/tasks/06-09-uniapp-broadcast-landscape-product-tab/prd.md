# fix uniapp broadcast landscape product tab

## Goal

Fix the uni-app broadcast entry landscape layout so tapping the 商品 tab switches the content panel to the product list instead of leaving the interaction danmu/comment list visible.

## What I Already Know

* User report: `uniapp-src` page `pages/broadcast/entry` in landscape style highlights 商品, but the panel still shows the interaction list.
* `LiveLandscapeStage.vue` renders tabs with `activeTabIndex`, while tab content visibility uses `activeTab`.
* `LiveProductShelf.vue` already supports `mode="landscape-list"`, so this is a state synchronization bug, not a missing product-list component.
* `useLiveEntryActions.js` currently maps `activeTab` only inside `onTabChange({ name })`; `@update:model-value` only mutates `activeTabIndex`.

## Assumptions

* Wot Design Uni tab events can provide either a direct name/model value or an object payload depending on platform/component event.
* The fix should keep existing tab names: `0=interact`, `1=products`, `2=sign`.

## Requirements

* 商品 tab selection must set both `activeTabIndex` and `activeTab`.
* 互动 and 签到 tab selection must continue to select their correct panels.
* The handler must tolerate string, number, and object event payloads used by the tabs component.
* Scope stays inside `uniapp-src` broadcast source and focused tests.

## Acceptance Criteria

* [ ] `onTabChange` maps 商品 selection to `activeTab="products"` and `activeTabIndex="1"`.
* [ ] `setActiveTabIndex` used by `@update:model-value` also updates `activeTab`.
* [ ] Focused unit test covers product tab model-value update and object change payload.
* [ ] Focused test command passes.

## Definition of Done

* Focused tests pass.
* `npm run build:mp-weixin` is attempted or skipped with a concrete reason if not appropriate.
* No unrelated working tree changes are reverted.

## Out of Scope

* Redesigning the landscape product list UI.
* Changing product API loading behavior beyond any already triggered load call.
* Editing root legacy Mini Program source or `uniapp-src/dist`.

## Technical Notes

* Relevant source:
  * `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`
  * `uniapp-src/src/pages/broadcast/components/LiveProductShelf.vue`
  * `uniapp-src/src/pages/broadcast/composables/useLiveEntryActions.js`
  * `uniapp-src/tests/live-entry-actions.test.mjs`
* Frontend specs read:
  * `.trellis/spec/frontend/index.md`
  * `.trellis/spec/frontend/component-guidelines.md`
  * `.trellis/spec/frontend/quality-guidelines.md`
  * `.trellis/spec/frontend/directory-structure.md`
