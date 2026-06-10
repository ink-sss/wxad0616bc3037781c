# Align Uniapp Login Agreements With Uni-H5

## Goal

Make the user agreement and privacy policy opened from `uniapp-src` login pages match the `uni-h5` implementation exactly, instead of showing the legacy Mini Program policy webview content.

## What I Already Know

- The current login pages under `uniapp-src/src/pagesPlus/main/login/` route agreement taps to `/pagesPlus/main/webview/ue?type=...`.
- The current `/pagesPlus/main/webview/ue` page loads policy rich text from `user.userapple/policy`, which is the legacy Mini Program-style implementation the user wants replaced for login entry points.
- The `uni-h5` source pages are:
  - `/Users/apple/Desktop/code/live_h5/src/pages/agreement/service.vue`
  - `/Users/apple/Desktop/code/live_h5/src/pages/agreement/privacy.vue`
- `uni-h5` routes them as `/pages/agreement/service` and `/pages/agreement/privacy`.
- The target project is `uniapp-src`; root Mini Program source and `live_h5` are reference/copy sources only.

## Requirements

- Copy the `uni-h5` service agreement page into `uniapp-src` with the same page content and styling.
- Copy the `uni-h5` privacy policy page into `uniapp-src` with the same page content and styling.
- Register the copied routes in `uniapp-src/src/pages.json`.
- Update login agreement links to navigate to `/pages/agreement/service` and `/pages/agreement/privacy`.
- Do not modify legacy root Mini Program source or `uniapp-src/dist/`.

## Acceptance Criteria

- [ ] Tapping `《用户协议》` from the uni-app login pages opens the copied H5 service agreement page.
- [ ] Tapping `《隐私政策》` from the uni-app login pages opens the copied H5 privacy policy page.
- [ ] The two copied page files match the `uni-h5` source files.
- [ ] `npm run build:mp-weixin` passes, or any blocker is reported with concrete output.

## Out Of Scope

- Replacing every non-login policy entry in the app.
- Removing the old `/pagesPlus/main/webview/ue` route.
- Editing `/Users/apple/Desktop/code/live_h5/`.
- Editing root legacy Mini Program source.

## Technical Notes

- Relevant frontend specs: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/directory-structure.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`.
- CodeGraph is not initialized in this repository, so file discovery used `rg`.
