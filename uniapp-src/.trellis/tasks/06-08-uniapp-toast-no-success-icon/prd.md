# uniapp toast success icon removal

## Goal

Remove the checkmark icon from selected uni-app success toast messages so payment success, receive-goods success, and address-import success display as text-only toast prompts.

## What I already know

* User reported the `确认收货成功` toast shows a checkmark icon and requested payment success, receive-goods, and address-import prompts to use plain toast prompts.
* The relevant implementation is under `uniapp-src/`.
* The behavior is controlled by `uni.showToast` / `uniRuntime.showToast` `icon` values.

## Requirements

* Change `支付成功` toast prompts from success icon to text-only.
* Change receive-goods success prompts such as `确认收货成功` from success icon to text-only.
* Change address import success prompts such as `地址导入成功` / `导入成功` from success icon to text-only.
* Do not change unrelated success prompts such as save, copy, claim, login, or cart actions.

## Acceptance Criteria

* [ ] No targeted payment, receive-goods, or address-import success toast uses `icon: "success"`.
* [ ] Existing copy, flow timing, redirects, and API calls remain unchanged.
* [ ] Verification covers the affected source files with a focused search.

## Out of Scope

* Redesigning toast UI.
* Changing backend calls, payment flow, order state, address import logic, or unrelated success toasts.

## Technical Notes

* Initial search used `rg` for literal toast text and icon values in `uniapp-src/src` and `uniapp-src/tests`.
* Frontend spec index currently points to placeholder guideline files; project AGENTS.md rules are the primary detailed frontend constraints for this task.
