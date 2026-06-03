import { onBeforeUnmount, ref, watch } from "vue";

const BUYING_NOTICE_SHOW_DURATION = 5000;
const BUYING_NOTICE_LEAVE_DURATION = 500;
const BUYING_NOTICE_THROTTLE = 2000;
const BUYING_NOTICE_DEFAULT_TEXT = "正在去购买";
const GO_SHOPPING_NOTICE_SHOW_DURATION = 2000;
const GO_SHOPPING_NOTICE_LEAVE_DURATION = 500;
const GO_SHOPPING_NOTICE_THROTTLE = 2000;
const SUCCESS_NOTICE_ENTER_DELAY = 200;
const SUCCESS_NOTICE_SHOW_DURATION = 3000;
const SUCCESS_NOTICE_LEAVE_DURATION = 200;
const SUCCESS_NOTICE_DEFER_DURATION = 30000;
// 商品列表弹窗轮询「N人购买了」氛围浮框：首发延迟 + 轮换间隔 + 人数上限
const MOCK_NOTICE_FIRST_DELAY_MS = 1000;
const MOCK_NOTICE_INTERVAL_MS = 3000;
const MOCK_NOTICE_MAX_COUNT = 99;

/**
 * 直播间「正在去购买」飘屏通知。
 * 职责边界：收集 2s 内的购买消息做节流聚合，以浮层动画展示；不写入聊天消息列表。
 * 竞品（诺云）样式复刻：左侧滑入 → 停留 → 左侧滑出。
 */
