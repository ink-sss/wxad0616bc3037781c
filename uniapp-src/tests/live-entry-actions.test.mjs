import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadEntryActionsModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-entry-actions-"));
  const sourcePath = join(root, "src/pages/broadcast/composables/useLiveEntryActions.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import { computed, ref } from "vue";', "const ref = (value) => ({ value });\nconst computed = (getter) => ({ get value() { return getter(); } });")
    .replace('import { useTapLikeEffect } from "../../../utils/useTapLikeEffect.js";', "const useTapLikeEffect = () => ({ tapEffects: { value: [] }, comboInfo: { value: {} }, onScreenTap() {}, finishTapEffect() {} });")
    .replace('import { ZAN_IMAGES } from "../utils/entry-format.js";', "const ZAN_IMAGES = ['heart.png'];");
  const modulePath = join(tempDir, "useLiveEntryActions.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

async function withFakeTimers(callback) {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = () => ({ mocked: true });
  globalThis.clearTimeout = () => {};
  try {
    await callback();
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
}

async function createEntryActions(overrides = {}) {
  const { useLiveEntryActions } = await loadEntryActionsModule();
  const likeCount = { value: 0 };
  const activeTabIndex = { value: "0" };
  const activeTab = { value: "interact" };
  const loadCalls = [];
  const ctx = {
    mode: { value: "portrait" },
    showProductList: { value: false },
    productLoading: { value: false },
    productList: { value: [] },
    loadProductList(...args) {
      loadCalls.push(args);
    },
    activeTabIndex,
    activeTab,
    currentProduct: { value: null },
    getEffectiveTermId: () => 0,
    liveId: { value: 12 },
    roomCode: { value: "R1" },
    liveTenantId: { value: 15 },
    shareCode: { value: "S1" },
    liveBindId: { value: "B1" },
    isReplay: { value: false },
    myUserId: { value: 66 },
    likeCount,
    sendLike: async () => {},
    getLiveSocket: () => null,
    isMuted: { value: false },
    getVideoPlayer: () => null,
    roomSetting: { value: { enableLike: 1, showProduct: 1, enableChat: 1 } },
    isTruthyFlag: Boolean,
    signConfig: { value: { enabled: false } },
    ...overrides,
  };
  return {
    likeCount,
    activeTabIndex,
    activeTab,
    loadCalls,
    actions: useLiveEntryActions(ctx),
  };
}

test("live like sends through IM/WS with the H5 argument shape", async () => {
  await withFakeTimers(async () => {
    const channelCalls = [];
    const httpCalls = [];
    const { actions } = await createEntryActions({
      getLiveSocket: () => ({
        sendLike: async (...args) => {
          channelCalls.push(args);
          return true;
        },
      }),
      sendLike: async (...args) => {
        httpCalls.push(args);
      },
    });

    actions.doLike();
    const result = await actions.flushPendingLikes();

    assert.equal(result, true);
    assert.deepEqual(channelCalls, [[1]]);
    assert.deepEqual(httpCalls, []);
  });
});

test("live like HTTP fallback keeps the H5 argument shape", async () => {
  await withFakeTimers(async () => {
    const channelCalls = [];
    const httpCalls = [];
    const { actions } = await createEntryActions({
      liveId: { value: 88 },
      getLiveSocket: () => ({
        sendLike: async (...args) => {
          channelCalls.push(args);
          return false;
        },
      }),
      sendLike: async (...args) => {
        httpCalls.push(args);
      },
    });

    actions.doLike();
    const result = await actions.flushPendingLikes();

    assert.equal(result, false);
    assert.deepEqual(channelCalls, [[1]]);
    assert.deepEqual(httpCalls, [[88, 1]]);
  });
});

test("landscape model-value tab update switches the content panel to products", async () => {
  const { actions, activeTabIndex, activeTab, loadCalls } = await createEntryActions({
    mode: { value: "landscape" },
  });

  actions.setActiveTabIndex("1");

  assert.equal(activeTabIndex.value, "1");
  assert.equal(activeTab.value, "products");
  assert.deepEqual(loadCalls, [[true]]);
});

test("landscape change event payload switches the content panel to products", async () => {
  const { actions, activeTabIndex, activeTab, loadCalls } = await createEntryActions({
    mode: { value: "landscape" },
  });

  actions.onTabChange({ name: "1" });

  assert.equal(activeTabIndex.value, "1");
  assert.equal(activeTab.value, "products");
  assert.deepEqual(loadCalls, [[true]]);
});

test("landscape mini-program native detail payload switches the content panel to products", async () => {
  const { actions, activeTabIndex, activeTab, loadCalls } = await createEntryActions({
    mode: { value: "landscape" },
  });

  actions.setActiveTabIndex({ detail: "1" });

  assert.equal(activeTabIndex.value, "1");
  assert.equal(activeTab.value, "products");
  assert.deepEqual(loadCalls, [[true]]);
});

test("landscape uni-app event bridge args switch the content panel to products", async () => {
  const { actions, activeTabIndex, activeTab, loadCalls } = await createEntryActions({
    mode: { value: "landscape" },
  });

  actions.setActiveTabIndex({ detail: { __args__: ["1"] } });

  assert.equal(activeTabIndex.value, "1");
  assert.equal(activeTab.value, "products");
  assert.deepEqual(loadCalls, [[true]]);
});

test("landscape tab switch records normalized debug state", async () => {
  const events = [];
  const { actions, activeTabIndex, activeTab, loadCalls } = await createEntryActions({
    mode: { value: "landscape" },
    recordTabDebugEvent(type, detail) {
      events.push({ type, detail });
    },
  });

  actions.setActiveTabIndex({ detail: { __args__: ["1"] } });

  assert.equal(activeTabIndex.value, "1");
  assert.equal(activeTab.value, "products");
  assert.deepEqual(loadCalls, [[true]]);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "tab:setActiveTabIndex");
  assert.equal(events[0].detail.parsedName, "1");
  assert.equal(events[0].detail.nextActiveTab, "products");
  assert.equal(events[0].detail.shouldLoadProducts, true);
});
