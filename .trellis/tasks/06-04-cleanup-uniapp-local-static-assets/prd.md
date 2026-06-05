# implement: cleanup uniapp local static assets

## Goal

Clean redundant local static assets from `uniapp-src` now that most image assets are loaded from `https://man.lqjy.cc/static/...`, and remove tracked `uniapp-src/dist` build output from git so generated files stop polluting the working tree.

## What I already know

* Source code uses CDN URLs for most icons, remote-icons, invitation, order, and live assets.
* `uniapp-src/dist/**` is currently tracked even though `.gitignore` already ignores `dist`.
* Local-path references still require keeping `uniapp-src/src/static/tabbar/**` and `uniapp-src/src/assets/figma/**`.
* Multiple page/component-level `static` directories duplicate the same CDN mirror files.

## Requirements

* Remove `uniapp-src/dist/**` from git tracking without relying on compiled output.
* Delete redundant page/component-level static mirror directories:
  * `uniapp-src/src/components/static`
  * `uniapp-src/src/pages/broadcast/static`
  * `uniapp-src/src/pages/broadcast/components/static`
  * `uniapp-src/src/pages/lottery-preview/**/static`
* Preserve local assets that are still referenced by source paths:
  * `uniapp-src/src/static/tabbar/**`
  * `uniapp-src/src/assets/figma/**`
* Verify no source references remain to deleted local static directories.

## Acceptance Criteria

* [ ] `npm run build:mp-weixin` passes from `uniapp-src/`.
* [ ] `git ls-files 'uniapp-src/dist/**'` returns no tracked files.
* [ ] Source scan has no remaining references to deleted `components/static` or page-level `./static` / `../static` directories.
* [ ] CDN URL references remain untouched.
* [ ] Local tabbar and figma assets remain tracked.

## Definition of Done

* Static cleanup staged as normal source deletions.
* Build output not tracked by git.
* Verification commands and any residual risks are reported.

## Out of Scope

* Changing CDN domains or asset URL constants.
* Re-uploading assets to CDN.
* Redesigning pages or changing runtime image behavior.

## Technical Notes

* Relevant frontend specs: `.trellis/spec/frontend/directory-structure.md`, `.trellis/spec/frontend/quality-guidelines.md`.
* `uniapp-src/package.json` exposes `npm run build:mp-weixin`.
* Root `.gitignore` already contains `dist`, which ignores generated dist directories once they are removed from tracking.
