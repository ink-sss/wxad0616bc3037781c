"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const _sfc_main = {
  onLoad(query = {}) {
    if (query.token)
      common_vendor.index.setStorageSync("token", query.token);
    if (query.user_id)
      common_vendor.index.setStorageSync("user_id", query.user_id);
    const app = getApp();
    const done = () => {
      this.gotoPage(pages_login_pageTools.getCurrentRedirect("/pages/user/index/index"), "reLaunch");
    };
    if (app && app.globalData && app.globalData.is_login)
      done();
    else if (app && typeof app.getWxopen === "function")
      app.getWxopen(done);
    else
      done();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
