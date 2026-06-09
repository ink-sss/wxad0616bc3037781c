# broadcast entry coupon selection state

## Goal

Fix the broadcast entry order coupon picker so a coupon already applied on the order page is shown as selected when the coupon list is opened.

## What I already know

- The issue is in the uni-app project under `uniapp-src`.
- The visible order page state already shows a coupon was used.
- Opening the coupon list currently renders that same coupon as unselected.

## Assumptions

- The fix should preserve the existing coupon calculation and only correct current-selection state passed to or held by the list UI.
- Root legacy Mini Program files and the external H5 project are reference-only unless needed for comparison.

## Requirements

- Keep the applied coupon and coupon list selected state in sync.
- Do not change unrelated order, payment, or live-room behavior.

## Acceptance Criteria

- [ ] When an applied coupon exists on the broadcast entry order page, opening the coupon list shows that coupon selected.
- [ ] Selecting another coupon still updates the order page discount.
- [ ] Clearing or not having a coupon does not show a stale selected item.

## Definition of Done

- Focused code change in `uniapp-src`.
- Minimal relevant verification run, or the reason it cannot run is documented.

## Technical Notes

- Relevant frontend specs read: `.trellis/spec/frontend/index.md`, `component-guidelines.md`, `hook-guidelines.md`, `quality-guidelines.md`, and `.trellis/spec/guides/index.md`.
