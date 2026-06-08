import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadDebugModule() {
  delete globalThis.__liveSocketDebug;
  return import(`${pathToFileURL(join(root, "src/utils/live-socket-debug.js")).href}?t=${Date.now()}`);
}

test("live socket debug captures close failures and masks signed URLs", async () => {
  const handlers = {};
  globalThis.uni = {
    connectSocket(options = {}) {
      return {
        onOpen(handler) {
          handlers.open = handler;
        },
        onClose(handler) {
          handlers.close = handler;
        },
        onError(handler) {
          handlers.error = handler;
        },
        close(closeOptions = {}) {
          closeOptions.fail?.({ errMsg: "closeSocket:fail task not found" });
        },
      };
    },
  };

  const {
    getLiveSocketDebugSnapshot,
    installLiveSocketDebug,
  } = await loadDebugModule();

  installLiveSocketDebug(true);
  const task = globalThis.uni.connectSocket({
    url: "wss://example.test/live?token=secret&auth_key=abc",
  });
  handlers.open?.({});
  task.close({ fail() {} });

  const snapshot = getLiveSocketDebugSnapshot();
  const eventNames = snapshot.events.map((event) => event.event);
  assert.ok(eventNames.includes("connect_socket_call"));
  assert.ok(eventNames.includes("socket_open"));
  assert.ok(eventNames.includes("socket_close_call"));
  assert.ok(eventNames.includes("socket_close_fail"));
  assert.equal(
    snapshot.events.some((event) => String(event.url || "").includes("secret")),
    false,
  );
  assert.equal(
    snapshot.events.some((event) => String(event.url || "").includes("token=***")),
    true,
  );

  delete globalThis.uni;
});

test("broadcast debug report includes socket and playback diagnostics", async () => {
  const source = await readFile(join(root, "src/pages/broadcast/entry.vue"), "utf8");

  assert.match(source, /getLiveSocketDebugSnapshot/);
  assert.match(source, /socketDebug:\s*getLiveSocketDebugSnapshot\(\)/);
  assert.match(source, /sockClose:/);
  assert.match(source, /playback:\s*\{/);
  assert.match(source, /videoFrameReady:\s*videoFrameReady\.value/);
});
