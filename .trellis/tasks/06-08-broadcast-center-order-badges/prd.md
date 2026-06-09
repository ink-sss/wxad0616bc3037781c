# fix broadcast center order badges

## Goal

Restore order badge counts in the `uniapp-src` broadcast entry personal-center popup. The popup already renders badges, but its stats normalization only accepts a narrow H5 field shape, so Mini Program-compatible response aliases can collapse to zero.

## Requirements

- Update `uniapp-src/src/pages/broadcast/composables/useLiveSidePanels.js` so `buildCenterStats` accepts the same order/refund aliases used by existing uniapp personal-center code.
- Preserve current popup UI and navigation behavior.
- Do not add a badge for "已完成"; this task only restores the existing H5 parity badges for 待付款、待发货、待收货、退款/售后.
- Do not change root legacy Mini Program source or `/Users/apple/Desktop/code/live_h5`.

## Acceptance Criteria

- `buildCenterStats` maps:
  - payment/unpay/waitPay/wait_pay/pendingPay -> waitPay
  - delivery/unsend/waitShip/wait_ship/waitDelivery -> waitShip
  - received/unreceive/waitReceive/wait_receive -> waitReceive
  - refund/refunding/processing/unread/total/orderStats.refund -> refunding
- String numbers are converted to numbers and missing values resolve to zero.
- Focused unit test covers H5 fields, uniapp aliases, legacy Mini Program aliases, and empty payloads.

## Validation

- `cd uniapp-src && npm run test:live-side-panels`
- `cd uniapp-src && npm run test:live-entry-bootstrap`
