# Push uniapp-src as standalone repository

## Goal

Make `uniapp-src/` an independent Git repository and push its source history to `git@gitee.com:qidianbox/live-miniapp.git` on the `master` branch.

## What I already know

* User requested `uniapp-src` as a separate Git repository.
* Target remote is `git@gitee.com:qidianbox/live-miniapp.git`.
* Target branch is `master`.
* `uniapp-src` is not currently a Git repository.
* `uniapp-src/.gitignore` excludes generated and local directories such as `dist/`, `node_modules/`, `.trellis/`, `.agents/`, `.codex/`, and `.codegraph/`.

## Assumptions

* The standalone repository should contain the current non-ignored `uniapp-src/` source files.
* Generated build outputs and dependencies should stay untracked.
* A normal push is preferred. If the remote already has conflicting history, do not overwrite it without explicit confirmation.

## Requirements

* Initialize Git metadata inside `uniapp-src/`.
* Create or switch to a local `master` branch.
* Commit the current non-ignored project files.
* Configure `origin` as `git@gitee.com:qidianbox/live-miniapp.git`.
* Push `master` to the remote.

## Acceptance Criteria

* [ ] `uniapp-src/.git` exists.
* [ ] `uniapp-src` has a commit containing the intended source files.
* [ ] `origin` points to `git@gitee.com:qidianbox/live-miniapp.git`.
* [ ] `master` is pushed successfully to Gitee.

## Out of Scope

* Modifying business source code.
* Editing `uniapp-src/dist/` output.
* Rewriting or force-pushing over an existing remote branch without confirmation.

## Technical Notes

* This is a Git packaging/push task, not a uni-app source change.
* Minimal verification is Git status, remote configuration, and push result.
