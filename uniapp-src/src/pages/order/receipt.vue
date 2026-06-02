<template>
  <!-- 加载成功：显示小票内容 -->
  <view class="receipt-page" v-if="receiptDetail">
    <view class="receipt-card">
      <view class="receipt-section">
        <view class="receipt-row">
          <text class="label">订单编号</text>
          <text class="value">{{ receiptDetail.orderNo }}</text>
        </view>
      </view>
      <view class="receipt-section">
        <view class="receipt-row">
          <text class="label">商品总额</text>
          <text class="value">¥{{ receiptDetail.amount.goodsAmount }}</text>
        </view>
        <view class="receipt-row">
          <text class="label">运费</text>
          <text class="value">¥{{ receiptDetail.amount.freightAmount }}</text>
        </view>
        <view class="receipt-row receipt-row-strong">
          <text class="label">实付金额</text>
          <text class="value value-amount"
            >¥{{ receiptDetail.amount.payAmount }}</text
          >
        </view>
      </view>

      <view class="receipt-footer">
        <view class="receipt-btn" @click="goOrderList">返回订单列表</view>
        <view
          class="receipt-btn receipt-btn-live"
          v-if="receiptDetail.roomCode"
          @click="goBackLive"
          >返回直播间</view
        >
      </view>
    </view>
    <live-mini-window :room-code="receiptDetail.roomCode" :enabled="!isInGoldPlanIframe" />
  </view>
  <!-- 加载失败：显示错误信息和收到的参数，方便排查 -->
  <view class="receipt-page" v-else-if="loadError">
    <view class="receipt-card">
      <view class="receipt-section">
        <text class="receipt-error-title">订单信息加载失败</text>
        <text class="receipt-error-msg">{{ loadError }}</text>
      </view>
      <view class="receipt-section receipt-debug">
        <view class="receipt-row">
          <text class="label">out_trade_no</text>
          <text class="value">{{ debugParams.outTradeNo || '(空)' }}</text>
        </view>
        <view class="receipt-row">
          <text class="label">sub_mch_id</text>
          <text class="value">{{ debugParams.subMchId || '(空)' }}</text>
        </view>
        <view class="receipt-row">
          <text class="label">check_code</text>
          <text class="value">{{ debugParams.checkCode ? '已收到' : '(空)' }}</text>
        </view>
        <view class="receipt-row">
          <text class="label">全部参数</text>
          <text class="value" style="font-size:22rpx;color:#999;">{{ debugParams.raw }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getOrderDetail, getReceiptDetail } from "@/api/order";
import { ensureH5PageAuth } from "@/services/h5-auth-context";
import { returnToLiveRoom } from "@/utils/live-room-navigation";
import LiveMiniWindow from "@/components/live-mini-window.vue";

const receiptDetail = ref(null);
const loadError = ref("");
const debugParams = ref({ outTradeNo: "", subMchId: "", checkCode: "", raw: "" });
const isInGoldPlanIframe = false;

const ORDER_STATUS_META = {
  1: { statusTitle: "待付款" },
  2: { statusTitle: "待发货" },
  3: { statusTitle: "待收货" },
  4: { statusTitle: "已完成" },
  5: { statusTitle: "已取消" },
};

function formatAmount(value) {
  const num = Number(value || 0);
  return num.toFixed(2);
}

function resolvePayType(payMethod) {
  const map = {
    4: "易宝支付",
  };
  return map[Number(payMethod)] || "未支付";
}

function mapReceiptDetail(detail = {}) {
  const firstItem = Array.isArray(detail.items) && detail.items.length > 0 ? detail.items[0] : {};
  const meta = ORDER_STATUS_META[Number(detail.orderStatus || 0)] || ORDER_STATUS_META[5];
  return {
    id: detail.id || 0,
    statusTitle: meta.statusTitle,
    orderNo: detail.orderNo || "",
    createTime: detail.createdAt || "",
    payType: resolvePayType(detail.payMethod),
    address: {
      name: detail.receiverName || "",
      phone: detail.receiverPhone || "",
      fullAddress: detail.receiverAddress || "",
    },
    goods: {
      image: firstItem.coverImage || "",
      title: firstItem.productName || "暂无商品名称",
      spec: firstItem.skuText || "默认规格",
      unitPrice: formatAmount(firstItem.price),
      quantity: Number(firstItem.quantity || 0),
    },
    amount: {
      goodsAmount: formatAmount(detail.totalAmount),
      freightAmount: formatAmount(detail.shippingFee),
      payAmount: formatAmount(detail.payAmount),
    },
    roomCode: detail.roomCode || detail.liveRoomCode || "",
    liveType: detail.liveType || "",
  };
}

