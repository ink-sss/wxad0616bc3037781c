<template>
  <view class="pay-page">
    <!-- 状态头部 -->
    <view class="status-header" :class="statusHeaderClass">
      <view v-if="status === 'loading' || status === 'paying'" class="status-icon-wrap">
        <view class="spinner"></view>
      </view>
      <view v-else-if="status === 'success'" class="status-icon-wrap">
        <view class="icon-circle icon-success">
          <view class="check-mark"></view>
        </view>
      </view>
      <view v-else-if="status === 'fail'" class="status-icon-wrap">
        <view class="icon-circle icon-fail">
          <view class="fail-mark">
            <view class="fail-line fail-line-1"></view>
            <view class="fail-line fail-line-2"></view>
          </view>
        </view>
      </view>
      <text class="status-title">{{ statusTitle }}</text>
      <text class="status-hint">{{ statusHint }}</text>
    </view>

    <!-- 订单详情卡片 -->
    <view class="detail-section">
      <!-- 商品信息 -->
      <view v-if="orderDetail && orderItems.length" class="card goods-card">
        <view
          v-for="(item, idx) in orderItems"
          :key="idx"
          class="goods-row"
        >
          <image
            v-if="item.coverImage"
            class="goods-img"
            :src="item.coverImage"
            mode="aspectFill"
          />
          <view v-else class="goods-img goods-img-placeholder"></view>
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <text v-if="item.skuText" class="goods-sku">{{ item.skuText }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ formatPrice(item.price) }}</text>
              <text class="goods-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 金额信息 -->
      <view class="card amount-card">
        <view class="amount-row">
          <text class="amount-label">订单编号</text>
          <text class="amount-value amount-mono">{{ orderNo }}</text>
        </view>
        <view v-if="orderDetail" class="amount-row">
          <text class="amount-label">商品合计</text>
          <text class="amount-value">¥{{ formatPrice(orderDetail.totalAmount) }}</text>
        </view>
        <view v-if="orderDetail && orderDetail.shippingFee > 0" class="amount-row">
          <text class="amount-label">运费</text>
          <text class="amount-value">¥{{ formatPrice(orderDetail.shippingFee) }}</text>
        </view>
        <view v-if="orderDetail && orderDetail.discountAmount > 0" class="amount-row">
          <text class="amount-label">优惠</text>
          <text class="amount-value discount-text">-¥{{ formatPrice(orderDetail.discountAmount) }}</text>
        </view>
        <view class="amount-divider"></view>
        <view class="amount-row amount-total-row">
          <text class="amount-label total-label">实付金额</text>
          <text class="amount-value total-value">
            ¥{{ orderDetail ? formatPrice(orderDetail.payAmount) : "--" }}
          </text>
        </view>
      </view>

      <!-- 收货信息 -->
      <view v-if="orderDetail && orderDetail.receiverName" class="card address-card">
        <view class="addr-row">
          <text class="addr-name">{{ orderDetail.receiverName }}</text>
          <text class="addr-phone">{{ maskPhone(orderDetail.receiverPhone) }}</text>
        </view>
        <text class="addr-detail">{{ orderDetail.receiverAddress }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view v-if="status === 'loading' || status === 'paying'" class="bottom-inner">
        <view class="pay-btn pay-btn-disabled">
          <view class="btn-spinner"></view>
          <text>支付处理中...</text>
        </view>
      </view>
      <view v-else-if="status === 'success'" class="bottom-inner" :class="{ 'bottom-inner-dual': canBackLive }">
        <view v-if="canBackLive" class="pay-btn pay-btn-ghost" @click="goBackLiveRoom">
          返回直播间
        </view>
        <view class="pay-btn pay-btn-primary" @click="goOrderList">
          查看订单
        </view>
      </view>
      <view v-else-if="status === 'fail'" class="bottom-inner bottom-inner-triple">
        <view v-if="canBackLive" class="pay-btn pay-btn-ghost" @click="goBackLiveRoom">
          返回直播间
        </view>
        <view class="pay-btn pay-btn-ghost" @click="goOrderList">
          查看订单
        </view>
        <view class="pay-btn pay-btn-primary" @click="retryPay">
          重新支付
        </view>
      </view>
    </view>
    <live-mini-window :room-code="liveRoomCode" :return-origin="returnOrigin" />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getOrderDetail, markOrderUnread } from "@/api/order";
