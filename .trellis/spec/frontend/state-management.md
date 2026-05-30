# State Management

> How state is managed in this project.

---

## Overview

The migrated uni-app source currently keeps Vuex and Pinia side by side for
compatibility with compiled-era page code.

---

## State Categories

- Vuex holds legacy global UI/business flags used through `$store.commit(...)`.
- Pinia holds newer domain stores such as live chat state.
- Server state remains fetched through global request helpers (`_get`, `_post`,
  store/supplier variants) rather than a client cache library.

---

## When to Use Global State

- Use Vuex only for compatibility with existing migrated code that already
  expects `$store`.
- Use Pinia for new domain stores when global shared state is needed.
- Prefer page-local state for isolated form/list/popup state.

---

## Server State

- Preserve backend API paths and request payloads during migration.
- Keep token invalidation and login redirect behavior centralized in the shared
  request helper.

---

## Common Mistakes

- Upgrading Pinia without checking Vue compatibility. For Vue 3.4.x, Pinia 2.x
  is the safe compatibility line used by the migrated uni-app source.
- Replacing Vuex before migrated pages compile. Keep Vuex compatibility first,
  then plan a separate store consolidation task.
