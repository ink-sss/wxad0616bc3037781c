/**
 * 小程序订阅开播提醒。
 * H5 公众号一次性订阅 URL 在小程序中不可用；这里改走 requestSubscribeMessage。
 */
export function useLiveSubscribePush(ctx = {}) {
  const { liveTenantId, domainStore } = ctx;

  function readMaybeRef(value) {
    if (value && typeof value === "object" && "value" in value) return value.value;
    return value;
  }

  async function ensureSubscribeConfigLoaded() {
    const tenantId = Number(readMaybeRef(liveTenantId) || domainStore?.tenantId || 0);
    if (
      !tenantId ||
      typeof domainStore?.load !== "function" ||
      (
        domainStore.loaded &&
        Number(domainStore.tenantId || 0) === tenantId &&
        domainStore.subscribeTemplateId
      )
    ) {
      return;
    }
    uni.showLoading({ title: "加载中...", mask: true });
    try {
      await domainStore.load(tenantId);
    } catch (error) {
      console.warn("[Live] 加载订阅配置失败:", error);
    } finally {
      uni.hideLoading();
    }
  }

  async function onSubscribePush() {
    await ensureSubscribeConfigLoaded();
    const tmplId = domainStore?.subscribeTemplateId;
    if (!tmplId || typeof uni.requestSubscribeMessage !== "function") {
      uni.showToast({ title: "未配置订阅模板", icon: "none" });
      return;
    }
    uni.requestSubscribeMessage({
      tmplIds: [tmplId],
      success(res) {
        if (res?.[tmplId] === "accept") {
          uni.showToast({ title: "订阅成功", icon: "success" });
        } else {
          uni.showToast({ title: "未开启订阅", icon: "none" });
        }
      },
      fail() {
        uni.showToast({ title: "订阅失败", icon: "none" });
      },
    });
  }

  return {
    onSubscribePush,
  };
}
