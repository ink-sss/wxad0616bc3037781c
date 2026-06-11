# brainstorm: adjust uniapp home and category styles

## Goal

Work in an isolated git worktree to adjust the `uniapp-src` home page and category page styles for the uni-app / WeChat mini-program frontend.

## What I already know

* The user asked to create a new worktree for collaboration on `uniapp-src` home page and category styles.
* Project rules say `uniapp-src/` is the active frontend project and root mini-program source is reference-only unless explicitly requested.
* Style changes should preserve uni-app / WeChat mini-program compatibility and avoid hand-editing `uniapp-src/dist/`.

## Assumptions (temporary)

* The work should be done on a separate branch and sibling worktree to avoid mixing with the current dirty main workspace.
* The target pages are the current uni-app home entry and category entry under `uniapp-src/src/`.
* Legacy mini-program or H5 files may be used as visual reference, but changes should land in `uniapp-src`.

## Open Questions

* Which visual source should the home and category pages match: current old mini-program, H5, a screenshot/design, or direct live adjustment with you?

## Requirements (evolving)

* Create an isolated worktree and branch for the style work.
* Identify the current home and category page implementation files.
* Keep edits scoped to `uniapp-src/src/` and supporting docs/tests if needed.
* Preserve loading, empty, error, and mobile layout behavior while adjusting styles.

## Acceptance Criteria (evolving)

* [ ] Home page style changes are implemented in the new worktree.
* [ ] Category page style changes are implemented in the new worktree.
* [ ] WeChat mini-program build or the smallest relevant verification is run, or any inability to run it is documented.
* [ ] No generated `uniapp-src/dist/` files are hand-edited.

## Definition of Done (team quality bar)

* Tests added/updated where appropriate.
* Lint / typecheck / build verification completed where practical.
* Docs/notes updated if behavior changes.
* Rollout/rollback considered if risky.

## Out of Scope (explicit)

* Modifying the root legacy mini-program source unless explicitly requested.
* Modifying `/Users/apple/Desktop/code/live_h5/`.
* Reworking backend APIs or adding server-side constraints.
* Refactoring unrelated pages, services, or stores.

## Technical Notes

* Worktree path: `/Users/apple/Desktop/code/wxad0616bc3037781c-home-category-style`
* Branch: `codex/uniapp-home-category-style`
* Initial task directory: `.trellis/tasks/06-05-uniapp-home-category-style`
