"use strict";
const common_vendor = require("../../../common/vendor.js");
function useLiveSubscribePush(ctx = {}) {
  const { liveTenantId, domainStore } = ctx;
  function readMaybeRef(value) {
    if (value && typeof value === "object" && "value" in value)
      return value.value;
    return value;
  }
  async function ensureSubscribeConfigLoaded() {
    const tenantId = Number(readMaybeRef(liveTenantId) || (domainStore == null ? void 0 : domainStore.tenantId) || 0);
    if (!tenantId || typeof (domainStore == null ? void 0 : domainStore.load) !== "function" || domainStore.loaded && Number(domainStore.tenantId || 0) === tenantId && domainStore.subscribeTemplateId) {
      return;
    }
    common_vendor.index.showLoading({ title: "加载中...", mask: true });
    try {
      await domainStore.load(tenantId);
    } catch (error) {
      console.warn("[Live] 加载订阅配置失败:", error);
    } finally {
      common_vendor.index.hideLoading();
    }
  }
  async function onSubscribePush() {
    await ensureSubscribeConfigLoaded();
    const tmplId = domainStore == null ? void 0 : domainStore.subscribeTemplateId;
    if (!tmplId || typeof common_vendor.index.requestSubscribeMessage !== "function") {
      common_vendor.index.showToast({ title: "未配置订阅模板", icon: "none" });
      return;
    }
    common_vendor.index.requestSubscribeMessage({
      tmplIds: [tmplId],
      success(res) {
        if ((res == null ? void 0 : res[tmplId]) === "accept") {
          common_vendor.index.showToast({ title: "订阅成功", icon: "success" });
        } else {
          common_vendor.index.showToast({ title: "未开启订阅", icon: "none" });
        }
      },
      fail() {
        common_vendor.index.showToast({ title: "订阅失败", icon: "none" });
      }
    });
  }
  return {
    onSubscribePush
  };
}
exports.useLiveSubscribePush = useLiveSubscribePush;
