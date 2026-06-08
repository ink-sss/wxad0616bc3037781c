import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readSource(path) {
  return readFile(join(root, path), "utf8");
}

test("broadcast entry skips mini-program entry overlay and defaults to sound playback", async () => {
  const entry = await readSource("src/pages/broadcast/entry.vue");
  const initializer = await readSource("src/pages/broadcast/composables/useLiveEntryInitializer.js");
  const displayState = await readSource("src/pages/broadcast/composables/useLiveDisplayState.js");

  assert.match(entry, /const\s+isMuted\s*=\s*ref\(false\);/);
  assert.match(entry, /showEntryOverlay,\s*\n\s*shouldShowEntryOverlay,/);
  assert.match(entry, /liveOverlayTitle,\s*shouldShowEntryOverlay,/);
  assert.doesNotMatch(initializer, /isMuted\.value\s*=\s*true/);
  assert.match(initializer, /isMuted\.value\s*=\s*false/);
  assert.match(initializer, /import\s+\{\s*isMpWeixinRuntime\s*\}/);
  assert.match(initializer, /!\s*isWeChatIOSH5\s*&&\s*!\s*isMpWeixinRuntime\(\)/);
  assert.match(initializer, /function\s+isEntryOverlayVisible\(\)/);
  assert.match(initializer, /isEntryOverlayVisible\(\)\s*\|\|\s*accessDenied\.value/);
  assert.doesNotMatch(initializer, /sessionId\.value\s*\|\|\s*showEntryOverlay\.value\s*\|\|\s*accessDenied\.value/);
  assert.match(displayState, /!\s*isMpWeixinRuntime\(\)\s*&&\s*showEntryOverlay\.value/);
});

