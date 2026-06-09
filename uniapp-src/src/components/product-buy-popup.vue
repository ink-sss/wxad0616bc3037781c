<template>
  <view>
    <wd-popup
      v-model="popupVisible"
      position="bottom"
      :z-index="zIndex"
      custom-style="height: calc(84vh - 40rpx); border-radius: 24rpx 24rpx 0 0; overflow: hidden;"
      @close="emit('close')"
    >
      <view class="buy-popup">
        <view class="buy-popup-close" @click="emit('close')">
          <text class="buy-popup-close__icon">×</text>
        </view>
        <view class="product-info">
          <image class="info-img" :src="product.image" mode="aspectFill" />
          <view class="info-detail">
            <text class="info-title">{{ product.title }}</text>
            <view class="info-price-row">
              <text class="info-price-symbol">¥</text>
              <text class="info-price">{{ displayPrice }}</text>
              <text v-if="showPriceRange" class="info-price-range">起</text>
            </view>
            <text class="selected-tip">已选：{{ selectedSpecText }}</text>
          </view>
        </view>

        <scroll-view class="popup-scroll" scroll-y :show-scrollbar="false">
          <view v-if="props.requireAddress !== 2" class="address-section" @click="emit('select-address')">
            <view class="address-card">
              <image class="address-icon" src="https://man.lqjy.cc/static/icons/address.svg" mode="aspectFit" />
              <view class="address-main">
                <text class="address-text" :class="{ 'address-empty': !addressText }">
                  {{ addressDisplay.address || "请选择收货地址" }}
                </text>
                <text v-if="addressDisplay.contact" class="address-contact">
                  {{ addressDisplay.contact }}
                </text>
              </view>
              <image class="address-arrow" src="https://man.lqjy.cc/static/icons/right.svg" mode="aspectFit" />
            </view>
          </view>

          <view v-if="isMultiSpec" class="section-row spec-section">
            <view
              v-for="specGroup in specs"
              :key="specGroup.id"
              class="spec-group"
            >
              <text class="section-label">{{ specGroup.name }}</text>
              <view class="spec-list">
                <view
                  v-for="sv in specGroup.values"
                  :key="sv.id"
                  :class="[
                    'spec-tag',
                    selectedSpecValues[specGroup.name] === sv.value
                      ? 'spec-active'
                      : '',
                    isSpecValueSoldOut(specGroup.name, sv.value)
                      ? 'spec-soldout'
                      : '',
                  ]"
                  @click="selectSpec(specGroup.name, sv.value)"
                >
                  <text
                    :class="[
                      'spec-text',
                      selectedSpecValues[specGroup.name] === sv.value
                        ? 'spec-text-active'
                        : '',
                      isSpecValueSoldOut(specGroup.name, sv.value)
                        ? 'spec-text-soldout'
                        : '',
                    ]"
                    >{{ sv.value }}</text
                  >
                </view>
              </view>
            </view>
          </view>

          <view class="section-row quantity-row">
            <view class="section-left">
              <text class="section-label">购买数量</text>
              <text class="stock-text">库存{{ displayStock }}件</text>
            </view>
            <view class="quantity-ctrl">
              <view
                class="qty-btn"
                :class="{ disabled: quantity <= 1 }"
                @click="changeQty(-1)"
              >
                <image
                  class="qty-icon-img"
                  src="https://man.lqjy.cc/static/icons/minus.svg"
                  mode="aspectFit"
                />
              </view>
              <text class="qty-num">{{ quantity }}</text>
              <view
                class="qty-btn qty-btn-add"
                :class="{ disabled: quantity >= displayStock }"
                @click="changeQty(1)"
              >
                <image
                  class="qty-icon-img"
                  src="https://man.lqjy.cc/static/icons/add.svg"
                  mode="aspectFit"
                />
              </view>
            </view>
          </view>

          <view class="section-row remark-row">
            <text class="section-label">买家留言</text>
            <input
              class="remark-input"
              :value="remark"
              placeholder="建议与卖家协商一致后填写"
              @input="onRemarkInput"
            />
          </view>

          <view class="section-row coupon-row" @click="openCouponSelector">
            <view class="coupon-row-left">
              <text class="section-label">优惠券</text>
              <text v-if="usableCoupons.length > 0 && !selectedCoupon" class="max-discount">
                {{ usableCoupons.length }}张可用
              </text>
            </view>
            <view class="coupon-select-right">
              <text
                class="coupon-select-text"
                :class="{ 'coupon-empty': !selectedCoupon }"
              >
                {{ couponDisplayText }}
              </text>
              <image class="coupon-arrow" src="https://man.lqjy.cc/static/icons/right.svg" mode="aspectFit" />
            </view>
          </view>

          <view class="price-row">
            <text class="price-label">商品总价</text>
            <text class="price-value">¥ {{ goodsAmount }}</text>
          </view>
          <view v-if="showCouponDiscount" class="price-row">
            <text class="price-label">优惠券</text>
            <text class="price-value price-discount">-¥ {{ discountAmount }}</text>
          </view>
          <view class="price-row">
            <text class="price-label">运费</text>
            <text class="price-value">¥ {{ shippingFee }}</text>
          </view>
        </scroll-view>

        <view class="popup-footer">
          <view class="popup-pay-left">
            <text class="popup-pay-label">实付款</text>
            <text class="popup-pay-price">¥ {{ totalPrice }}</text>
          </view>
          <view
            :class="['confirm-btn', isSoldOut ? 'confirm-btn-disabled' : '']"
            @click="!isSoldOut && onConfirm()"
          >
            <text class="confirm-text">{{
              isSoldOut ? "已售罄" : loading ? "提交中..." : "立即购买"
            }}</text>
          </view>
        </view>
      </view>
    </wd-popup>
    <coupon-select-popup
      v-if="couponPopupVisible"
      :visible="couponPopupVisible"
      :usable-coupons="usableCoupons"
      :unusable-coupons="unusableCoupons"
      :selected-coupon-id="selectedCouponId"
      :z-index="couponZIndex"
      @close="couponPopupVisible = false"
      @select-coupon="handleCouponSelect"
    />
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import CouponSelectPopup from "@/components/coupon-select-popup.vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  product: { type: Object, default: () => ({}) },
  addressText: { type: String, default: "" },
  addressDetail: { type: Object, default: () => ({}) },
  shippingFee: { type: String, default: "0.00" },
  goodsAmount: { type: String, default: "0.00" },
  totalPrice: { type: String, default: "0.00" },
  discountAmount: { type: String, default: "0.00" },
  remark: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  requireAddress: { type: Number, default: 1 },
  usableCoupons: { type: Array, default: () => [] },
  unusableCoupons: { type: Array, default: () => [] },
  selectedCouponId: { type: Number, default: 0 },
  couponLoading: { type: Boolean, default: false },
  zIndex: { type: Number, default: 100000000 },
  couponZIndex: { type: Number, default: 100000001 },
});

