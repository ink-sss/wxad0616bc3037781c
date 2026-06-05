import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readSource(path) {
  return readFile(join(root, path), "utf8");
}

test("live report popup uses native textarea and submit button colors", async () => {
  const source = await readSource("src/components/live-report-popup.vue");

  assert.doesNotMatch(source, /<wd-textarea/);
  assert.doesNotMatch(source, /<wd-button/);
  assert.match(source, /\.report-desc-textarea \{[\s\S]*background: #f8f8f8;/);
  assert.match(source, /\.complaint-submit-btn \{[\s\S]*background: linear-gradient\(90deg, #fd7e19 0%, #ff6b2e 100%\);/);
});

test("live product popup keeps H5 scrollbar and custom component height overrides", async () => {
  const source = await readSource("src/pages/broadcast/components/LiveProductShelf.vue");

  assert.match(source, /class="popup-product-list"/);
  assert.match(source, /\.goods-all-box :deep\(\.product-scroll::-webkit-scrollbar\) \{\s+display: none;/);
  assert.match(source, /\.popup-product-list \{[\s\S]*height: 100%;[\s\S]*flex: 1;/);
});
