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
  const routeDebugPath = pathToFileURL(join(root, "src/utils/live-route-debug.js")).href;
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      'import { firstTruthyQueryValue, isWxAddrDoneHit } from "./useLivePurchase.js";',
      "const firstTruthyQueryValue = (value) => Array.isArray(value) ? value.find((item) => item) : value;\nconst isWxAddrDoneHit = (value) => value === '1' || value === 1 || value === true;"
    )
    .replace(
      'import { normalizeLiveRouteOptions, parseScene } from "@/utils/live-route.js";',
      `import { normalizeLiveRouteOptions, parseScene } from ${JSON.stringify(routePath)};`
    )
    .replace(
      'import { normalizeLiveRouteOptions } from "@/utils/live-route.js";',
      `import { normalizeLiveRouteOptions } from ${JSON.stringify(routePath)};`
    )
    .replace(
      'import { logLiveRouteInput, logLiveRouteNormalized } from "@/utils/live-route-debug.js";',
      `import { logLiveRouteInput, logLiveRouteNormalized } from ${JSON.stringify(routeDebugPath)};`
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

async function loadStartupModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "miniprogram-startup-"));
  const sourcePath = join(root, "src/services/miniprogram-startup.js");
  const routePath = pathToFileURL(join(root, "src/utils/live-route.js")).href;
  const routeDebugPath = pathToFileURL(join(root, "src/utils/live-route-debug.js")).href;
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { fetchLoginSetting, reportMiniProgramVersion } from '@/api/login.js'",
      "const fetchLoginSetting = globalThis.__fetchLoginSetting;\nconst reportMiniProgramVersion = globalThis.__reportMiniProgramVersion;"
    )
    .replace(
      "import { getAccountInfo } from '@/platform/weixin/account.js'",
      "const getAccountInfo = globalThis.__getAccountInfo;"
    )
    .replace(
      "import { getRuntimeConfig } from '@/utils/runtime-config.js'",
      "const getRuntimeConfig = globalThis.__getRuntimeConfig;"
    )
    .replace(
      "import { normalizeLiveRouteOptions } from '@/utils/live-route.js'",
      `import { normalizeLiveRouteOptions } from ${JSON.stringify(routePath)};`
    )
    .replace(
      "import { logLiveRouteInput, logLiveRouteNormalized } from '@/utils/live-route-debug.js'",
      `import { logLiveRouteInput, logLiveRouteNormalized } from ${JSON.stringify(routeDebugPath)};`
    )
    .replace(
      "import { saveLiveRoomContext } from '@/utils/live-room-context.js'",
      "const saveLiveRoomContext = globalThis.__saveLiveRoomContext;"
    );
  const modulePath = join(tempDir, "miniprogram-startup.mjs");
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

test("scene can carry short live-room aliases", async () => {
  const { ctx, storage, initCalls } = createHarness();
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({
    scene: encodeURIComponent("sc=mrdrawwfd4wq&lt=replay&tenantId=15&_tc=xthxirwe9f&wx_token=token-short"),
  }, ctx);

  assert.equal(storage.get("h5_token"), "token-short");
  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "mrdrawwfd4wq");
  assert.equal(storage.get("mp_live_room_context_v1").shareCode, "mrdrawwfd4wq");
  assert.equal(storage.get("mp_live_room_context_v1").liveType, "replay");
  assert.equal(initCalls[0].roomCode, "mrdrawwfd4wq");
  assert.equal(initCalls[0].shareCode, "mrdrawwfd4wq");
  assert.equal(initCalls[0].liveType, "replay");
});

test("entry keeps current live-room params", async () => {
  const { ctx, storage, initCalls } = createHarness();
  ctx.userStore.token = "token-current";
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({
    roomCode: "miufct6sqaqh",
    tenantId: "15",
    liveType: "live",
    _tc: "xthxirwe9f",
  }, ctx);

  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "miufct6sqaqh");
  assert.equal(storage.get("mp_live_room_context_v1").tenantId, "15");
  assert.equal(storage.get("mp_live_room_context_v1").liveType, "live");
  assert.equal(storage.get("mp_live_room_context_v1")._tc, "xthxirwe9f");
  assert.equal(initCalls.length, 1);
  assert.equal(initCalls[0].roomCode, "miufct6sqaqh");
  assert.equal(initCalls[0].tenantId, "15");
  assert.equal(initCalls[0].liveType, "live");
  assert.equal(initCalls[0]._tc, "xthxirwe9f");
});

