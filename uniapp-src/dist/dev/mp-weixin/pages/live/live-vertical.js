"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_liveRoute = require("../../utils/live-route.js");
const _sfc_main = {
  onLoad(query = {}) {
    const options = utils_liveRoute.normalizeLiveRouteOptions(query);
    common_vendor.index.redirectTo({ url: utils_liveRoute.buildBroadcastEntryUrl({ ...options, orientation: "vertical" }) });
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-46b19f02"]]);
wx.createPage(MiniProgramPage);
