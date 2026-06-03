<template>
  <view
    v-if="isCenterCouponModal"
    class="source-coupon-receive"
    @click.self="closeModal"
  >
    <view class="source-coupon-box">
      <view
        class="center-watch-bg"
        :class="isSuccess ? 'have-received' : 'enable-receive'"
      >
        <view
          class="source-coupon-content"
          :class="{ 'is-success': isSuccess }"
        >
          <view v-if="!isSuccess" class="source-coupon-title">
            获得优惠券 {{ couponQuantity }} 张
          </view>
          <view v-else class="source-coupon-success-title"></view>

          <view class="coupon-bg source-coupon-card">
            <view class="source-coupon-card-left">
              <view class="source-coupon-amount">
                <text class="source-coupon-symbol">¥</text>
                <text class="source-coupon-price">{{ couponAmountInteger }}</text>
                <text class="source-coupon-decimal">{{ couponAmountDecimal }}</text>
              </view>
              <view class="source-coupon-limit">{{ couponLimitText }}</view>
            </view>
            <view class="source-coupon-card-right">
              <view class="source-coupon-name">{{ couponName }}</view>
              <view class="source-coupon-desc">
                {{ couponDesc }}
              </view>
              <view class="source-coupon-validity">{{ couponValidity }}</view>
            </view>
          </view>

          <template v-if="isSuccess">
            <view class="source-coupon-result-wrapper">
              <view class="source-coupon-result" @click="openPrizeRecord">
              领取结果在 <text class="source-coupon-result-link">中奖记录</text> 查看
            </view>
            <view class="source-coupon-countdown">{{ closeCountdown }} 秒后自动关闭</view>
            </view>
          </template>
          <template v-else>
            <view class="source-coupon-tip">数量有限，先到先得～</view>
            <view class="source-coupon-button">立即领取</view>
          </template>
        </view>
        <view class="source-coupon-close-row">
          <view class="source-coupon-close" @click="closeModal"></view>
        </view>
      </view>
    </view>
  </view>

  <view v-if="activeModal === 'couponBindPhone'" class="coupon-bind-phone-box">
    <view class="push-coupon-time-header">
      <view class="push-coupon-time-left"></view>
      <text>绑定手机号</text>
      <text class="coupon-close" @click="closeModal">×</text>
    </view>
    <view class="push-coupon-time-tip">
      <image class="push-coupon-time-tip-icon" :src="image.tip" mode="aspectFill" />
      <text>请绑定手机号，如未绑定则无法领取优惠券</text>
    </view>
    <view class="coupon-bind-phone-center">
      <view class="coupon-bind-phone-inp-box">
        <image class="coupon-bind-phone-code-icon" :src="image.add" mode="aspectFill" />
        <text>86</text>
        <text class="coupon-bind-phone-inp">请输入手机号</text>
      </view>
      <view class="coupon-bind-phone-inp-box">
        <text class="coupon-bind-code-inp">请输入短信验证码</text>
        <text class="send-coupon-bind-code isDisabled">获取验证码</text>
      </view>
    </view>
    <view class="push-coupon-time-foot">
      <text class="coupon-bind-phone-cancel" @click="closeModal">取消</text>
      <text class="coupon-bind-phone-confirm">确定</text>
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { navigateToPrizeRecord } from "@/utils/route-navigation";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  assets: {
    type: Object,
    required: true
  },
  coupon: {
    type: Object,
    default: null
  },
  recordUrl: {
    type: String,
    default: "/pages/prize-record/index"
  }
});

const emit = defineEmits(["close"]);

const AUTO_CLOSE_SECONDS = 8;
const closeCountdown = ref(AUTO_CLOSE_SECONDS);
let closeTimer = null;

const image = {
  tip: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-goods-refund-tip-5eba5241.png",
  add: "./static/remote-icons/nyfs-oss-bcvdata-com-public-mobile-images-add-icon-58e6dd01.png"
};

