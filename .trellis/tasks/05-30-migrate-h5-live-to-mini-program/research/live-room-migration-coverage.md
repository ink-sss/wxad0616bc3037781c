# Live Room Migration Coverage

Task: `.trellis/tasks/05-30-migrate-h5-live-to-mini-program`

Source of truth: `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/`

Mini implementation surface:

- `uniapp-src/src/pages/broadcast/entry.vue`
- `uniapp-src/src/pages/broadcast/replay.vue`
- `uniapp-src/src/pages/broadcast/useReplayProductSchedule.js`
- `uniapp-src/src/api/live.js`
- `uniapp-src/src/api/marketing.js`
- `uniapp-src/src/api/h5-live.js`
- `uniapp-src/src/utils/live-route.js`
- `uniapp-src/src/utils/mini-live-socket.js`
- `uniapp-src/src/utils/ws-envelope.js`
- `uniapp-src/src/services/h5-auth-context.js`

Open audience entries: none.

## Audience Capability Coverage

| Capability | Status | Mini implementation |
|---|---|---|
| Live playback visual states | adapted | `entry.vue` uses `live-player`, portrait/landscape branches, source failover, poster and ended overlays. |
| Replay playback visual states | adapted | `entry.vue` uses `video`, replay list, poster fade, progress restore/reporting, auto-next replay. |
| Entry overlay and manual sound/play intent | adapted | `entry.vue` `showEntryOverlay`, `enterLiveByGesture`, `manualPlayVideo`, `broadcast_sound_intent` storage. |
| Ended/access-denied/viewer-limit states | adapted | `entry.vue` explicit `live-ended-overlay`, `access-denied-overlay`, `viewer-limit` and enter-room error handling. |
| Marquee ad | adapted | `entry.vue` `shouldShowMarquee`, position classes, dismiss, setting update reset. |
| Chat input, quick replies, mute states | adapted | `entry.vue` quick reply bar, send path, `chatDisabled`, mute-all and user mute socket events. |
| Product shelf/current product | adapted | `entry.vue` product sheet, current teaching card, product detail navigation, buy reminder API. |
| Replay product schedule | ported | `useReplayProductSchedule.js`, called from `entry.vue` replay time updates. |
| Buying notices and replay simulated orders | adapted | `entry.vue` transient buying notice, chat system notice, `getReplaySimMessages` order payload routing. |
| Comments, pinned/delete/top/clear/filter | adapted | `entry.vue` history load, pinned bar, socket delete/top/clear/mute-word handling. |
| Likes and viewer metrics | adapted | `entry.vue` local like feedback, API/socket send, live status/viewer count updates. |
| Normal lottery | adapted | `entry.vue` marketing action list/panel, participant lookup, socket notice refresh. |
| Comment lottery | adapted | `entry.vue` external lottery entry, keyword bubble, comment reward claim, socket notice refresh. |
| Watch rewards | adapted | `entry.vue` watch reward entry, claim API, watch seconds heartbeat state, socket notice refresh. |
| Sign-in | adapted | `entry.vue` sign config, check status, submit panel/tab. |
| Report/share/center/return-to-live | adapted | `entry.vue` complaint navigation, Mini Program share hooks, center navigation, replay return. |
| Replay progress | adapted | `entry.vue` local progress storage and `/h5/live/reportViewProgress`. |
| Mini-window/collapse behavior | adapted | `entry.vue` landscape collapse/restore/hide controls. |
| Adaptive stream selection/status updates | adapted | `live-route.js` candidate ordering, `entry.vue` source failover and live status snapshot switching. |
| Heartbeat/enter/leave | adapted | `entry.vue` `/h5/live/enter`, `/heartbeat`, `/leave`, viewer-limit handling. |
| Socket envelope normalization | ported | `mini-live-socket.js` plus `ws-envelope.js` HMAC wrapper/unwrapper and event normalization. |
| Playback debug float | adapted | `entry.vue` query-gated `debug=1` mini debug panel. |
| Wake lock | adapted | `entry.vue` uses `uni.setKeepScreenOn` on load/unload. |

## File Mapping

