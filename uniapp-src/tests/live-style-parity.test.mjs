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

test("landscape comment lottery entry keeps landscape-only placement", async () => {
  const stage = await readSource("src/pages/broadcast/components/LiveLandscapeStage.vue");
  const lotteryTools = await readSource("src/pages/broadcast/components/LiveExternalLotteryTools.vue");
  const landscapeStyles = await readSource("src/pages/broadcast/styles/entry-landscape.scss");
  const liveStageStyles = await readSource("src/pages/broadcast/styles/live-landscape-stage.scss");
  const liveStyles = await readSource("src/pages/broadcast/styles/entry-landscape-live.scss");

  assert.match(stage, /class="interact-content"[\s\S]*<live-external-lottery-tools/);
  assert.match(stage, /<live-external-lottery-tools[\s\S]*v-if="\(!isWaitingSchedule \|\| allowWarmupInteraction\) && !anyBusinessPopupOpen"/);
  assert.match(stage, /<live-external-lottery-tools[\s\S]*variant="landscape"/);
  assert.match(stage, /:comment-lottery-visible="showLandscapeCommentLotteryEntry"/);
  assert.match(lotteryTools, /external-lottery-tools--landscape/);
  assert.match(lotteryTools, /\.external-lottery-tools \{[^}]*top: calc\(96rpx \+ var\(--broadcast-nav-height, 0px\)\);[^}]*\}/);
  assert.match(lotteryTools, /\.external-lottery-tools--landscape \{[^}]*top: 22rpx;[^}]*\}/);
  assert.match(landscapeStyles, /\.interact-content \{[^}]*position: relative;[^}]*\}/);
  assert.match(liveStageStyles, /\.landscape-lottery-tools\s+\{[^}]*z-index: 5;[^}]*\}/);
  assert.doesNotMatch(liveStageStyles, /\.landscape-lottery-tools\s+\{[^}]*top:/);
  assert.doesNotMatch(liveStageStyles, /\.landscape-lottery-tools \{[^}]*top: 536rpx;[^}]*\}/);
  assert.doesNotMatch(liveStageStyles, /\.landscape-lottery-tools \{[^}]*--broadcast-nav-height[^}]*\}/);
  assert.match(liveStyles, /:deep\(\.external-lottery-tools--landscape\) \{[^}]*top: 22rpx;[^}]*right: 24rpx;[^}]*z-index: 1001;[^}]*width: 88rpx;[^}]*gap: 10rpx;[^}]*\}/);
  assert.doesNotMatch(liveStyles, /:deep\(\.external-lottery-tools--landscape\) \{[^}]*top: 528rpx;[^}]*\}/);
  assert.doesNotMatch(liveStyles, /:deep\(\.external-lottery-tools--landscape\) \{[^}]*--broadcast-nav-height[^}]*\}/);
});

test("landscape collapsed video state follows H5 collapsed header", async () => {
  const stage = await readSource("src/pages/broadcast/components/LiveLandscapeStage.vue");
  const controls = await readSource("src/pages/broadcast/styles/entry-landscape-live-controls.scss");

  assert.match(stage, /<view class="landscape-navbar-placeholder">\s*<text v-if="!stageCollapsed" class="landscape-navbar-title">/);
  assert.match(stage, /<view v-if="!stageCollapsed" class="video-top">/);
  assert.match(stage, /<view v-if="stageCollapsed" class="live-landscape-collapsed-header"/);
  assert.match(stage, /class="live-landscape-collapsed-header__fire"[\s\S]*fire\.png/);
  assert.match(stage, /class="live-landscape-collapsed-header__count"[\s\S]*\{\{ displayViewerCount \}\}[\s\S]*<\/text>/);
  assert.match(stage, /class="live-landscape-collapsed-header__restore" @click\.stop="toggleCollapse"/);
  assert.doesNotMatch(stage, /<view v-show="!stageCollapsed" class="video-top">/);
  assert.match(controls, /\.live-landscape-collapsed-header \{[\s\S]*height: 80rpx;[\s\S]*background: linear-gradient\(135deg, #1a0533 0%, #3d1a6e 50%, #6b21a8 100%\);/);
  assert.match(controls, /\.live-landscape-collapsed-header__restore \{[\s\S]*border-radius: 50%;[\s\S]*background: rgba\(255, 255, 255, 0\.2\);/);
});
