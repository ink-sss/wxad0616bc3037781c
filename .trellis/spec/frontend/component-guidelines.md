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
- For `scroll-view` inside Mini Program bottom sheets or flex layouts, give the
  scroll area a concrete height, such as `calc(100% - <header/footer size>)`,
  and then set the nested `scroll-view` to `height: 100%`. iOS real devices can
  collapse scroll areas that depend only on flex distribution or `height: 0`,
  making populated lists look empty.
- For autoplaying Mini Program `swiper` components, keep the `current` index in
  the same coordinate space as the rendered `swiper-item` list. Do not render a
  moving slice/window while also binding a parent-owned `current`, because iOS
  can fight the native autoplay transition and look like it is jittering left
  and right.
- If an iOS Mini Program `swiper` still jitters after the index/list coordinate
  spaces are aligned, avoid native `autoplay` on controlled swipers. Keep the
  visible behavior by advancing the parent-owned `current` index with a
  component timer, and use `circular="true"` when last-to-first should move
  forward instead of snapping backward.

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
- Letting a generic poster fallback keep covering a playable `<video>` after
  playback starts. For mini-window or layered media components, gate poster
  overlays with the actual playback state, for example
  `hasPlayableSource && poster && !isPlaying`, and only use the static poster
  fallback when there is no playable source.
- Making cross-page floating components depend only on the secondary page's
  initial props. Live mini-window pages often render before order/center route
  data has a `roomCode`; the component must be able to recover the room from
  its own cached mini-window state before deciding to hide itself.
- Using a third-party tab component's internal active state to drive one part
  of a live room while external panels read separate page state. For landscape
  live-room tabs, keep the visual active state and the rendered panel on the
  same page-owned state (`activeTab`/`activeTabIndex`) or Mini Program custom
  event bridge differences can highlight "Products" while still rendering the
  interaction feed.
- Using `v-show` for mutually exclusive Mini Program panels that also have
  flex/display styles. In mp-weixin this compiles to `hidden`, and display
  declarations on the same node or child component can make stale panels look
  visible. For live-room tab panels and bottom bars, prefer `v-if`/`wx:if` so
  inactive panels are destroyed instead of hidden.
- Placing critical fixed CTA controls under Mini Program native components or
  persistent popup wrappers. If a page can be reached from live video, map the
  mp-weixin CTA layer to `cover-view`, destroy closed popup components with
  `v-if`, and keep the `cover-view` styling to conservative absolute
  positioning plus `background-color`/`line-height` instead of relying on
  flex-only layout or gradients.
- Rendering Canvas-designed poster slots as layered DOM with percentage width
  and height for square assets. In Mini Program invitation posters, avatar and
  QR code slots must be sized from the poster display width and then applied as
  equal `rpx` width/height. If width and height are both percentages, they scale
  against different card axes and circles become tall ovals while QR codes
  overflow their frame.
- Re-rendering Mini Program invitation poster backgrounds from remote template
  URLs on every canvas export. If an H5 invitation template ships local static
  backgrounds, copy compatible assets into the matching uni-app package or
  subpackage and import them from `templates.js`; this avoids repeated
  `getImageInfo`/network latency during poster generation.
- Treating WeChat user avatar URLs such as `thirdwx.qlogo.cn` as normal
  downloadable images in canvas composition. Those domains may be absent from
  the Mini Program download whitelist, so poster code must not block on
  `getImageInfo`/`downloadFile` for them. Prefer direct canvas image loading
  for the first successful avatar render, then immediately copy that decoded
  image into an in-memory offscreen canvas and try the canvas cache first for
  later poster canvases. Temp-file avatar paths are only a fallback because
  repeated `createImage(wxfile://...)` reads can time out on later templates;
  failed or empty temp-file caches must be discarded before retrying direct
  canvas image loading.
- Reusing the same short image-load timeout for both avatar probes and poster
  template backgrounds. Avatar probes should fail fast, but invitation template
  backgrounds are larger local package images and need a longer canvas
  `createImage` timeout. If a required template background fails, treat that
  render as failed instead of caching a fallback-colored poster.
- Starting Mini Program invitation share-card composition immediately after
  poster composition. Template switching can leave the previous share-card
  canvas loading background/avatar assets while the new poster canvas needs the
  same avatar, causing the new poster avatar to time out and fall back to an
  initial. Generate the share-card image lazily from `onShareAppMessage`
  instead of preheating it after every poster render.
- Assuming every packaged static image path can be drawn directly by Mini
  Program offscreen canvas. For invitation posters, if direct `createImage`
  loading of `/pagesPlus/static/...` fails, call `getImageInfo` for the packaged
  path and draw the returned local `path` before failing the render.
- Clearing Mini Program invitation poster runtime caches on page mount/unload.
  Exported poster files remain the first cache layer, but unfinished templates
  still need the same hot image path/avatar/QR-code caches that the first page
  instance built. Keep source-keyed runtime caches across invitation page
  instances, prefer cached packaged image paths before direct canvas probes, and
  delete only the specific cache entry that fails to load.
- Re-generating an invitation poster on page re-entry when an identical poster
  was already exported in the same Mini Program session. The exported poster
  `wxfile://` result is the stable artifact users actually need, while decoded
  images/canvases are runtime details. Cache exported poster/share file paths
  by template plus invitation payload and show that cached file immediately on
  re-entry; only rebuild when the cache key changes or no exported file exists.
- Trusting an exported invitation poster/share cache string without checking
  that the local `wxfile://` still exists. Re-entry, page unload, or native
  cleanup can leave stale paths and make the page skip the first-entry canvas
  composition while showing a broken or half-generated poster. Before any
  poster/share cache hit, validate local `wxfile://`, `file://`, or absolute
  paths with `FileSystemManager.access`; evict unreadable entries and continue
  through the same canvas generation path used on first entry.
- Letting a new invitation page instance wait for an in-flight poster Promise
  created by an unloaded page. Module-level Promise caches are useful inside a
  page instance, but page unload can leave a render that no longer has a valid
  owner. Scope poster file promises by page instance; on scope mismatch, keep
  final exported file cache reuse but start a fresh current-page canvas render.
- Only caching the invitation poster that the user manually viewed. After the
  first visible poster export succeeds, start a sequential background queue for
  the remaining templates and cache each exported poster file with the same
  template-plus-payload key. Re-entry must reuse those final files for every
  template instead of asking the new page instance to decode untouched template
  backgrounds again.
- Letting the invitation poster preload queue compete with the currently
  selected template render. Background exports are only an optimization: delay
  them after the visible poster finishes, cancel them on template selection or
  page unload, and restart them only after the selected poster render completes.
  Debug reports for this flow must include QR-code source, Mini Program code
  field name, ordinary QR-code fallback reason, and whether a preload promise is
  still active.
- Treating generic `qrCode`/`qrcode` fields as guaranteed Mini Program codes in
  invitation payloads. Only explicit fields such as `miniProgramQrCode`,
  `mini_program_qr_code`, `miniProgramCode`, or `wxaCode` should drive Mini
  Program code composition. Generic QR fields may be logged as fallback
  candidates, but the poster must report when it has fallen back to ordinary QR
  generation.
- Silently falling back to generated QR matrices after an explicit invitation
  Mini Program code image fails to load. Mini Program code images are required
  composition inputs: cache the decoded image/canvas for later templates, retry
  alternate explicit sources when available, and fail that render with debug
  events instead of exporting an ordinary QR-code poster.