const isCenterCouponModal = computed(() => {
  return props.activeModal === "couponReceive" || props.activeModal === "couponReceiveSuccess";
});
const isSuccess = computed(() => props.activeModal === "couponReceiveSuccess");
const couponQuantity = computed(() => Number(props.coupon?.rewardQuantity || 1) || 1);
const couponAmount = computed(() => {
  const amount = props.coupon?.couponAmount || props.coupon?.amount || "";
  return amount ? String(amount) : "40.05";
});
const couponAmountParts = computed(() => {
  const [integer, decimal = ""] = couponAmount.value.split(".");
  return { integer: integer || "0", decimal: decimal ? `.${decimal}` : "" };
});
const couponAmountInteger = computed(() => couponAmountParts.value.integer);
const couponAmountDecimal = computed(() => couponAmountParts.value.decimal);
const couponLimitText = computed(() => {
  const minAmount = props.coupon?.couponMinAmount || props.coupon?.minAmount || "";
  if (minAmount) return `满${minAmount}可用`;
  return props.coupon ? "无门槛" : "满100可用";
});
const couponName = computed(() => props.coupon?.rewardName || props.coupon?.couponName || "优惠券名称优惠券名...");
const couponDesc = computed(() => (
  props.coupon?.couponDesc || props.coupon?.description || "全部商品可用，允许与折后或秒杀优惠等营销活..."
));
const couponValidity = computed(() => {
  if (props.coupon?.couponStartTime && props.coupon?.couponEndTime) {
    return `${props.coupon.couponStartTime} 至 ${props.coupon.couponEndTime}`;
  }
  return props.coupon?.validityText || (props.coupon ? "有效期以券包为准" : "领取当日2天内可用");
});

watch(
  () => props.activeModal,
  (modal) => {
    if (modal === "couponReceiveSuccess") {
      startAutoCloseCountdown();
      return;
    }
    stopAutoCloseCountdown();
    closeCountdown.value = AUTO_CLOSE_SECONDS;
  },
  { immediate: true }
);

function startAutoCloseCountdown() {
  stopAutoCloseCountdown();
  closeCountdown.value = AUTO_CLOSE_SECONDS;
  closeTimer = setInterval(() => {
    const next = closeCountdown.value - 1;
    if (next <= 0) {
      closeCountdown.value = 0;
      closeModal();
      return;
    }
    closeCountdown.value = next;
  }, 1000);
}

function stopAutoCloseCountdown() {
  if (!closeTimer) return;
  clearInterval(closeTimer);
  closeTimer = null;
}

function closeModal() {
  stopAutoCloseCountdown();
  emit("close");
}

function openPrizeRecord() {
  navigateToPrizeRecord(props.recordUrl);
}

onBeforeUnmount(stopAutoCloseCountdown);
</script>

<style lang="scss" scoped>
.source-coupon-receive {
  position: fixed;
  inset: 0;
  z-index: 100200;
  background: rgba(0, 0, 0, 0.6);
}

.source-coupon-box {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 590rpx;
  height: 754rpx;
  transform: translate(-50%, -50%);
}

.center-watch-bg {
  position: relative;
  width: 590rpx;
  height: 754rpx;
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-size: 100% calc(100% - 128rpx);
}

.center-watch-bg.enable-receive {
  background-image: url("../static/remote-icons/s-nuoyun-center-watch-enable-receive-bg.png");
}

.center-watch-bg.have-received {
  background-image: url("../static/remote-icons/s-nuoyun-center-watch-have-received-bg.png");
}

.source-coupon-content {
  width: 590rpx;
  height: 626rpx;
  padding: 64rpx 48rpx 0;
  box-sizing: border-box;
}

.source-coupon-content.is-success {
  height: 582rpx;
}

.source-coupon-title {
  height: 56rpx;
  margin-bottom: 48rpx;
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 56rpx;
  text-align: center;
}

.source-coupon-success-title {
  height: 128rpx;
}

.source-coupon-card {
  display: flex;
  width: 494rpx;
  height: 202rpx;
  padding: 24rpx 16rpx 24rpx 8rpx;
  box-sizing: border-box;
  background: url("../static/remote-icons/s-nuoyun-center-watch-coupon-bg.png") center / 100% 100% no-repeat;
}

