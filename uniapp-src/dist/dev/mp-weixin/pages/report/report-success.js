"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "report-success",
  setup(__props) {
    const fromPath = common_vendor.ref("");
    function backToLive() {
      const pages = getCurrentPages();
      const liveIdx = (() => {
        for (let i = pages.length - 1; i >= 0; i--) {
          const r = pages[i] && pages[i].route || "";
          if (r === "pages/broadcast/entry" || r === "pages/broadcast/replay")
            return i;
        }
        return -1;
      })();
      if (liveIdx >= 0) {
        const delta = pages.length - 1 - liveIdx;
        if (delta > 0) {
          common_vendor.index.navigateBack({
            delta,
            fail: () => {
              if (fromPath.value) {
                common_vendor.index.reLaunch({ url: fromPath.value });
              } else {
                common_vendor.index.reLaunch({ url: "/pages/broadcast/entry" });
              }
            }
          });
          return;
        }
      }
      if (fromPath.value) {
        common_vendor.index.reLaunch({ url: fromPath.value });
      } else {
        common_vendor.index.reLaunch({ url: "/pages/broadcast/entry" });
      }
    }
    function close() {
      backToLive();
    }
    common_vendor.onLoad((options) => {
      fromPath.value = options.fromPath || "";
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(close, "a1"),
        b: common_vendor.o(backToLive, "e0")
      };
    };
  }
};
wx.createPage(_sfc_main);
