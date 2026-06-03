"use strict";
const common_vendor = require("../../common/vendor.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const pages_broadcast_utils_liveRouteContext = require("../broadcast/utils/live-route-context.js");
const _sfc_main = {
  __name: "report-home",
  setup(__props) {
    const liveId = common_vendor.ref("");
    const roomCode = common_vendor.ref("");
    const tenantId = common_vendor.ref("");
    const termId = common_vendor.ref("");
    const customerId = common_vendor.ref("");
    const replayVideoId = common_vendor.ref("");
    const liveType = common_vendor.ref("");
    const liveName = common_vendor.ref("");
    const cover = common_vendor.ref("");
    const fromPath = common_vendor.ref("");
    function appendQuery(params, key, value) {
      const text = value === void 0 || value === null ? "" : String(value);
      if (text)
        params.push(key + "=" + encodeURIComponent(text));
    }
    function goSelectType() {
      const params = [];
      appendQuery(params, "liveId", liveId.value);
      appendQuery(params, "roomCode", roomCode.value);
      appendQuery(params, "tenantId", tenantId.value);
      appendQuery(params, "termId", termId.value);
      appendQuery(params, "customerId", customerId.value);
      appendQuery(params, "replayVideoId", replayVideoId.value);
      appendQuery(params, "videoId", replayVideoId.value);
      appendQuery(params, "liveType", liveType.value);
      appendQuery(params, "liveName", liveName.value);
      appendQuery(params, "cover", cover.value);
      appendQuery(params, "fromPath", fromPath.value);
      common_vendor.index.navigateTo({ url: "/pages/report/report-type?" + params.join("&") });
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      liveId.value = options.liveId || "";
      roomCode.value = options.roomCode || options.room_code || "";
      tenantId.value = options.tenantId || options.tenant_id || "";
      termId.value = options.termId || options.term_id || options.liveTermId || options.live_term_id || "";
      customerId.value = options.customerId || options.customer_id || options.userId || options.user_id || "";
      replayVideoId.value = options.replayVideoId || options.replay_video_id || options.videoId || options.video_id || "";
      liveType.value = options.liveType || options.live_type || (options.replay === "1" ? "replay" : "");
      liveName.value = options.liveName || "";
      cover.value = options.cover || "";
      fromPath.value = options.fromPath || "";
      if (!liveId.value || !roomCode.value) {
        try {
          const ctx = utils_liveRoomContext.loadLiveRoomContext();
          if (ctx) {
            liveId.value = liveId.value || ctx.liveId || ctx.roomId || "";
            roomCode.value = roomCode.value || ctx.roomCode || "";
            tenantId.value = tenantId.value || ctx.tenantId || ctx.tenant_id || "";
            termId.value = termId.value || ctx.termId || ctx.term_id || ctx.liveTermId || ctx.live_term_id || "";
            customerId.value = customerId.value || ctx.customerId || ctx.customer_id || ctx.userId || ctx.user_id || "";
            replayVideoId.value = replayVideoId.value || ctx.replayVideoId || ctx.replay_video_id || ctx.videoId || ctx.video_id || "";
            liveType.value = liveType.value || ctx.liveType || ctx.live_type || (ctx.replay === "1" ? "replay" : "");
            liveName.value = liveName.value || ctx.liveName || "";
            cover.value = cover.value || ctx.cover || "";
            fromPath.value = fromPath.value || pages_broadcast_utils_liveRouteContext.buildBroadcastReturnPath(ctx);
          }
        } catch (_) {
        }
      }
      if (!fromPath.value) {
        fromPath.value = pages_broadcast_utils_liveRouteContext.buildBroadcastReturnPath({
          roomCode: roomCode.value,
          liveId: liveId.value,
          tenantId: tenantId.value,
          termId: termId.value,
          customerId: customerId.value,
          videoId: replayVideoId.value,
          liveType: liveType.value,
          liveName: liveName.value,
          cover: cover.value
        });
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goSelectType, "69")
      };
    };
  }
};
wx.createPage(_sfc_main);
