import assert from "node:assert/strict";
import test from "node:test";

import { buildCenterStats, mergePendingOrderTotal, useLiveSidePanels } from "../src/pages/broadcast/composables/useLiveSidePanels.js";

test("buildCenterStats maps H5 unread stat fields", () => {
  assert.deepEqual(
    buildCenterStats(
      { unpay: "1", unsend: 2, unreceive: "3" },
      { refund: "4" },
    ),
    { waitPay: 1, waitShip: 2, waitReceive: 3, refunding: 4 },
  );
});

test("buildCenterStats maps uniapp personal-center aliases", () => {
  assert.deepEqual(
    buildCenterStats(
      { waitPay: "5", waitShip: "6", waitReceive: "7" },
      { refunding: "8" },
    ),
    { waitPay: 5, waitShip: 6, waitReceive: 7, refunding: 8 },
  );
});

test("buildCenterStats maps legacy Mini Program aliases", () => {
  assert.deepEqual(
    buildCenterStats(
      { payment: "9", delivery: "10", received: "11" },
      { processing: "12" },
    ),
    { waitPay: 9, waitShip: 10, waitReceive: 11, refunding: 12 },
  );
});

test("buildCenterStats keeps explicit zero values and falls back to order refund", () => {
  assert.deepEqual(
    buildCenterStats(
      { pendingPay: "13", waitDelivery: "14", wait_receive: "15", refund: "16" },
      {},
    ),
    { waitPay: 13, waitShip: 14, waitReceive: 15, refunding: 16 },
  );
  assert.deepEqual(
    buildCenterStats(
      { pendingPay: "13", refund: "16" },
      { refund: 0 },
    ),
    { waitPay: 13, waitShip: 0, waitReceive: 0, refunding: 0 },
  );
});

test("buildCenterStats maps missing or blank values to zero", () => {
  assert.deepEqual(
    buildCenterStats(
      { payment: "", waitShip: null, waitReceive: undefined },
      { total: "" },
    ),
    { waitPay: 0, waitShip: 0, waitReceive: 0, refunding: 0 },
  );
});

test("mergePendingOrderTotal keeps pending pay badge after unread stats are consumed", () => {
  assert.deepEqual(
    mergePendingOrderTotal(
      { waitPay: 0, waitShip: 0, waitReceive: 0, refunding: 0 },
      { total: 1 },
    ),
    { waitPay: 1, waitShip: 0, waitReceive: 0, refunding: 0 },
  );
  assert.deepEqual(
    mergePendingOrderTotal(
      { waitPay: 3, waitShip: 0, waitReceive: 0, refunding: 0 },
      { total: 1 },
    ),
    { waitPay: 3, waitShip: 0, waitReceive: 0, refunding: 0 },
  );
});

test("refreshCenterOrderStats updates pending payment badge data", async () => {
  const orderListCalls = [];
  const panels = useLiveSidePanels({
    liveId: { value: 77 },
    roomCode: { value: "room-code" },
    roomCurrentTermId: { value: 99 },
    myUserId: { value: 100 },
    liveTenantId: { value: 12 },
    shareCode: { value: "" },
    liveBindId: { value: "" },
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    anchorName: { value: "anchor" },
    anchorAvatar: { value: "" },
    userStore: {
      token: "token",
      userInfo: {},
      setUserInfo(value) {
        this.userInfo = value;
      },
    },
    getLiveRedirectUrl: () => "/pages/broadcast/entry?roomCode=room-code",
    isDebugLocalLogin: () => false,
    ensureBuyAddressLoaded: async () => {},
    addressPopupSource: { value: "" },
    showAddressPopup: { value: false },
    getCenter: async () => ({ customer: { nickname: "viewer" } }),
    getOrderUnreadStats: async () => ({ unpay: "0", unsend: 0, unreceive: 0 }),
    getOrderList: async (params) => {
      orderListCalls.push(params);
      return { total: 2, list: [{}] };
    },
    getRefundUnreadStats: async () => ({ refund: 0 }),
    checkSigned: async () => ({}),
    uniApi: {
      navigateTo() {},
      showToast() {},
    },
    logger: {
      error() {},
      warn() {},
    },
  });

  assert.equal(panels.centerPopupOrderStats.value.waitPay, 0);

  await panels.refreshCenterOrderStats();

  assert.equal(panels.centerPopupOrderStats.value.waitPay, 2);
  assert.deepEqual(orderListCalls, [{ page: 1, pageSize: 1, orderStatus: 1 }]);
});
