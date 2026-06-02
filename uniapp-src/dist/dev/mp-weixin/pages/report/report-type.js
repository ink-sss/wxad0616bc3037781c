"use strict";
const common_vendor = require("../../common/vendor.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const _sfc_main = {
  __name: "report-type",
  setup(__props) {
    const liveId = common_vendor.ref("");
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
      const q = "type=" + encodeURIComponent(item.value) + "&typeLabel=" + encodeURIComponent(item.label) + "&liveId=" + encodeURIComponent(liveId.value || "") + "&liveName=" + encodeURIComponent(liveName.value || "") + "&cover=" + encodeURIComponent(cover.value || "") + (fromPath.value ? "&fromPath=" + encodeURIComponent(fromPath.value) : "");
      common_vendor.index.navigateTo({ url: "/pages/report/report-form?" + q });
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      liveId.value = options.liveId || "";
      liveName.value = options.liveName || "";
      cover.value = options.cover || "";
      from.value = options.from || "";
      fromPath.value = options.fromPath || "";
      if (!liveId.value) {
        try {
          const ctx = utils_liveRoomContext.loadLiveRoomContext();
          if (ctx && (ctx.liveId || ctx.roomId)) {
            liveId.value = ctx.liveId || ctx.roomId;
            liveName.value = liveName.value || ctx.liveName || "";
            cover.value = cover.value || ctx.cover || "";
          }
        } catch (_) {
        }
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
