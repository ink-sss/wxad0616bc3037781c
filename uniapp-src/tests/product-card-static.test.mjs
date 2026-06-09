import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("floating product card swiper autoplays every five seconds without window slicing", async () => {
  const source = await readFile(join(root, "src/components/product-card.vue"), "utf8");
  const swiperMatch = source.match(/<swiper[\s\S]*?>/);

  assert.ok(swiperMatch, "product card should render a swiper");
  assert.match(swiperMatch[0], /\sautoplay(?:\s|>|=)/);
  assert.match(swiperMatch[0], /\sinterval="5000"/);
  assert.match(swiperMatch[0], /:current="visibleActiveIndex"/);
  assert.match(swiperMatch[0], /@change="onSwiperChange"/);
  assert.doesNotMatch(source, /SWIPER_WINDOW_RADIUS/);
  assert.match(source, /const visibleActiveIndex = computed\(\(\) => safeActiveIndex\.value\);/);
});
