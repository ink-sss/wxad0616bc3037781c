"use strict";
const common_vendor = require("../common/vendor.js");
const api_live = require("../api/live.js");
const utils_liveRoomContext = require("../utils/live-room-context.js");
const utils_liveRoute = require("../utils/live-route.js");
const utils_liveRoomNavigation = require("../utils/live-room-navigation.js");
const _sfc_main = {
  __name: "live-mini-window",
  props: {
    roomCode: {
      type: [String, Number],
      default: ""
    },
    enabled: {
      type: Boolean,
      default: true
    },
    bottomOffset: {
      type: Number,
      default: 190
    },
    returnOrigin: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const props = __props;
    const closed = common_vendor.ref(false);
    const poster = common_vendor.ref("");
    const playUrl = common_vendor.ref("");
    const roomCodeValue = common_vendor.ref("");
    const position = common_vendor.ref({ left: 0, top: 0 });
    let dragStart = null;
    let hasMoved = false;
    const visible = common_vendor.computed(() => props.enabled && !closed.value && !!roomCodeValue.value);
    const miniStyle = common_vendor.computed(() => ({
      left: `${position.value.left}px`,
      top: `${position.value.top}px`
    }));
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
      const width = rpxToPx(224);
      const height = rpxToPx(316);
      const margin = rpxToPx(16);
      return {
        left: Math.min(Math.max(left, margin), Math.max(margin, win.width - width - margin)),
        top: Math.min(Math.max(top, margin), Math.max(margin, win.height - height - margin))
      };
    }
    function initPosition() {
      const win = getWindowSize();
      const width = rpxToPx(224);
      const height = rpxToPx(316);
      position.value = clampPosition(
        win.width - width - rpxToPx(24),
        win.height - height - rpxToPx(props.bottomOffset)
      );
    }
    function resolveRoomCode() {
      var _a;
      const propCode = String(props.roomCode || "").trim();
      if (propCode)
        return propCode;
      return String(((_a = utils_liveRoomContext.loadLiveRoomContext()) == null ? void 0 : _a.roomCode) || "").trim();
    }
    function getCurrentRoute() {
      var _a;
      try {
        const pages = getCurrentPages() || [];
        return String(((_a = pages[pages.length - 1]) == null ? void 0 : _a.route) || "").replace(/^\/+/, "");
      } catch (error) {
        return "";
      }
    }
    async function loadMini() {
      const code = resolveRoomCode();
      roomCodeValue.value = code;
      if (!code || getCurrentRoute().startsWith("pages/broadcast/"))
        return;
      const cached = utils_liveRoomContext.loadLiveRoomContext() || {};
      poster.value = cached.cover || cached.coverImage || cached.poster || "";
      playUrl.value = cached.playUrl || "";
      try {
        const raw = await api_live.getLiveDetail({ roomCode: code });
        const detail = utils_liveRoute.normalizeRoomDetail(raw, { roomCode: code });
        poster.value = detail.coverImage || poster.value;
        playUrl.value = utils_liveRoute.getBestLiveUrl(detail) || utils_liveRoute.getBestReplayUrl(detail) || playUrl.value;
      } catch (error) {
      }
    }
    function closeMini() {
      closed.value = true;
    }
    function restoreLive() {
      if (hasMoved)
        return;
      const code = roomCodeValue.value || resolveRoomCode();
      if (code)
        utils_liveRoomNavigation.returnToLiveRoom(code);
    }
    function onDragStart(event) {
      var _a;
      const touch = (_a = event.touches) == null ? void 0 : _a[0];
      if (!touch)
        return;
      hasMoved = false;
      dragStart = {
        x: touch.clientX,
        y: touch.clientY,
        left: position.value.left,
        top: position.value.top
      };
    }
    function onDragMove(event) {
      var _a;
      if (!dragStart)
        return;
      const touch = (_a = event.touches) == null ? void 0 : _a[0];
      if (!touch)
        return;
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4)
        hasMoved = true;
      position.value = clampPosition(dragStart.left + dx, dragStart.top + dy);
    }
    function onDragEnd() {
      dragStart = null;
      setTimeout(() => {
        hasMoved = false;
      }, 50);
    }
    common_vendor.watch(
      () => [props.roomCode, props.enabled],
      () => {
        closed.value = false;
        loadMini();
      }
    );
    initPosition();
    common_vendor.onShow(loadMini);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: visible.value
      }, visible.value ? common_vendor.e({
        b: playUrl.value
      }, playUrl.value ? {
        c: playUrl.value,
        d: poster.value
      } : poster.value ? {
        f: poster.value
      } : {}, {
        e: poster.value,
        g: common_vendor.o(restoreLive, "bc"),
        h: common_vendor.o(closeMini, "e6"),
        i: common_vendor.o(restoreLive, "3b"),
        j: common_vendor.s(miniStyle.value),
        k: common_vendor.o(onDragStart, "fb"),
        l: common_vendor.o(onDragMove, "2d"),
        m: common_vendor.o(onDragEnd, "ae")
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-84a35452"]]);
wx.createComponent(Component);
