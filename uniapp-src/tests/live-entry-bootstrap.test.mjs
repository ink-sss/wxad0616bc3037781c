import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadBootstrapModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-entry-bootstrap-"));
  const sourcePath = join(root, "src/pages/broadcast/composables/useLiveEntryBootstrap.js");
  const routePath = pathToFileURL(join(root, "src/utils/live-route.js")).href;
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      'import { firstTruthyQueryValue, isWxAddrDoneHit } from "./useLivePurchase.js";',
      "const firstTruthyQueryValue = (value) => Array.isArray(value) ? value.find((item) => item) : value;\nconst isWxAddrDoneHit = (value) => value === '1' || value === 1 || value === true;"
    )
    .replace(
      'import { normalizeLiveRouteOptions } from "@/utils/live-route.js";',
      `import { normalizeLiveRouteOptions } from ${JSON.stringify(routePath)};`
    )
    .replace(
      'import { bindIDManager } from "@/services/bindid";',
      "const bindIDManager = globalThis.__bindIDManager;"
    )
    .replace(
      'import { saveH5AuthContext, syncH5AuthSession } from "@/services/h5-auth-context";',
      "const saveH5AuthContext = globalThis.__saveH5AuthContext;\nconst syncH5AuthSession = globalThis.__syncH5AuthSession;"
    )
    .replace(
      'import { saveLiveRoomContext } from "@/utils/live-room-context";',
      "const saveLiveRoomContext = globalThis.__saveLiveRoomContext;"
    );
  const modulePath = join(tempDir, "useLiveEntryBootstrap.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

function createHarness(storageSeed = {}) {
  const storage = new Map(Object.entries(storageSeed));
  const redirects = [];
  const initCalls = [];
  const userStore = {
    token: "",
    setToken(token) {
      this.token = token || "";
      globalThis.uni.setStorageSync("h5_token", this.token);
      globalThis.uni.setStorageSync("token", this.token);
    },
  };

  globalThis.uni = {
    getStorageSync(key) {
      return storage.get(key) || "";
    },
    setStorageSync(key, value) {
      storage.set(key, value);
    },
    removeStorageSync(key) {
      storage.delete(key);
    },
    redirectTo(payload) {
      redirects.push(payload);
    },
    showToast() {},
    getSystemInfoSync() {
      return { platform: "devtools", screenHeight: 800, safeArea: { bottom: 800 } };
    },
  };

  globalThis.__bindIDManager = {
    setBindId(bindId) {
      storage.set("bindIDManager.bindId", bindId);
    },
    async smartAutoLogin() {
      storage.set("bindIDManager.smartAutoLogin", "1");
    },
  };
  globalThis.__syncH5AuthSession = (payload = {}) => {
    const token = payload.wx_token || payload.wxToken || payload.h5_token || payload.token || "";
    if (token) {
      storage.set("h5_token", token);
      storage.set("token", token);
      userStore.token = token;
    }
    return { token };
  };
  globalThis.__saveH5AuthContext = (context = {}) => {
    const saved = { ...context, ts: Date.now() };
    storage.set("mp_h5_auth_context_v1", saved);
    return saved;
  };
  globalThis.__saveLiveRoomContext = (context = {}) => {
    storage.set("mp_live_room_context_v1", context);
    return context;
  };

  const ctx = {
    userStore,
    pendingRecoverBuyCtx: { value: null },
    setShowEntryOverlay() {},
    setShowWxAddrDonePlayBtn() {},
    setPendingSubscribeBack() {},
    isDebugLocalLogin: () => false,
    getLiveDetail: async () => ({ tenantId: 15 }),
    setSafeBottom() {},
    setIsIOSKeyboardMode() {},
    syncKeyboardViewportBaseHeight() {},
    initLive(options) {
      initCalls.push(options);
    },
    nextTick(callback) {
      callback();
    },
    scrollToBottom() {},
  };

  return { ctx, storage, redirects, initCalls };
}

test("wx_token entry stores token and live-room context before initLive", async () => {
  const { ctx, storage, initCalls } = createHarness();
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({
    roomCode: "mrdrawwfd4wq",
    tenantId: "15",
    liveType: "replay",
    _tc: "xthxirwe9f",
    wx_token: "token-1",
  }, ctx);

  assert.equal(storage.get("h5_token"), "token-1");
  assert.equal(storage.get("token"), "token-1");
  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "mrdrawwfd4wq");
  assert.equal(storage.get("mp_live_room_context_v1").tenantId, "15");
  assert.equal(storage.get("mp_live_room_context_v1").liveType, "replay");
  assert.equal(storage.get("mp_live_room_context_v1")._tc, "xthxirwe9f");
  assert.equal(initCalls.length, 1);
  assert.equal(initCalls[0].wx_token, undefined);
});

