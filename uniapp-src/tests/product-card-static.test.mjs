import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("floating product card advances every five seconds without native swiper autoplay", async () => {
  const source = await readFile(join(root, "src/components/product-card.vue"), "utf8");
  const swiperMatch = source.match(/<swiper[\s\S]*?>/);

  assert.ok(swiperMatch, "product card should render a swiper");
  assert.doesNotMatch(swiperMatch[0], /\sautoplay(?:\s|>|=)/);
  assert.doesNotMatch(swiperMatch[0], /\sinterval=/);
  assert.match(swiperMatch[0], /:circular="canLoop"/);
  assert.match(swiperMatch[0], /:current="visibleActiveIndex"/);
  assert.match(swiperMatch[0], /@change="onSwiperChange"/);
  assert.match(source, /const AUTOPLAY_INTERVAL_MS = 5000;/);
  assert.match(source, /const canLoop = computed\(\(\) => productItems\.value\.length > 1\);/);
  assert.match(source, /setInterval\(\(\) =>/);
  assert.doesNotMatch(source, /SWIPER_WINDOW_RADIUS/);
  assert.match(source, /const visibleActiveIndex = computed\(\(\) => safeActiveIndex\.value\);/);
});