| H5 file | Status | Mini mapping / reason |
|---|---|---|
| `entry.vue` | adapted | Consolidated into `uniapp-src/src/pages/broadcast/entry.vue` with mini-native playback, socket, auth, product, comment, marketing, and state UI. |
| `replay.vue` | adapted | `uniapp-src/src/pages/broadcast/replay.vue` normalizes replay query and redirects to entry replay mode. |
| `useReplayProductSchedule.js` | ported | `uniapp-src/src/pages/broadcast/useReplayProductSchedule.js`. |
| `components/LiveBroadcastStageHost.vue` | adapted | Stage host and state branching are in `entry.vue`. |
| `components/LivePortraitStage.vue` | adapted | Portrait live/replay branch, overlays, chat, product, toolbar in `entry.vue`. |
| `components/LiveLandscapeStage.vue` | adapted | Landscape branch, tabs, mini-window collapse, product/sign/interact panels in `entry.vue`. |
| `components/LiveChatBar.vue` | adapted | Input, send, quick replies, mute state, toolbar actions in `entry.vue`. |
| `components/LiveProductShelf.vue` | adapted | Product shelf popup and current product card in `entry.vue`. |
| `components/LiveBroadcastMarketingLayer.vue` | adapted | Mini marketing sheet/entries/notices in `entry.vue`; H5-only modal visuals replaced with mini-safe panels. |
| `components/LiveEntryOverlay.vue` | adapted | `entry.vue` entry overlay and manual play/sound gesture. |
| `components/LiveEndedOverlay.vue` | adapted | `entry.vue` ended overlay. |
| `components/LiveAccessDenied.vue` | adapted | `entry.vue` access denied overlay and UID copy. |
| `components/LiveViewerLimitReached.vue` | adapted | `entry.vue` viewer-limit overlay. |
| `components/LiveMarqueeAd.vue` | adapted | `entry.vue` marquee ad. |
| `components/LiveExternalLotteryTools.vue` | adapted | `entry.vue` comment-lottery and watch-reward floating entries. |
| `components/LivePlaybackDebugFloat.vue` | adapted | `entry.vue` debug panel gated by `debug=1`. |
| `composables/live-entry-initializer-helpers.js` | adapted | Route/auth/detail normalization handled by `live-route.js`, `h5-auth-context.js`, and `entry.vue`. |
| `composables/live-lottery-message.js` | adapted | Lottery text and socket notices handled by `entry.vue` marketing handlers. |
| `composables/useIMChannel.js` | adapted | H5 IM channel replaced by `MiniLiveSocket` event normalization. |
| `composables/useMessageChannel.js` | adapted | H5 message multiplexing replaced by `MiniLiveSocket` plus `handleSocketMessage`. |
| `composables/useLiveWebSocket.js` | adapted | `mini-live-socket.js` uses `uni.connectSocket`, reconnect, ping, replay request, sign key. |
| `composables/useLiveWsMessageHandler.js` | adapted | `entry.vue` socket dispatcher plus `mini-live-socket.js` normalized event names. |
| `composables/useLiveComments.js` | adapted | `entry.vue` history, optimistic send, pinned/top/delete/clear/filter, replay simulated comments. |
| `composables/useLiveChatInput.js` | adapted | `entry.vue` Mini Program input focus and send handling; H5 keyboard DOM listeners are not used. |
| `composables/useLiveEntryActions.js` | adapted | `entry.vue` like, product, share, center, tab, video tap actions. |
| `composables/useLiveBuyingNotice.js` | adapted | `entry.vue` transient buying notice and chat notice. |
| `composables/useLivePlaybackDebug.js` | adapted | `entry.vue` mini debug panel. |
| `composables/useLiveHeartbeatStatus.js` | adapted | `entry.vue` enter/heartbeat/leave plus socket status snapshots. |
| `composables/useLivePlayerInitializer.js` | adapted | `entry.vue` `live-player`/`video` setup and event handlers; no `hls.js`, `flv.js`, or DOM insertion. |
| `composables/useLiveReplayPlayback.js` | adapted | `entry.vue` replay list, progress restore/report, ended/auto-next. |
| `composables/useReplaySimOrders.js` | adapted | `entry.vue` windowed `getReplaySimMessages` consumption and order notice routing. |
| `composables/useLiveLoadBootstrap.js` | adapted | `entry.vue` `loadRoom`, auth guard, detail/stream/replay bootstrap. |
| `composables/useLivePlaybackWiring.js` | adapted | Mini playback events are wired directly in `entry.vue`. |
| `composables/useLiveScreenWakeLock.js` | adapted | `entry.vue` uses `uni.setKeepScreenOn`; H5 `navigator.wakeLock` is not used. |
| `composables/useLiveStageBinding.js` | adapted | Stage binding is static Vue template with native Mini Program components in `entry.vue`. |
| `composables/useLiveDisplayState.js` | adapted | `entry.vue` computed display state for overlays, poster, status, marquee, access/viewer-limit. |
| `composables/useLiveEntryHelpers.js` | adapted | Formatting/navigation helpers folded into `entry.vue` and `live-route.js`. |
| `composables/useLiveWatchRewards.js` | adapted | `entry.vue` watch reward list, entry, claim, socket refresh. |
| `composables/useLiveViewerMetrics.js` | adapted | `entry.vue` viewer/like display and status socket updates. |
| `composables/useLiveSidePanels.js` | adapted | `entry.vue` center/report/sign/product panels and navigation into migrated mini pages. |
| `composables/useLiveEntryBootstrap.js` | adapted | `entry.vue` load lifecycle and auth guard. |
| `composables/useLiveEntryLifecycle.js` | adapted | `entry.vue` `onShow`/`onHide`/`onUnload` keep-screen-on, status refresh, replay progress, heartbeat, leave, and socket teardown. |
| `composables/useLiveEnterNotice.js` | adapted | `entry.vue` enter/leave/system message display through chat stream. |
| `composables/useIOSWechatBridgeAutoPlay.js` | unsupported | H5 iOS WeChat bridge/autoplay is browser/JSSDK-only; mini implementation uses entry overlay user gesture with native `live-player`/`video`. |
| `composables/useLiveProducts.js` | adapted | `entry.vue` product list/current product/detail routing and product socket refresh. |
| `composables/useLiveProgressReport.js` | adapted | `entry.vue` replay progress storage/reporting. |
| `composables/useLiveVideoRuntime.js` | adapted | Browser runtime replaced by native `live-player`/`video` contexts in `entry.vue`. |
| `composables/useLiveCommentLottery.js` | adapted | `entry.vue` comment lottery entry, claim, socket refresh and panel. |
| `composables/useLiveAdaptiveQuality.js` | adapted | `live-route.js` stream candidate ranking and `entry.vue` status/failover; browser `navigator.connection` is not used. |
| `composables/useLivePurchase.js` | adapted | `entry.vue` buy reminder and navigation to migrated product/order mini pages. |
| `composables/useLiveMarketingRuntime.js` | adapted | `entry.vue` marketing state/actions/notices. |
| `composables/useLiveMuteState.js` | adapted | `entry.vue` mute toggle, user muted/unblocked/block socket events and mute-all settings. |
| `composables/useLiveEntryInitializer.js` | adapted | `entry.vue` detail bootstrap, access restrictions, stream lookup, replay first video, room context. |
| `composables/useLiveScheduleResume.js` | adapted | Replay/schedule resume is handled by replay progress restore and replay product schedule. |
| `composables/useLiveMiniWindow.js` | adapted | `entry.vue` landscape collapse/restore/hide mini-window behavior. |
| `composables/useLiveNormalLottery.js` | adapted | `entry.vue` normal lottery panel and participant lookup. |
| `composables/useLiveSoundIntent.js` | adapted | `entry.vue` entry overlay, manual play, mute toggle, sound-intent storage. |
| `composables/useLivePageLeave.js` | adapted | `entry.vue` `onUnload` teardown, progress report, leave API, socket close. |
| `composables/useLiveSubscribePush.js` | unsupported | H5 public-account/JSSDK subscribe flow has no safe Mini Program equivalent without backend template IDs; mini keeps live entry usable and share/auth native. |
| `utils/refresh-sound-intent.js` | adapted | Mini storage key `broadcast_sound_intent` and entry gesture in `entry.vue`. |
| `utils/entry-format.js` | adapted | Formatting logic folded into `entry.vue` and `live-route.js`. |
| `utils/entry-route.js` | adapted | `uniapp-src/src/utils/live-route.js`. |
| `utils/live-source.js` | adapted | `uniapp-src/src/utils/live-route.js` candidate ranking: RTMP, FLV, then HLS/video. |
| `utils/domain-prefetch.js` | unsupported | Browser `<link rel=prefetch>`/domain preconnect has no Mini Program DOM equivalent. |
| `utils/live-status-snapshot.js` | adapted | `entry.vue` `applyLiveStatusSnapshot` and candidate switching. |
| `utils/entry-init.js` | adapted | `live-route.js`, `h5-auth-context.js`, and `entry.vue` route/detail bootstrap. |
| `styles/entry-landscape.scss` | adapted | Scoped CSS in `entry.vue` landscape branch. |
| `styles/entry-global.scss` | adapted | Scoped page-level CSS in `entry.vue`; no global H5 DOM selectors. |
| `styles/entry-landscape-live.scss` | adapted | Scoped CSS in `entry.vue` live landscape branch. |
| `styles/entry-landscape-live-controls.scss` | adapted | Scoped CSS in `entry.vue` landscape controls. |
| `styles/entry-portrait.scss` | adapted | Scoped CSS in `entry.vue` portrait branch. |
| `styles/entry.scss` | adapted | Consolidated page CSS in `entry.vue`. |
| `styles/entry-overlays.scss` | adapted | Scoped overlay CSS in `entry.vue`. |
| `styles/live-portrait-stage.scss` | adapted | Scoped CSS in `entry.vue` portrait stage. |
| `styles/entry-live.scss` | adapted | Scoped CSS in `entry.vue` live status/product/chat controls. |
| `styles/live-landscape-stage.scss` | adapted | Scoped CSS in `entry.vue` landscape stage. |
| `styles/entry-shared.scss` | adapted | Shared page styles folded into `entry.vue`. |

## Unsupported Platform-Only Items

| Item | Reason |
|---|---|
| H5 iOS WeChat bridge autoplay | Requires browser DOM/JSSDK video access; mini uses user gesture plus native player contexts. |
| H5 public-account subscribe push | Requires H5/JSSDK public-account template flow; Mini Program needs backend template IDs for `requestSubscribeMessage`, which this H5 source does not provide. |
| H5 domain prefetch/preconnect | Requires browser DOM/link APIs; Mini Program has no equivalent preconnect primitive for page code. |
