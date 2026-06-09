import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("coupon selector syncs selected coupon on initial visible mount", async () => {
  const source = await readFile(join(root, "src/components/coupon-select-popup.vue"), "utf8");

  assert.match(
    source,
    /watch\(\s*\(\)\s*=>\s*props\.visible[\s\S]*draftCouponId\.value\s*=\s*Number\(props\.selectedCouponId\)\s*\|\|\s*0;[\s\S]*\{\s*immediate:\s*true\s*\}/,
  );
});