const emit = defineEmits([
  "close",
  "confirm",
  "select-address",
  "update:remark",
  "update:quantity",
  "update:sku",
  "select-coupon",
]);

const popupVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) emit("close");
  },
});

const quantity = ref(1);
const selectedSpecValues = ref({});
const couponPopupVisible = ref(false);

const specs = computed(() => props.product.specs || []);
const skus = computed(() => props.product.skus || []);
const isMultiSpec = computed(() => props.product.isMultiSpec || 0);

const currentSku = computed(() => {
  if (!isMultiSpec.value || skus.value.length === 0) {
    return skus.value.length === 1 ? skus.value[0] : null;
  }
  // 必须所有规格组都已选择
  const selectedVals = selectedSpecValues.value;
  if (Object.keys(selectedVals).length < specs.value.length) return null;

  // 方式1：用 specValueIds 匹配
  const selectedIds = Object.values(selectedVals)
    .map((val) => {
      for (const spec of specs.value) {
        const found = (spec.values || []).find((sv) => sv.value === val);
        if (found) return found.id;
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a - b);
  if (selectedIds.length > 0) {
    const key = selectedIds.join(",");
    const matched = skus.value.find(
      (s) => s.specValueIds && String(s.specValueIds) === key,
    );
    if (matched) return matched;
  }

  // 方式2：兜底用 specText 匹配（后端 specText 格式为逗号分隔，如 "白,小"）
  const selectedTexts = specs.value
    .map((g) => selectedVals[g.name])
    .filter(Boolean);
  if (selectedTexts.length === specs.value.length) {
    // 逗号分隔（后端默认格式）
    const textKey = selectedTexts.join(",");
    const matched = skus.value.find(
      (s) => s.specText && s.specText === textKey,
    );
    if (matched) return matched;
    // 空格分隔
    const textKey2 = selectedTexts.join(" ");
    const matched2 = skus.value.find(
      (s) => s.specText && s.specText === textKey2,
    );
    if (matched2) return matched2;
  }

  return null;
});

const displayPrice = computed(() => {
  if (currentSku.value) return currentSku.value.salePrice?.toFixed(2);
  // 有多规格但未选完时，显示最低价
  if (isMultiSpec.value && skus.value.length > 0) {
    const prices = skus.value.map((s) => s.salePrice).filter((p) => p > 0);
    if (prices.length > 0) return Math.min(...prices).toFixed(2);
  }
  return props.product.priceMin
    ? Number(props.product.priceMin).toFixed(2)
    : props.product.price || "0.00";
});

// 是否显示"起"字（有多规格且价格区间不一致，且未选定SKU）
const showPriceRange = computed(() => {
  if (currentSku.value) return false;
  if (!isMultiSpec.value || skus.value.length <= 1) return false;
  const prices = skus.value.map((s) => s.salePrice).filter((p) => p > 0);
  if (prices.length < 2) return false;
  return Math.min(...prices) !== Math.max(...prices);
});

const displayStock = computed(() => {
  if (currentSku.value) return currentSku.value.stock;
  return props.product.stock || 0;
});

const isSoldOut = computed(
  () =>
    props.product.soldOut === true ||
    props.product.isSoldOut === true ||
    props.product.isSoldOut === 1 ||
    Number(displayStock.value || 0) <= 0,
);

// 判断某规格值在当前已选规格条件下是否全部售罄（库存≤0）
function isSpecValueSoldOut(specName, specValue) {
  if (skus.value.length === 0) return false;
  // 找出包含该规格值的所有SKU
  const matched = skus.value.filter((sku) => {
    const texts = (sku.specText || "").split(",").map((s) => s.trim());
    return texts.includes(specValue);
  });
  if (matched.length === 0) return false;
  // 只要有一个有库存，就不置灰
  return matched.every((sku) => sku.stock <= 0);
}

const selectedSpecText = computed(() => {
  if (!isMultiSpec.value) return "默认";
  const vals = Object.values(selectedSpecValues.value);
  return vals.length > 0 ? vals.join(" / ") : "请选择规格";
});

const addressDisplay = computed(() => {
  const detail = props.addressDetail || {};
  const raw = String(props.addressText || "").trim();
  const address = String(
    detail.fullAddress ||
      detail.addressText ||
      detail.address ||
      raw,
  ).trim();
  const name = String(detail.receiverName || detail.name || "").trim();
  const phone = String(detail.receiverPhone || detail.mobile || "").trim();
  const contact = [name, phone].filter(Boolean).join(" ");

  return {
    address,
    contact,
  };
});

const selectedCoupon = computed(() => {
  const id = Number(props.selectedCouponId) || 0;
  if (!id) return null;
  return props.usableCoupons.find((coupon) => Number(coupon.customerCouponId) === id) || null;
});

const couponDisplayText = computed(() => {
  if (props.couponLoading) return "加载中";
  if (selectedCoupon.value) return `已减 ¥${formatAmount(selectedCoupon.value.previewDiscount || selectedCoupon.value.reduceAmount)}`;
  const count = props.usableCoupons.length;
  return count > 0 ? `${count} 张可用` : "暂无可用";
});

const showCouponDiscount = computed(() => Number(props.discountAmount || 0) > 0);

watch(
  () => props.visible,
  (val) => {
    if (val) {
      quantity.value = 1;
      selectedSpecValues.value = {};
      // 多规格自动选中价格最低的有库存 SKU
      if (isMultiSpec.value && skus.value.length > 0 && specs.value.length > 0) {
        const inStock = skus.value.filter((s) => s.stock > 0);
        const candidates = inStock.length > 0 ? inStock : skus.value;
        const cheapest = candidates.reduce((min, s) =>
          s.salePrice < min.salePrice ? s : min,
        );
        if (cheapest && cheapest.specText) {
          const parts = cheapest.specText.split(",").map((s) => s.trim());
          const newSelected = {};
          specs.value.forEach((group, idx) => {
            if (parts[idx]) {
              newSelected[group.name] = parts[idx];
            }
          });
          selectedSpecValues.value = newSelected;
        }
      }
    }
  },
);

watch(
  () => (props.visible ? currentSku.value?.id || 0 : 0),
  (skuId) => {
    emit("update:sku", skuId || 0);
  },
  { immediate: true },
);

function selectSpec(specName, value) {
  if (isSpecValueSoldOut(specName, value)) {
    uni.showToast({ title: "该规格已售罄", icon: "none" });
    return;
  }
  selectedSpecValues.value = { ...selectedSpecValues.value, [specName]: value };
}

function changeQty(delta) {
  const stock = displayStock.value;
  const next = quantity.value + delta;
  if (next >= 1 && next <= stock) {
    quantity.value = next;
    emit("update:quantity", next);
  }
}

function onRemarkInput(event) {
  emit("update:remark", event?.detail?.value || "");
}

function formatAmount(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

function openCouponSelector() {
  if (props.couponLoading) return;
  couponPopupVisible.value = true;
}

function handleCouponSelect(customerCouponId) {
  emit("select-coupon", Number(customerCouponId) || 0);
}

function onConfirm() {
  if (props.loading) return;
  if (isMultiSpec.value && !currentSku.value) {
    uni.showToast({ title: "请选择规格", icon: "none" });
    return;
  }
  if (props.requireAddress !== 2 && !props.addressText) {
    uni.showToast({ title: "请选择收货地址", icon: "none" });
    return;
  }
  if (displayStock.value <= 0) {
    uni.showToast({ title: "库存不足", icon: "none" });
    return;
  }
  const resolvedSkuId =
    currentSku.value?.id ||
    (skus.value.length === 1 ? skus.value[0].id : 0) ||
    props.product.defaultSkuId ||
    0;
  // 多规格商品必须选择有效SKU；单规格允许skuId=0，后端会自动匹配默认SKU
  if (isMultiSpec.value && !resolvedSkuId) {
    uni.showToast({ title: "商品规格异常，请重试", icon: "none" });
    return;
  }
  emit("confirm", {
    product: props.product,
    quantity: quantity.value,
    skuId: resolvedSkuId,
    selectedSpecText: selectedSpecText.value,
  });
}
</script>

<style lang="scss" scoped>
.buy-popup {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 750rpx;
  height: calc(84vh - 40rpx);
  box-sizing: border-box;
  background: #fff;
}

.buy-popup-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
}

.buy-popup-close__icon {
  color: #666;
  font-size: 40rpx;
  line-height: 56rpx;
}

.section-row {
  padding: 34rpx 32rpx;
  // border-top: 1rpx solid #f0f4f7;
}

.address-section {
  padding: 24rpx 32rpx 26rpx;
  border-top: 20rpx solid #f0f4f7;
}

.address-card {
  min-height: 104rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.address-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.address-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.address-arrow {
  width: 13rpx;
  height: 23rpx;
  flex-shrink: 0;
}

/* 商品信息 */
.product-info {
  display: flex;
  align-items: flex-start;
  padding: 32rpx;
  gap: 24rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #f2f2f2;
  flex-shrink: 0;
}
.info-img {
  width: 180rpx;
  min-width: 180rpx;
  max-width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
  overflow: hidden;
}
.info-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding-right: 72rpx;
}
.info-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
  padding-right: 12rpx;
}
.info-price-row {
  display: flex;
  align-items: baseline;
  font-family: "PingFang SC";
}
.info-price-symbol {
  font-size: 24rpx;
  color: #ff4d4f;
  font-weight: 600;
}
.info-price {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: 700;
}

/* 购买数量 */
.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 34rpx 32rpx;
  border-top: 20rpx solid #f0f4f7;
}
.section-left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.section-label {
  font-size: 28rpx;
  color: #1a1a1a;
}
.stock-text {
  font-size: 24rpx;
  color: #999;
}
.quantity-ctrl {
  display: flex;
  align-items: center;
  gap: 4rpx;
}
.qty-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn.disabled {
  opacity: 0.35;
}
.qty-icon-img {
  width: 44rpx;
  height: 44rpx;
}
.qty-num {
  font-size: 32rpx;
  color: #1a1a1a;
  font-weight: 500;
  min-width: 60rpx;
  text-align: center;
}

