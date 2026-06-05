import assert from "node:assert/strict";
import test from "node:test";

import { MiniLiveSocket } from "../src/utils/mini-live-socket.js";

function createOpenSocket() {
  const sent = [];
  const socket = new MiniLiveSocket({
    liveId: 123,
    context: {
      roomCode: "room-a",
      tenantId: 15,
      termId: 9,
      customerId: 88,
    },
    user: {
      customerId: 88,
      nickname: "观众",
      avatar: "avatar.png",
    },
  });
  socket.socket = {
    send({ data, success }) {
      sent.push(JSON.parse(data));
      success?.();
    },
  };
  socket.open = true;
  return { socket, sent };
}

test("mini live chat sends the same plain payload shape as H5", async () => {
  const { socket, sent } = createOpenSocket();

  const result = await socket.sendChat("发一条", undefined, { msgId: "msg-1" });

  assert.equal(result, true);
  assert.deepEqual(sent[0], {
    type: 1,
    content: "发一条",
    msgId: "msg-1",
  });
});

test("mini replay chat keeps H5 timeline data without injecting room context", async () => {
  const { socket, sent } = createOpenSocket();

  const result = await socket.sendChat(
    "回放弹幕",
    { timelineSeconds: 12, replayVideoId: 7 },
    { msgId: "msg-2" },
  );

  assert.equal(result, true);
  assert.deepEqual(sent[0], {
    type: 1,
    content: "回放弹幕",
    msgId: "msg-2",
    data: {
      timelineSeconds: 12,
      replayVideoId: 7,
    },
  });
});
