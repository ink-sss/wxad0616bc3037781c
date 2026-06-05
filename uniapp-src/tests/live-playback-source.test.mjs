import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadLiveSourceModule(tempDir) {
  const sourcePath = join(root, "src/pages/broadcast/utils/live-source.js");
  const routePath = pathToFileURL(join(root, "src/utils/live-route.js")).href;
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      'import { parseAbsoluteUrl, removeUrlQueryParam } from "@/utils/url-helpers.js";',
      `const parseAbsoluteUrl = (rawUrl = "", options = {}) => {
        let value = String(rawUrl || "").trim();
        if (!value) return null;
        if (!/^[a-z][a-z\\d+.-]*:\\/\\//i.test(value)) {
          if (options.assumeDomain === false || value.startsWith("/")) return null;
          value = "https://" + value;
        }
        const parsed = new URL(value);
        return {
          origin: parsed.origin,
          pathname: parsed.pathname,
          search: parsed.search,
        };
      };
      const removeUrlQueryParam = (rawUrl = "", paramName = "") => {
        const value = String(rawUrl || "").trim();
        const queryIndex = value.indexOf("?");
        if (queryIndex < 0) return value.split("#")[0];
        const path = value.slice(0, queryIndex);
        const query = value.slice(queryIndex + 1).split("#")[0];
        const nextQuery = query
          .split("&")
          .filter((part) => part && part.split("=")[0].toLowerCase() !== String(paramName).toLowerCase())
          .join("&");
        return path + (nextQuery ? "?" + nextQuery : "");
      };`
    )
    .replace(
      'import { getMiniProgramLiveCandidates, isLivePlayerSource, isVideoSource } from "@/utils/live-route.js";',
      `import { getMiniProgramLiveCandidates, isLivePlayerSource, isVideoSource } from ${JSON.stringify(routePath)};`
    );
  const modulePath = join(tempDir, "live-source.mjs");
  await writeFile(modulePath, source, "utf8");
  return { modulePath, module: await import(pathToFileURL(modulePath).href) };
}

async function loadLiveStatusSnapshotModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-playback-source-"));
  const liveSource = await loadLiveSourceModule(tempDir);
  const sourcePath = join(root, "src/pages/broadcast/utils/live-status-snapshot.js");
  let source = await readFile(sourcePath, "utf8");
  source = source.replace(
    'from "./live-source.js";',
    `from ${JSON.stringify(pathToFileURL(liveSource.modulePath).href)};`
  );
  const modulePath = join(tempDir, "live-status-snapshot.mjs");
  await writeFile(modulePath, source, "utf8");
  return {
    liveSource: liveSource.module,
    liveStatusSnapshot: await import(pathToFileURL(modulePath).href),
  };
}

async function loadLiveEntryInitializerHelpersModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-entry-helper-"));
  const liveSource = await loadLiveSourceModule(tempDir);
  const sourcePath = join(root, "src/pages/broadcast/composables/live-entry-initializer-helpers.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      'import { getLiveStreamInf } from "@/api/live.js";',
      "const getLiveStreamInf = async () => null;"
    )
    .replace(
      'import { getMiniProgramLiveCandidates } from "@/utils/live-route.js";',
      `import { getMiniProgramLiveCandidates } from ${JSON.stringify(pathToFileURL(join(root, "src/utils/live-route.js")).href)};`
    )
    .replace(
      'import { selectReplayVideoPlaybackSource } from "@/utils/videoPlay.js";',
      "const selectReplayVideoPlaybackSource = (video = {}) => ({ playUrl: video.videoUrl || video.video_url || video.url || '', backupUrl: '', sourceType: 'mp4' });"
    )
    .replace(
      'import { safeParseReplayTime } from "../utils/entry-format.js";',
      "const safeParseReplayTime = (value = '') => Date.parse(String(value).replace(/-/g, '/')) || 0;"
    )
    .replace(
      /import \{\n  buildStreamPlaybackOptions,\n  isIOSRuntime,\n  normalizeLiveSourceUrlKey,\n  normalizePullStreams,\n  selectMiniProgramLiveCandidate,\n  selectDefaultStream,\n  shouldPreferMiniProgramHlsPlayback,\n\} from "\.\.\/utils\/live-source\.js";/,
      `import {
        buildStreamPlaybackOptions,
        isIOSRuntime,
        normalizeLiveSourceUrlKey,
        normalizePullStreams,
        selectMiniProgramLiveCandidate,
        selectDefaultStream,
        shouldPreferMiniProgramHlsPlayback,
      } from ${JSON.stringify(pathToFileURL(liveSource.modulePath).href)};`
    );
  const modulePath = join(tempDir, "live-entry-initializer-helpers.mjs");
  await writeFile(modulePath, source, "utf8");
  return await import(pathToFileURL(modulePath).href);
}

