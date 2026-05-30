# Directory Structure

> How frontend code is organized in this project.

---

## Overview

The maintainable uni-app source project lives under `uniapp-src/`. The repository
root may contain compiled WeChat Mini Program output used only as migration
reference.

---

## Directory Layout

```
uniapp-src/
├── package.json
├── vite.config.js
├── project.config.json
└── src/
    ├── App.vue
    ├── main.js
    ├── manifest.json
    ├── pages.json
    ├── common/
    ├── components/
    ├── env/
    ├── pages/
    ├── pagesPlus/
    ├── platform/weixin/
    ├── store/
    ├── uni_modules/
    └── utils/
```

---

## Module Organization

- Route source files must live at `uniapp-src/src/<route>.vue`, matching
  `src/pages.json` paths exactly.
- Shared business helpers live in `src/common/` or `src/utils/`.
- WeChat-only APIs live behind `src/platform/weixin/` wrappers; pages and
  components should import wrappers rather than call high-risk platform APIs
  directly.
- Routes whose compiled original is only `Page({ data: {} })` plus a route-text
  WXML shell must remain compile-safe as equivalent empty pages, without visible
  placeholder text or route labels. Reserve `TODO:migration` placeholders for
  unrecovered business gaps or routes without an equivalent source shell.

---

## Naming Conventions

- Preserve existing Mini Program route paths when migrating to uni-app source.
- Use `.vue` single-file components for pages and components.
- Keep generated placeholders at the final route path, not in a separate
  placeholder directory, so route coverage checks stay simple.

---

## Examples

- `uniapp-src/src/pages.json` is the source route registry.
- `uniapp-src/src/platform/weixin/` is the platform boundary for mp-weixin-only
  capabilities.
