import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildPendingOrderListUrl,
  handleCreatedOrderPaymentCancel,
  isPaymentCancelError,
} from "../src/services/order-payment-cancel.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("payment cancel helper recognizes H5 and mini-program cancel errors", () => {
  assert.equal(isPaymentCancelError(new Error("用户取消支付")), true);
  assert.equal(isPaymentCancelError({ errMsg: "requestPayment:fail cancel" }), true);
  assert.equal(isPaymentCancelError({ message: "支付失败" }), false);
});

test("created order payment cancel navigates to pending order list", () => {
  const navigations = [];
  const toasts = [];
  const handled = handleCreatedOrderPaymentCancel({
    err: { errMsg: "requestPayment:fail cancel" },
    orderNo: "NO1",
    roomCode: "room-code",
    uniApi: {
      navigateTo(payload) {
        navigations.push(payload);
      },
      showToast(payload) {
        toasts.push(payload);
      },
    },
  });

  assert.equal(handled, true);
  assert.equal(buildPendingOrderListUrl("room-code"), "/pages/order/list?status=unpay&roomCode=room-code");
  assert.deepEqual(navigations, [
    { url: "/pages/order/list?status=unpay&roomCode=room-code" },
  ]);
  assert.deepEqual(toasts, [
    { title: "用户取消支付", icon: "none" },
  ]);
});

test("payment cancel helper ignores cancel-like errors before order creation", () => {
  const navigations = [];
  const toasts = [];
  const handled = handleCreatedOrderPaymentCancel({
    err: new Error("用户取消支付"),
    orderNo: "",
    roomCode: "room-code",
    uniApi: {
      navigateTo(payload) {
        navigations.push(payload);
      },
      showToast(payload) {
        toasts.push(payload);
      },
    },
  });

  assert.equal(handled, false);
  assert.deepEqual(navigations, []);
  assert.deepEqual(toasts, []);
});

test("order confirm payment flow uses created-order cancel handling", async () => {
  const source = await readFile(resolve(root, "src/pages/order/confirm.vue"), "utf8");
  assert.match(source, /handleCreatedOrderPaymentCancel/);
  assert.match(source, /orderNo:\s*createdOrderNo/);
  assert.match(source, /roomCode:\s*liveRoomCode\.value/);
});