.source-coupon-card-left {
  width: 160rpx;
  margin-right: 16rpx;
  color: #ff0e4c;
  text-align: center;
}

.source-coupon-amount {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 82rpx;
  color: #ff0e4c;
  line-height: 1;
}

.source-coupon-symbol {
  margin-bottom: 10rpx;
  font-size: 24rpx;
}

.source-coupon-price {
  font-size: 72rpx;
  font-weight: 700;
}

.source-coupon-decimal {
  margin-bottom: 8rpx;
  font-size: 34rpx;
  font-weight: 700;
}

.source-coupon-limit {
  display: block;
  margin-top: 12rpx;
  color: #ff0e4c;
  font-size: 24rpx;
  line-height: 34rpx;
}

.source-coupon-card-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.source-coupon-name {
  overflow: hidden;
  color: #333;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 40rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-coupon-desc {
  display: -webkit-box;
  overflow: hidden;
  color: #333;
  font-size: 24rpx;
  line-height: 34rpx;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.source-coupon-validity {
  overflow: hidden;
  padding-right: 6rpx;
  color: #999;
  font-size: 22rpx;
  line-height: 32rpx;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-coupon-tip {
  height: 88rpx;
  // margin: 24rpx 0 40rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  font-weight: 400;
  line-height: 88rpx;
  text-align: center;
}

.source-coupon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 494rpx;
  height: 88rpx;
  border-radius: 44rpx;
  color: #fe6b33;
  font-size: 28rpx;
  font-weight: 700;
  background: #fff;
}

.source-coupon-result-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 234rpx;
}

.source-coupon-result {
  // height: 34rpx;
  // margin: 24rpx 0 16rpx;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  line-height: 34rpx;
  text-align: center;
}

.source-coupon-result-link {
  color: #fff;
  font-weight: 700;
}

.source-coupon-countdown {
  height: 34rpx;
  margin-top: 16rpx;
  color: #fff;
  font-size: 24rpx;
  line-height: 34rpx;
  text-align: center;
}

.source-coupon-close {
  width: 64rpx;
  height: 64rpx;
  background: url("../static/remote-icons/s-nuoyun-icon-close.png") center / contain no-repeat;
}

.source-coupon-close-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  margin-top: 64rpx;
}

.coupon-bind-phone-box {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 100200;
  width: 100%;
  border-radius: 48rpx 48rpx 0 0;
  background: #fff;
}

.push-coupon-time-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 124rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 700;
}

.coupon-close {
  position: absolute;
  right: 32rpx;
  top: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  color: #999;
  font-size: 52rpx;
}

.push-coupon-time-tip {
  display: flex;
  align-items: center;
  min-height: 60rpx;
  padding: 0 32rpx;
  color: #ff0e4c;
  font-size: 24rpx;
  background: rgba(255, 14, 76, 0.1);
}

.push-coupon-time-tip-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.coupon-bind-phone-center {
  padding: 16rpx 32rpx 64rpx;
}

.coupon-bind-phone-inp-box {
  display: flex;
  align-items: center;
  height: 140rpx;
  color: #333;
  font-size: 32rpx;
  border-bottom: 2rpx solid #f2f2f2;
}

.coupon-bind-phone-code-icon {
  width: 18rpx;
  height: 18rpx;
  margin-right: 4rpx;
}

.coupon-bind-phone-inp,
.coupon-bind-code-inp {
  flex: 1;
  margin-left: 16rpx;
  color: #b3b3b3;
}

.send-coupon-bind-code {
  color: #d8d8d8;
}

.push-coupon-time-foot {
  display: flex;
  width: 100%;
  padding: 16rpx 32rpx 40rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.coupon-bind-phone-cancel,
.coupon-bind-phone-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 44rpx;
}

.coupon-bind-phone-cancel {
  width: 240rpx;
  margin-right: 30rpx;
  color: #333;
  background: #f6f6f6;
}

.coupon-bind-phone-confirm {
  flex: 1;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
}
</style>
