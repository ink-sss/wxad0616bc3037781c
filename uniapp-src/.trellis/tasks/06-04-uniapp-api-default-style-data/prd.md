# implement: use API default style data for uniapp

## Goal

Use the production API response shape as the default home page and TabBar data in `uniapp-src`, so the mini program default style matches the source backend payload instead of hand-authored placeholder styles.

## What I Already Know

* User supplied production curl examples for `index/nav` and `index/index`.
* `index/nav` returns `data.vars.data` with TabBar style and four visible tabs.
* `index/index` returns `data.page`, `data.items`, `data.setting`, and share data for the home page.
* Current `src/pages/index/index.vue` bypasses the API and sets hand-authored default DIY items.
* Current `src/components/tabbar/footTabbar.vue` and `src/utils/install.js` each define their own hand-authored TabBar defaults.
* `_get` in `src/utils/request.js` already appends `token`, `app_id`, `appid`, and `source_client=wx`.

## Requirements

* Home page should request `index/index` again and apply response data when available.
* Home page fallback data should be derived from the provided API response payload, not the previous manual search/product placeholder.
* TabBar fallback data should be derived from the provided `index/nav` response payload, not local `/static/tabbar/*` guesses.
* Keep existing navigation/share/loading behavior stable.

## Acceptance Criteria

* [x] `pages/index/index.vue` renders API `items` and falls back to API-derived defaults on failure.
* [x] `components/tabbar/footTabbar.vue` uses API-derived default nav data and honors stored `TabBar` when present.
* [x] `utils/install.js` stores the same API-derived default nav data when no stored TabBar exists.
* [x] Focused build/lint check runs or blocker is reported.

## Definition of Done

* Tests added/updated where appropriate.
* Lint/type/build check green or known blocker documented.
* Notes updated if behavior changes.

## Out of Scope

* Rebuilding the legacy backend API.
* Changing the static `pages.json` TabBar declaration.
* Styling components unrelated to the home default payload.

## Technical Notes

* Frontend spec index has no filled project-specific checklist yet.
* CodeGraph is configured in instructions but not initialized for this workspace, so file search was used for this task.
* Verification: `npm run build:mp-weixin` passes; `git diff --check` passes for touched files.
