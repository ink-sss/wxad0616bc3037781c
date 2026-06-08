# fix: uniapp live profile arrow escaped text

## Goal

Fix the UniApp live room personal-center popup order section so the "查看全部" entry renders a right arrow instead of the literal escaped string `&gt;`.

## What I already know

- The user screenshot shows `查看全部 &gt;` in the live room personal center popup.
- Literal search located the escaped arrow in `uniapp-src/src/components/center-section-card.vue`.
- The component is shared by the personal center cards and already uses a right-arrow image for list rows.

## Assumptions

- The expected behavior is a visual right arrow beside the link text, not displaying the entity text.
- This is a source fix in `uniapp-src/src/`, not a root legacy Mini Program source change.

## Requirements

- Replace the escaped text arrow in the section header link with a Mini Program-safe visual arrow.
- Keep the existing `showLink`, `linkText`, and `link` emit behavior unchanged.
- Do not modify unrelated live room, user center, or legacy Mini Program files.

## Acceptance Criteria

- [ ] `查看全部` no longer displays `&gt;` in the personal-center popup.
- [ ] The right arrow remains aligned with the link text.
- [ ] `cd uniapp-src && npm run build:mp-weixin` passes or any failure is reported with cause.

## Definition of Done

- Minimal source diff in `uniapp-src/src/components/center-section-card.vue`.
- Build verification attempted for mp-weixin.

## Out of Scope

- Redesigning the personal center popup.
- Changing order card behavior, routing, or API data.
- Editing root legacy Mini Program source.

## Technical Notes

- Relevant component: `uniapp-src/src/components/center-section-card.vue`.
- Relevant specs read: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/guides/index.md`.