/* 商品规格 */
.spec-section {
  padding: 0 32rpx 34rpx;
}
.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 22rpx;
}
.spec-tag {
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef1f4;
}
.spec-group {
  margin-bottom: 24rpx;
}
.spec-active {
  background: #ffece5;
  border: 1rpx solid #ff7a1a;
}
.spec-soldout {
  opacity: 0.38;
  position: relative;
  overflow: hidden;
}
.spec-text {
  font-size: 26rpx;
  color: #333;
}
.spec-text-active {
  color: #333;
  font-weight: 400;
}
.spec-text-soldout {
  color: #999;
}
.info-price-range {
  font-size: 24rpx;
  color: #ff4d4f;
  font-weight: 400;
  margin-left: 4rpx;
  align-self: flex-end;
  padding-bottom: 4rpx;
}

/* 备注 */
.remark-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.remark-input {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 28rpx;
  color: #999;
}

.coupon-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.coupon-row-left {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 16rpx;
}

.max-discount {
  max-width: 180rpx;
  height: 36rpx;
  line-height: 36rpx;
  padding: 0 8rpx;
  border-radius: 8rpx;
  background: rgba(250, 119, 20, 0.06);
  color: #fa7714;
  font-size: 24rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-select-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  min-width: 0;
  gap: 12rpx;
}

