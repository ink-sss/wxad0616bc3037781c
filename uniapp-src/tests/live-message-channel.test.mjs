import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadMessageChannelModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-message-channel-"));
  const sourcePath = join(root, "src/pages/broadcast/composables/useMessageChannel.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import { computed } from "vue";', "const computed = (getter) => ({ get value() { return getter(); } });")
    .replace('import { useLiveWebSocket } from "./useLiveWebSocket.js";', "const useLiveWebSocket = globalThis.__useLiveWebSocket;")
    .replace('import { useIMChannel } from "./useIMChannel.js";', "const useIMChannel = globalThis.__useIMChannel;");
  const modulePath = join(tempDir, "useMessageChannel.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

function installChannelStubs(calls, options = {}) {
  globalThis.__useIMChannel = () => ({
    imState: { value: options.imState || "idle" },
    async initWebSocket() {
      calls.push("im:init");
      return options.imInitResult ?? true;
    },
    getLiveSocket() {
      return {
        channel: "im",
        sendEnter() {
          calls.push("im:enter");
        },
      };
    },
    closeLiveSocket() {
      calls.push("im:close");
    },
  });
  globalThis.__useLiveWebSocket = () => ({
    wsState: { value: options.wsState || "idle" },
    wsDebugState: { value: options.wsDebugState || { lastEvent: "stub", lastSendOk: null } },
    async initWebSocket() {
      calls.push("ws:init");
      return options.wsInitResult ?? true;
    },
    getLiveSocket() {
      return {
        channel: "ws",
        open: options.wsOpen ?? true,
        getState() {
          return options.wsSocketState || (options.wsOpen === false ? "connecting" : "open");
        },
        sendEnter() {
          calls.push("ws:enter");
        },
      };
    },
    closeLiveSocket() {
      calls.push("ws:close");
    },
  });
}

test("live groupType matches H5 dual channel and sends chat through backend websocket", async () => {
  const calls = [];
  installChannelStubs(calls);
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  await channel.initWebSocket("wss://live-ws");

  assert.deepEqual(calls, ["im:init", "ws:init"]);
  assert.equal(channel.getLiveSocket()?.channel, "ws");
  assert.equal(channel.channelDebugState.value.dualMode, true);
  assert.equal(channel.channelDebugState.value.mode, "dual");
  assert.equal(channel.channelDebugState.value.active, "im+ws");
  assert.equal(channel.channelDebugState.value.sendChannel, "ws");
  assert.equal(channel.channelDebugState.value.ws.lastEvent, "stub");
});

test("live groupType uses IM send adapter while backend websocket is still connecting", async () => {
  const calls = [];
  installChannelStubs(calls, { wsState: "connecting", wsOpen: false });
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  await channel.initWebSocket("wss://live-ws");

  assert.deepEqual(calls, ["im:init", "ws:init"]);
  assert.equal(channel.getLiveSocket()?.channel, "im");
  assert.equal(channel.channelDebugState.value.dualMode, true);
  assert.equal(channel.channelDebugState.value.wsState, "connecting");
  assert.equal(channel.channelDebugState.value.sendChannel, "im");
});

test("live groupType keeps IM selected if backend websocket init returns false", async () => {
  const calls = [];
  installChannelStubs(calls, { wsInitResult: false });
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  const result = await channel.initWebSocket("");

  assert.equal(result, true);
  assert.deepEqual(calls, ["im:init", "ws:init"]);
  assert.equal(channel.getLiveSocket()?.channel, "im");
  assert.equal(channel.channelDebugState.value.dualMode, false);
  assert.equal(channel.channelDebugState.value.mode, "im");
});

test("live groupType falls back to backend websocket when IM init fails", async () => {
  const calls = [];
  installChannelStubs(calls, { imInitResult: false, imState: "error" });
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  const result = await channel.initWebSocket("wss://live-ws");

  assert.equal(result, true);
  assert.deepEqual(calls, ["im:init", "ws:init"]);
  assert.equal(channel.getLiveSocket()?.channel, "ws");
  assert.equal(channel.channelDebugState.value.dualMode, false);
  assert.equal(channel.channelDebugState.value.mode, "ws");
});

test("live groupType sends fallback enter through IM in dual mode", async () => {
  const calls = [];
  installChannelStubs(calls, { imState: "open" });
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  await channel.initWebSocket("wss://live-ws");
  channel.sendFallbackEnter();

  assert.deepEqual(calls, ["im:init", "ws:init", "im:enter"]);
});

test("live groupType closes both channels in dual mode", async () => {
  const calls = [];
  installChannelStubs(calls);
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  await channel.initWebSocket("wss://live-ws");
  channel.closeLiveSocket();

  assert.deepEqual(calls, ["im:init", "ws:init", "im:close", "ws:close"]);
  assert.equal(channel.channelDebugState.value.dualMode, false);
});

test("replay groupType keeps using websocket for timeline comments", async () => {
  const calls = [];
  installChannelStubs(calls);
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 1 },
    liveId: { value: 123 },
  });

  await channel.initWebSocket("wss://live-ws");

  assert.deepEqual(calls, ["ws:init"]);
  assert.equal(channel.getLiveSocket()?.channel, "ws");
});