test("comma scene can carry legacy key:value params", async () => {
  const { ctx, storage, initCalls } = createHarness();
  ctx.userStore.token = "token-legacy-scene";
  const { runLiveEntryBootstrap } = await loadBootstrapModule();

  await runLiveEntryBootstrap({
    scene: encodeURIComponent("roomCode:miufct6sqaqh,tenantId:15,liveType:live,_tc:xthxirwe9f,uid:874"),
  }, ctx);

  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "miufct6sqaqh");
  assert.equal(storage.get("mp_live_room_context_v1").tenantId, "15");
  assert.equal(initCalls.length, 1);
  assert.equal(initCalls[0].roomCode, "miufct6sqaqh");
  assert.equal(initCalls[0].uid, "874");
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

test("mini-program startup persists scene and loginSetting compatibility storage", async () => {
  const { storage } = createHarness();
  const versionReports = [];
  globalThis.__fetchLoginSetting = async () => ({
    appVersion: "0.9.0",
    setting: {
      mp_open: 1,
      wx_open: 1,
      wx_phone: 0,
      h5_sms_open: 1,
      is_login: 1,
      live_page: "2",
    },
    im_setting: {
      im_sdk_appid: "sdk-1",
      im_user_id: "im-user",
      im_user_sig: "im-sig",
    },
  });
  globalThis.__reportMiniProgramVersion = async (version, options) => {
    versionReports.push({ version, options });
    return { code: 1 };
  };
  globalThis.__getAccountInfo = () => ({
    miniProgram: {
      appId: "wx-test",
      version: "1.0.0",
    },
  });
  globalThis.__getRuntimeConfig = () => ({
    app_id: 393016,
    appid: "wx-config",
    miniprogram_appid: "wx-config",
  });
  globalThis.getApp = () => ({ globalData: {} });
  const app = { globalData: {} };
  const { runMiniProgramStartup } = await loadStartupModule();

  await runMiniProgramStartup({
    query: {
      scene: encodeURIComponent("roomCode:miufct6sqaqh,tenantId:15,liveType:live,_tc:xthxirwe9f,uid:874,live_id:1001,shop_supplier_id:15"),
    },
  }, app);

  assert.equal(storage.get("referee_id"), "874");
  assert.equal(storage.get("shop_supplier_id"), "15");
  assert.equal(app.globalData.live_id, "1001");
  assert.equal(app.globalData.shop_supplier_id, "15");
  assert.equal(app.globalData.is_login, 1);
  assert.equal(app.globalData.live_page, "2");
  assert.equal(app.globalData.SDKAppID, "sdk-1");
  assert.equal(app.globalData.imUserId, "im-user");
  assert.equal(app.globalData.imUserSig, "im-sig");
  assert.equal(storage.get("mpState"), 1);
  assert.equal(storage.get("wxOpen"), 1);
  assert.equal(storage.get("wxBinding"), 0);
  assert.equal(storage.get("smsOpen"), 1);
  assert.deepEqual(storage.get("setting_393016"), {
    mp_open: 1,
    wx_open: 1,
    wx_phone: 0,
    h5_sms_open: 1,
    is_login: 1,
    live_page: "2",
  });
  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "miufct6sqaqh");
  assert.equal(versionReports.length, 1);
  assert.equal(versionReports[0].version, "1.0.0");
  assert.equal(versionReports[0].options.appid, "wx-test");
});

test("mini-program startup maps short scene aliases", async () => {
  const { storage } = createHarness();
  globalThis.__fetchLoginSetting = async () => ({ appVersion: "1.0.0", setting: {}, im_setting: {} });
  globalThis.__reportMiniProgramVersion = async () => ({ code: 1 });
  globalThis.__getAccountInfo = () => ({
    miniProgram: {
      appId: "wx-test",
      version: "1.0.0",
    },
  });
  globalThis.__getRuntimeConfig = () => ({
    app_id: 393016,
    appid: "wx-config",
    miniprogram_appid: "wx-config",
  });
  const app = { globalData: {} };
  const { runMiniProgramStartup } = await loadStartupModule();

  const normalized = await runMiniProgramStartup({
    query: {
      scene: encodeURIComponent("sc=mrdrawwfd4wq&lt=live&tenantId=15&_tc=xthxirwe9f"),
    },
  }, app);

  assert.equal(normalized.roomCode, "mrdrawwfd4wq");
  assert.equal(normalized.shareCode, "mrdrawwfd4wq");
  assert.equal(normalized.liveType, "live");
  assert.equal(storage.get("mp_live_room_context_v1").roomCode, "mrdrawwfd4wq");
  assert.equal(storage.get("mp_live_room_context_v1").liveType, "live");
});
