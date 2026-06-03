"use strict";
const common_vendor = require("../common/vendor.js");
const utils_liveMiniState = require("../utils/live-mini-state.js");
const utils_liveRoomNavigation = require("../utils/live-room-navigation.js");
const MINI_WIDTH_RPX = 224;
const MINI_HEIGHT_RPX = 316;
function rpxToPx(value) {
  try {
    const sys = common_vendor.index.getSystemInfoSync();
    return Number(value) / 750 * Number(sys.windowWidth || 375);
  } catch (error) {
    return Number(value) / 2;
  }
}
function getWindowSize() {
  try {
    const sys = common_vendor.index.getSystemInfoSync();
    return {
      width: Number(sys.windowWidth || 375),
      height: Number(sys.windowHeight || 667)
    };
  } catch (error) {
    return { width: 375, height: 667 };
  }
}
function clampPosition(left, top) {
  const win = getWindowSize();
  const width = rpxToPx(MINI_WIDTH_RPX);
  const height = rpxToPx(MINI_HEIGHT_RPX);
  const margin = rpxToPx(16);
  return {
    left: Math.min(Math.max(left, margin), Math.max(margin, win.width - width - margin)),
    top: Math.min(Math.max(top, margin), Math.max(margin, win.height - height - margin))
  };
}
function useLiveMiniWindow(props = {}) {
  const initial = utils_liveMiniState.loadLiveMiniState(props.roomCode) || {};
  const visible = common_vendor.ref(!!(props.enabled && initial.roomCode && initial.playUrl));
  const poster = common_vendor.ref(initial.poster || "");
  const playUrl = common_vendor.ref(initial.playUrl || "");
  const muted = common_vendor.ref(initial.muted !== false);
  const isPlaying = common_vendor.ref(false);
  const title = common_vendor.ref(initial.title || "直播间");
  const stateRoomCode = common_vendor.ref(initial.roomCode || props.roomCode || "");
  const start = common_vendor.ref(null);
  const fallback = (() => {
    const win = getWindowSize();
    return clampPosition(win.width - rpxToPx(MINI_WIDTH_RPX) - rpxToPx(24), win.height - rpxToPx(MINI_HEIGHT_RPX) - rpxToPx(props.bottomOffset || 190));
  })();
  const position = common_vendor.ref(fallback);
  const hasPlayableSource = common_vendor.computed(() => !!playUrl.value);
  const displayTitle = common_vendor.computed(() => title.value || "直播间");
  const statusText = common_vendor.computed(() => hasPlayableSource.value ? "播放中" : "直播间");
  const miniStyle = common_vendor.computed(() => ({
    left: `${position.value.left}px`,
    top: `${position.value.top}px`
  }));
  function closeMini() {
    visible.value = false;
    utils_liveMiniState.clearLiveMiniState(stateRoomCode.value);
  }
  function restoreLive() {
    if (!stateRoomCode.value)
      return;
    utils_liveRoomNavigation.returnToLiveRoom(stateRoomCode.value);
  }
  function playMini() {
    try {
      common_vendor.index.createVideoContext("liveMiniVideo").play();
    } catch (error) {
    }
  }
  function onDragStart(event = {}) {
    var _a, _b;
    const touch = ((_a = event.touches) == null ? void 0 : _a[0]) || ((_b = event.changedTouches) == null ? void 0 : _b[0]);
    if (!touch)
      return;
    start.value = {
      x: touch.clientX,
      y: touch.clientY,
      left: position.value.left,
      top: position.value.top
    };
  }
  function onDragMove(event = {}) {
    var _a, _b;
    const touch = ((_a = event.touches) == null ? void 0 : _a[0]) || ((_b = event.changedTouches) == null ? void 0 : _b[0]);
    if (!touch || !start.value)
      return;
    position.value = clampPosition(
      start.value.left + touch.clientX - start.value.x,
      start.value.top + touch.clientY - start.value.y
    );
  }
  function onDragEnd() {
    start.value = null;
  }
  return {
    visible,
    poster,
    playUrl,
    hasPlayableSource,
    muted,
    isPlaying,
    displayTitle,
    statusText,
    miniStyle,
    closeMini,
    restoreLive,
    playMini,
    onDragStart,
    onDragMove,
    onDragEnd
  };
}
exports.useLiveMiniWindow = useLiveMiniWindow;