function createStatusContext(overrides = {}) {
  const events = [];
  const initCalls = [];
  const sourceUpdates = [];
  const player = {
    url: overrides.activeUrl || "https://hls.yaakoo123.cn/live/room_235.m3u8?auth_key=old",
    updateSources(url, options) {
      sourceUpdates.push({ url, options });
    },
  };
  return {
    events,
    initCalls,
    sourceUpdates,
    player,
    ctx: {
      pushStatus: { value: 1 },
      isPlaying: { value: overrides.isPlaying ?? true },
      videoFrameReady: { value: overrides.videoFrameReady ?? true },
      setViewerCountDisplay() {},
      viewerCount: { value: "" },
      likeCount: { value: 0 },
      isReplay: { value: false },
      isScheduleWarmupMode: () => false,
      isWaitingSchedule: { value: false },
      pullUrl: { value: player.url },
      messages: { value: [] },
      refreshPinnedMessage() {},
      initVideoPlayer(...args) {
        initCalls.push(args);
      },
      getVideoPlayer: () => player,
      recordPlaybackDebugEvent(type, payload) {
        events.push({ type, payload });
      },
      updateSignedStreams() {},
      getPreferredLiveQuality: () => "",
    },
  };
}

const statusPayload = {
  pushStatus: 1,
  pullRtmpUrl: "rtmp://hls.yaakoo123.cn/live/room_235?auth_key=new",
  pullFlvUrl: "https://hls.yaakoo123.cn/live/room_235.flv?auth_key=new",
  pullHlsUrl: "https://hls.yaakoo123.cn/live/room_235.m3u8?auth_key=new",
};

const statusPayloadWithAdaptive = {
  ...statusPayload,
  adaptiveHlsUrl: "https://hls.yaakoo123.cn/live/room_235_abrv2.m3u8?auth_key=new",
};

function setDevtoolsRuntime() {
  globalThis.uni = {
    getSystemInfoSync() {
      return { platform: "devtools", system: "iOS 10.0.1" };
    },
  };
}

function setMiniProgramRuntime(appId = "") {
  globalThis.uni = {
    getSystemInfoSync() {
      return { platform: "android", system: "Android 12" };
    },
    getAccountInfoSync() {
      return { miniProgram: { appId } };
    },
  };
}

test("mini-program live source selection prefers HLS video in devtools", async () => {
  setDevtoolsRuntime();
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-select-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);

  const selected = liveSource.selectMiniProgramLiveCandidate([
    { url: statusPayload.pullHlsUrl, type: "hls", component: "video" },
    { url: statusPayload.pullRtmpUrl, type: "rtmp", component: "live-player" },
    { url: statusPayload.pullFlvUrl, type: "flv", component: "live-player" },
  ], { preferHls: true });

  assert.equal(selected.url, statusPayload.pullHlsUrl);
  assert.equal(selected.component, "video");
});

test("mini-program live source selection always prefers HLS video", async () => {
  setMiniProgramRuntime();
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-native-select-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);

  const selected = liveSource.selectMiniProgramLiveCandidate([
    { url: statusPayload.pullHlsUrl, type: "hls", component: "video" },
    { url: statusPayload.pullFlvUrl, type: "flv", component: "live-player" },
    { url: statusPayload.pullRtmpUrl, type: "rtmp", component: "live-player" },
  ]);

  assert.equal(selected.url, statusPayload.pullHlsUrl);
  assert.equal(selected.component, "video");
  assert.equal(selected.type, "hls");
});

