<template>
  <view v-if="visible" class="coupon-layer" @click="emit('close')">
    <view class="coupon-panel" @click.stop>
      <view class="coupon-header">
        <text class="coupon-title">选择优惠券</text>
        <view class="coupon-close" @click="emit('close')">×</view>
      </view>

      <view v-if="bestCoupon" class="best-offer">
        <view class="best-offer-left">
          <text class="best-offer-title">最佳优惠</text>
          <text class="best-offer-desc">预计抵扣 ¥{{ formatAmount(bestCoupon.previewDiscount || bestCoupon.reduceAmount) }}</text>
        </view>
        <view class="best-offer-btn" @click="selectBestCoupon">使用最佳优惠</view>
      </view>

      <view class="coupon-tabs">
        <view
          :class="['coupon-tab', activeTab === 'usable' ? 'coupon-tab-active' : '']"
          @click="activeTab = 'usable'"
        >
          可用优惠券({{ usableCoupons.length }})
        </view>
        <view
          :class="['coupon-tab', activeTab === 'unusable' ? 'coupon-tab-active' : '']"
          @click="activeTab = 'unusable'"
        >
          不可用({{ unusableCoupons.length }})
        </view>
      </view>

      <scroll-view class="coupon-list" scroll-y :show-scrollbar="false">
        <view v-if="activeTab === 'usable'" class="no-coupon-row" @click="draftCouponId = 0">
          <text>暂不使用优惠券</text>
          <view :class="['coupon-check', draftCouponId === 0 ? 'coupon-check-active' : '']">
            <text v-if="draftCouponId === 0">已选</text>
          </view>
        </view>

        <template v-if="displayCoupons.length">
          <view
            v-for="(coupon, index) in displayCoupons"
            :key="couponKey(coupon, index)"
            :class="['coupon-card', activeTab === 'unusable' ? 'coupon-card-disabled' : '']"
            @click="onCouponTap(coupon)"
          >
            <view class="coupon-card-left">
              <view class="coupon-amount">
                <text class="coupon-currency">¥</text>
                <text class="coupon-amount-main">{{ amountParts(coupon).integer }}</text>
                <text class="coupon-amount-decimal">.{{ amountParts(coupon).decimal }}</text>
              </view>
              <text class="coupon-limit">{{ formatLimit(coupon) }}</text>
            </view>
            <view class="coupon-card-right">
              <text class="coupon-name">{{ coupon.couponName || coupon.name || "优惠券" }}</text>
              <text class="coupon-desc">{{ formatScope(coupon) }}</text>
              <text class="coupon-time">{{ formatValidity(coupon) }}</text>
              <text v-if="activeTab === 'unusable'" class="coupon-reason">
                {{ coupon.unusableReason || coupon.reason || "当前商品不可用" }}
              </text>
            </view>
            <view
              v-if="activeTab === 'usable'"
              :class="['coupon-use-state', isDraftSelected(coupon) ? 'coupon-use-state-active' : '']"
            >
              {{ isDraftSelected(coupon) ? "已选" : "使用" }}
            </view>
          </view>
        </template>

        <view v-else class="coupon-empty-state">
          <text>{{ activeTab === "usable" ? "暂无可用优惠券" : "暂无不可用优惠券" }}</text>
        </view>
      </scroll-view>

      <view v-if="activeTab === 'usable'" class="coupon-choose-count">
        {{ draftCouponId ? "已选择 1 张优惠券" : "暂不使用优惠券" }}
      </view>

      <view class="coupon-footer">
        <view class="coupon-confirm" @click="confirmSelection">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  usableCoupons: { type: Array, default: () => [] },
  unusableCoupons: { type: Array, default: () => [] },
  selectedCouponId: { type: Number, default: 0 },
  zIndex: { type: Number, default: 100000001 },
});

const emit = defineEmits(["close", "select-coupon"]);

const activeTab = ref("usable");
const draftCouponId = ref(0);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      activeTab.value = props.usableCoupons.length > 0 || props.unusableCoupons.length === 0 ? "usable" : "unusable";
      draftCouponId.value = Number(props.selectedCouponId) || 0;
    }
  },
);

watch(
  () => props.selectedCouponId,
  (id) => {
    if (props.visible) draftCouponId.value = Number(id) || 0;
  },
);

const displayCoupons = computed(() => (
  activeTab.value === "usable" ? props.usableCoupons : props.unusableCoupons
));

const bestCoupon = computed(() => {
  if (!props.usableCoupons.length) return null;
  return props.usableCoupons.reduce((best, coupon) => {
    const bestAmount = Number(best.previewDiscount || best.reduceAmount || 0);
    const amount = Number(coupon.previewDiscount || coupon.reduceAmount || 0);
    return amount > bestAmount ? coupon : best;
  }, props.usableCoupons[0]);
});

function couponKey(coupon, index) {
  return coupon.customerCouponId || coupon.couponId || coupon.id || `${coupon.couponName || "coupon"}-${index}`;
}

