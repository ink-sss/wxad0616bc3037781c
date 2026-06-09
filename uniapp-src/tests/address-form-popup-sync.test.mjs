import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("address form popup syncs edit data on initial visible mount", async () => {
  const source = await readFile(
    join(root, "src/components/address-form-popup.vue"),
    "utf8",
  );

  assert.match(
    source,
    /watch\(\s*\[\s*\(\)\s*=>\s*props\.visible,\s*\(\)\s*=>\s*props\.editData\s*,?\s*\]/,
  );
  assert.match(
    source,
    /\(\[visible,\s*editData\]\)\s*=>\s*\{\s*if\s*\(!visible\)\s*return;\s*syncFormFromEditData\(editData\);/,
  );
  assert.match(source, /\{\s*immediate:\s*true\s*\}/);
});
