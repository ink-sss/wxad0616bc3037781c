# fix mp-weixin WXSS calc minifier

## Goal

Make `cd uniapp-src && npm run build:mp-weixin` produce Mini Program WXSS that preserves valid `calc()` syntax for broadcast positioning while keeping the production package from growing.

## Requirements

- Keep `postbuild:mp-weixin` enabled and keep WXSS/WXML/JSON/JS minification active.
- Preserve required whitespace around `+` and `-` operators inside CSS/WXSS `calc(...)` expressions.
- Do not expand unrelated WXSS output or disable package-size optimizations.
- Scope code changes to the uni-app build/minification pipeline.

## Acceptance Criteria

- [ ] `cd uniapp-src && npm run build:mp-weixin` succeeds.
- [ ] Built `pages/broadcast/components/LiveProductShelf.wxss` keeps `calc(190rpx + env(safe-area-inset-bottom))` valid.
- [ ] Built `pages/broadcast/entry.wxss` keeps live portrait product-area override `calc(190rpx + env(safe-area-inset-bottom))` valid.
- [ ] Total built `dist/build/mp-weixin` runtime bytes do not increase compared with the current build output baseline.

## Technical Notes

- `uniapp-src/scripts/minify-mp-weixin-wxss.mjs` currently removes spaces around `+`, producing invalid `calc(190rpx+env(...))` in WXSS.
- The user explicitly wants normal `npm run build:mp-weixin` to be safe and package size not to grow.