async function loadReceiptDetail(orderNo, subMchId, orderId) {
  try {
    const detail = orderNo
      ? await getReceiptDetail(orderNo, subMchId)
      : await getOrderDetail(orderId);
    receiptDetail.value = mapReceiptDetail(detail || {});
    loadError.value = "";
  } catch (err) {
    const errMsg = err?.message || err?.errMsg || "订单信息加载失败";
    console.error("[Receipt] 获取小票失败:", err);
    loadError.value = errMsg;
  }
}

function goOrderList() {
  const code = String(receiptDetail.value?.roomCode || "").trim();
  uni.reLaunch({
    url: `/pages/order/list?status=unsend${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`,
  });
}

function goBackLive() {
  const code = receiptDetail.value?.roomCode;
  if (!code) return;
  const liveType = String(receiptDetail.value?.liveType || "").trim();
  returnToLiveRoom(code, liveType ? { liveType } : {});
}

onLoad((options = {}) => {
  if (!ensureH5PageAuth(options)) return;
  const outTradeNo = String(
    options.out_trade_no || options.orderNo || options.outTradeNo || "",
  ).trim();
  const orderId = Number(options.id || options.orderId || options.order_id || 0);
  const subMchId = String(options.sub_mch_id || options.subMchId || "").trim();
  const checkCode = String(options.check_code || options.checkCode || "").trim();
  debugParams.value = {
    outTradeNo,
    subMchId,
    checkCode,
    raw: JSON.stringify(options || {}),
  };
  if (!outTradeNo && !orderId) {
    loadError.value = "缺少订单参数";
    return;
  }
  loadReceiptDetail(outTradeNo, subMchId, orderId);
});
</script>

<style lang="scss" scoped>
.receipt-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f5f5f5;
  box-sizing: border-box;
}

.receipt-card {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.06);
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 28rpx;
  background: linear-gradient(180deg, #fff1e6 0%, #fff8f3 100%);
}

.receipt-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #222;
}

.receipt-status {
  font-size: 28rpx;
  color: #f58d1b;
}

.receipt-section {
  padding: 28rpx;
  border-bottom: 1rpx dashed #ececec;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24rpx;
  margin-top: 18rpx;
}

.receipt-row:first-child {
  margin-top: 0;
}

.receipt-row-top {
  align-items: flex-start;
}

.receipt-row-strong .label,
.receipt-row-strong .value {
  font-size: 32rpx;
  font-weight: 600;
}

.label {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #666;
}

.value {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #222;
  word-break: break-all;
}

.value-amount {
  color: #f58d1b;
}

.goods-row {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.goods-image {
  width: 132rpx;
  height: 132rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.goods-title {
  font-size: 28rpx;
  line-height: 40rpx;
  color: #222;
}

.goods-spec,
.goods-qty {
  font-size: 24rpx;
  color: #888;
}

.goods-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
}

.address-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.address-text {
  line-height: 38rpx;
}

.receipt-footer {
  display: flex;
  gap: 20rpx;
  padding: 100rpx 28rpx 28rpx;
}

.receipt-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 42rpx;
  border: 1rpx solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
}

.receipt-btn-primary {
  color: #fff;
  border-color: #f58d1b;
  background: linear-gradient(135deg, #ff9f2f 0%, #f58d1b 100%);
}

.receipt-btn-live {
  color: #fff;
  border-color: #f58d1b;
  background: linear-gradient(135deg, #ff9f2f 0%, #f58d1b 100%);
}

.receipt-error-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #e64340;
  margin-bottom: 16rpx;
}

.receipt-error-msg {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.receipt-debug {
  background: #fafafa;
}

// ===== 诊断面板样式（已删除）=====
</style>
