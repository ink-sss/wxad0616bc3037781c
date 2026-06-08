# fix uniapp broadcast entry winner nickname

## Goal

Fix the `uniapp-src` broadcast entry interaction feed so lottery congratulations display the winning user's nickname instead of always falling back to `中奖用户`.

## What I Already Know

* User screenshot shows the portrait interaction feed rendering `恭喜 中奖用户 获得 ...`; the expected `XXX` is the winner nickname.
* `LivePortraitStage.vue` and `LiveLandscapeStage.vue` render `lottery_win` messages from `msg.nick`.
* `useLiveNormalLottery.js` appends `lottery_win` messages through `appendLotteryWinMessage`.
* `live-lottery-message.js` currently falls back to `中奖用户` when `getLotteryWinnerName()` cannot find a known nickname field.
* CodeGraph is not initialized for this workspace, so this task uses text search and direct file reads.

## Assumptions

* Existing UI templates are correct; the bug is in message normalization.
* The backend may send winner names under additional aliases or nested user/customer/member objects.
* `中奖用户` should remain the fallback only when no nickname is present anywhere useful.

## Requirements

* Extract winner nickname from the direct lottery record fields already supported.
* Also extract nickname from common nested user/customer/member/profile shapes.
* Keep prize name and duplicate message behavior unchanged.
* Add a focused test for direct, snake_case, and nested nickname payloads.

## Acceptance Criteria

* [ ] A `lottery_win` message with `customer: { nickname: "..." }` renders that nickname.
* [ ] A `lottery_win` message with `nick_name` renders that nickname.
* [ ] Missing nickname still falls back to `中奖用户`.
* [ ] Relevant Node test passes.

## Definition of Done

* Focused code change in `uniapp-src` only.
* Minimal test added or updated.
* Relevant npm test command run from `uniapp-src`.

## Out of Scope

* Changing lottery UI styles.
* Changing backend contracts.
* Modifying root legacy miniprogram source or external H5 source.

## Technical Notes

* Primary files: `uniapp-src/src/pages/broadcast/composables/live-lottery-message.js`, `uniapp-src/src/pages/broadcast/composables/useLiveNormalLottery.js`.
* Test location: `uniapp-src/tests/`.
* Applicable spec layer: `.trellis/spec/frontend/index.md`.
