import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("address list panel gives mp-weixin scroll-view an explicit height", async () => {
  const source = await readFile(
    join(root, "src/components/address-list-panel.vue"),
    "utf8",
  );

  assert.match(
    source,
    /<view class="address-scroll-wrap">\s*<scroll-view class="address-scroll" scroll-y>/,
  );
  assert.match(
    source,
    /\.address-scroll-wrap\s*\{[\s\S]*?flex:\s*none;[\s\S]*?height:\s*calc\(78vh - 232rpx - env\(safe-area-inset-bottom\)\);[\s\S]*?\}/,
  );
  assert.match(
    source,
    /\.address-scroll\s*\{[\s\S]*?height:\s*100%;[\s\S]*?\}/,
  );
  assert.doesNotMatch(
    source,
    /\.address-scroll-wrap\s*\{[^}]*\bheight:\s*0;[^}]*\}/,
  );
});
