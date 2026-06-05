<template>
  <view
    class="product-list"
    :class="[variant === 'popup' ? 'goods-content' : '', `product-list--${variant}`]"
  >
    <scroll-view class="product-scroll" scroll-y @scroll="onScroll" @scrolltolower="onLoadMore">
      <view class="product-scroll-content">
        <view class="product-virtual-spacer" :style="spacerStyle(topSpacerHeight)" />
        <view
          v-for="{ item, index } in visibleItems"
          :key="item.id || index"
          :class="[
            'product-item',
            variant === 'popup' ? 'goods-content-li' : '',
            variant === 'popup' ? 'goods-shopping-li' : '',
            item.isCurrent ? 'goods-content-explain' : '',
            item.soldOut ? 'product-item-soldout sellout' : '',
          ]"
          @click="onDetail(item, index)"
        >
          <view class="goods-row goods-content-first">
            <view class="product-img-wrap goods-thumb">
              <image class="product-img img-responsive" :src="productImage(item)" mode="aspectFill" lazy-load />
              <view v-if="item.soldOut" class="sellout-text">
                <view class="stock-state-label">
                  <view class="stock-line stock-line--left"></view>
                  <text class="stock-state-text">已抢光</text>
                  <view class="stock-line stock-line--right"></view>
                </view>
              </view>
              <view v-else-if="item.stock <= 0" class="no-stock">
                <view class="stock-state-label">
                  <view class="stock-line stock-line--left"></view>
                  <text class="stock-state-text">无库存</text>
                  <view class="stock-line stock-line--right"></view>
                </view>
              </view>
              <view v-if="item.isCurrent" class="product-badge explaining-badge recommend-tip">
                <image
                  class="recommend-tip-img"
                  src="https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-recommend-tip-9e14e49e.gif"
                  mode="aspectFit"
                />
                <text class="badge-text">讲解中</text>
              </view>
              <view v-if="variant === 'popup'" class="product-badge top-badge index-tip">
                <text class="badge-text">{{ displayIndex(item, index) }}</text>
              </view>
              <view v-else-if="item.isTop" class="product-badge top-badge">
                <text class="badge-text">置顶</text>
              </view>
            </view>
            <view class="product-detail goods-info-box">
              <view class="goods-info">
                <text :class="['product-title goods-name', item.soldOut ? 'title-soldout' : '']">{{ item.title }}</text>
                <text v-if="!item.soldOut && item.stock > 0" class="goods-storage">库存 {{ item.stock }}件</text>
              </view>
              <view class="product-price-row goods-oper">
                <view class="price-group goods-price">
                  <text :class="['price-symbol goods-price-unit', item.soldOut ? 'price-soldout' : '']">¥</text>
                  <text :class="['price-current', item.soldOut ? 'price-soldout' : '']">{{ item.price }}</text>
                  <text v-if="item.isMultiSpec" :class="['price-suffix goods-price-unit-1', item.soldOut ? 'price-soldout' : '']">起</text>
                  <text v-if="item.originPrice" class="price-origin"
                    >¥{{ item.originPrice }}</text
                  >
                </view>
                <view
                  :class="['buy-btn goods-btn', item.soldOut ? 'buy-btn-disabled seckill-end' : '']"
                  @click.stop="!item.soldOut && onBuy(item, index)"
                >
                  <text class="buy-text">{{ item.soldOut ? '立即购买' : '立即购买' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="product-virtual-spacer" :style="spacerStyle(bottomSpacerHeight)" />
        <view v-if="list.length > 0" class="list-footer">
          <view v-if="loading" class="loading-row">
            <text class="footer-text">加载中...</text>
          </view>
          <view v-else-if="finished" class="loading-row">
            <text class="footer-text">已经到底了哦~</text>
          </view>
          <view v-else class="loadmore-row" @click="onLoadMore">
            <text class="loadmore-text">加载更多</text>
          </view>
        </view>
        <view v-if="list.length === 0" class="list-empty">
          <text class="empty-text">暂无商品</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { useVirtualProductList } from "@/composables/useVirtualProductList";
import { toSizedImageUrl } from "@/utils/image-url";

const DEFAULT_ITEM_HEIGHT_RPX = 229;
const POPUP_ITEM_HEIGHT_RPX = 256;
const DEFAULT_THUMB_SIZE = { width: 180, height: 180 };
const POPUP_THUMB_SIZE = { width: 224, height: 224 };

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  finished: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: "default",
  },
});

