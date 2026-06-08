# mp-weixin hot reload diagnostics

Use this when WeChat Developer Tools freezes or grows memory during
`npm run dev:mp-weixin` hot reload.

## Normal launch

1. Run the uni-app dev compiler:

   ```bash
   npm run dev:mp-weixin
   ```

2. Open this folder in WeChat Developer Tools:

   ```text
   uniapp-src/dist/dev/mp-weixin
   ```

Do not open the repository root for this workflow.

## Capture one hot reload

Run this before saving a source edit:

```bash
npm run diagnose:mp-weixin-hot-reload -- --snapshot .hot-reload-before.json
```

Save a source file and wait for DevTools to reload, then run:

```bash
npm run diagnose:mp-weixin-hot-reload -- --compare .hot-reload-before.json
```

The comparison prints how many files changed under `dist/dev/mp-weixin`, the
largest changed files, current output size, and any matched WeChat Developer
Tools process memory.

## Structural pressure controls

`src/pages.json` keeps `easycom.autoscan` disabled. Shared components that rely
on easycom are mapped explicitly so the compiler does not scan the full
component tree on every rebuild.

`components/upload/upload` is a shared component, not a route, and should stay
out of the `pages` array.

PageSpy is disabled in normal dev builds so its console proxy and socket client
do not enter the default hot-reload vendor bundle. Enable it only when actively
debugging PageSpy:

```bash
VITE_ENABLE_PAGE_SPY=true npm run dev:mp-weixin
```

Then import `uniapp-src/dist/dev/mp-weixin` in Weixin DevTools. The checked-in
`uniapp-src/project.config.json` points at `dist/build/mp-weixin`, which is the
release output and keeps PageSpy stubbed out.

## Local fallback

If DevTools still spikes memory while diagnosing, set this local generated file:

```text
uniapp-src/dist/dev/mp-weixin/project.private.config.json
```

Change:

```json
"compileHotReLoad": true
```

to:

```json
"compileHotReLoad": false
```

This disables the DevTools hot-reload reload path. Treat it as a local fallback,
not the main fix, because it slows the edit loop.
