# fix: uniapp live video stuck on cover with audio

## Goal

Fix `uniapp-src` broadcast playback where Mini Program real devices keep showing the live cover while audio plays, and WeChat DevTools simulator only starts playback after a tap.

## What I Already Know

- User reports the issue in `uniapp-src` live room.
- Frontend quality spec says Mini Program live playback must use HLS/m3u8 through `video`, not `live-player`.
- `LivePortraitStage.vue` and `LiveLandscapeStage.vue` currently can still render `live-player` when `mediaSourceComponent` says so or the URL looks like a live-player source.
- Live cover hiding depends on `videoFrameReady`; Mini Program `video` may emit `play`/`timeupdate` without reliable DOM `target` readiness data.

## Requirements

- Mini Program live playback must not initialize `live-player`.
- Cover overlay must clear when playback progress or play state confirms media has started.
- Entry should actively retry playback after the source is rendered so the simulator does not depend on a user tap.

## Acceptance Criteria

- [ ] `mp-weixin` stage components render `video` for live HLS sources and do not select `live-player`.
- [ ] `play`/`timeupdate` events can mark live playback ready and hide the cover.
- [ ] Source changes schedule a native context `play()` retry after render.
- [ ] `npm run build:mp-weixin` passes.

## Out of Scope

- Changing backend stream contracts.
- Editing root legacy Mini Program source.
- Editing external H5 source.

## Technical Notes

- Relevant files: `uniapp-src/src/pages/broadcast/components/LivePortraitStage.vue`, `LiveLandscapeStage.vue`, `entry.vue`, `useLivePlayerInitializer.js`, `useLiveSoundIntent.js`.
- Spec reference: `.trellis/spec/frontend/quality-guidelines.md`, scenario "Mini Program Live Playback Source Selection".