.coupon-select-text {
  min-width: 0;
  color: #ff4d4f;
  font-size: 28rpx;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-empty {
  color: #999;
}

.coupon-arrow {
  width: 13rpx;
  height: 23rpx;
  flex-shrink: 0;
}

/* 价格 */
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 34rpx 32rpx;
}

.price-label {
  font-size: 28rpx;
  color: #1a1a1a;
}

.price-value {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 28rpx;
  font-family: "PingFang SC";
  color: #111;
}

.price-discount {
  color: #ff4d4f;
}

/* 底部按钮 */
.popup-footer {
  padding: 20rpx 32rpx calc(env(safe-area-inset-bottom) + 20rpx);
  flex-shrink: 0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  background: #fff;
}

.popup-pay-left {
  display: flex;
  align-items: baseline;
}

.popup-pay-label {
  font-size: 28rpx;
  color: #555;
}

.popup-pay-price {
  font-family: "PingFang SC";
  margin-left: 12rpx;
  font-size: 46rpx;
  color: #ff180e;
  font-weight: 600;
}

.confirm-btn {
  width: 260rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(90deg, #ff8a21 0%, #ff5a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-btn-disabled {
  background: #d9d9d9;
}

.confirm-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

.selected-tip {
  font-size: 24rpx;
  color: #999;
}

.popup-scroll {
  flex: 1;
  min-height: 0;
}
</style>
