"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_liveRoute = require("../../../utils/live-route.js");
const _sfc_main = {
  onLoad(query = {}) {
    common_vendor.index.redirectTo({ url: utils_liveRoute.buildBroadcastEntryUrl(utils_liveRoute.normalizeLiveRouteOptions(query)) });
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e5d3d6f7"]]);
wx.createPage(MiniProgramPage);