import { executeYeepayPayment } from "@/services/payment-action";
import { ensureH5PageAuth } from "@/services/h5-auth-context";
import { resolveLiveRoomCode } from "@/utils/live-room-context";
import { returnToLiveRoom } from "@/utils/live-room-navigation";
import LiveMiniWindow from "@/components/live-mini-window.vue";

const status = ref("loading");
const errorMsg = ref("");
const orderNo = ref("");
const orderId = ref(0);
const liveRoomCode = ref("");
const preferredChannelType = ref(0);
const returnOrigin = ref("");
const orderDetail = ref(null);

const canBackLive = computed(() => !!returnOrigin.value && !!liveRoomCode.value);

const orderItems = computed(() => {
  const items = orderDetail.value?.items;
  return Array.isArray(items) ? items : [];
});

const statusTitle = computed(() => {
  if (status.value === "loading") return "正在准备支付";
  if (status.value === "paying") return "正在发起支付";
  if (status.value === "success") return "支付成功";
  return errorMsg.value || "支付失败";
});

const statusHint = computed(() => {
  if (status.value === "loading" || status.value === "paying")
    return "请稍候，即将弹出支付窗口...";
  if (status.value === "success") return "订单已支付完成";
  return "请检查网络后重试";
});

const statusHeaderClass = computed(() => {
  if (status.value === "success") return "header-success";
  if (status.value === "fail") return "header-fail";
  return "header-loading";
});

function formatPrice(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || "";
  return phone.substring(0, 3) + "****" + phone.substring(7);
}

async function loadOrderDetail() {
  if (!orderId.value) return;
  try {
    const detail = await getOrderDetail(orderId.value);
    if (detail) {
      orderDetail.value = detail;
    }
  } catch (e) {
    console.warn("[Pay] 获取订单详情失败:", e);
  }
}

async function doPay() {
  if (!orderNo.value) {
    status.value = "fail";
    errorMsg.value = "订单号缺失";
    return;
  }
  status.value = "paying";
  try {
    const payMode = await executeYeepayPayment(orderNo.value, {
      channelType: preferredChannelType.value || 4,
      roomCode: liveRoomCode.value,
    });
    if (payMode === "cashier") {
      return;
    }
    status.value = "success";
  } catch (err) {
    status.value = "fail";
    errorMsg.value = err?.message || "支付失败，请重试";
    // 支付失败/取消：重置订单已读状态，触发待付款角标
    if (orderId.value) {
      markOrderUnread(orderId.value).catch(() => {});
    }
  }
}

function retryPay() {
  doPay();
}

function goOrderList() {
  const code = String(liveRoomCode.value || "").trim();
  uni.reLaunch({
    url: `/pages/order/list?status=unpay${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`,
  });
}

function goBackLiveRoom() {
  const code = String(liveRoomCode.value || "").trim();
  if (!code) return;
  returnToLiveRoom(code);
}

onLoad(async (query) => {
  if (!ensureH5PageAuth(query)) return;
  orderNo.value = query?.orderNo || "";
  orderId.value = Number(query?.orderId || query?.id) || 0;
  liveRoomCode.value = resolveLiveRoomCode(query?.roomCode);
  preferredChannelType.value = Number(query?.channelType) || 0;
  returnOrigin.value = decodeURIComponent(query?.returnOrigin || "");
  if (!orderNo.value) {
    status.value = "fail";
    errorMsg.value = "订单号缺失";
    return;
  }

  // 并行：加载订单详情 + 发起支付
  loadOrderDetail();
  doPay();
});
</script>