test("scene can carry equivalent live-room params", async () => {
  const { ctx, storage, initCalls } = createHarness();
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({
    scene: encodeURIComponent("roomCode=mrdrawwfd4wq&tenantId=15&liveType=replay&_tc=xthxirwe9f&wx_token=token-2"),
  }, ctx);

  assert.equal(storage.get("h5_token"), "token-2");
  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "mrdrawwfd4wq");
  assert.equal(initCalls[0].roomCode, "mrdrawwfd4wq");
  assert.equal(initCalls[0].liveType, "replay");
});

test("scene can carry H5 search token plus hash live-room params", async () => {
  const { ctx, storage, initCalls } = createHarness();
  const { runLiveEntryBootstrap } = await loadBootstrapModule();
  const h5Url = "http://localhost:5173?wx_token=token-2b#/pages/broadcast/entry?roomCode=mrdrawwfd4wq&tenantId=15&liveType=replay&_tc=xthxirwe9f";

  await runLiveEntryBootstrap({ scene: encodeURIComponent(h5Url) }, ctx);

  assert.equal(storage.get("h5_token"), "token-2b");
  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "mrdrawwfd4wq");
  assert.equal(storage.get("mp_live_room_context_v1").tenantId, "15");
  assert.equal(JSON.stringify(storage.get("mp_live_room_context_v1")).includes("token-2b"), false);
  assert.equal(initCalls[0].roomCode, "mrdrawwfd4wq");
  assert.equal(initCalls[0]._tc, "xthxirwe9f");
});

test("bindId with wx_token persists bind context without dropping token", async () => {
  const { ctx, storage } = createHarness();
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({
    roomCode: "mrdrawwfd4wq",
    bindId: "bind-123",
    wx_token: "token-3",
  }, ctx);

  assert.equal(storage.get("currentBindId"), "bind-123");
  assert.equal(storage.get("h5_token"), "token-3");
  assert.equal(storage.get("token"), "token-3");
});

test("missing token redirects to login and keeps original broadcast query", async () => {
  const { ctx, redirects, initCalls } = createHarness();
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({
    roomCode: "mrdrawwfd4wq",
    tenantId: "15",
    liveType: "replay",
    _tc: "xthxirwe9f",
  }, ctx);

  assert.equal(initCalls.length, 0);
  assert.equal(redirects.length, 1);
  const url = redirects[0].url;
  assert.match(url, /^\/pagesPlus\/main\/login\/login\?/);
  assert.match(decodeURIComponent(url), /\/pages\/broadcast\/entry\?roomCode=mrdrawwfd4wq/);
  assert.match(decodeURIComponent(url), /tenantId=15/);
  assert.match(decodeURIComponent(url), /liveType=replay/);
  assert.match(decodeURIComponent(url), /_tc=xthxirwe9f/);
});

test("debugLive=1 has no source token fallback", async () => {
  const { ctx, storage, redirects } = createHarness({
    debug_live_room_code: "mrdrawwfd4wq",
    debug_live_tenant_id: "15",
    debug_live_type: "replay",
  });
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({ debugLive: "1" }, ctx);

  assert.equal(storage.get("h5_token"), undefined);
  assert.equal(storage.get("token"), undefined);
  assert.equal(redirects.length, 1);
});
