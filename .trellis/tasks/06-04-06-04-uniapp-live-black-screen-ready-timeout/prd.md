# fix: uniapp mp-weixin live black screen ready timeout

## Problem

Mini Program broadcast live rooms can show a black screen and stop live playback even after the stream has started emitting `timeupdate` events.

The pasted runtime log shows:

- `playback-ready-timeout`
- fallback from an HLS live URL to another HLS fallback URL
- `AbortError: The play() request was interrupted by a call to pause()`

## Root Cause

The portrait and landscape broadcast stage components only marked live playback ready from DOM-backed `loadeddata`/`playing` events, `live-player` state changes, or live-player netstatus activity.

In mp-weixin, `video` `timeupdate` events can arrive without a DOM `target`; the current handlers returned early in that case and ignored `event.detail.currentTime`. As a result, playback was active but `videoFrameReady` stayed false, the native-load timer fired after 8 seconds, and fallback reinitialization destroyed/paused the current player.

## Requirement

For live playback, treat a target-less mp-weixin `timeupdate` event with `detail.currentTime > 0` as playback-ready evidence and clear the ready timeout through the existing `markPlaybackReady` path.

Keep portrait and landscape behavior aligned.

## Validation

- `npm run build:mp-weixin` from `uniapp-src/` passes.
- Manual validation in WeChat Developer Tools or real device should confirm the live room no longer black-screens after active `timeupdate` events.
