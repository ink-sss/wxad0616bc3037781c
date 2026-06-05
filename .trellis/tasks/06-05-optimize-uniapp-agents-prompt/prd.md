# optimize uniapp agents prompt

## Goal

Clarify `AGENTS.md` so future coding agents treat `uniapp-src/` as the active uni-app + Vue 3 + WeChat mini-program project, while using the root mini-program source and migrated H5 features only as references unless explicitly asked otherwise.

## What I already know

* The user wants prompt improvements, not business code changes.
* The main implementation target is `uniapp-src/`.
* The root mini-program source is for migration and reference.
* Live room and personal-center/order flows were migrated from the external H5 project at `/Users/apple/Desktop/code/live_h5/` and need migration-aware rules.
* `uniapp-src/package.json` contains `build:mp-weixin` and `test:live-entry-bootstrap` scripts.

## Requirements

* Update `AGENTS.md` project description and structure to point at `uniapp-src/src/`.
* Add clear source-boundary rules for active code, legacy mini-program reference code, and migrated H5 behavior.
* Explicitly mention `/Users/apple/Desktop/code/live_h5/` as the read-only H5 migration source by default.
* Add migration rules for live room, personal center, orders, payment, sharing, IM, and WeChat-specific compatibility.
* Keep edits scoped to prompt/documentation text.

## Acceptance Criteria

* [ ] `AGENTS.md` no longer implies root `src/` is the active project root.
* [ ] Root mini-program source is explicitly marked as migration/reference-only by default.
* [ ] H5 migrated features are explicitly tied to `/Users/apple/Desktop/code/live_h5/` and governed by behavior parity plus uni-app/mini-program adaptation.
* [ ] Diff only changes documentation/task metadata for this request.

## Out of Scope

* Business code changes.
* Reformatting unrelated files.
* Changing Trellis managed block contents.

## Technical Notes

* Files inspected: `AGENTS.md`, `uniapp-src/package.json`, `uniapp-src/src/`, root mini-program directories.