<style lang="scss" scoped>
.pay-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* ===== 状态头部 ===== */
.status-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx 48rpx;
  color: #fff;
}

.header-loading {
  background: linear-gradient(135deg, #ff8a1d 0%, #ff6b10 100%);
}

.header-success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.header-fail {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.status-icon-wrap {
  margin-bottom: 20rpx;
}

.spinner {
  width: 72rpx;
  height: 72rpx;
  border: 5rpx solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon-circle {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: iconPop 0.35s ease-out;
}

@keyframes iconPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.icon-success,
.icon-fail {
  background: rgba(255, 255, 255, 0.25);
}

.check-mark {
  width: 32rpx;
  height: 20rpx;
  border-left: 5rpx solid #fff;
  border-bottom: 5rpx solid #fff;
  transform: rotate(-45deg);
  margin-top: -4rpx;
}

.fail-mark {
  width: 36rpx;
  height: 36rpx;
  position: relative;
}

.fail-line {
  position: absolute;
  width: 36rpx;
  height: 5rpx;
  background: #fff;
  border-radius: 3rpx;
  top: 50%;
  left: 0;
  margin-top: -2.5rpx;
}

.fail-line-1 {
  transform: rotate(45deg);
}

.fail-line-2 {
  transform: rotate(-45deg);
}

.status-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.status-hint {
  font-size: 24rpx;
  opacity: 0.8;
}

/* ===== 详情区域 ===== */
.detail-section {
  padding: 24rpx 24rpx 0;
  margin-top: -20rpx;
  position: relative;
  z-index: 1;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

/* ===== 商品卡片 ===== */
.goods-card {
  padding: 24rpx;
}

.goods-row {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
}

.goods-row + .goods-row {
  border-top: 1rpx solid #f0f0f0;
  margin-top: 12rpx;
  padding-top: 24rpx;
}

.goods-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.goods-img-placeholder {
  background: #eee;
}

.goods-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  min-height: 140rpx;
}

.goods-name {
  font-size: 28rpx;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-sku {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  padding: 4rpx 12rpx;
  background: #f5f5f5;
  border-radius: 4rpx;
  align-self: flex-start;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.goods-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff5722;
}

.goods-qty {
  font-size: 24rpx;
  color: #999;
}

/* ===== 金额卡片 ===== */
.amount-card {
  padding: 24rpx 28rpx;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.amount-label {
  font-size: 26rpx;
  color: #666;
}

.amount-value {
  font-size: 26rpx;
  color: #333;
}

.amount-mono {
  font-family: monospace;
  font-size: 24rpx;
  color: #999;
}

.discount-text {
  color: #ff5722;
}

.amount-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 8rpx 0;
}

.amount-total-row {
  padding-top: 16rpx;
}

.total-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #1a1a1a;
}

.total-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff5722;
}

/* ===== 地址卡片 ===== */
.address-card {
  padding: 24rpx 28rpx;
}

.addr-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 8rpx;
}

.addr-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #1a1a1a;
}

.addr-phone {
  font-size: 26rpx;
  color: #666;
}

.addr-detail {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

/* ===== 底部按钮栏 ===== */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
  z-index: 10;
}

.bottom-inner {
  display: flex;
  gap: 20rpx;
}

.bottom-inner-dual .pay-btn,
.bottom-inner-triple .pay-btn {
  flex: 1;
}

.pay-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: opacity 0.2s;
}

.pay-btn:active {
  opacity: 0.8;
}

.pay-btn-primary {
  background: linear-gradient(90deg, #ff8a1d 0%, #ff7215 100%);
  color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(255, 114, 21, 0.3);
}

.pay-btn-ghost {
  background: #f5f5f5;
  color: #666;
}

.pay-btn-disabled {
  background: #f5f5f5;
  color: #999;
}

.btn-spinner {
  width: 28rpx;
  height: 28rpx;
  border: 4rpx solid #ccc;
  border-top-color: #999;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
