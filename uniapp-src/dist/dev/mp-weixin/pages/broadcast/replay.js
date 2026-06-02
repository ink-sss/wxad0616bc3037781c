"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_liveRoute = require("../../utils/live-route.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const _sfc_main = {
  onLoad(query = {}) {
    const options = utils_liveRoute.normalizeLiveRouteOptions({ ...query, replay: "1", mode: query.mode || "replay" });
    const url = utils_liveRoute.buildBroadcastEntryUrl(options);
    if (!services_h5AuthContext.ensureH5Authenticated({ ...query, ...options, redirect: url }))
      return;
    common_vendor.index.redirectTo({ url });
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1fa4bff9"]]);
wx.createPage(MiniProgramPage);