const emit = defineEmits(["buy", "detail", "loadmore"]);

const productItemHeightRpx = computed(() =>
  props.variant === "popup" ? POPUP_ITEM_HEIGHT_RPX : DEFAULT_ITEM_HEIGHT_RPX
);
const productViewportItemCount = computed(() => (props.variant === "popup" ? 5 : 4));
const {
  visibleItems,
  topSpacerHeight,
  bottomSpacerHeight,
  onScroll,
} = useVirtualProductList({
  list: computed(() => props.list),
  itemHeightRpx: productItemHeightRpx,
  viewportItemCount: productViewportItemCount,
  overscan: 3,
});

function onBuy(item, idx) {
  if (item?.soldOut) return;
  emit("buy", { item, index: idx });
}

function onDetail(item, idx) {
  if (item?.soldOut) return;
  emit("detail", { item, index: idx });
}

function onLoadMore() {
  if (!props.loading && !props.finished) {
    emit("loadmore");
  }
}

function displayIndex(item, idx) {
  // 商品序号仅表示列表展示位次（后端 sort/rank 是排序权重，多商品会重复）
  return idx + 1;
}

function productImage(item) {
  return toSizedImageUrl(
    item?.image || "",
    props.variant === "popup" ? POPUP_THUMB_SIZE : DEFAULT_THUMB_SIZE
  );
}

function spacerStyle(height) {
  const value = Math.max(Number(height || 0), 0);
  return { height: `${value}rpx` };
}
</script>

