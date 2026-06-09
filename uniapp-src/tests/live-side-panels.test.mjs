import assert from "node:assert/strict";
import test from "node:test";

import { buildCenterStats } from "../src/pages/broadcast/composables/useLiveSidePanels.js";

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
