"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.onLoad((query = {}) => {
      const params = Object.entries(query).filter(([, value]) => value !== void 0 && value !== null && value !== "").map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
      common_vendor.index.redirectTo({
        url: `/pages/report/report-home${params ? `?${params}` : ""}`
      });
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-804f1809"]]);
wx.createPage(MiniProgramPage);
