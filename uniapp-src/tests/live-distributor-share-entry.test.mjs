import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readSource(path) {
  return readFile(join(root, path), "utf8");
}

function extractTag(source, tagName) {
  const match = source.match(new RegExp(`<${tagName}\\b[\\s\\S]*?/>`));
  assert.ok(match, `${tagName} should be rendered`);
  return match[0];
}

test("live chat bar keeps H5 distributor share button condition", async () => {
  const source = await readSource("src/pages/broadcast/components/LiveChatBar.vue");

  assert.match(
    source,
    /v-if="useLiveToolbar && roomSetting\.enableShare !== 0 && isDistributor && distributorStatus === 1"/,
  );
  assert.match(source, /@click="emit\('share'\)"/);
});

test("portrait and landscape stages pass distributor share attribution props", async () => {
  for (const file of [
    "src/pages/broadcast/components/LivePortraitStage.vue",
    "src/pages/broadcast/components/LiveLandscapeStage.vue",
  ]) {
    const source = await readSource(file);
    const popup = extractTag(source, "share-popup");

    assert.match(popup, /:room-id="liveId"/, file);
    assert.match(popup, /:room-code="roomCode"/, file);
    assert.match(popup, /:share-code="shareCode"/, file);
    assert.match(popup, /:bind-id="liveBindId"/, file);
    assert.match(popup, /:tenant-id="liveTenantId"/, file);
    assert.match(popup, /:is-replay="isReplay"/, file);
    assert.match(popup, /:replay-video-id="replayCurrentVideoId"/, file);
    assert.match(popup, /:is-distributor="isDistributor"/, file);
    assert.match(popup, /:distributor-status="distributorStatus"/, file);
  }
});

test("landscape warmup video keeps H5 interactive share toolbar visible", async () => {
  const source = await readSource("src/pages/broadcast/components/LiveLandscapeStage.vue");
  const chatBar = extractTag(source, "live-chat-bar");

  assert.match(
    source,
    /const allowWarmupInteraction = computed\(\(\) =>\s+roomGroupType\.value === 1 && isWaitingSchedule\.value && !!warmUpVideoUrl\.value\s+\)/,
  );
  assert.match(
    chatBar,
    /:visible="roomSetting\.enableChat !== 0 && \(!isWaitingSchedule \|\| allowWarmupInteraction\)"/,
  );
});