test("mini-program live candidates keep normal HLS before adaptive HLS", async () => {
  setDevtoolsRuntime();
  const { getMiniProgramLiveCandidates } = await import(pathToFileURL(join(root, "src/utils/live-route.js")).href);
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-adaptive-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);
  const normalHlsUrl = "https://hls.yaakoo123.cn/live/room_235.m3u8?auth_key=normal";
  const adaptiveHlsUrl = "https://hls.yaakoo123.cn/live/room_235_abrv2.m3u8?auth_key=adaptive";
  const candidates = getMiniProgramLiveCandidates({
    adaptiveHlsUrl,
    pullHlsUrl: normalHlsUrl,
  });

  assert.equal(candidates[0].url, normalHlsUrl);
  assert.equal(candidates[1].url, adaptiveHlsUrl);
  assert.equal(candidates[1].isAdaptiveHls, true);

  const selected = liveSource.selectMiniProgramLiveCandidate(candidates, { preferHls: true });
  assert.equal(selected.url, normalHlsUrl);
});

test("adaptive HLS is selected in devtools when it is the only viable HLS source", async () => {
  setDevtoolsRuntime();
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-adaptive-only-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);
  const adaptiveHlsUrl = "https://hls.yaakoo123.cn/live/room_235_abrv2.m3u8?auth_key=adaptive";

  const selected = liveSource.resolveStatusPullUrl({
    adaptiveHlsUrl,
    pullFlvUrl: statusPayload.pullFlvUrl,
  });

  assert.equal(selected, adaptiveHlsUrl);
});

test("live pull URL fallback keeps normal HLS before adaptive HLS", async () => {
  const helpers = await loadLiveEntryInitializerHelpersModule();
  const normalHlsUrl = "https://hls.yaakoo123.cn/live/room_235_http.m3u8?auth_key=normal";
  const adaptiveHlsUrl = "https://hls.yaakoo123.cn/live/room_235_abrv2.m3u8?auth_key=adaptive";

  assert.equal(helpers.resolveLivePullUrl({
    adaptiveHlsUrl,
    httpHlsUrl: normalHlsUrl,
  }, true), normalHlsUrl);

  assert.equal(helpers.resolveLivePullUrl({
    adaptiveHlsUrl,
    pullFlvUrl: statusPayload.pullFlvUrl,
  }, true), adaptiveHlsUrl);

  assert.equal(helpers.resolveLivePullUrl({
    pullFlvUrl: statusPayload.pullFlvUrl,
    pullRtmpUrl: statusPayload.pullRtmpUrl,
  }, true), "");
});

test("pull stream normalization follows video HLS priority for mini-program playback", async () => {
  setMiniProgramRuntime();
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-streams-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);

  const [stream] = liveSource.normalizePullStreams({
    pullStreams: [{
      quality: "origin",
      rtmpUrl: statusPayload.pullRtmpUrl,
      flvUrl: statusPayload.pullFlvUrl,
      hlsUrl: statusPayload.pullHlsUrl,
    }],
  }, true);

  assert.equal(stream.playUrl, statusPayload.pullHlsUrl);
  assert.equal(stream.sourceType, "hls");
  assert.equal(stream.sourceComponent, "video");
});

test("pull stream normalization keeps default HLS before adaptive HLS", async () => {
  setDevtoolsRuntime();
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-streams-adaptive-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);
  const adaptiveHlsUrl = "https://hls.yaakoo123.cn/live/room_235_abrv2.m3u8?auth_key=adaptive";

  const [stream] = liveSource.normalizePullStreams({
    pullStreams: [{
      quality: "origin",
      hlsUrl: statusPayload.pullHlsUrl,
      adaptiveHlsUrl,
    }],
  }, true);

  assert.equal(stream.playUrl, statusPayload.pullHlsUrl);
  assert.equal(stream.normalHlsUrl, statusPayload.pullHlsUrl);
  assert.equal(stream.adaptiveHlsUrl, adaptiveHlsUrl);
});

test("status source selection keeps origin HLS before adaptive HLS in devtools", async () => {
  setDevtoolsRuntime();
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-status-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);

  const selected = liveSource.resolveStatusPullUrl({
    ...statusPayloadWithAdaptive,
    pullStreams: [{
      quality: "origin",
      flvUrl: statusPayload.pullFlvUrl,
      hlsUrl: statusPayload.pullHlsUrl,
      rtmpUrl: statusPayload.pullRtmpUrl,
    }],
  });

  assert.equal(selected, statusPayload.pullHlsUrl);
});

