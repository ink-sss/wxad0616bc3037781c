"use strict";
const common_vendor = require("../../common/vendor.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const _sfc_main = {
  __name: "report-home",
  setup(__props) {
    const liveId = common_vendor.ref("");
    const liveName = common_vendor.ref("");
    const cover = common_vendor.ref("");
    const fromPath = common_vendor.ref("");
    function goSelectType() {
      const q = "liveId=" + encodeURIComponent(liveId.value || "") + "&liveName=" + encodeURIComponent(liveName.value || "") + "&cover=" + encodeURIComponent(cover.value || "") + (fromPath.value ? "&fromPath=" + encodeURIComponent(fromPath.value) : "");
      common_vendor.index.navigateTo({ url: "/pages/report/report-type?" + q });
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      liveId.value = options.liveId || "";
      liveName.value = options.liveName || "";
      cover.value = options.cover || "";
      fromPath.value = options.fromPath || "";
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goSelectType, "69")
      };
    };
  }
};
wx.createPage(_sfc_main);
