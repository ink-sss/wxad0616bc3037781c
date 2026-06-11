# fix: uniapp 分类页复刻小程序样式

## Goal

Restore the `uniapp-src` product category page so its layout and visual behavior match the original WeChat mini program category page.

## What I already know

* User reports the `uniapp-src` category page style is broken.
* Original source files are `pages/product/category.wxml`, `pages/product/category.wxss`, and `pages/product/category.js`.
* Migrated page is `uniapp-src/src/pages/product/category.vue`.
* The migrated template is broadly aligned with the original WXML, but some details diverge.

## Assumptions

* The intended reference is the existing root mini program source under `pages/product/category.*`.
* This task should be scoped to the category page style parity unless code structure must change to support styling.

## Requirements

* Preserve the existing uni-app data/API behavior.
* Match the original category layouts for category grids, left tabs, product list style, quick-buy cart bar, and category popover.
* Avoid unrelated refactors and do not touch generated `dist` output.

## Acceptance Criteria

* [ ] `uniapp-src/src/pages/product/category.vue` mirrors the key class structure and CSS dimensions from `pages/product/category.wxml/.wxss`.
* [ ] Quick-buy footer matches the original mini program, including the checkout action area.
* [ ] Product rows keep the original image size, spacing, and info height.
* [ ] The page builds for `mp-weixin` without syntax errors.

## Definition of Done

* Focused code changes only.
* Build or equivalent syntax check completed.
* Notes updated if implementation finds a reusable convention.

## Out of Scope

* Backend/API changes.
* Changing cart persistence semantics beyond what is required for current uni-app behavior.
* Rebuilding generated `uniapp-src/dist` artifacts.

## Technical Notes

* CodeGraph is not initialized for this repo, so structural inspection used local file search/reads.
* Frontend spec index currently contains placeholder guidance only.
