import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("floating product card swiper does not autoplay", async () => {
  const source = await readFile(join(root, "src/components/product-card.vue"), "utf8");
  const swiperMatch = source.match(/<swiper[\s\S]*?>/);

  assert.ok(swiperMatch, "product card should render a swiper");
  assert.doesNotMatch(swiperMatch[0], /\sautoplay(?:\s|>|=)/);
  assert.doesNotMatch(swiperMatch[0], /\sinterval=/);
  assert.match(swiperMatch[0], /@change="onSwiperChange"/);
});