function formatAmount(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

function amountParts(coupon) {
  const [integer, decimal = "00"] = formatAmount(coupon.previewDiscount || coupon.reduceAmount).split(".");
  return { integer, decimal };
}

function formatLimit(coupon) {
  const minAmount = Number(coupon.minAmount || 0);
  return minAmount > 0 ? `满${formatAmount(minAmount)}可用` : "无门槛";
}

function formatScope(coupon) {
  return coupon.scopeText || coupon.applicableText || coupon.useScope || "适用商品以结算页为准";
}

function formatValidity(coupon) {
  const start = coupon.startTime || coupon.validStartTime || coupon.effectiveAt || "";
  const end = coupon.endTime || coupon.validEndTime || coupon.expiredAt || "";
  if (start && end) return `${start} - ${end}`;
  if (end) return `有效期至 ${end}`;
  return "有效期以券包为准";
}

function isDraftSelected(coupon) {
  return Number(coupon.customerCouponId) === Number(draftCouponId.value);
}

function onCouponTap(coupon) {
  if (activeTab.value !== "usable") return;
  draftCouponId.value = Number(coupon.customerCouponId) || 0;
}

function selectBestCoupon() {
  if (!bestCoupon.value) return;
  activeTab.value = "usable";
  draftCouponId.value = Number(bestCoupon.value.customerCouponId) || 0;
}

function confirmSelection() {
  emit("select-coupon", Number(draftCouponId.value) || 0);
  emit("close");
}
</script>

<style scoped>
.coupon-layer {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: v-bind(zIndex);
  background: rgba(0, 0, 0, 0.6);
}

.coupon-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: 78vh;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
}

.coupon-header {
  position: relative;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coupon-title {
  font-size: 36rpx;
  line-height: 50rpx;
  font-weight: 700;
  color: #333;
}

.coupon-close {
  position: absolute;
  right: 24rpx;
  top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  color: #666;
  font-size: 44rpx;
}

.best-offer {
  margin: 0 32rpx 20rpx;
  padding: 16rpx 24rpx;
  height: 104rpx;
  box-sizing: border-box;
  background: rgba(250, 119, 20, 0.06);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.best-offer-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.best-offer-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.best-offer-desc {
  font-size: 24rpx;
  color: #ff0e4c;
  font-weight: 600;
}

.best-offer-btn {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coupon-tabs {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 32rpx 16rpx;
}

.coupon-tab {
  position: relative;
  padding-bottom: 14rpx;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.coupon-tab-active {
  color: #ff0e4c;
  font-weight: 700;
}

.coupon-tab-active::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 40rpx;
  height: 4rpx;
  border-radius: 2rpx;
  background: #ff0e4c;
  transform: translateX(-50%);
}

.coupon-list {
  flex: 1;
  height: 0;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0 32rpx 20rpx;
}

.coupon-list :deep(.uni-scroll-view) {
  height: 100%;
}

.no-coupon-row {
  height: 88rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
  border-radius: 14rpx;
  background: #fff;
  box-shadow: 0 4rpx 18rpx rgba(48, 48, 48, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
  font-size: 28rpx;
}

.coupon-check {
  min-width: 46rpx;
  height: 46rpx;
  border-radius: 23rpx;
  border: 2rpx solid #e5e5e5;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  color: #fff;
  font-size: 20rpx;
}

.coupon-check-active {
  min-width: 72rpx;
  border-color: #ff0e4c;
  background: #ff0e4c;
}

.coupon-card {
  position: relative;
  min-height: 224rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  background: #fff;
  box-shadow: 0 4rpx 18rpx rgba(48, 48, 48, 0.08);
}

.coupon-card::before,
.coupon-card::after {
  content: "";
  position: absolute;
  left: 218rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #fff;
  z-index: 2;
}

.coupon-card::before {
  top: -14rpx;
}

.coupon-card::after {
  bottom: -14rpx;
}

.coupon-card-left {
  width: 232rpx;
  padding: 34rpx 12rpx 24rpx;
  box-sizing: border-box;
  background: linear-gradient(145deg, #ff6d2d 0%, #ff0e4c 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.coupon-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  font-weight: 700;
}

.coupon-currency {
  font-size: 28rpx;
}

.coupon-amount-main {
  font-size: 72rpx;
  line-height: 84rpx;
}

.coupon-amount-decimal {
  font-size: 28rpx;
}

.coupon-limit {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 32rpx;
}

.coupon-card-right {
  flex: 1;
  min-width: 0;
  padding: 24rpx 80rpx 22rpx 28rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-name {
  font-size: 28rpx;
  line-height: 40rpx;
  font-weight: 700;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-desc,
.coupon-time,
.coupon-reason {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 32rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-reason {
  color: #ff0e4c;
}

.coupon-use-state {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  min-width: 64rpx;
  height: 48rpx;
  padding: 0 12rpx;
  border-radius: 24rpx;
  color: #ff0e4c;
  border: 2rpx solid #ff0e4c;
  font-size: 22rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coupon-use-state-active {
  background: #ff0e4c;
  color: #fff;
}

.coupon-card-disabled .coupon-card-left {
  background: linear-gradient(145deg, #c8c8c8 0%, #999 100%);
}

.coupon-empty-state {
  min-height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
}

.coupon-choose-count {
  flex-shrink: 0;
  height: 60rpx;
  line-height: 60rpx;
  background: rgba(255, 14, 76, 0.1);
  text-align: center;
  color: #ff0e4c;
  font-size: 24rpx;
}

.coupon-footer {
  flex-shrink: 0;
  padding: 16rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.coupon-confirm {
  height: 88rpx;
  border-radius: 52rpx;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
