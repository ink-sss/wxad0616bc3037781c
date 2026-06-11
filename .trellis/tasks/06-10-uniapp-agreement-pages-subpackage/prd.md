# Move agreement pages to subpackage

## Goal

Reduce the uni-app WeChat mini-program main package size by moving the agreement pages out of the main `pages` list into a subpackage.

## What I Already Know

- The current main package registers `pages/agreement/service` and `pages/agreement/privacy` in `uniapp-src/src/pages.json`.
- The source files already live at `uniapp-src/src/pages/agreement/service.vue` and `uniapp-src/src/pages/agreement/privacy.vue`.
- Login pages navigate to `/pages/agreement/service` and `/pages/agreement/privacy`.
- A dedicated `subPackages` entry with `root: "pages/agreement/"` preserves those full runtime route URLs while moving the page code out of the main package.

## Requirements

- Remove `pages/agreement/service` and `pages/agreement/privacy` from the main package `pages` array.
- Add a subpackage for `pages/agreement/` containing `service` and `privacy`.
- Preserve current navigation URLs for the two agreement pages.
- Do not modify generated build output under `uniapp-src/dist/`.

## Acceptance Criteria

- [ ] `uniapp-src/src/pages.json` registers both agreement pages under `subPackages`.
- [ ] Existing navigation to `/pages/agreement/service` and `/pages/agreement/privacy` remains valid.
- [ ] `cd uniapp-src && npm run build:mp-weixin` completes without route configuration errors.

## Out of Scope

- Rewriting agreement page content or styles.
- Changing login flow behavior.
- Modifying the legacy root mini-program source.

## Technical Notes

- Relevant config: `uniapp-src/src/pages.json`.
- Relevant pages: `uniapp-src/src/pages/agreement/service.vue`, `uniapp-src/src/pages/agreement/privacy.vue`.
