import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("live IM channel uses the Easemob uni-app SDK entry", async () => {
  const source = await readFile(join(root, "src/pages/broadcast/composables/useIMChannel.js"), "utf8");

  assert.match(source, /easemob-websdk\/uniApp\/Easemob-chat/);
  assert.match(source, /uni\.WebIM\s*=\s*EC/);
  assert.match(source, /isHttpDNS:\s*false/);
  assert.match(source, /useOwnUploadFun:\s*true/);
  assert.match(source, /isAutoLogin:\s*false/);
  assert.match(source, /joinChatRoom\(\{\s*roomId:\s*String\(imInfo\.mainChatroomId\),\s*leaveOtherRooms:\s*false\s*\}\)/);
  assert.match(source, /init_reused_same_room/);
  assert.match(source, /expectedClose/);
  assert.match(source, /closeRequestedBy/);
  assert.match(source, /type:\s*"close_event"/);
  assert.doesNotMatch(source, /from\s+["']easemob-websdk["']/);
  assert.doesNotMatch(source, /_getSock\s*=/);
});

async function loadIMChannelModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-im-channel-"));
  const sourcePath = join(root, "src/pages/broadcast/composables/useIMChannel.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import EC from "easemob-websdk/uniApp/Easemob-chat";', "const EC = globalThis.__EC;")
    .replace('import { ref } from "vue";', "const ref = (value) => ({ value });")
    .replace('import { getImToken } from "@/api/live.js";', "const getImToken = globalThis.__getImToken;")
    .replace('import { useUserStore } from "@/stores/user";', "const useUserStore = globalThis.__useUserStore;");
  const modulePath = join(tempDir, "useIMChannel.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

function createDeferred() {
  let resolvePromise;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}

async function waitUntil(condition, label) {
  for (let i = 0; i < 20; i += 1) {
    if (condition()) return;
    await Promise.resolve();
  }
  assert.fail(label);
}

test("live IM channel reuses same-liveId init without closing connecting or opened SDK sockets", async () => {
  const calls = [];
  const openParams = [];
  const openGate = createDeferred();
  globalThis.uni = {};
  globalThis.__getImToken = async () => ({
    appKey: "org#app",
    imUsername: "viewer_1",
    imToken: "token",
    mainChatroomId: "room_1",
  });
  globalThis.__useUserStore = () => ({ userInfo: {}, token: "viewer-token" });
  globalThis.__EC = {
    logger: { disableAll() {} },
    message: { create(payload) { return payload; } },
    connection: class MockConnection {
      constructor() {
        calls.push("conn:new");
        this.handlers = {};
      }
      addEventHandler(_, handlers) {
        this.handlers = handlers;
      }
      async open(params) {
        openParams.push(params);
        calls.push("conn:open");
        await openGate.promise;
        this.handlers.onConnected?.();
      }
      async joinChatRoom() {
        calls.push("conn:join");
      }
      async leaveChatRoom() {
        calls.push("conn:leave");
      }
      close() {
        calls.push("conn:close");
      }
      isOpened() {
        return false;
      }
    },
  };

  const { useIMChannel } = await loadIMChannelModule();
  const channel = useIMChannel({
    liveId: { value: 123 },
    loadCommentHistory() {},
    handleWsMessage() {},
    onOpen() {},
  });

  const firstInit = channel.initWebSocket();
  await waitUntil(() => calls.includes("conn:open"), "first init did not reach SDK open");
  const pendingReuse = channel.initWebSocket();

  assert.equal(calls.filter((item) => item === "conn:new").length, 1);
  assert.equal(calls.filter((item) => item === "conn:open").length, 1);
  assert.equal(calls.filter((item) => item === "conn:close").length, 0);

  openGate.resolve();
  assert.equal(await firstInit, true);
  assert.equal(await pendingReuse, true);
  assert.equal(openParams[0].user, "viewer_1");
  assert.equal(openParams[0].accessToken, "token");
  await waitUntil(() => calls.includes("conn:join"), "first init did not join chatroom");

  assert.equal(await channel.initWebSocket(), true);
  assert.equal(calls.filter((item) => item === "conn:new").length, 1);
  assert.equal(calls.filter((item) => item === "conn:close").length, 0);
  assert.equal(channel.imDebugState.value.lastEvent, "init_reused_same_room");
});

test("live IM channel does not use object-shaped user fields as Easemob username", async () => {
  const openParams = [];
  globalThis.uni = {};
  globalThis.__getImToken = async () => ({
    appKey: "org#app",
    user: { id: 88, nickname: "viewer" },
    imUsername: "viewer_88",
    imToken: "token-88",
    mainChatroomId: "room_88",
  });
  globalThis.__useUserStore = () => ({ userInfo: {}, token: "viewer-token" });
  globalThis.__EC = {
    logger: { disableAll() {} },
    message: { create(payload) { return payload; } },
    connection: class MockConnection {
      constructor() {
        this.handlers = {};
      }
      addEventHandler(_, handlers) {
        this.handlers = handlers;
      }
      async open(params) {
        openParams.push(params);
        this.handlers.onConnected?.();
      }
      async joinChatRoom() {}
      isOpened() {
        return true;
      }
      close() {}
    },
  };

  const { useIMChannel } = await loadIMChannelModule();
  const channel = useIMChannel({
    liveId: { value: 88 },
    loadCommentHistory() {},
    handleWsMessage() {},
    onOpen() {},
  });

  assert.equal(await channel.initWebSocket(), true);
  assert.equal(openParams[0].user, "viewer_88");
  assert.notEqual(openParams[0].user, "[object Object]");
  assert.equal(channel.imDebugState.value.imUsername, "viewer_88");
});

test("live IM channel prefers miniprogram IM login fields over generic user and token fields", async () => {
  const openParams = [];
  globalThis.uni = {};
  globalThis.__getImToken = async () => ({
    appKey: "org#app",
    username: "customer_870",
    token: "business-token",
    im_user_id: "im_customer_870",
    im_user_sig: "easemob-user-token",
    main_chatroom_id: "room_870",
  });
  globalThis.__useUserStore = () => ({ userInfo: {}, token: "viewer-token" });
  globalThis.__EC = {
    logger: { disableAll() {} },
    message: { create(payload) { return payload; } },
    connection: class MockConnection {
      constructor() {
        this.handlers = {};
      }
      addEventHandler(_, handlers) {
        this.handlers = handlers;
      }
      async open(params) {
        openParams.push(params);
        this.handlers.onConnected?.();
      }
      async joinChatRoom() {}
      isOpened() {
        return true;
      }
      close() {}
    },
  };

  const { useIMChannel } = await loadIMChannelModule();
  const channel = useIMChannel({
    liveId: { value: 870 },
    loadCommentHistory() {},
    handleWsMessage() {},
    onOpen() {},
  });

  assert.equal(await channel.initWebSocket(), true);
  assert.equal(openParams[0].user, "im_customer_870");
  assert.equal(openParams[0].accessToken, "easemob-user-token");
  assert.equal(channel.imDebugState.value.imUsername, "im_customer_870");
  assert.deepEqual(channel.imDebugState.value.rawFieldKeys, [
    "appKey",
    "username",
    "token",
    "im_user_id",
    "im_user_sig",
    "main_chatroom_id",
  ]);
});