export function useLiveBuyingNotice() {
  const buyingNotice = ref({
    visible: false,
    leaving: false,
    nick: "",
    count: 0,
    noticeText: BUYING_NOTICE_DEFAULT_TEXT,
    key: 0,
  });
  const goShoppingNotice = ref({
    visible: false,
    leaving: false,
    nick: "",
    count: 0,
    noticeText: BUYING_NOTICE_DEFAULT_TEXT,
    productId: 0,
    productName: "",
    productImage: "",
    key: 0,
  });
  const productListSuccessNotice = ref({
    visible: false,
    phase: "entering",
    nick: "",
    productId: 0,
    productName: "",
    productImage: "",
    count: 0,
    sort: "",
    key: 0,
  });

  let hideTimer = null;
  let removeTimer = null;
  let throttleTimer = null;
  let goShoppingHideTimer = null;
  let goShoppingRemoveTimer = null;
  let goShoppingThrottleTimer = null;
  let successEnterTimer = null;
  let successTimer = null;
  let successRemoveTimer = null;
  let successDeferredTimer = null;
  const pendingQueue = [];
  const goShoppingPendingQueue = [];

  function clearTimers() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (removeTimer) { clearTimeout(removeTimer); removeTimer = null; }
    if (throttleTimer) { clearTimeout(throttleTimer); throttleTimer = null; }
    if (goShoppingHideTimer) { clearTimeout(goShoppingHideTimer); goShoppingHideTimer = null; }
    if (goShoppingRemoveTimer) { clearTimeout(goShoppingRemoveTimer); goShoppingRemoveTimer = null; }
    if (goShoppingThrottleTimer) { clearTimeout(goShoppingThrottleTimer); goShoppingThrottleTimer = null; }
    if (successEnterTimer) { clearTimeout(successEnterTimer); successEnterTimer = null; }
    if (successTimer) { clearTimeout(successTimer); successTimer = null; }
    if (successRemoveTimer) { clearTimeout(successRemoveTimer); successRemoveTimer = null; }
    if (successDeferredTimer) { clearTimeout(successDeferredTimer); successDeferredTimer = null; }
  }

  function hideBuyingNotice() {
    if (!buyingNotice.value.visible) return;
    buyingNotice.value = { ...buyingNotice.value, leaving: true };
    removeTimer = setTimeout(() => {
      buyingNotice.value = {
        visible: false,
        leaving: false,
        nick: "",
        count: 0,
        noticeText: BUYING_NOTICE_DEFAULT_TEXT,
        key: buyingNotice.value.key,
      };
      removeTimer = null;
    }, BUYING_NOTICE_LEAVE_DURATION);
  }

  function flushQueue() {
    if (pendingQueue.length === 0) return;
    const first = pendingQueue[0];
    const firstNick = first.nick;
    const count = pendingQueue.length;
    const noticeText = first.noticeText || BUYING_NOTICE_DEFAULT_TEXT;
    pendingQueue.length = 0;

    // 清除旧的展示/隐藏计时
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (removeTimer) { clearTimeout(removeTimer); removeTimer = null; }

    buyingNotice.value = {
      visible: true,
      leaving: false,
      nick: firstNick,
      count,
      noticeText,
      key: buyingNotice.value.key + 1,
    };

    hideTimer = setTimeout(() => {
      hideTimer = null;
      hideBuyingNotice();
    }, BUYING_NOTICE_SHOW_DURATION);
  }

  /**
   * 推入一条原有购买飘屏消息，2s 节流窗口内聚合为 "xx等N人正在去购买/刚刚购买了"。
   * @param {string} nick 用户昵称
   * @param {string} noticeText 飘屏动作文案
   */
  function showBuyingNotice(nick, noticeText = "") {
    const displayNick = String(nick || "").trim();
    if (!displayNick) {
      return;
    }
    pendingQueue.push({
      nick: displayNick,
      noticeText: String(noticeText || BUYING_NOTICE_DEFAULT_TEXT).trim() || BUYING_NOTICE_DEFAULT_TEXT,
    });

    if (throttleTimer === null) {
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        flushQueue();
      }, BUYING_NOTICE_THROTTLE);
    }
  }

  function hideGoShoppingNotice() {
    if (!goShoppingNotice.value.visible) return;
    goShoppingNotice.value = { ...goShoppingNotice.value, leaving: true };
    goShoppingRemoveTimer = setTimeout(() => {
      goShoppingNotice.value = {
        visible: false,
        leaving: false,
        nick: "",
        count: 0,
        noticeText: BUYING_NOTICE_DEFAULT_TEXT,
        productId: 0,
        productName: "",
        productImage: "",
        key: goShoppingNotice.value.key,
      };
      goShoppingRemoveTimer = null;
    }, GO_SHOPPING_NOTICE_LEAVE_DURATION);
  }

  function flushGoShoppingQueue() {
    if (goShoppingPendingQueue.length === 0) return;
    const first = goShoppingPendingQueue[0];
    const count = goShoppingPendingQueue.length;
    goShoppingPendingQueue.length = 0;

    if (goShoppingHideTimer) { clearTimeout(goShoppingHideTimer); goShoppingHideTimer = null; }
    if (goShoppingRemoveTimer) { clearTimeout(goShoppingRemoveTimer); goShoppingRemoveTimer = null; }

    goShoppingNotice.value = {
      visible: true,
      leaving: false,
      nick: first.nick,
      count,
      noticeText: first.noticeText || BUYING_NOTICE_DEFAULT_TEXT,
      productId: first.productId,
      productName: first.productName,
      productImage: first.productImage,
      key: goShoppingNotice.value.key + 1,
    };

    goShoppingHideTimer = setTimeout(() => {
      goShoppingHideTimer = null;
      hideGoShoppingNotice();
    }, GO_SHOPPING_NOTICE_SHOW_DURATION);
  }

  /**
   * 推入 HAR 抓取到的「去购买提醒」浮框。该提醒由用户点击商品卡片触发，并带去购买按钮。
   * @param {string} nick 用户昵称
   * @param {string} noticeText 浮框动作文案
   * @param {Object} meta 商品信息，字段对应竞品 toShopping 所需的 detail.id/img/name。
   */
  function showGoShoppingNotice(nick, noticeText = "", meta = {}) {
    const displayNick = String(nick || "").trim();
    if (!displayNick) return;
    const productMeta = meta && typeof meta === "object" ? meta : {};
    goShoppingPendingQueue.push({
      nick: displayNick,
      noticeText: String(noticeText || BUYING_NOTICE_DEFAULT_TEXT).trim() || BUYING_NOTICE_DEFAULT_TEXT,
      productId: Number(productMeta.productId || 0),
      productName: String(productMeta.productName || "").trim(),
      productImage: String(productMeta.productImage || "").trim(),
    });

    if (goShoppingThrottleTimer === null) {
      goShoppingThrottleTimer = setTimeout(() => {
        goShoppingThrottleTimer = null;
        flushGoShoppingQueue();
      }, GO_SHOPPING_NOTICE_THROTTLE);
    }
  }

  function clearProductListSuccessNotice() {
    productListSuccessNotice.value = {
      visible: false,
      phase: "entering",
      nick: "",
      productId: 0,
      productName: "",
      productImage: "",
      count: 0,
      sort: "",
      key: productListSuccessNotice.value.key,
    };
  }

  function showProductListSuccessNotice(nick, productName = "", productImage = "", meta = {}) {
    const displayNick = String(nick || "").trim();
    if (!displayNick) return;
    const productMeta = meta && typeof meta === "object" ? meta : {};
    if (successEnterTimer) { clearTimeout(successEnterTimer); successEnterTimer = null; }
    if (successTimer) { clearTimeout(successTimer); successTimer = null; }
    if (successRemoveTimer) { clearTimeout(successRemoveTimer); successRemoveTimer = null; }
    if (successDeferredTimer) { clearTimeout(successDeferredTimer); successDeferredTimer = null; }
    const defer = Boolean(productMeta.defer);
    productListSuccessNotice.value = {
      visible: true,
      phase: defer ? "entered" : "entering",
      nick: displayNick,
      productId: Number(productMeta.productId || 0),
      productName: String(productName || "").trim(),
      productImage: String(productImage || "").trim(),
      count: Number(productMeta.count || 0),
      sort: String(productMeta.sort || "").trim(),
      key: productListSuccessNotice.value.key + 1,
    };
    if (defer) {
      successDeferredTimer = setTimeout(() => {
        clearProductListSuccessNotice();
        successDeferredTimer = null;
      }, SUCCESS_NOTICE_DEFER_DURATION);
      return;
    }
    successEnterTimer = setTimeout(() => {
      productListSuccessNotice.value = {
        ...productListSuccessNotice.value,
        phase: "entered",
      };
      successEnterTimer = null;
    }, SUCCESS_NOTICE_ENTER_DELAY);
    successTimer = setTimeout(() => {
      productListSuccessNotice.value = {
        ...productListSuccessNotice.value,
        phase: "exiting",
      };
      successTimer = null;
      successRemoveTimer = setTimeout(() => {
        clearProductListSuccessNotice();
        successRemoveTimer = null;
      }, SUCCESS_NOTICE_LEAVE_DURATION);
    }, SUCCESS_NOTICE_SHOW_DURATION);
  }

  onBeforeUnmount(() => {
    clearTimers();
    stopMockRotation();
    pendingQueue.length = 0;
    goShoppingPendingQueue.length = 0;
  });

  // 商品列表弹窗打开期间轮询「N人购买了」氛围浮框。
  // 仅限本 composable 内部状态复用，不外露独立抽象；外层传入 ref 启停。
  let mockTimer = null;
  let mockStartTimer = null;
  let mockCursor = 0;
  let mockUnwatch = null;

  function pickAvailableProducts(productList) {
    const list = productList?.value || [];
    return list.filter(
      (p) => !p?.soldOut && !p?.isSoldOut && Number(p?.stock || 0) > 0,
    );
  }

  function emitMockNoticeOnce(productList) {
    const candidates = pickAvailableProducts(productList);
    if (!candidates.length) return;
    const item = candidates[mockCursor % candidates.length];
    mockCursor += 1;
    const stock = Math.max(1, Number(item.stock || 0));
    const upper = Math.min(stock, MOCK_NOTICE_MAX_COUNT);
    const count = Math.max(1, Math.floor(Math.random() * upper) + 1);
    // 商品序号取在完整列表中的实际位次，与商品列表应 1-based 序号对齐
    const fullList = productList?.value || [];
    const originIdx = fullList.findIndex(
      (p) => Number(p?.id || p?.productId || 0) === Number(item.id || 0),
    );
    const sort = originIdx >= 0 ? String(originIdx + 1) : "";
    showProductListSuccessNotice("观众", item.title || "", item.image || "", {
      productId: Number(item.id || 0),
      count,
      sort,
    });
  }

  function startMockRotation(productList) {
    stopMockRotation();
    // 列表打开后延迟 1s 再首发，避免弹窗动画未结束就冒出浮框
    mockStartTimer = setTimeout(() => {
      mockStartTimer = null;
      emitMockNoticeOnce(productList);
      mockTimer = setInterval(
        () => emitMockNoticeOnce(productList),
        MOCK_NOTICE_INTERVAL_MS,
      );
    }, MOCK_NOTICE_FIRST_DELAY_MS);
  }

  function stopMockRotation() {
    if (mockStartTimer) {
      clearTimeout(mockStartTimer);
      mockStartTimer = null;
    }
    if (mockTimer) {
      clearInterval(mockTimer);
      mockTimer = null;
    }
    mockCursor = 0;
  }

  /**
   * 绑定商品列表弹窗状态与商品列表 ref，打开期间每 5s 轮换一条未售罄商品。
   * @param {Object} params
   * @param {Ref<boolean>} params.showProductList 商品列表弹窗显示状态
   * @param {Ref<Array>} params.productList 商品列表数据
   * @param {Ref<boolean>|Function} [params.enabled] 总开关：受后台 buySuccessReminder 控制；关闭时不轮换且立刻清场
   */
  function bindProductListMockRotation({ showProductList, productList, enabled }) {
    if (!showProductList || !productList) return;
    if (mockUnwatch) {
      mockUnwatch();
      mockUnwatch = null;
    }
    const readEnabled = () => {
      if (enabled == null) return true;
      if (typeof enabled === "function") return Boolean(enabled());
      return Boolean(enabled?.value);
    };
    mockUnwatch = watch(
      () => Boolean(showProductList?.value) && readEnabled(),
      (active) => {
        if (active) {
          startMockRotation(productList);
        } else {
          stopMockRotation();
          clearProductListSuccessNotice();
        }
      },
      { immediate: true },
    );
  }

  return {
    buyingNotice,
    goShoppingNotice,
    productListSuccessNotice,
    showBuyingNotice,
    showGoShoppingNotice,
    showProductListSuccessNotice,
    bindProductListMockRotation,
  };
}
