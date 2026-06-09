import assert from "node:assert/strict";
import test from "node:test";

import {
  extractMiniProgramRoute,
  navigateToPrizeRecord,
  normalizeAppRoute,
} from "../src/utils/route-navigation.js";

test("extractMiniProgramRoute recognizes pagesPlus routes", () => {
  assert.equal(
    extractMiniProgramRoute("https://example.test/#/pagesPlus/main/prize-record/index?roomCode=room-1"),
    "/pagesPlus/main/prize-record/index?roomCode=room-1",
  );
  assert.equal(
    extractMiniProgramRoute("https://example.test/pagesPlus/main/prize-record/index?roomCode=room-2"),
    "/pagesPlus/main/prize-record/index?roomCode=room-2",
  );
});

test("normalizeAppRoute keeps current prize record route with query", () => {
  assert.equal(
    normalizeAppRoute("pagesPlus/main/prize-record/index?roomCode=room-3"),
    "/pagesPlus/main/prize-record/index?roomCode=room-3",
  );
});

test("navigateToPrizeRecord always lands on the uniapp winning record page", () => {
  const navigations = [];
  const redirects = [];
  const uniApi = {
    navigateTo(payload) {
      navigations.push(payload);
    },
    redirectTo(payload) {
      redirects.push(payload);
    },
  };

  navigateToPrizeRecord("/pagesPlus/main/prize-record/index?roomCode=room-4", { uniApi });
  navigateToPrizeRecord("/pages/prize-record/index?roomCode=room-5", { uniApi });
  navigateToPrizeRecord("https://example.test/#/pages/prize-record/index?roomCode=room-6", { uniApi });

  assert.deepEqual(
    navigations.map((item) => item.url),
    [
      "/pagesPlus/main/prize-record/index?roomCode=room-4",
      "/pagesPlus/main/prize-record/index?roomCode=room-5",
      "/pagesPlus/main/prize-record/index?roomCode=room-6",
    ],
  );
  assert.equal(navigations.every((item) => typeof item.fail === "function"), true);
  assert.equal(redirects.length, 0);
});
