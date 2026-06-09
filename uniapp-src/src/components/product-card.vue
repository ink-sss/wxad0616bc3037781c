<template>
  <view v-if="visible" class="product-wrap explain-goods-box-content">
    <!-- 热卖徽章：位于卡片上方，火焰图标悬浮溢出 -->
    <view v-if="showHotSale && displayHotSales(activeItem) > 0" class="hot-goods-box">
      <image class="hot-icon" src="https://man.lqjy.cc/static/icons/hot-fire.gif" mode="aspectFit" />
      <view class="hot-goods">
        <text class="hot-goods-text">热卖</text>
        <text class="hot-goods-times hot-goods-digit">x</text>
        <text class="hot-goods-num hot-goods-digit">{{ displayHotSales(activeItem) }}</text>
      </view>
    </view>
    <view class="card-body">
      <swiper
        class="explain-goods-center"
        :current="visibleActiveIndex"
        previous-margin="0rpx"
        next-margin="0rpx"
        circular="false"
         autoplay
        interval="5000"
        @change="onSwiperChange"
      >
        <swiper-item
          v-for="entry in visibleProductItems"
          :key="entry.item.id || entry.index"
        >
          <view
            class="product-card explain-goods-swiper swiper-slide-goods"
            :class="{ sellout: entry.item.soldOut }"
            @click="onDetail(entry.item)"
          >
            <view class="explain-goods-img recommend-goods-img">
              <image class="product-img" :src="productImage(entry.item)" mode="aspectFill" lazy-load />
              <view class="sellout-text">
                <view class="sellout-label">
                  <view class="sellout-label-line sellout-label-line--left"></view>
                  <text class="sellout-label-text">已抢光</text>
                  <view class="sellout-label-line sellout-label-line--right"></view>
                </view>
              </view>
              <view class="explain-goods-tip">
                <image
                  class="explain-icon"
                  src="https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-recommend-tip-9e14e49e.gif"
                  mode="aspectFit"
                />
                <text class="explain-text">讲解中</text>
                <text class="explain-count">{{ entry.index + 1 }}/{{ productItems.length }}</text>
              </view>
            </view>

            <view class="explain-goods-name recommend-goods-name">
              {{ entry.item.title }}
            </view>

            <view class="explain-goods-bottom active">
              <view class="explain-goods-bottom-highlight"></view>
              <view class="explain-goods-price">
                <text class="price-symbol">¥</text>
                <text class="price-num">{{ priceMain(entry.item.price) }}.</text>
                <text class="price-decimal">{{ priceDecimal(entry.item.price) }}</text>
              </view>
              <view
                class="explain-goods-btn recommend-goods-btn"
                @click.stop="onDetail(entry.item)"
              >
                <image
                  class="grab-img"
                  src="https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-wechat-assets-grab-5x-693793a1.png"
                  mode="aspectFill"
                />
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <view class="close-explain" @click.stop="close">
        <image
          class="close-explain-img"
          src="https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-recommend-close-b846ab82.png"
          mode="aspectFit"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { toSizedImageUrl } from "@/utils/image-url";

