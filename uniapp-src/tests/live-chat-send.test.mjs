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

function createOpenSignedSocket() {
  const sent = [];
  const socket = new MiniLiveSocket({
    liveId: 123,
    signKey: "test-sign-key",
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

async function withFakeSocketRuntime(callback) {
  const originalUni = globalThis.uni;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  const timers = [];
  let nextTimerId = 1;
  globalThis.setTimeout = (fn) => {
    const id = nextTimerId;
    nextTimerId += 1;
    timers.push({ id, fn, cleared: false });
    return id;
  };
  globalThis.clearTimeout = (id) => {
    const timer = timers.find((item) => item.id === id);
    if (timer) timer.cleared = true;
  };
  globalThis.setInterval = () => ({ interval: true });
  globalThis.clearInterval = () => {};
  try {
    await callback({
      async flushTimers() {
        while (timers.length > 0) {
          const timer = timers.shift();
          if (timer.cleared) continue;
          await timer.fn();
          await Promise.resolve();
        }
      },
    });
  } finally {
    globalThis.uni = originalUni;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
  }
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

test("mini live enter sends the same plain payload shape as H5", async () => {
  const { socket, sent } = createOpenSocket();

  const result = await socket.sendEnter();

  assert.equal(result, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, 3);
  assert.equal(typeof sent[0].msgId, "string");
  assert.ok(sent[0].msgId);
  assert.deepEqual(Object.keys(sent[0]).sort(), ["msgId", "type"]);
});

test("mini live enter signs an H5-compatible websocket envelope payload", async () => {
  const { socket, sent } = createOpenSignedSocket();

  const result = await socket.sendEnter();

  assert.equal(result, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].v, 1);
  assert.equal(sent[0].enc, false);
  assert.equal(typeof sent[0].ts, "number");
  assert.equal(typeof sent[0].nonce, "string");
  assert.equal(typeof sent[0].sig, "string");
  assert.equal(sent[0].payload.type, 3);
  assert.equal(typeof sent[0].payload.msgId, "string");
  assert.ok(sent[0].payload.msgId);
  assert.deepEqual(Object.keys(sent[0].payload).sort(), ["msgId", "type"]);
});

test("mini live socket actively sends enter after websocket opens", async () => {
  await withFakeSocketRuntime(async ({ flushTimers }) => {
    const sent = [];
    let openHandler = null;
    globalThis.uni = {
      connectSocket() {
        return {
          onOpen(callback) {
            openHandler = callback;
          },
          onMessage() {},
          onClose() {},
          onError() {},
          send({ data, success }) {
            sent.push(JSON.parse(data));
            success?.();
          },
          close() {},
        };
      },
    };
    const socket = new MiniLiveSocket({
      url: "wss://live.example/ws",
      liveId: 123,
      sendEnterOnOpen: true,
      enterSendDelay: 0,
      enterRetryDelay: 0,
    });

    socket.connect();
    openHandler?.();
    await flushTimers();

    assert.equal(sent.length, 1);
    assert.equal(sent[0].type, 3);
    assert.equal(typeof sent[0].msgId, "string");
    assert.deepEqual(Object.keys(sent[0]).sort(), ["msgId", "type"]);
    assert.equal(socket.getDebugState().lastSendOk, true);
    assert.equal(socket.getDebugState().lastSendType, 3);
    assert.equal(socket.getDebugState().lastSendMethod, "socket.send");
    assert.equal(socket.getDebugState().lastSendPayload.type, 3);
  });
});

test("mini live socket retries active enter once with the same msgId", async () => {
  await withFakeSocketRuntime(async ({ flushTimers }) => {
    const sent = [];
    let openHandler = null;
    globalThis.uni = {
      connectSocket() {
        return {
          onOpen(callback) {
            openHandler = callback;
          },
          onMessage() {},
          onClose() {},
          onError() {},
          send({ data, success, fail }) {
            sent.push(JSON.parse(data));
            if (sent.length === 1) {
              fail?.();
              return;
            }
            success?.();
          },
          close() {},
        };
      },
    };
    const socket = new MiniLiveSocket({
      url: "wss://live.example/ws",
      liveId: 123,
      sendEnterOnOpen: true,
      enterSendDelay: 0,
      enterRetryDelay: 0,
    });

    socket.connect();
    openHandler?.();
    await flushTimers();

    assert.equal(sent.length, 2);
    assert.equal(sent[0].type, 3);
    assert.equal(sent[1].type, 3);
    assert.equal(sent[0].msgId, sent[1].msgId);
    assert.deepEqual(Object.keys(sent[0]).sort(), ["msgId", "type"]);
    assert.deepEqual(Object.keys(sent[1]).sort(), ["msgId", "type"]);
    assert.equal(socket.getDebugState().lastSendOk, true);
    assert.equal(socket.getDebugState().sendFailCount, 1);
    assert.equal(socket.getDebugState().sendOkCount, 1);
  });
});

test("mini live socket sends enter when first message arrives before onOpen callback", async () => {
  await withFakeSocketRuntime(async ({ flushTimers }) => {
    const sent = [];
    const received = [];
    let messageHandler = null;
    globalThis.uni = {
      connectSocket() {
        return {
          onOpen() {},
          onMessage(callback) {
            messageHandler = callback;
          },
          onClose() {},
          onError() {},
          send({ data, success }) {
            sent.push(JSON.parse(data));
            success?.();
          },
          close() {},
        };
      },
    };
    const socket = new MiniLiveSocket({
      url: "wss://live.example/ws",
      liveId: 123,
      sendEnterOnOpen: true,
      enterSendDelay: 0,
      enterRetryDelay: 0,
      onMessage(message) {
        received.push(message);
      },
    });

    socket.connect();
    messageHandler?.({
      data: JSON.stringify({
        type: 18,
        content: "商品列表",
        data: [],
      }),
    });
    await flushTimers();

    assert.equal(socket.getState(), "open");
    assert.equal(socket.getDebugState().lastEvent, "send_success");
    assert.equal(socket.getDebugState().implicitOpenCount, 1);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].type, 3);
    assert.equal(typeof sent[0].msgId, "string");
    assert.equal(received.length, 1);
    assert.equal(received[0].type, "product_list");
  });
});

test("mini live socket swallows close task not found failures", () => {
  const socket = new MiniLiveSocket({ liveId: 123 });
  socket.socket = {
    close() {
      throw new Error("closeSocket:fail task not found");
    },
  };
  socket.open = true;
  socket.setState("open");

  assert.doesNotThrow(() => socket.close());
  assert.equal(socket.getState(), "closed");
  assert.equal(socket.getDebugState().closeFailCount, 1);
  assert.match(socket.getDebugState().lastCloseFail, /task not found/);
});

test("mini live socket skips close when socket task was never opened", () => {
  let closeCalled = 0;
  const socket = new MiniLiveSocket({ liveId: 123 });
  socket.socket = {
    close() {
      closeCalled += 1;
    },
  };

  assert.doesNotThrow(() => socket.close());
  assert.equal(closeCalled, 0);
  assert.equal(socket.getState(), "closed");
  assert.equal(socket.getDebugState().lastCloseFail, "not_open");
});

test("mini live socket skips close while task is still connecting", () => {
  let closeCalled = 0;
  const socket = new MiniLiveSocket({ liveId: 123 });
  socket.socket = {
    close() {
      closeCalled += 1;
    },
  };
  socket.setState("connecting");

  socket.close();

  assert.equal(closeCalled, 0);
  assert.equal(socket.getState(), "closed");
  assert.equal(socket.getDebugState().lastCloseFail, "not_open");
});
