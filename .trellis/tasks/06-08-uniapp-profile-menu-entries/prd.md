# fix uniapp profile menu entries

## Goal

Update the uni-app personal center page to match the requested mobile UI: remove the member grade badge beside the user nickname, and show entry points for prize records, shipping address, and complaints.

## What I already know

* The target project is `uniapp-src/`.
* The screenshot matches `uniapp-src/src/pages/user/index/index.vue`, which renders the main tab personal center page.
* `uniapp-src/src/pages.json` already registers routes for prize records, address management, and complaints.
* `index.vue` already has navigation mappings for `prizeRecord`, `address`, and `complaint`.
* The service entry card currently exists but is hidden with `v-if="false"`.

## Requirements

* Remove the visible member grade badge from the personal center header.
* Show the three service entries requested by the user:
  * 中奖记录
  * 收货地址
  * 投诉
* Keep order entry behavior unchanged.
* Reuse existing routes and icons where possible.
* Do not modify the legacy root mini-program source or generated `uniapp-src/dist/` output.

## Acceptance Criteria

* [ ] The profile header no longer renders a member grade badge such as `普通会员`.
* [ ] The personal center page shows `中奖记录`, `收货地址`, and `投诉` entries.
* [ ] Tapping each new entry uses the existing route mapping.
* [ ] The change is limited to `uniapp-src` source and Trellis task documentation.
* [ ] Minimal validation is run, or any skipped validation is explained.

## Out of Scope

* Changing order status behavior.
* Adding new API endpoints.
* Modifying old root mini-program source.
* Reworking the visual design beyond the requested entries.

## Technical Notes

* Primary file: `uniapp-src/src/pages/user/index/index.vue`.
* Existing route mappings:
  * `prizeRecord` -> `/pagesPlus/main/prize-record/index`
  * `address` -> `/pagesPlus/main/address/index`
  * `complaint` -> `/pagesPlus/main/report/report-type?fromPath=%2Fpages%2Fcenter%2Findex`