const SWIPER_WINDOW_RADIUS = 2;
const PRODUCT_CARD_THUMB_SIZE = { width: 220, height: 220 };

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    default: () => ({
      image:
        "https://man.lqjy.cc/static/remote-icons/figma-product-placeholder.png",
      title: "女神节激光节女神节激光节节激光...",
      price: "888",
    }),
  },
  salesCount: {
    type: Number,
    default: 0,
  },
  currentIndex: {
    type: Number,
    default: 1,
  },
  totalCount: {
    type: Number,
    default: 3,
  },
  products: {
    type: Array,
    default: () => [],
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
  showHotSale: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close", "detail", "change"]);

const productItems = computed(() => {
  if (Array.isArray(props.products) && props.products.length > 0) {
    return props.products;
  }
  return [props.product];
});

const safeActiveIndex = computed(() => {
  const max = productItems.value.length - 1;
  if (max < 0) return 0;
  return Math.min(Math.max(props.activeIndex || 0, 0), max);
});

const activeItem = computed(() => {
  return productItems.value[safeActiveIndex.value] || {};
});

const visibleWindowStart = computed(() => {
  const total = productItems.value.length;
  if (total <= SWIPER_WINDOW_RADIUS * 2 + 1) return 0;
  const maxStart = Math.max(total - (SWIPER_WINDOW_RADIUS * 2 + 1), 0);
  return Math.min(Math.max(safeActiveIndex.value - SWIPER_WINDOW_RADIUS, 0), maxStart);
});

const visibleProductItems = computed(() => {
  const start = visibleWindowStart.value;
  const end = Math.min(start + SWIPER_WINDOW_RADIUS * 2 + 1, productItems.value.length);
  return productItems.value.slice(start, end).map((item, offset) => ({
    item,
    index: start + offset,
  }));
});

const visibleActiveIndex = computed(() => safeActiveIndex.value - visibleWindowStart.value);

function close() {
  emit("close");
}

function onDetail(item) {
  if (item?.soldOut) return;
  emit("detail", item);
}

function onSwiperChange(e) {
  emit("change", visibleWindowStart.value + Number(e?.detail?.current || 0));
}

function productImage(item) {
  return toSizedImageUrl(item?.image || "", PRODUCT_CARD_THUMB_SIZE);
}

function splitPrice(price) {
  const [main, decimal = "00"] = String(price ?? "0.00").split(".");
  return [main || "0", decimal.padEnd(2, "0").slice(0, 2)];
}

function priceMain(price) {
  return splitPrice(price)[0];
}

function priceDecimal(price) {
  return splitPrice(price)[1];
}

function displayHotSales(item) {
  const value = Number(item?.hotSales ?? item?.salesCount ?? props.salesCount ?? 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}
</script>

<style lang="scss" scoped>
.product-wrap {
  flex-shrink: 0;
  position: relative;
  width: 220rpx;
  overflow: visible;
}

.explain-goods-box-content {
  flex-shrink: 0;
  position: relative;
  box-shadow: 0rpx 2rpx 12rpx 0rpx rgba(0, 0, 0, 0.2);
  border-radius: 16rpx;
  overflow: visible;
  width: 220rpx;
}

.explain-goods-center {
  width: 100%;
  height: 320rpx;
}

.explain-goods-swiper {
  cursor: pointer;
  background-color: #fff;
}

.product-card {
  width: 100%;
  overflow: hidden;
  border-radius: 16rpx;
}

.explain-goods-img {
  width: 100%;
  height: 208rpx;
  border-radius: 16rpx 16rpx 0 0;
  overflow: hidden;
  position: relative;
  border: 4rpx solid #fff;
  box-sizing: border-box;
}

.explain-goods-img .product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #fff;
}

.explain-goods-tip {
  display: flex;
  align-items: center;
  height: 32rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16rpx 0 16rpx 0;
  position: absolute;
  left: 0rpx;
  top: 0rpx;
  width: fit-content;
  max-width: 100%;
  font-size: 20rpx;
  font-weight: bold;
  padding: 0 8rpx;
  color: #fff;
  z-index: 10;
}

.explain-goods-tip .explain-icon {
  width: 24rpx;
  height: 24rpx;
  margin-right: 4rpx;
}

/* ===== 热卖徽章（1:1 复刻竞品诺云） ===== */
.hot-goods-box {
  position: absolute;
  width: 100%;
  top:-60rpx;
  padding-top: 2rpx;
  z-index: 12;
  pointer-events: none;
}

.hot-icon {
  width: 52rpx;
  height: 56rpx;
  position: absolute;
  left: 0;
  top: -8rpx;
  z-index: 13;
}

.hot-goods {
  background: linear-gradient(273deg, rgba(255, 164, 98, 0) 0%, rgba(255, 160, 87, 0.8) 32%, #FEB333 100%);
  height: 48rpx;
  border-radius: 24rpx 0 0 24rpx;
  padding-left: 50rpx;
  padding-right: 8rpx;
  font-size: 28rpx;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 48rpx;
  text-shadow: 0rpx 2rpx 4rpx rgba(255, 46, 0, 0.5);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.hot-goods-text {
  white-space: nowrap;
}

.hot-goods-times {
  margin: 0 2rpx;
}

.hot-goods-num {
  white-space: nowrap;
}

.hot-goods-digit {
  font-style: italic;
  font-family: "DIN Alternate", "DIN Next", "Avenir-Heavy", "Impact", "Arial Black", sans-serif;
  letter-spacing: 1rpx;
}

.card-body {
  position: relative;
  overflow: hidden;
  border-radius: 16rpx;
}

.explain-text {
  margin-right: 4rpx;
}

.explain-goods-name {
  width: 100%;
  font-size: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  padding: 0 8rpx 4rpx;
  color: #333;
  background-color: #fff;
  line-height: 28rpx;
  height: 56rpx;
  word-break: break-all;
}

.explain-goods-bottom {
  width: 100%;
  height: 56rpx;
  background: #FF0E4C;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.explain-goods-price {
  font-weight: 600;
  color: #fff;
  padding-left: 8rpx;
  height: 40rpx;
  display: inline-flex;
  align-items: baseline;
  font-size: 18rpx;
  width: calc(100% - 68rpx);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

.price-num {
  font-size: 28rpx;
}

.price-decimal {
  font-size: 20rpx;
}

.explain-goods-btn {
  width: 68rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.grab-img {
  width: 68rpx;
  height: 56rpx;
  display: block;
}

.explain-goods-bottom-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 56rpx;
  background-image: linear-gradient(240deg, rgba(255, 214, 133, 0) 29%, rgba(255, 214, 133, .4) 33%, rgba(255, 214, 133, .4) 34%, rgba(255, 214, 133, 0) 38%);
  background-size: 200% 100%;
  background-position: 150% 0;
  animation: light-scan 3.5s infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes light-scan {
  0% {
    background-position: 150% 0;
  }

  57% {
    background-position: 150% 0;
  }

  100% {
    background-position: 0 0;
  }
}

.close-explain {
  width: 40rpx;
  height: 40rpx;
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  z-index: 14;
  cursor: pointer;
}

.close-explain-img {
  width: 100%;
  height: 100%;
  display: block;
}

.sellout .sellout-text {
  display: flex;
}

.sellout-text {
  position: absolute;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 28rpx;
  color: #fff;
  left: 0;
  top: 0;
  display: none;
}

.sellout-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sellout-label-text {
  line-height: 1;
}

.sellout-label-line {
  width: 24rpx;
  height: 2rpx;
  flex-shrink: 0;
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 1),
    rgba(255, 255, 255, 0)
  );
}

.sellout-label-line--left {
  margin-right: 8rpx;
}

.sellout-label-line--right {
  margin-left: 8rpx;
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 1)
  );
}
</style>
