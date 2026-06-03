"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_liveRoute = require("../../utils/live-route.js");
const _sfc_main = {
  __name: "replay",
  setup(__props) {
    common_vendor.onLoad((options) => {
      const resolved = utils_liveRoute.normalizeLiveRouteOptions(options || {});
      const url = utils_liveRoute.buildBroadcastEntryUrl({
        ...resolved,
        replay: "1",
        liveType: "replay",
        mode: resolved.mode || "landscape",
        tenantId: (options == null ? void 0 : options.tenantId) || "",
        liveName: (options == null ? void 0 : options.liveName) || "",
        cover: (options == null ? void 0 : options.cover) || "",
        liveCover: (options == null ? void 0 : options.liveCover) || "",
        _tc: (options == null ? void 0 : options._tc) || "",
        wx_token: (options == null ? void 0 : options.wx_token) || ""
      });
      common_vendor.index.redirectTo({ url });
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1fa4bff9"]]);
wx.createPage(MiniProgramPage);
