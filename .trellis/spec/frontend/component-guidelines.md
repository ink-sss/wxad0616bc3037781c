# Component Guidelines

> How components are built in this project.

---

## Overview

Components in the uni-app source project are Vue single-file components under
`uniapp-src/src/components/` or `uniapp-src/src/uni_modules/`.

---

## Component Structure

- Prefer Options API when recovering components from compiled uni-app output,
  because compiled page/component logic usually preserves `data`, `props`,
  `computed`, `watch`, lifecycle hooks, and `methods`.
- Use official `uni_modules` components when the old component is a clear legacy
  wrapper around a uni-ui component.
- Preserve custom business components when behavior is project-specific.

---

## Props Conventions

- Keep existing prop names and event names stable during migration so recovered
  pages do not need unrelated rewrites.
- Document uncertain prop/event contracts with `TODO:migration` at the component
  boundary.

---

## Styling Patterns

- Keep `rpx` sizing for Mini Program parity.
- Convert compiled selectors such as `wx-view`, `wx-image`, and `wx-button` to
  maintainable uni-app selectors or class selectors.
- Remove compiled scoped artifacts when they do not carry source-level meaning.
- When recovering scoped components that used global utility classes in compiled
  WXML, make critical layout explicit in the component style. For example, a
  navigation row that needs horizontal layout should define `display: flex`,
  `flex-direction: row`, and `align-items: center` on its own selector instead
  of relying only on classes such as `d-s-c`.
- For mp-weixin component internals, prefer state classes and selectors inside
  the component's own scoped style over parent `:deep()` overrides. Mini Program
  style isolation can make parent deep selectors unreliable for replacing child
  images or backgrounds; pass a prop/class state into the child and style the
  child-owned node directly.

---

## Accessibility

<!-- A11y requirements and patterns -->

(To be filled by the team)

---

## Common Mistakes

- Treating compiled WXML fields such as `uI`, `uP`, `uR`, and `bind:__l` as
  source semantics. They are uni-app bridge artifacts and should be removed or
  replaced with explicit Vue props/events.
- Assuming compiled placeholder components/pages contain recoverable business
  logic. If only an empty shell exists, create a documented placeholder instead.
- Depending on root compiled `app.wxss` utility classes for recovered component
  layout. In the uni-app source tree, those classes may not exist globally, so
  logo/search rows or tab rows can collapse into vertical block layout unless
  the component declares its own flex contract.
