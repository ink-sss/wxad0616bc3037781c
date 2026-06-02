"use strict";
const common_vendor = require("../../common/vendor.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoute = require("../../utils/live-route.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const _sfc_main = {
  onLoad(query = {}) {
    if (query.roomCode || query.roomId || query.liveId)
      utils_liveRoomContext.saveLiveRoomContext(utils_liveRoute.normalizeLiveRouteOptions(query));
    if (!services_h5AuthContext.ensureH5PageAuth(query, "/pages/center/index"))
      return;
    common_vendor.index.switchTab({
      url: "/pages/user/index/index",
      fail: () => common_vendor.index.redirectTo({ url: "/pages/user/index/index" })
    });
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7be81911"]]);
wx.createPage(MiniProgramPage);
