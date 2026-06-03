"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    function buildQuery(options = {}) {
      return Object.keys(options).filter((key) => options[key] !== void 0 && options[key] !== null && options[key] !== "").map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(options[key]))}`).join("&");
    }
    common_vendor.onLoad((options = {}) => {
      const query = buildQuery(options);
      common_vendor.index.redirectTo({
        url: `/pages/address/index${query ? `?${query}` : ""}`
      });
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b9746c2a"]]);
wx.createPage(MiniProgramPage);
