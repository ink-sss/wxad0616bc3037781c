# fix uniapp broadcast distributor share entry

## Goal

Fix the uni-app broadcast entry so distributor users see the same H5 share invitation entry and the share popup uses distributor attribution data.

## What I already know

* User reports `uniapp-src` `pages/broadcast/entry` does not show the share button for distributors.
* H5 source under `/Users/apple/Desktop/code/live_h5` is available and is the interaction source of truth.
* H5 `LiveChatBar` displays the invite icon when `roomSetting.enableShare !== 0 && isDistributor && distributorStatus === 1`.
* `uniapp-src` already has distributor state from `checkDistributor(liveId)` and a matching `LiveChatBar` condition.
* `uniapp-src` portrait stage already passes distributor state to `LiveChatBar`, but share popup argument parity must be preserved for distributor share attribution.

## Requirements

* Keep distributor state chain: `checkDistributor(liveId)` sets `isDistributor` and `distributorStatus`; do not change backend field types.
* Preserve H5 visibility condition for the bottom invite icon: `enableShare !== 0 && isDistributor && distributorStatus === 1`.
* Ensure both portrait and landscape share popups receive `roomCode`, `shareCode`, `bindId`, `tenantId`, replay context, `isDistributor`, and `distributorStatus`.
* Keep personal center invitation record visibility logic intact.
* Do not modify `/Users/apple/Desktop/code/live_h5`; use it only as reference.
* Do not revert unrelated dirty files or manually edit `uniapp-src/dist/`.

## Acceptance Criteria

* Distributor with `status=1` and share enabled can see the invite share button.
* Non-distributor, disabled distributor status, or `enableShare=0` does not show the invite share button.
* Opening share passes distributor attribution parameters to `share-popup` in portrait and landscape stages.
* Focused tests cover the visibility condition and popup prop wiring.
* `npm run test:live-entry-bootstrap` and `npm run build:mp-weixin` are attempted from `uniapp-src/`.

## Technical Notes

* Primary files: `uniapp-src/src/pages/broadcast/components/LiveChatBar.vue`, `LivePortraitStage.vue`, `LiveLandscapeStage.vue`, `uniapp-src/src/components/share-popup.vue`.
* Existing dirty files may include user work; keep edits scoped and avoid formatting churn.
