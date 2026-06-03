<template>
  <template v-if="mode === 'portrait'">
    <view class="product-area">
      <product-card
        :visible="showProduct && !showProductList"
        :product="currentProduct"
        :products="productCardItems"
        :active-index="productCardActiveIndex"
        :show-hot-sale="showHotSale"
        @close="emit('update:showProduct', false)"
        @change="emit('product-card-change', $event)"
        @detail="(p) => emit('buy', { item: p })"
      />
    </view>
    <wd-overlay
      :show="showProductList"
      custom-style="z-index:60;background:rgba(0,0,0,0.5);"
      @click="emit('update:showProductList', false)"
    />
    <wd-transition
      :show="showProductList"
      :duration="500"
      enter-class="plist-popup-enter"
      enter-active-class="plist-popup-enter-active"
      enter-to-class="plist-popup-enter-to"
      leave-class="plist-popup-leave"
      leave-active-class="plist-popup-leave-active"
      leave-to-class="plist-popup-leave-to"
      custom-style="position:fixed;left:0;top:0;right:0;bottom:0;z-index:61;"
    >
      <view class="product-list-mask" @click="emit('update:showProductList', false)">
        <view
          v-if="successNotice?.visible"
          :key="successNotice.key"
          class="goods-bullet-chat list-bullet-chat product-success-notice"
          @click.stop
        >
          <view class="list-bullet-item" :class="successNotice.phase || 'entering'">
            <view v-if="successNotice.productImage" class="list-bullet-goods-img">
              <view v-if="successNoticeSort" class="list-bullet-goods-sort">{{ successNoticeSort }}</view>
              <image class="buy-img" :src="successNotice.productImage" mode="aspectFill" />
            </view>
            <image
              v-else
              class="buy-img"
              src="/static/icons/shopping-icon.png"
              mode="aspectFill"
            />
            <view class="buy-content">
              <text class="buy-title">{{ successNoticeTitle }}</text>
              <text v-if="successNotice.productName" class="buy-goods-name">{{ successNoticeProductLabel }}</text>
            </view>
            <view class="buy-btn bullet-buy-btn" @click.stop="openSuccessNoticeProduct">去购买</view>
          </view>
        </view>
        <view class="product-list-popup goods-list-box" @click.stop>
          <!-- <view class="popup-header">
            全部宝贝（{{ displayProductTotal }}）
          </view> -->
          <view class="popup-header">全部宝贝（{{ displayProductTotal }}）</view>
          <!-- <view style="color:red">123</view> -->
          <view class="goods-all-box">
            <product-list
              variant="popup"
              :list="productList"
              :loading="productLoading"
              :finished="productFinished"
              @buy="emit('buy', $event)"
              @detail="emit('buy', $event)"
              @loadmore="emit('loadmore')"
            />
          </view>
        </view>
      </view>
    </wd-transition>
  </template>

  <product-list
    v-else-if="mode === 'landscape-list'"
    :list="productList"
    :loading="productLoading"
    :finished="productFinished"
    @buy="emit('buy', $event)"
    @detail="emit('detail', $event)"
    @loadmore="emit('loadmore')"
  />

  <view
    v-else-if="mode === 'landscape-anchor' && showProduct"
    class="landscape-product-anchor"
    @click="emit('update:showProduct', false)"
  >
    <view class="product-popup" @click.stop>
      <product-card
        :visible="true"
        :product="currentProduct"
        :products="productCardItems"
        :active-index="productCardActiveIndex"
        :show-hot-sale="showHotSale"
        @close="emit('update:showProduct', false)"
        @change="emit('product-card-change', $event)"
        @detail="(p) => emit('buy', { item: p })"
      />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import ProductCard from "@/components/product-card.vue";
import ProductList from "@/components/product-list.vue";

const props = defineProps({
  mode: {
    type: String,
    required: true,
  },
  showProduct: {
    type: Boolean,
    default: false,
  },
  showProductList: {
    type: Boolean,
    default: false,
  },
  currentProduct: {
    type: Object,
    default: null,
  },
  productCardItems: {
    type: Array,
    default: () => [],
  },
  productCardActiveIndex: {
    type: Number,
    default: 0,
  },
  productList: {
    type: Array,
    default: () => [],
  },
  productTotal: {
    type: Number,
    default: 0,
  },
  productLoading: {
    type: Boolean,
    default: false,
  },
  productFinished: {
    type: Boolean,
    default: false,
  },
  showHotSale: {
    type: Boolean,
    default: true,
  },
  successNotice: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  "update:showProduct",
  "update:showProductList",
  "product-card-change",
  "buy",
  "detail",
  "loadmore",
]);

