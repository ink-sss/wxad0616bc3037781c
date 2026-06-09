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

test("landscape product tab uses page-owned state instead of third-party tab internals", async () => {
  const source = await readSource("src/pages/broadcast/components/LiveLandscapeStage.vue");
  const styles = await readSource("src/pages/broadcast/styles/entry-landscape.scss");

  assert.doesNotMatch(source, /<wd-tabs/);
  assert.match(source, /@click\.stop="setActiveTabIndex\('1'\)"/);
  assert.match(source, /:class="\{ 'is-active': activeTab === 'products' \}"/);
  assert.match(source, /landscape-direct-tabs__indicator/);
  assert.match(source, /v-if="activeTab === 'products'"/);
  assert.match(source, /v-if="roomSetting\.enableChat !== 0 && activeTab === 'interact'"/);
  assert.match(source, /:visible="roomSetting\.enableChat !== 0 && activeTab === 'interact' && \(!isWaitingSchedule \|\| allowWarmupInteraction\)"/);
  assert.doesNotMatch(source, /v-show="activeTab === 'products'"/);
  assert.doesNotMatch(source, /v-show="activeTab === 'interact'"/);
  assert.match(styles, /\.landscape-direct-tabs__item\.is-active \.landscape-direct-tabs__indicator/);
  assert.match(styles, /\.landscape-direct-tabs__indicator \{[\s\S]*background: #ff0e4c;/);
});

test("landscape product shelf owns H5 product tab sizing for mp-weixin", async () => {
  const shelf = await readSource("src/pages/broadcast/components/LiveProductShelf.vue");
  const productList = await readSource("src/components/product-list.vue");

  assert.match(shelf, /variant="landscape"/);
  assert.match(productList, /\.product-list--landscape \{[\s\S]*height: 100%;[\s\S]*background: #fff;/);
  assert.match(productList, /\.product-list--landscape \.product-scroll-content \{[\s\S]*padding: 28rpx 30rpx 140rpx;/);
  assert.match(productList, /\.product-list--landscape \.product-img-wrap \{[\s\S]*width: 160rpx;[\s\S]*height: 160rpx;/);
  assert.match(productList, /\.product-list--landscape \.recommend-tip-img \{[\s\S]*width: 28rpx;[\s\S]*height: 28rpx;/);
  assert.match(productList, /\.product-list--landscape \.buy-btn \{[\s\S]*width: 144rpx;[\s\S]*background: linear-gradient\(270deg, #ff0e4c 0%, #ff6089 100%\);/);
});