test("broadcast stages keep media components sound-enabled", async () => {
  const portrait = await readSource("src/pages/broadcast/components/LivePortraitStage.vue");
  const landscape = await readSource("src/pages/broadcast/components/LiveLandscapeStage.vue");
  const landscapeControls = await readSource("src/pages/broadcast/styles/entry-landscape-live-controls.scss");

  for (const source of [portrait, landscape]) {
    assert.doesNotMatch(source, /:muted="isMuted"/);
    assert.match(source, /:muted="false"/);
    assert.match(source, /sound-mode="speaker"/);
    assert.match(source, /:mute-on-audio-conflict="false"/);
    assert.match(source, /:show-mute-btn="false"/);
  }
  assert.match(landscape, /id="liveVideo"/);
  assert.doesNotMatch(landscape, /id="liveVideo\s+/);
  assert.doesNotMatch(landscape, /video-mini-controls__mute/);
  assert.doesNotMatch(landscapeControls, /video-mini-controls__mute/);
});

test("player wrappers force sound through native playback contexts", async () => {
  const playerInitializer = await readSource("src/pages/broadcast/composables/useLivePlayerInitializer.js");
  const videoRuntime = await readSource("src/pages/broadcast/composables/useLiveVideoRuntime.js");
  const miniProgramSound = await readSource("src/pages/broadcast/composables/useMiniProgramSoundPlayback.js");
  const stageBinding = await readSource("src/pages/broadcast/composables/useLiveStageBinding.js");
  const videoPlay = await readSource("src/utils/videoPlay.js");

  assert.doesNotMatch(playerInitializer, /player\.muted\s*=\s*!!isMuted\.value/);
  assert.doesNotMatch(playerInitializer, /this\.muted\s*=\s*!!value/);
  assert.match(playerInitializer, /this\.muted\s*=\s*false/);
  assert.match(playerInitializer, /applyMiniProgramSoundPlayback/);
  assert.match(playerInitializer, /mini_player_sound_restore/);
  assert.match(playerInitializer, /mini_player_reuse_same_source/);
  assert.match(playerInitializer, /oldPlayer\.url\s*===\s*playUrl/);
  assert.match(playerInitializer, /return\s+oldPlayer/);
  assert.match(playerInitializer, /soundMode:\s*"speaker"/);
  assert.match(playerInitializer, /muted:\s*false/);
  assert.match(videoRuntime, /applyMiniProgramSoundPlayback/);
  assert.match(miniProgramSound, /safeCall\(context,\s*"unmute"\)/);
  assert.match(miniProgramSound, /safeCall\(context,\s*"setSoundMode",\s*\["speaker"\]\)/);
  assert.match(miniProgramSound, /safeCall\(context,\s*"setMuted",\s*\[false\]\)/);
  assert.match(miniProgramSound, /safeCall\(context,\s*"setVolume",\s*\[1\]\)/);
  assert.doesNotMatch(miniProgramSound, /safeCall\(context,\s*"mute"/);
  assert.doesNotMatch(stageBinding, /const\s+muted\s*=\s*!ctx\.isMuted\.value/);
  assert.match(stageBinding, /ctx\.isMuted\.value\s*=\s*false/);
  assert.match(videoPlay, /muted:\s*false/);
  assert.doesNotMatch(videoPlay, /this\.muted\s*=\s*!!value/);
  assert.doesNotMatch(videoPlay, /context\?\.mute\?\.\(/);
  assert.match(videoPlay, /setVolume\?\.\(1\)/);
  assert.match(videoPlay, /unmute\?\.\(\)/);
});

test("mini-program sound playback applies native unmute and play commands", async () => {
  const moduleUrl = pathToFileURL(join(root, "src/pages/broadcast/composables/useMiniProgramSoundPlayback.js")).href;
  const { applyMiniProgramSoundPlayback } = await import(moduleUrl);
  const liveCalls = [];
  const videoCalls = [];
  const liveContext = {
    unmute() { liveCalls.push(["unmute"]); },
    setSoundMode(mode) { liveCalls.push(["setSoundMode", mode]); },
    play() { liveCalls.push(["play"]); },
    resume() { liveCalls.push(["resume"]); },
  };
  const videoContext = {
    setMuted(value) { videoCalls.push(["setMuted", value]); },
    setVolume(value) { videoCalls.push(["setVolume", value]); },
    play() { videoCalls.push(["play"]); },
  };

  assert.equal(applyMiniProgramSoundPlayback({
    knownComponent: "live-player",
    createMediaContext: (_id, type) => type === "live-player" ? liveContext : null,
  }), true);
  assert.deepEqual(liveCalls, [
    ["unmute"],
    ["setSoundMode", "speaker"],
    ["play"],
    ["resume"],
  ]);

  assert.equal(applyMiniProgramSoundPlayback({
    knownComponent: "video",
    createMediaContext: (_id, type) => type === "video" ? videoContext : null,
  }), true);
  assert.deepEqual(videoCalls, [
    ["setMuted", false],
    ["setVolume", 1],
    ["play"],
  ]);
});

test("live mini-window state keeps sound intent but autoplays muted", async () => {
  const broadcastMini = await readSource("src/pages/broadcast/composables/useLiveMiniWindow.js");
  const globalMini = await readSource("src/composables/useLiveMiniWindow.js");
  const globalMiniComponent = await readSource("src/components/live-mini-window.vue");

  assert.match(broadcastMini, /muted:\s*false/);
  assert.match(broadcastMini, /canPlayWithSound:\s*true/);
  assert.match(broadcastMini, /soundMutedByUser:\s*false/);
  assert.doesNotMatch(broadcastMini, /setMuted\(true\)/);
  assert.match(globalMini, /const\s+muted\s*=\s*ref\(true\)/);
  assert.match(globalMini, /muted\.value\s*=\s*true/);
  assert.match(globalMiniComponent, /:muted="muted"/);
});

test("live mini-window removes poster overlay after playback starts", async () => {
  const globalMiniComponent = await readSource("src/components/live-mini-window.vue");

  assert.match(globalMiniComponent, /v-if="hasPlayableSource && poster && !isPlaying"/);
  assert.match(globalMiniComponent, /v-else-if="!hasPlayableSource && poster"/);
  assert.doesNotMatch(globalMiniComponent, /v-else-if="poster"/);
});

test("live mini-window can recover room code from cached mini state", async () => {
  const globalMini = await readSource("src/composables/useLiveMiniWindow.js");

  assert.match(globalMini, /function\s+getCachedMiniRoomCode\(\)/);
  assert.match(globalMini, /loadLiveMiniState\(\)\?\.roomCode/);
  assert.match(globalMini, /loadLiveRoomContext\(\)\?\.roomCode\)\s*\|\|\s*getCachedMiniRoomCode\(\)/);
  assert.match(globalMini, /return\s+getCachedMiniRoomCode\(\)/);
});

test("live mini-window exposes secondary page debug report", async () => {
  const globalMini = await readSource("src/composables/useLiveMiniWindow.js");
  const globalMiniComponent = await readSource("src/components/live-mini-window.vue");
  const debugFloat = await readSource("src/components/live-mini-debug-float.vue");
  const userCenter = await readSource("src/pages/user/index/index.vue");

  assert.match(globalMiniComponent, /<live-mini-debug-float/);
  assert.match(globalMiniComponent, /:show="debugVisible"/);
  assert.match(globalMiniComponent, /@copy="copyDebugInfo"/);
  assert.match(globalMini, /const\s+debugVisible\s*=\s*computed\(\(\)\s*=>\s*true\)/);
  assert.match(globalMini, /function\s+buildDebugReport\(\)/);
  assert.match(globalMini, /hideReason/);
  assert.match(globalMini, /snapshotStorage\(\)/);
  assert.match(globalMini, /route:\s*getCurrentRoute\(\)/);
  assert.match(globalMini, /uni\.setClipboardData/);
  assert.match(debugFloat, /小窗调试/);
  assert.match(debugFloat, /复制信息/);
  assert.match(userCenter, /<live-mini-window\s+:room-code="liveRoomCode"/);
  assert.match(userCenter, /liveRoomCode\(\)\s*\{\s*\n\s*return\s+this\.liveRoomContext\?\.roomCode/);
});