<style lang="scss" scoped>
.product-list {
  flex: 1;
  height: 0;
  overflow: hidden;
}
.product-list--popup {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.product-scroll {
  height: 100%;
}
.product-scroll-content {
  min-height: 100%;
}
.product-virtual-spacer {
  width: 100%;
  flex-shrink: 0;
}
.product-list--popup .product-scroll {
  box-sizing: border-box;
  padding: 0;
}
.product-list--popup .product-scroll-content {
  box-sizing: border-box;
  padding: 0 32rpx 180rpx 32rpx;
}

.product-item {
  display: flex;
  padding: 24rpx 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
  gap: 20rpx;
}
.product-list--default .goods-row {
  width: 100%;
  flex: 1;
  min-width: 0;
  display: flex;
  display: -webkit-flex;
  align-items: flex-start;
  -webkit-align-items: flex-start;
  gap: 20rpx;
}
.product-list--popup .product-item {
  background: #fff;
  margin-bottom: 32rpx;
  position: relative;
  display: block;
  padding: 0;
  border-bottom: 0;
}
.product-list--popup .goods-row {
  display: flex;
  display: -webkit-flex;
  align-items: flex-start;
  -webkit-align-items: flex-start;
}

.product-img-wrap {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
}
.product-list--popup .product-img-wrap {
  width: 224rpx;
  height: 224rpx;
  margin-right: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.product-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}
.product-list--popup .product-img {
  width: 100%;
  height: 100% !important;
  border-radius: 0;
  object-fit: cover;
}

.product-item-soldout .product-img {
  opacity: 0.5;
}
.product-list--popup .product-item-soldout .product-img {
  opacity: 1;
}

.sellout-text,
.no-stock {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.sellout-text .stock-state-text,
.no-stock .stock-state-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.product-badge {
  position: absolute;
  left: 0;
  padding: 2rpx 12rpx;
  border-radius: 12rpx 0 12rpx 0;
}

.explaining-badge {
  background: linear-gradient(90deg, #ff5a2e 0%, #ff8a21 100%);
}
.product-list--popup .recommend-tip {
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40rpx;
  background: rgba(255, 14, 76, 0.8);
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
  line-height: 24rpx;
  padding: 0;
  border-radius: 0;
  z-index: 3;
}
.product-list--popup .recommend-tip-img {
  width: 32rpx;
  height: 32rpx;
  margin-right: 4rpx;
}

.top-badge {
  background: #ff9500;
}
.product-list--popup .index-tip {
  position: absolute;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.4);
  font-size: 20rpx;
  font-weight: bold;
  min-width: 48rpx;
  height: 28rpx;
  text-align: center;
  border-radius: 16rpx 0rpx 16rpx 0rpx;
  color: #ffffff;
  line-height: 28rpx;
  z-index: 3;
  padding: 0;
}

.badge-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 500;
}
.product-list--popup .recommend-tip .badge-text {
  font-size: 24rpx;
  font-weight: bold;
  line-height: 24rpx;
}
.product-list--popup .index-tip .badge-text {
  font-size: 20rpx;
  font-weight: bold;
  line-height: 28rpx;
}

.title-soldout {
  color: #bbb;
}

.price-soldout {
  color: #ccc !important;
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
}

.product-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
}
.product-list--popup .product-title {
  font-size: 28rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  cursor: pointer;
  font-weight: bold;
  line-height: 40rpx;
}
.product-list--popup .goods-info-box {
  width: calc(100% - 248rpx);
  min-height: 224rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.product-list--popup .goods-info {
  min-width: 0;
}
.product-list--popup .goods-storage {
  color: #999999;
  font-size: 24rpx;
  display: inline-block;
  box-sizing: border-box;
  line-height: 1;
}
.product-list--popup .goods-oper {
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  -webkit-justify-content: space-between;
  align-items: flex-end;
  -webkit-align-items: flex-end;
  margin-top: 16rpx;
}

.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.price-group {
  display: flex;
  align-items: baseline;
  font-family: "PingFang SC";
  gap: 4rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #ff4d4f;
  font-weight: 600;
}
.product-list--popup .price-symbol {
  font-size: 24rpx;
  line-height: 24rpx;
  color: #F91746;
}

.price-current {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: 700;
}
.product-list--popup .price-current {
  color: #F91746;
  font-size: 36rpx;
  font-weight: bold;
  line-height: 28rpx;
}

.price-suffix {
  font-size: 22rpx;
  color: #ff4d4f;
  font-weight: 500;
  margin-left: 2rpx;
}
.product-list--popup .price-suffix {
  color: #F91746;
  font-size: 24rpx;
}

.price-origin {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.buy-btn {
  height: 56rpx;
  padding: 0 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(90deg, #ff8a21 0%, #ff5a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.product-list--popup .buy-btn {
  color: #fff;
  font-size: 24rpx;
  height: 56rpx;
  background: linear-gradient(270deg, #FF0E4C 0%, #FF6089 100%);
  border-radius: 28rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-weight: bold;
  width: 128rpx;
  flex-shrink: 0;
  padding: 0;
}

.buy-btn-disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.buy-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
}
.product-list--popup .buy-text {
  font-size: 24rpx;
  font-weight: bold;
}
.product-list--popup .sellout .buy-btn,
.product-list--popup .sellout .goods-btn {
  pointer-events: none;
  opacity: 0.5;
}
.product-list--popup .sellout .no-stock {
  display: none;
}
.product-list--popup .sellout-text,
.product-list--popup .no-stock {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-list--popup .stock-state-label {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-list--popup .sellout-text .stock-state-text,
.product-list--popup .no-stock .stock-state-text {
  position: relative;
  font-size: 20rpx;
  font-weight: 400;
}
.product-list--popup .stock-line {
  width: 16rpx;
  height: 2rpx;
  background: linear-gradient(270deg, #fff, rgba(255, 255, 255, 0));
}
.product-list--popup .stock-line--left {
  margin-right: 8rpx;
}
.product-list--popup .stock-line--right {
  margin-left: 8rpx;
  background: linear-gradient(270deg, rgba(255, 255, 255, 0), #fff);
}

.list-footer {
  padding: 32rpx 0 48rpx;
  display: flex;
  justify-content: center;
}

.loading-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-text {
  font-size: 24rpx;
  color: #ccc;
}

.loadmore-row {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.loadmore-text {
  font-size: 26rpx;
  color: #ff6b2e;
}

.list-empty {
  padding: 120rpx 0;
  display: flex;
  justify-content: center;
}

.empty-text {
  font-size: 28rpx;
  color: #ccc;
}
</style>
