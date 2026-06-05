import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("report type selection keeps parent visible while switching to form popup", async () => {
  const source = await readFile(join(root, "src/components/live-report-popup.vue"), "utf8");

  assert.match(source, /const showTypePopup = ref\(false\)/);
  assert.doesNotMatch(source, /const showTypePopup = computed/);
  assert.match(source, /function handleTypePopupClose\(\) \{\s+if \(showFormPopup\.value \|\| showSuccessPopup\.value\) return/);
  assert.match(source, /function handleFormPopupClose\(\) \{\s+if \(showTypePopup\.value \|\| showSuccessPopup\.value\) return/);
  assert.match(source, /function onSelectComplaintType\(item\) \{[\s\S]*showTypePopup\.value = false[\s\S]*showFormPopup\.value = true/);
});

test("report popup form matches H5 textarea and submit button colors", async () => {
  const source = await readFile(join(root, "src/components/live-report-popup.vue"), "utf8");

  assert.doesNotMatch(source, /<wd-textarea/);
  assert.doesNotMatch(source, /<wd-button/);
  assert.match(source, /<textarea[\s\S]*class="report-desc-textarea"/);
  assert.match(source, /\.report-desc-textarea \{[\s\S]*background: #f8f8f8;/);
  assert.match(source, /\.complaint-submit-btn \{[\s\S]*background: linear-gradient\(90deg, #fd7e19 0%, #ff6b2e 100%\);/);
});
