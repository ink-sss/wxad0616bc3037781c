"use strict";
const common_vendor = require("../../common/vendor.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const pages_broadcast_utils_liveRouteContext = require("../broadcast/utils/live-route-context.js");
const _sfc_main = {
  __name: "report-type",
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
    const from = common_vendor.ref("");
    const fromPath = common_vendor.ref("");
    const types = common_vendor.ref([
      { label: "广告欺诈", value: "ad_fraud" },
      { label: "政治敏感", value: "politics" },
      { label: "侮辱谩骂", value: "abuse" },
      { label: "直播侵权", value: "infringement" },
      { label: "违法违规", value: "illegal" },
      { label: "色情低俗", value: "porn" },
      { label: "血腥暴力", value: "violence" },
      { label: "其他问题", value: "other" }
    ]);
    const instance = common_vendor.getCurrentInstance();
    function appendQuery(params, key, value) {
      const text = value === void 0 || value === null ? "" : String(value);
      if (text)
        params.push(key + "=" + encodeURIComponent(text));
    }
    function goForm(item) {
      if (from.value === "form") {
        const channel = instance.proxy.getOpenerEventChannel && instance.proxy.getOpenerEventChannel();
        if (channel && channel.emit) {
          channel.emit("selectType", {
            type: item.value,
            typeLabel: item.label
          });
        }
        common_vendor.index.navigateBack();
        return;
      }
      const params = [];
      appendQuery(params, "type", item.value);
      appendQuery(params, "typeLabel", item.label);
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
      common_vendor.index.navigateTo({ url: "/pages/report/report-form?" + params.join("&") });
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
      from.value = options.from || "";
      fromPath.value = options.fromPath || "";
      if (!liveId.value || !roomCode.value || !fromPath.value) {
        try {
          const ctx = utils_liveRoomContext.loadLiveRoomContext();
          if (ctx && (ctx.liveId || ctx.roomId)) {
            liveId.value = ctx.liveId || ctx.roomId;
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
        a: common_vendor.f(types.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: common_vendor.o(($event) => goForm(item), item.value)
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7bf54b87"]]);
wx.createPage(MiniProgramPage);
