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

function installChannelStubs(calls) {
  globalThis.__useIMChannel = () => ({
    imState: { value: "idle" },
    async initWebSocket() {
      calls.push("im:init");
      return true;
    },
    getLiveSocket() {
      return { channel: "im" };
    },
    closeLiveSocket() {
      calls.push("im:close");
    },
  });
  globalThis.__useLiveWebSocket = () => ({
    wsState: { value: "idle" },
    async initWebSocket() {
      calls.push("ws:init");
      return true;
    },
    getLiveSocket() {
      return { channel: "ws" };
    },
    closeLiveSocket() {
      calls.push("ws:close");
    },
  });
}

test("live groupType uses the third-party IM adapter for chat sending", async () => {
  const calls = [];
  installChannelStubs(calls);
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  await channel.initWebSocket("wss://live-ws");

  assert.deepEqual(calls, ["im:init"]);
  assert.deepEqual(channel.getLiveSocket(), { channel: "im" });
});

test("live groupType still initializes IM when backend websocket url is empty", async () => {
  const calls = [];
  installChannelStubs(calls);
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  const result = await channel.initWebSocket("");

  assert.equal(result, true);
  assert.deepEqual(calls, ["im:init"]);
  assert.deepEqual(channel.getLiveSocket(), { channel: "im" });
});

test("live groupType does not fall back to backend websocket when IM init fails", async () => {
  const calls = [];
  installChannelStubs(calls);
  globalThis.__useIMChannel = () => ({
    imState: { value: "error" },
    async initWebSocket() {
      calls.push("im:init");
      return false;
    },
    getLiveSocket() {
      return { channel: "im" };
    },
  });
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  const result = await channel.initWebSocket("wss://live-ws");

  assert.equal(result, false);
  assert.deepEqual(calls, ["im:init"]);
  assert.deepEqual(channel.getLiveSocket(), { channel: "im" });
});

test("live groupType suppresses fallback enter on IM path", async () => {
  const calls = [];
  installChannelStubs(calls);
  globalThis.__useIMChannel = () => ({
    imState: { value: "open" },
    async initWebSocket() {
      calls.push("im:init");
      return true;
    },
    getLiveSocket() {
      return {
        sendEnter() {
          calls.push("im:enter");
        },
      };
    },
  });
  const { useMessageChannel } = await loadMessageChannelModule();

  const channel = useMessageChannel({
    roomGroupType: { value: 0 },
    liveId: { value: 123 },
  });

  await channel.initWebSocket("wss://live-ws");
  channel.sendFallbackEnter();

  assert.deepEqual(calls, ["im:init"]);
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
  assert.deepEqual(channel.getLiveSocket(), { channel: "ws" });
});
