# fix uniapp login back skip home

## Goal

Uni-app login page should send users to the home page when they either use the page back action or tap "暂不登录".

## What I Already Know

- The requested scope is `uniapp-src` login page behavior.
- The current project target is uni-app Vue 3 for WeChat Mini Program.
- Login success redirect behavior should remain unchanged unless current code requires a shared helper.
- Existing unrelated dirty files must not be reverted or included in this task.

## Requirements

- When the user taps "暂不登录" on the login page, navigate to the home page.
- When the user uses the login page back action, navigate to the home page.
- Preserve successful login redirect behavior and auth/session persistence.
- Keep the change scoped to `uniapp-src` source and tests/docs only if needed.

## Acceptance Criteria

- [x] Login page back action enters the configured home route.
- [x] Login page "暂不登录" enters the configured home route.
- [x] Existing login success redirect behavior remains unchanged.
- [x] Relevant uni-app validation passes or any inability to run is explained.

## Out Of Scope

- Reworking login APIs or auth storage.
- Changing root legacy Mini Program source.
- Changing unrelated broadcast or invitation files currently dirty in the worktree.

## Technical Notes

- Inspect `uniapp-src/src/pages.json` to confirm the home route.
- Inspect login page source before editing.
