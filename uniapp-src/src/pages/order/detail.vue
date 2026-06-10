<template>
  <view class="order-detail-page" v-if="orderDetail">
    <view class="status-hero" :class="heroClass">
      <view class="status-main">
        <text class="status-title">{{ orderDetail.statusTitle }}</text>
        <text class="status-subtitle">
          <text v-if="orderDetail.highlightText" class="status-highlight">{{
            orderDetail.highlightText
          }}</text>
          <text>{{ orderDetail.subtitle }}</text>
        </text>
      </view>
      <image
        class="status-hero-image"
        :src="orderDetail.heroImage"
        mode="aspectFit"
      />
    </view>

    <scroll-view class="detail-scroll" scroll-y>
      <view class="detail-content">
        <view
          class="address-card section-card"
          :class="{ 'address-card-selectable': orderDetail.canSelectAddress }"
          @tap="openAddressSelect"
          v-if="orderDetail.canSelectAddress"
        >
          <view class="address-head">
            <image
              class="address-icon"
              src="https://man.lqjy.cc/static/icons/address.svg"
              mode="aspectFit"
            />
            <view class="address-main">
              <view v-if="orderDetail.address.fullAddress" class="address-contact">
                <text class="address-name">{{ orderDetail.address.name }}</text>
                <text class="address-phone">{{
                  orderDetail.address.phone
                }}</text>
              </view>
              <text v-if="orderDetail.address.fullAddress" class="address-text">{{
                orderDetail.address.fullAddress
              }}</text>
              <text v-else class="address-placeholder">{{
                orderDetail.canSelectAddress ? "请选择收货地址" : "暂无收货地址"
              }}</text>
            </view>
            <view
              v-if="orderDetail.canSelectAddress"
              class="address-select-action"
              @tap.stop="openAddressSelect"
            >
              <text>{{ orderDetail.address.fullAddress ? "更换" : "选择" }}</text>
              <text class="address-select-arrow">›</text>
            </view>
          </view>
        </view>

        <view class="section-card goods-card">
          <view class="goods-row">
            <image
              class="goods-image"
              :src="orderDetail.goods.image"
              mode="aspectFill"
            />
            <view class="goods-info">
              <view class="goods-name-price">
                <text class="goods-title">{{ orderDetail.goods.title }}</text>
                <text class="goods-price"
                  >￥{{ orderDetail.goods.unitPrice }}</text
                >
              </view>
              <view class="goods-spec-count">
                <text class="goods-spec">{{ orderDetail.goods.spec }}</text>
                <text class="goods-count"
                  >x{{ orderDetail.goods.quantity }}</text
                >
              </view>
            </view>
          </view>

          <view class="amount-row amount-row-total">
            <text class="amount-label">商品总额</text>
            <text class="amount-value"
              >¥ {{ orderDetail.amount.goodsAmount }}</text
            >
          </view>
          <view class="amount-row">
            <text class="amount-label amount-label-light">商品运费</text>
            <text class="amount-value amount-value-light"
              >¥ {{ orderDetail.amount.freightAmount }}</text
            >
          </view>
          <view class="amount-row amount-row-pay">
            <text class="amount-label amount-label-strong">实付款</text>
            <text class="amount-value amount-value-strong"
              >¥ {{ orderDetail.amount.payAmount }}</text
            >
          </view>
        </view>

        <view class="info-section">
          <view class="section-card info-card">
            <text class="section-title">订单信息</text>
            <view class="info-row">
              <text class="info-label">订单编号</text>
              <view class="info-value-wrap info-copy-wrap" @click="copyOrderNo">
                <text class="info-value">{{ orderDetail.orderNo }}</text>
                <image
                  class="copy-icon"
                  src="https://man.lqjy.cc/static/icons/copy.svg"
                  mode="aspectFit"
                />
              </view>
            </view>
            <view class="info-row">
              <text class="info-label">下单时间</text>
              <text class="info-value">{{ orderDetail.createTime }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">支付方式</text>
              <text class="info-value">{{ orderDetail.payType }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">配送方式</text>
              <text class="info-value">{{ orderDetail.expressType }}</text>
            </view>
            <view class="info-row" :class="{ 'info-row-clickable': orderDetail.expressNo !== '--' }" @click="onExpressNoClick">
              <text class="info-label">物流单号</text>
              <view class="info-value-wrap">
                <text class="info-value">{{ orderDetail.expressNo }}</text>
                <text v-if="orderDetail.expressNo !== '--'" class="info-arrow">›</text>
              </view>
            </view>
          </view>

          <view class="page-bottom-space" />
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="bottom-actions">
        <view
          v-for="action in orderDetail.actions"
          :key="action.key"
          :class="['bottom-btn', action.primary ? 'bottom-btn-primary' : '']"
          @click="handleAction(action.key)"
        >
          {{ action.label }}
        </view>
      </view>
    </view>
    <order-logistics-sheet
      v-if="logisticsVisible"
      :logistics-data="logisticsData"
      :logistics-status-label="logisticsStatusLabel"
      :logistics-status-class="logisticsStatusClass"
      @close="logisticsVisible = false"
      @copy="copyTrackingNo"
    />

    <live-mini-window :room-code="orderDetail.roomCode" :bottom-offset="380" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import {
  cancelOrder,
  confirmReceive,
  extendReceive,
  getLogistics,
  getOrderDetail,
  getOrderList,
  updatePrizeOrderAddress,
} from "@/api/order";
import { ORDER_PAYMENT_SUCCESS_EVENT } from "@/services/order-payment-navigation";
import { resolveLiveRoomCode } from "@/utils/live-room-context";
import OrderLogisticsSheet from "./components/order-logistics-sheet.vue";
import LiveMiniWindow from "@/components/live-mini-window.vue";

const orderDetail = ref(null);
const logisticsVisible = ref(false);
const logisticsData = ref(null);
const logisticsLoading = ref(false);
const addressUpdating = ref(false);
const currentOrderId = ref(0);
const currentOrderNo = ref("");
const routeRoomCode = ref("");

const ORDER_STATUS_META = {
  1: {
    status: "unpay",
    statusTitle: "待付款",
    subtitle: "请尽快完成支付",
    heroImage: "https://man.lqjy.cc/static/icons/order1.png",
    heroClass: "status-hero-unpay",
  },
  2: {
    status: "unsend",
    statusTitle: "待发货",
    subtitle: "商家正在备货中，请耐心等待发货",
    heroImage: "https://man.lqjy.cc/static/icons/order2.png",
    heroClass: "status-hero-unsend",
  },
  3: {
    status: "unreceive",
    statusTitle: "待收货",
    subtitle: "您的包裹正在运输中，请保持电话畅通",
    heroImage: "https://man.lqjy.cc/static/icons/order2.png",
    heroClass: "status-hero-unreceive",
  },
  4: {
    status: "finished",
    statusTitle: "已完成",
    subtitle: "订单已完成，感谢您的购买",
    heroImage: "https://man.lqjy.cc/static/icons/order2.png",
    heroClass: "status-hero-finished",
  },
  5: {
    status: "cancelled",
    statusTitle: "已取消",
    subtitle: "订单已取消",
    heroImage: "https://man.lqjy.cc/static/icons/order2.png",
    heroClass: "status-hero-unsend",
  },
};

const heroClass = computed(() => orderDetail.value?.heroClass || "");

const logisticsStatusLabel = computed(() => {
  const s = logisticsData.value?.status;
  if (s === 3) return '已签收';
  if (s === 2) return '运输中';
  if (s === 1) return '已发货';
  return '查询中';
});

const logisticsStatusClass = computed(() => {
  const s = logisticsData.value?.status;
  if (s === 3) return 'tag-signed';
  if (s === 2) return 'tag-transit';
  return 'tag-default';
});

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

function buildReceiverFullAddress(detail) {
  const region = [
    detail.receiverProvince,
    detail.receiverCity,
    detail.receiverDistrict,
  ].filter(Boolean).join("");
  const address = detail.receiverAddress || "";
  if (region && address && !address.startsWith(region)) {
    return `${region}${address}`;
  }
  return address || region;
}

function buildActions(detail) {
  const actions = [];
  const orderStatus = Number(detail?.orderStatus || 0);
  const refundStatus = Number(detail?.refundStatus || 0);
  const winSource = Number(detail?.winSource || 0);

  if (orderStatus === 1) {
    actions.push({ key: "pay", label: "立即支付", primary: true });
  }
  if (orderStatus === 2) {
    if (refundStatus === 0 && winSource === 0) {
      actions.push({ key: "refund", label: "申请退款" });
    } else if (refundStatus > 0) {
      actions.push({ key: "progress", label: "售后进度" });
    }
    actions.push({ key: "remind", label: "提醒发货", primary: true });
  }
  if (orderStatus === 3) {
    if (refundStatus === 0 && winSource === 0) {
      actions.push({ key: "refund", label: "申请售后" });
    } else if (refundStatus > 0) {
      actions.push({ key: "progress", label: "售后进度" });
    }
    actions.push({ key: "logistics", label: "查看物流" });
    actions.push({ key: "extend", label: "延长收货" });
    actions.push({ key: "confirm", label: "确认收货", primary: true });
  }
  if (orderStatus === 4) {
    if (refundStatus === 0 && winSource === 0) {
      actions.push({ key: "refund", label: "申请售后" });
    } else if (refundStatus > 0) {
      actions.push({ key: "progress", label: "售后进度" });
    }
    if (refundStatus === 0) {
      actions.push({ key: "rebuy", label: "再次购买", primary: true });
    }
  }
  return actions;
}

function mapOrderDetail(detail = {}) {
  const orderStatus = Number(detail.orderStatus || 0);
  const refundStatus = Number(detail.refundStatus || 0);
  const winSource = Number(detail.winSource || 0);
  const canSelectAddress = detail.canSelectAddress ?? (orderStatus === 2 && refundStatus === 0 && winSource > 0);
  let meta = ORDER_STATUS_META[orderStatus] || ORDER_STATUS_META[5];
  if (refundStatus === 2) {
    meta = {
      status: "refund_success",
      statusTitle: "退款成功",
      subtitle: "退款金额已原路返回，请注意查收",
      heroImage: "https://man.lqjy.cc/static/icons/order3.png",
      heroClass: "status-hero-refund",
    };
  }
  const firstItem =
    Array.isArray(detail.items) && detail.items.length > 0
      ? detail.items[0]
      : {};

  return {
    id: detail.id || 0,
    status: meta.status,
    statusTitle: meta.statusTitle,
    highlightText: "",
    subtitle: meta.subtitle,
    heroImage: meta.heroImage,
    heroClass: meta.heroClass,
    orderNo: detail.orderNo || "",
    createTime: detail.createdAt || "",
    payType: resolvePayType(detail.payMethod),
    expressType: detail.shipping?.logisticsCompany || "暂无物流信息",
    expressNo: detail.shipping?.trackingNo || "--",
    address: {
      id: Number(detail.addressId || detail.address_id || detail.receiverAddressId || 0),
      name: detail.receiverName || "",
      phone: detail.receiverPhone || "",
      fullAddress: buildReceiverFullAddress(detail),
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
    roomCode: detail.roomCode || detail.liveRoomCode || detail._roomCode || "",
    winSource,
    winSourceText: detail.winSourceText || "",
    canSelectAddress: Boolean(canSelectAddress),
    actions: buildActions(detail),
    raw: detail,
    refundId: Number(detail.refundId || detail.refund_id || detail.afterSaleId || detail.after_sale_id || 0),
  };
}

async function resolveOrderIdByOrderNo(orderNo) {
  const text = String(orderNo || "").trim();
  if (!text) return 0;
  const data = await getOrderList({ page: 1, pageSize: 1, orderNo: text });
  const list = Array.isArray(data?.list) ? data.list : [];
  const matched = list.find((item) => String(item?.orderNo || "").trim() === text) || list[0];
  return Number(matched?.id || matched?.orderId || 0);
}

async function loadOrderDetail(orderId, orderNo = currentOrderNo.value) {
  let id = Number(orderId || 0);
  if (!id && orderNo) {
    try {
      id = await resolveOrderIdByOrderNo(orderNo);
    } catch (err) {
      uni.showToast({ title: err?.message || "获取订单详情失败", icon: "none" });
      return;
    }
  }
  if (!id) {
    uni.showToast({ title: "订单参数错误", icon: "none" });
    return;
  }
  try {
    currentOrderId.value = id;
    const data = await getOrderDetail(id);
    orderDetail.value = mapOrderDetail(data || {});
    currentOrderNo.value = orderDetail.value?.orderNo || currentOrderNo.value;
    if (routeRoomCode.value && orderDetail.value && !orderDetail.value.roomCode) {
      orderDetail.value.roomCode = routeRoomCode.value;
    }
  } catch (err) {
    uni.showToast({ title: err?.message || "获取订单详情失败", icon: "none" });
  }
}

function copyOrderNo() {
  if (!orderDetail.value?.orderNo) return;
  uni.setClipboardData({
    data: orderDetail.value.orderNo,
    success() {
      uni.showToast({ title: "订单号已复制", icon: "none" });
    },
  });
}

function onExpressNoClick() {
  if (orderDetail.value?.expressNo === '--') return;
  handleAction('logistics');
}

function openAddressSelect() {
  const detail = orderDetail.value;
  if (!detail?.canSelectAddress) return;
  const query = [`select=1`];
  if (detail.address?.id) {
    query.push(`selectedId=${encodeURIComponent(detail.address.id)}`);
  }
  uni.navigateTo({
    url: `/pagesPlus/main/address/index?${query.join("&")}`,
    fail(err) {
      console.error("[OrderDetail] openAddressSelect fail:", err);
      uni.showToast({ title: "地址选择页打开失败", icon: "none" });
    },
  });
}

async function onAddressSelected(payload) {
  const id = Number(payload?.id || payload?.addressId || payload || 0);
  const orderId = orderDetail.value?.id || 0;
  if (!id || !orderId || addressUpdating.value) return;
  addressUpdating.value = true;
  try {
    await updatePrizeOrderAddress({ orderId, addressId: id });
    uni.showToast({ title: "收货地址已更新", icon: "success" });
    await loadOrderDetail(orderId);
  } catch (err) {
    uni.showToast({ title: err?.message || "更新地址失败", icon: "none" });
  } finally {
    addressUpdating.value = false;
  }
}

function copyTrackingNo() {
  if (!logisticsData.value?.trackingNo) return;
  uni.setClipboardData({
    data: logisticsData.value.trackingNo,
    success() {
      uni.showToast({ title: "物流单号已复制", icon: "none" });
    },
  });
}

async function handleAction(action) {
  if (action === "refund") return navigateRefund();
  if (action === "cancel") return handleCancelAction();
  if (action === "confirm") return handleConfirmAction();
  if (action === "logistics") return handleLogisticsAction();
  if (action === "remind") return uni.showToast({ title: "已提醒发货", icon: "none" });
  if (action === "extend") return handleExtendAction();
  if (action === "pay") return navigatePay();
  if (action === "progress") return navigateRefundProgress();
  if (action === "rebuy") return navigateRebuy();
  return navigateOrderList();
}

function navigateRefund() {
  const raw = orderDetail.value?.raw || {};
  const roomId = raw.liveRoomId || raw.roomId || raw.liveId || 0;
  const roomQuery = roomId ? `&roomId=${encodeURIComponent(roomId)}` : "";
  uni.navigateTo({
    url: `/pages/order/refund?orderId=${encodeURIComponent(orderDetail.value.id)}${roomQuery}`,
  });
}

function getRoomCodeQuery() {
  const code = String(orderDetail.value?.roomCode || "").trim();
  return code ? `&roomCode=${encodeURIComponent(code)}` : "";
}

function navigatePay() {
  const detail = orderDetail.value || {};
  const orderNo = String(detail.orderNo || detail.raw?.orderNo || "").trim();
  if (!orderNo) {
    uni.showToast({ title: "订单号缺失，无法支付", icon: "none" });
    return;
  }
  uni.navigateTo({
    url: `/pages/order/pay?orderNo=${encodeURIComponent(orderNo)}&id=${encodeURIComponent(detail.id || "")}&returnTo=detail${getRoomCodeQuery()}`,
  });
}

function navigateRefundProgress() {
  const detail = orderDetail.value || {};
  const refundId = Number(detail.refundId || detail.raw?.refundId || detail.raw?.refund_id || detail.raw?.afterSaleId || 0);
  if (refundId) {
    uni.navigateTo({
      url: `/pages/order/refund-detail?refundId=${encodeURIComponent(refundId)}&orderId=${encodeURIComponent(detail.id || "")}${getRoomCodeQuery()}`,
    });
    return;
  }
  uni.navigateTo({
    url: `/pages/order/list?status=refund${getRoomCodeQuery()}`,
  });
}

function navigateOrderList() {
  uni.navigateTo({
    url: `/pages/order/list?status=${orderDetail.value?.status || "all"}${getRoomCodeQuery()}`,
  });
}

async function handleCancelAction() {
  try {
    await cancelOrder(orderDetail.value.id);
    uni.showToast({ title: "已取消订单", icon: "success" });
    await loadOrderDetail(orderDetail.value.id);
  } catch (err) {
    uni.showToast({ title: err?.message || "取消订单失败", icon: "none" });
  }
}

async function handleConfirmAction() {
  try {
    await confirmReceive(orderDetail.value.id);
    uni.showToast({ title: "确认收货成功", icon: "none" });
    await loadOrderDetail(orderDetail.value.id);
  } catch (err) {
    uni.showToast({ title: err?.message || "确认收货失败", icon: "none" });
  }
}

async function handleLogisticsAction() {
  try {
    logisticsLoading.value = true;
    const data = await getLogistics(orderDetail.value.id);
    if (!data?.logisticsCompany && !data?.trackingNo) {
      uni.showToast({ title: "暂无物流信息", icon: "none" });
      return;
    }
    logisticsData.value = data;
    logisticsVisible.value = true;
  } catch (err) {
    uni.showToast({ title: err?.message || "获取物流失败", icon: "none" });
  } finally {
    logisticsLoading.value = false;
  }
}

async function handleExtendAction() {
  try {
    await extendReceive(orderDetail.value.id);
    uni.showToast({ title: "延长收货成功", icon: "none" });
    await loadOrderDetail(orderDetail.value.id);
  } catch (err) {
    uni.showToast({ title: err?.message || "延长收货失败", icon: "none" });
  }
}

function navigateRebuy() {
  const raw = orderDetail.value?.raw || {};
  const firstItem = raw.items?.[0] || {};
  const payload = encodeURIComponent(
    JSON.stringify({
      productId: firstItem.productId || 0,
      skuId: firstItem.skuId || 0,
      quantity: firstItem.quantity || 1,
      roomId: raw.liveRoomId || raw.roomId || 0,
      roomCode: orderDetail.value?.roomCode || raw.roomCode || raw.liveRoomCode || raw._roomCode || "",
      title: firstItem.productName || "",
      image: firstItem.coverImage || "",
      price: firstItem.price || 0,
    }),
  );
  uni.navigateTo({ url: "/pages/order/confirm?payload=" + payload });
}

function onPaymentSuccess(payload = {}) {
  const orderId = Number(payload.orderId || payload.id || currentOrderId.value || 0);
  const orderNo = payload.orderNo || payload.order_no || currentOrderNo.value;
  if (orderId && currentOrderId.value && orderId !== currentOrderId.value) return;
  loadOrderDetail(orderId || currentOrderId.value, orderNo);
}

onLoad((options) => {
  uni.$off("address-selected", onAddressSelected);
  uni.$on("address-selected", onAddressSelected);
  uni.$off(ORDER_PAYMENT_SUCCESS_EVENT, onPaymentSuccess);
  uni.$on(ORDER_PAYMENT_SUCCESS_EVENT, onPaymentSuccess);
  currentOrderId.value = Number(options?.id || options?.orderId) || 0;
  currentOrderNo.value = options?.orderNo || options?.order_no || "";
  routeRoomCode.value = resolveLiveRoomCode(options?.roomCode);
  loadOrderDetail(currentOrderId.value, currentOrderNo.value);
});

onShow(() => {
  if (!orderDetail.value || !currentOrderId.value) return;
  loadOrderDetail(currentOrderId.value, currentOrderNo.value);
});

onUnload(() => {
  uni.$off("address-selected", onAddressSelected);
  uni.$off(ORDER_PAYMENT_SUCCESS_EVENT, onPaymentSuccess);
});
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f6f6f6;
}

.status-hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 34rpx 28rpx 26rpx;
  box-sizing: border-box;
}

.status-hero-unpay {
  background: linear-gradient(180deg, #fff1e6 0%, #f8f1ed 100%);
}

.status-hero-unsend {
  background: linear-gradient(180deg, #fff1e6 0%, #f8f1ed 100%);
}

.status-hero-unreceive {
  background: linear-gradient(180deg, #f9eee6 0%, #f5f1ee 100%);
}

.status-hero-finished {
  background: linear-gradient(180deg, #fff1e6 0%, #f8f1ed 100%);
}

.status-hero-closed {
  background: linear-gradient(180deg, #f4f5f6 0%, #f7f7f7 100%);
}

.status-hero-refund {
  background: linear-gradient(180deg, #eefae8 0%, #f3f8f1 100%);
}

.status-main {
  flex: 1;
  min-width: 0;
  padding-right: 16rpx;
}

.status-title {
  display: block;
  font-size: 42rpx;
  line-height: 58rpx;
  font-weight: 600;
}

.status-hero-unpay .status-title {
  color: #f58d1b;
}

.status-hero-unsend .status-title {
  color: #f58d1b;
}

.status-hero-unreceive .status-title {
  color: #f58d1b;
}

.status-hero-finished .status-title {
  color: #f58d1b;
}

.status-hero-closed .status-title {
  color: #333;
}

.status-hero-refund .status-title {
  color: #45a938;
}

.status-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 38rpx;
  color: #666;
}

.status-highlight {
  color: #ff7a1a;
}

.status-hero-image {
  width: 178rpx;
  height: 148rpx;
  flex-shrink: 0;
}

.detail-scroll {
  height: calc(100vh - 180rpx);
}

.detail-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.section-card {
  margin-top: 12rpx;
  padding: 24rpx;
  background: #fff;
  box-sizing: border-box;
}

.address-card-selectable {
  cursor: pointer;
}

.address-head {
  display: flex;
  align-items: flex-start;
}

.address-icon {
  width: 28rpx;
  height: 28rpx;
  margin-top: 6rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.address-main {
  flex: 1;
  min-width: 0;
}

.address-contact {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.address-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}

.address-phone {
  font-size: 28rpx;
  color: #222;
}

.address-text {
  display: block;
  font-size: 28rpx;
  line-height: 40rpx;
  color: #333;
  font-weight: 500;
}

.address-placeholder {
  display: block;
  font-size: 30rpx;
  line-height: 42rpx;
  color: #999;
  font-weight: 500;
}

.address-select-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-left: 20rpx;
  color: #ff6b2e;
  font-size: 26rpx;
  line-height: 36rpx;
  flex-shrink: 0;
}

.address-select-arrow {
  font-size: 32rpx;
  line-height: 36rpx;
}

.shop-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.shop-avatar {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #f4f4f4;
}

.shop-name {
  margin-left: 12rpx;
  font-size: 30rpx;
  color: #222;
  font-weight: 500;
}

.shop-arrow {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.goods-row {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.goods-name-price {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.goods-title {
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  overflow: hidden;
  font-size: 30rpx;
  line-height: 42rpx;
  color: #000;
  font-weight: 500;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.goods-price {
  font-size: 30rpx;
  line-height: 42rpx;
  color: #1a1a1a;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.goods-spec-count {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.goods-spec {
  font-size: 28rpx;
  color: #888;
}

.goods-count {
  font-size: 28rpx;
  color: #888;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28rpx;
}

.amount-row-total {
  margin-top: 22rpx;
}

.amount-label {
  font-size: 30rpx;
  color: #222;
}

.amount-label-light,
.amount-value-light {
  color: #666;
}

.amount-label-strong {
  font-weight: 600;
}

.amount-value {
  font-size: 30rpx;
  color: #222;
}

.amount-value-strong {
  font-family: "PingFang SC";
  font-size: 44rpx;
  font-weight: 600;
}

.info-section {
  margin-top: 12rpx;
  background: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-card {
  margin-top: 0;
  padding-bottom: 34rpx;
}

.section-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  color: #222;
  font-weight: 600;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22rpx;
}

.info-label {
  font-size: 30rpx;
  color: #666;
}

.info-value-wrap {
  display: flex;
  align-items: center;
}

.info-value {
  font-size: 30rpx;
  color: #a7b2c5;
}

.info-copy-wrap {
  gap: 8rpx;
}

.info-row-clickable {
  cursor: pointer;
}

.info-arrow {
  font-size: 30rpx;
  color: #bbb;
  margin-left: 6rpx;
}

.copy-icon {
  width: 24rpx;
  height: 24rpx;
}

.page-bottom-space {
  height: 140rpx;
  background: #fff;
  flex: 1;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.bottom-btn {
  min-width: 168rpx;
  height: 66rpx;
  padding: 0 26rpx;
  border-radius: 33rpx;
  border: 1rpx solid #d9d9d9;
  font-size: 28rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #fff;
}

.bottom-btn-primary {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(90deg, #fd7d1b 0%, #ff6c2d 100%);
}

</style>