test("native mini-program runtime prefers HLS video regardless of appId", async () => {
  setMiniProgramRuntime("wx-live-enabled");
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-blocked-appid-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);

  const selected = liveSource.resolveStatusPullUrl(statusPayloadWithAdaptive);
  const options = liveSource.buildStatusPlaybackOptions(statusPayloadWithAdaptive, selected);

  assert.equal(selected, statusPayload.pullHlsUrl);
  assert.equal(options.sourceComponent, "video");
  assert.equal(options.sourceType, "hls");
  assert.equal(options.backupUrl, statusPayloadWithAdaptive.adaptiveHlsUrl);
  assert.equal(options.backupFlvUrl, "");
  assert.equal(options.backupRtmpUrl, "");
});

test("native mini-program runtime does not fall back to live-player-only sources", async () => {
  setMiniProgramRuntime("wx-live-enabled");
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-no-hls-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);

  const selected = liveSource.resolveStatusPullUrl({
    pushStatus: 1,
    pullRtmpUrl: statusPayload.pullRtmpUrl,
    pullFlvUrl: statusPayload.pullFlvUrl,
  });
  const streams = liveSource.normalizePullStreams({
    pullStreams: [{
      quality: "origin",
      rtmpUrl: statusPayload.pullRtmpUrl,
      flvUrl: statusPayload.pullFlvUrl,
    }],
  });

  assert.equal(selected, "");
  assert.equal(streams.length, 0);
});

test("native mini-program runtime only accepts HLS video for live playback", async () => {
  setMiniProgramRuntime("wx-live-enabled");
  const tempDir = await mkdtemp(join(tmpdir(), "live-source-video-only-"));
  const { module: liveSource } = await loadLiveSourceModule(tempDir);

  const selected = liveSource.selectMiniProgramLiveCandidate([
    { url: "https://hls.yaakoo123.cn/live/room_235.mp4?auth_key=new", type: "mp4", component: "video" },
    { url: statusPayload.pullRtmpUrl, type: "rtmp", component: "live-player" },
  ]);

  assert.equal(selected, null);
});

test("playback-resume status polling refreshes same HLS source without reinitializing", async () => {
  setDevtoolsRuntime();
  const { liveStatusSnapshot } = await loadLiveStatusSnapshotModule();
  const harness = createStatusContext();

  liveStatusSnapshot.applyLiveStatusSnapshot(harness.ctx, statusPayloadWithAdaptive, {
    source: "poll",
    reason: "playback_resume",
  });

  assert.equal(harness.initCalls.length, 0);
  assert.equal(harness.sourceUpdates.length, 1);
  assert.equal(harness.sourceUpdates[0].url, statusPayload.pullHlsUrl);
  assert.equal(harness.sourceUpdates[0].options.sourceComponent, "video");
  assert.equal(harness.sourceUpdates[0].options.sourceType, "hls");
});

test("status polling keeps same HLS source before playback is ready", async () => {
  setDevtoolsRuntime();
  const { liveStatusSnapshot } = await loadLiveStatusSnapshotModule();
  const harness = createStatusContext({ videoFrameReady: false });

  liveStatusSnapshot.applyLiveStatusSnapshot(harness.ctx, statusPayloadWithAdaptive, {
    source: "poll",
    reason: "playback_resume",
  });

  assert.equal(harness.sourceUpdates.length, 1);
  assert.equal(harness.initCalls.length, 0);
  assert.equal(harness.sourceUpdates[0].url, statusPayload.pullHlsUrl);
  assert.equal(harness.sourceUpdates[0].options.sourceComponent, "video");
  assert.equal(harness.sourceUpdates[0].options.sourceType, "hls");
});

test("portrait playback uses cover crop with inherited object position and stable media id", async () => {
  const stage = await readFile(join(root, "src/pages/broadcast/components/LivePortraitStage.vue"), "utf8");
  const style = await readFile(join(root, "src/pages/broadcast/styles/entry-portrait.scss"), "utf8");

  assert.doesNotMatch(stage, /id="liveVideo\s+[^"]+"/);
  assert.match(stage, /<live-player[\s\S]*?id="liveVideo"[\s\S]*?object-fit="fillCrop"/);
  assert.match(stage, /<video[\s\S]*?id="liveVideo"[\s\S]*?object-fit="cover"/);
  assert.match(style, /\.live-portrait\s+\.live-video\s+:deep\(\.uni-video-video\)[\s\S]*?object-fit:\s*cover;/);
  assert.match(style, /\.live-portrait\s+\.live-video\s+:deep\(\.uni-video-video\)[\s\S]*?object-position:\s*inherit;/);
});
