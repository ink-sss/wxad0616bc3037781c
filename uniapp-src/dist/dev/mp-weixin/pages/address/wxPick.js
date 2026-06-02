"use strict";
const common_vendor = require("../../common/vendor.js");
const services_wechatAddress = require("../../services/wechat-address.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const _sfc_main = {
  __name: "wxPick",
  setup(__props) {
    const step = common_vendor.ref("loading");
    const errorMsg = common_vendor.ref("");
    const redirectUrl = common_vendor.ref("/pages/address/index");
    const statusText = common_vendor.computed(() => {
      if (step.value === "picking")
        return "请在微信弹窗中选择收货地址";
      if (step.value === "saving")
        return "正在保存地址...";
      if (step.value === "success")
        return "地址导入成功，正在返回...";
      return "正在准备获取微信地址...";
    });
    function goBack() {
      common_vendor.index.redirectTo({
        url: redirectUrl.value,
        fail: () => common_vendor.index.navigateBack()
      });
    }
    function retryPick() {
      startPick();
    }
    async function startPick() {
      try {
        step.value = "picking";
        const ok = await services_wechatAddress.importWxAddress();
        if (!ok) {
          step.value = "error";
          errorMsg.value = "未导入微信地址";
          return;
        }
        step.value = "success";
        setTimeout(goBack, 500);
      } catch (error) {
        step.value = "error";
        errorMsg.value = (error == null ? void 0 : error.message) || "导入微信地址失败";
      }
    }
    common_vendor.onLoad((options = {}) => {
      const from = options.from || options.redirect || "";
      if (from)
        redirectUrl.value = decodeURIComponent(from);
      if (!services_h5AuthContext.ensureH5PageAuth(options, redirectUrl.value))
        return;
      startPick();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: step.value !== "error"
      }, step.value !== "error" ? {
        b: common_vendor.t(statusText.value)
      } : {
        c: common_vendor.t(errorMsg.value),
        d: common_vendor.o(retryPick, "5a"),
        e: common_vendor.o(goBack, "54")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-20da494c"]]);
wx.createPage(MiniProgramPage);
