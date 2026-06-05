import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("live detail identity keeps H5 roomId precedence for IM token room id", async () => {
  const source = await readFile(
    join(root, "src/pages/broadcast/composables/useLiveEntryInitializer.js"),
    "utf8",
  );
  const resolverMatch = source.match(/function\s+resolveDetailRoomId\(detail = \{\}\)\s*\{[\s\S]*?\n\s*\}/);

  assert.ok(resolverMatch, "resolveDetailRoomId should exist");
  assert.match(resolverMatch[0], /detail\.roomId/);
  assert.match(resolverMatch[0], /detail\.room_id/);
  assert.doesNotMatch(resolverMatch[0], /detail\.id/);
  assert.doesNotMatch(resolverMatch[0], /detail\.liveId/);
  assert.doesNotMatch(resolverMatch[0], /detail\.live_id/);
  assert.doesNotMatch(resolverMatch[0], /detail\.live\?\.id/);
  assert.doesNotMatch(resolverMatch[0], /detail\.room\?\.id/);
});
