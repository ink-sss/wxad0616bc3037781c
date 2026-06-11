# fix: align mini-program live portrait bottom icons

## Goal

Make the mp-weixin portrait live bottom-right toolbar icons match the H5 live visual style.

## What I Already Know

* The H5 reference shows the first bottom-right toolbar icon as the blue four-grid live tool icon.
* The mp-weixin screenshot shows the first bottom-right toolbar icon as the old home/user-center image.
* `LiveChatBar.vue` renders the first toolbar action with `center.png`; live portrait styling attempts to replace it from the parent page with `:deep(.toolbar-icons > .tool-btn:nth-child(1))`.
* In mp-weixin, scoped parent deep selectors are not reliable for replacing nested component internals.

## Requirements

* Preserve the existing center action click behavior.
* In live visual toolbar mode, render the first toolbar action with the H5 blue four-grid asset.
* Keep the live like button visual aligned with the existing live toolbar style.
* Avoid changing unrelated playback or layout logic.

## Acceptance Criteria

* [x] `LiveChatBar` has its own live-toolbar styling and no longer relies only on parent deep selectors for the first toolbar icon.
* [x] mp-weixin build passes.
* [x] Existing unrelated dirty changes are not reverted.

## Technical Notes

* Relevant source: `uniapp-src/src/pages/broadcast/components/LiveChatBar.vue`.
* Existing live asset: `https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-ebu-add-86ea0992.png`.
* Existing old icon: `https://man.lqjy.cc/static/icons/center.png`.
* Validation: `npm run build:mp-weixin` passed from `uniapp-src/`.
