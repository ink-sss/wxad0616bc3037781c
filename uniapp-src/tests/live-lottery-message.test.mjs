import assert from "node:assert/strict";
import test from "node:test";

import {
  appendLotteryWinMessage,
  getLotteryWinnerName,
} from "../src/pages/broadcast/composables/live-lottery-message.js";

test("lottery winner name reads snake_case nickname aliases", () => {
  assert.equal(getLotteryWinnerName({ nick_name: "中华用户" }), "中华用户");
  assert.equal(getLotteryWinnerName({ user_name: "发发发" }), "发发发");
});

test("lottery winner message reads nickname from nested winner objects", () => {
  const messages = [];

  appendLotteryWinMessage(
    (message) => messages.push(message),
    new Set(),
    {
      record_id: 88,
      customer: {
        nickname: "中奖昵称",
      },
      prize_name: "幸运奖品",
    },
  );

  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, "lottery_win");
  assert.equal(messages[0].nick, "中奖昵称");
  assert.equal(messages[0].content, "中奖昵称获得幸运奖品");
});

test("lottery winner message only falls back when no nickname exists", () => {
  const messages = [];

  appendLotteryWinMessage(
    (message) => messages.push(message),
    new Set(),
    {
      recordId: 99,
      prizeName: "兜底奖品",
    },
  );

  assert.equal(messages[0].nick, "中奖用户");
  assert.equal(messages[0].content, "中奖用户获得兜底奖品");
});