const displayProductTotal = computed(() => props.productTotal || props.productList.length);
const successNoticeTitle = computed(() => {
  const count = Number(props.successNotice?.count || 0);
  if (count > 0) return `${count}人购买了`;
  return `${props.successNotice?.nick || "观众"}购买成功`;
});
const successNoticeProductLabel = computed(() => {
  const sort = successNoticeSort.value;
  const name = String(props.successNotice?.productName || "").trim();
  return sort ? `${sort}号 ${name}` : name;
});
const successNoticeProduct = computed(() => {
  const id = Number(props.successNotice?.productId || 0);
  if (!id) return null;
  const product = props.productList.find((item) => Number(item.id || item.productId || 0) === id);
  if (product) return product;
  return {
    id,
    image: props.successNotice?.productImage || "",
    title: props.successNotice?.productName || "",
  };
});
const successNoticeSort = computed(() => {
  const rawSort = String(props.successNotice?.sort || "").trim();
  if (rawSort) return rawSort;
  const idx = props.productList.findIndex((item) =>
    Number(item.id || item.productId || 0) === Number(props.successNotice?.productId || 0),
  );
  return idx >= 0 ? String(idx + 1) : "";
});

function openSuccessNoticeProduct() {
  if (!successNoticeProduct.value) return;
  emit("buy", { item: successNoticeProduct.value });
}
</script>

<style lang="scss" scoped>
.product-area {
  position: absolute;
  right: 32rpx;
  bottom: calc(190rpx + env(safe-area-inset-bottom));
  z-index: 9;
}

/* 竖屏商品列表弹窗 */
.product-list-mask {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
}
.product-list-popup {
  width: 100%;
  background-color: rgba(255,255,255,0.9);
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  -webkit-overflow-scrolling: touch;
  height: 75%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.popup-header{
  color: #666666;
  padding: 0 32rpx;
  flex-shrink: 0;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 88rpx;
}
.popup-title {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;

}
.goods-all-box {
  height: 100%;
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  background-color: #fff;
  padding: 20rpx 0rpx;
  padding-bottom: env(safe-area-inset-bottom);
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}
.goods-all-box :deep(.goods-content) {
  width: 100%;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
}
.goods-all-box :deep(.product-scroll) {
  height: 100%;
}
.product-success-notice {
  position: absolute;
  bottom: calc(75% + 20rpx);
  left: 36rpx;
  z-index: 3;
  overflow: hidden;
}
.goods-bullet-chat .list-bullet-item {
  height: 100%;
  max-width: 466rpx;
  padding: 4rpx 8rpx 4rpx 4rpx;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16rpx;
  color: #fff;
  transition: all 200ms ease-in-out;
  overflow: hidden;
  line-height: 32rpx;
}
.goods-bullet-chat .list-bullet-item.entering {
  opacity: 0;
  transform: translateY(72rpx);
}
.goods-bullet-chat .list-bullet-item.entered {
  opacity: 1;
  transform: translateY(0);
}
.goods-bullet-chat .list-bullet-item.exiting {
  opacity: 0;
  transform: translateY(-72rpx);
}
.goods-bullet-chat .list-bullet-goods-img {
  position: relative;
}
.goods-bullet-chat .list-bullet-goods-sort {
  position: absolute;
  top: 0;
  left: 0;
  width: 32rpx;
  height: 24rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12rpx 0 12rpx 0;
  overflow: hidden;
  text-align: center;
  font-size: 18rpx;
  line-height: 26rpx;
  color: #fff;
  font-weight: bold;
}
.goods-bullet-chat .list-bullet-goods-img,
.goods-bullet-chat .buy-img {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-right: 12rpx;
  flex-shrink: 0;
}
.goods-bullet-chat .buy-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 24rpx;
}
.goods-bullet-chat .buy-title {
  color: #e0e0e0;
  font-size: 24rpx;
  line-height: 32rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.goods-bullet-chat .buy-goods-name {
  max-width: 274rpx;
  color: #fff;
  font-size: 24rpx;
  line-height: 32rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.goods-bullet-chat .buy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 48rpx;
  margin-left: 8rpx;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
  border-radius: 32rpx;
  font-weight: 600;
  font-size: 22rpx;
  color: #fff;
  flex-shrink: 0;
}

/* 商品弹窗 (横屏单品) */
.product-popup {
  position: relative;
  pointer-events: auto;
}

.landscape-product-anchor {
  position: absolute;
  right: 32rpx;
  bottom: calc(100% + 12rpx);
  pointer-events: none;
}
.landscape-product-anchor .product-popup {
  pointer-events: auto;
}
</style>

<style lang="scss" scoped>
/* 竖屏商品列表弹窗动画（与规格弹窗一致） */
:global(.plist-popup-enter) {
  transform: translateY(100%) !important;
}
:global(.plist-popup-enter-active) {
  transition: transform 500ms ease-out !important;
}
:global(.plist-popup-enter-to) {
  transform: translateY(0) !important;
}
:global(.plist-popup-leave) {
  transform: translateY(0) !important;
}
:global(.plist-popup-leave-active) {
  transition: transform 400ms ease-in !important;
}
:global(.plist-popup-leave-to) {
  transform: translateY(100%) !important;
}
</style>
