<template>
  <view class="order-list-page">
    <view class="tabs-wrap">
      <scroll-view class="status-scroll" scroll-x :show-scrollbar="false" :scroll-left="scrollLeft" scroll-with-animation>
        <view class="status-tabs">
          <view
            v-for="(tab, index) in tabs"
            :key="tab.key"
            :id="`tab-${tab.key}`"
            :class="[
              'status-tab-item',
              activeTab === tab.key ? 'status-tab-item-active' : '',
              index === tabs.length - 1 ? 'status-tab-item-last' : '',
            ]"
            @click="onTabPress(tab.key)"
          >
            <text
              :class="[
                'status-tab-text',
                activeTab === tab.key ? 'status-tab-text-active' : '',
              ]"
              >{{ tab.label }}</text
            >
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="activeTab === 'refund'" class="order-list">
      <template v-if="refundList.length">
        <view v-for="item in refundList" :key="item.id" class="order-card">
          <view class="order-head">
            <text class="order-no">售后单号：{{ item.refundNo }}</text>
            <text class="order-status" :class="item.statusClass">{{
              item.statusText
            }}</text>
          </view>

          <view class="goods-row goods-row-order" @click="goRefundDetail(item)">
            <image
              class="goods-image"
              :src="item.coverImage"
              mode="aspectFill"
            />
            <view class="goods-content goods-content-order">
              <view class="goods-top-row">
                <text class="goods-title">{{ item.productName }}</text>
                <text class="goods-count">x{{ item.quantity }}</text>
              </view>
              <text class="goods-spec">{{ item.skuText }}</text>
              <view class="goods-bottom-row">
                <view :class="['refund-tag', item.refundTagClass]">{{
                  item.refundTag
                }}</view>
                <text class="goods-price">
                  <text class="price-label">退款金额：</text>
                  <text class="price-symbol">￥</text>
                  <text class="price-int">{{ item.priceInt }}</text>
                  <text class="price-dec">.{{ item.priceDec }}</text>
                </text>
              </view>
            </view>
          </view>
        </view>
      </template>
      <view v-else class="order-empty">
        <text class="order-empty-text">暂无退款/售后记录</text>
      </view>
    </view>
    <view v-else-if="filteredOrders.length" class="order-list">
      <view
        v-for="item in filteredOrders"
        :key="item.id"
        :class="['order-card', item.cardClass]"
      >
        <view class="order-head">
          <text class="order-no">订单编号：{{ item.orderNo }}</text>
          <text class="order-status" :class="item.statusClass">{{
            item.statusText
          }}</text>
        </view>

        <view class="goods-row goods-row-order" @click="goDetail(item)">
          <image class="goods-image" :src="item.image" mode="aspectFill" />
          <view class="goods-content goods-content-order">
            <view class="goods-top-row">
              <text class="goods-title">{{ item.title }}</text>
              <text class="goods-count">x{{ item.quantity }}</text>
            </view>
            <text class="goods-spec">{{ item.spec }}</text>
            <view class="goods-bottom-row">
              <view v-if="item.winTag || item.refundTag" class="goods-tag-row">
                <view v-if="item.winTag" class="win-tag">{{ item.winTag }}</view>
                <view
                  v-if="item.refundTag"
                  :class="['refund-tag', item.refundTagClass]"
                  >{{ item.refundTag }}</view
                >
              </view>
              <text class="goods-price">
                <text class="price-symbol">￥</text>
                <text class="price-int">{{ item.priceInt }}</text>
                <text class="price-dec">.{{ item.priceDec }}</text>
              </text>
            </view>
          </view>
        </view>

        <view v-if="item.actions.length" class="action-row">
          <view
            v-for="action in item.actions"
            :key="action.key"
            :class="['action-btn', action.primary ? 'action-btn-primary' : '']"
            @click="onAction(action.key, item)"
          >
            {{ action.label }}
          </view>
        </view>
      </view>
    </view>
    <view v-else class="order-empty">
      <text class="order-empty-text">{{
        activeTab === "refund"
          ? "暂无退款/售后记录"
          : queryOrderNo
            ? "未找到关联订单"
            : "暂无订单"
      }}</text>
    </view>
    <live-mini-window :room-code="liveRoomCode" />
    <order-logistics-sheet
      v-if="logisticsVisible"
      :logistics-data="logisticsData"
      :logistics-status-label="logisticsStatusLabel"
      :logistics-status-class="logisticsStatusClass"
      @close="logisticsVisible = false"
      @copy="copyTrackingNo"
    />

  </view>
</template>

<script setup>
import { computed, ref, watch, nextTick } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
  getOrderList,
  cancelOrder,
  confirmReceive,
  extendReceive,
  getLogistics,
  deleteOrder,
} from "@/api/order";
import { getRefundList } from "@/api/refund";
import { executeYeepayPayment } from "@/services/payment-action";
import { resolveLiveRoomCode } from "@/utils/live-room-context";
import OrderLogisticsSheet from "./components/order-logistics-sheet.vue";
import LiveMiniWindow from "@/components/live-mini-window.vue";

const logisticsVisible = ref(false);
const logisticsData = ref(null);

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

function copyTrackingNo() {
  if (!logisticsData.value?.trackingNo) return;
  uni.setClipboardData({
    data: logisticsData.value.trackingNo,
    showToast: false,
    success() {
      uni.showToast({ title: '物流单号已复制', icon: 'none' });
    },
  });
}

function splitPrice(priceStr) {
  const [int, dec = "00"] = String(priceStr).split(".");
  return { priceInt: int, priceDec: dec };
}

const tabs = [
  { key: "all", label: "全部", status: 0 },
  { key: "unpay", label: "待付款", status: 1 },
  { key: "unsend", label: "待发货", status: 2 },
  { key: "unreceive", label: "待收货", status: 3 },
  { key: "finished", label: "已完成", status: 4 },
  { key: "cancelled", label: "已取消", status: 5 },
  { key: "refund", label: "退款/售后" },
];

const statusTextMap = {
  1: "待付款",
  2: "待发货",
  3: "待收货",
  4: "已完成",
  5: "已取消",
};
const statusKeyMap = {
  1: "unpay",
  2: "unsend",
  3: "unreceive",
  4: "finished",
  5: "cancelled",
};
const winSourceTextMap = {
  1: "观看奖励",
  2: "抽奖",
  3: "评论抽奖",
};

const orderList = ref([]);
const refundList = ref([]);
const activeTab = ref("all");
const scrollLeft = ref(0);
const page = ref(1);
const total = ref(0);
const loadingMore = ref(false);
const liveRoomCode = ref("");
const queryOrderNo = ref("");

function onTabChange({ name }) {
  activeTab.value = name;
}

function onTabPress(name) {
  activeTab.value = name;
  scrollTabToCenter(name);
}

function scrollTabToCenter(tabKey) {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query.select(`#tab-${tabKey}`).boundingClientRect();
    query.select('.status-scroll').boundingClientRect();
    query.select('.status-scroll').scrollOffset();
    query.exec((res) => {
      const tabRect = res[0];
      const scrollRect = res[1];
      const scrollInfo = res[2];
      if (!tabRect || !scrollRect || !scrollInfo) return;
      const currentScroll = scrollInfo.scrollLeft || 0;
      const tabCenter = tabRect.left - scrollRect.left + currentScroll + tabRect.width / 2;
      const targetScroll = tabCenter - scrollRect.width / 2;
      scrollLeft.value = Math.max(0, targetScroll);
    });
  });
}

function buildActions(order) {
  const actions = [];
  const s = order.orderStatus;
  const refundStatus = Number(order.refundStatus || 0);
  const winSource = Number(order.winSource || 0);
  if (s === 1) {
    actions.push({ key: "cancel", label: "取消订单" });
    actions.push({ key: "pay", label: "立即支付", primary: true });
  } else if (s === 2) {
    if (refundStatus === 0 && winSource === 0) {
      actions.push({ key: "refund", label: "申请退款" });
    }
    actions.push({ key: "remind", label: "提醒发货" });
  } else if (s === 3) {
    if (refundStatus === 0 && winSource === 0) {
      actions.push({ key: "refund", label: "申请退款" });
    }
    if (refundStatus === 0) {
      actions.push({ key: "extend", label: "延长收货" });
      actions.push({ key: "logistics", label: "查看物流" });
      actions.push({ key: "confirm", label: "确认收货", primary: true });
    }
  } else if (s === 4) {
    if (refundStatus === 0 && winSource === 0) {
      actions.push({ key: "refund", label: "申请售后" });
    }
    if (refundStatus === 0) {
      actions.push({ key: "rebuy", label: "再次购买" });
    }
  } else if (s === 5) {
    actions.push({ key: "delete", label: "删除订单" });
  }
  return actions;
}

function mapOrder(item) {
  const firstItem = item.items?.[0] || {};
  const priceStr = item.payAmount?.toFixed(2) || "0.00";
  const refundStatus = Number(item.refundStatus || 0);
  const winSource = Number(item.winSource || 0);
  const winSourceText = item.winSourceText || winSourceTextMap[winSource] || "";
  const refundMetaMap = {
    1: {
      text: "退款中",
      tagClass: "refund-tag-processing",
    },
    2: {
      text: "已退款",
      tagClass: "refund-tag-success",
    },
    3: {
      text: "部分退款",
      tagClass: "refund-tag-processing",
    },
  };
  const refundMeta = refundMetaMap[refundStatus] || null;
  const isRefundSuccess = refundStatus === 2;
  return {
    id: item.id,
    orderNo: item.orderNo,
    status: statusKeyMap[item.orderStatus] || "all",
    statusText: statusTextMap[item.orderStatus] || "",
    statusClass: item.orderStatus <= 3 ? "status-highlight" : "status-muted",
    image: firstItem.coverImage || "",
    title: firstItem.productName || "",
    spec: firstItem.skuText || "",
    quantity: firstItem.quantity || item.itemCount || 1,
    ...splitPrice(priceStr),
    refundStatus,
    refundTag: refundMeta?.text || "",
    refundTagClass: refundMeta?.tagClass || "",
    winSource,
    winTag: winSourceText ? `${winSourceText}奖品` : "",
    winTime: item.winTime || "",
    cardClass: isRefundSuccess ? "order-card-refund-success" : "",
    roomCode: item.roomCode || item.liveRoomCode || item._roomCode || "",
    isRead: Number(item?.isRead || 0),
    actions: buildActions(item),
    _raw: item,
  };
}

function mapRefund(item) {
  const refundStatus = Number(item?.refundStatus || 0);
  const refundStatusTagMap = {
    1: { text: "待处理", tagClass: "refund-tag-processing" },
    2: { text: "待退货", tagClass: "refund-tag-processing" },
    3: { text: "待商家收货", tagClass: "refund-tag-processing" },
    4: { text: "退款成功", tagClass: "refund-tag-success" },
    5: { text: "退款关闭", tagClass: "refund-tag-closed" },
    6: { text: "退款中", tagClass: "refund-tag-processing" },
  };
  const tagMeta = refundStatusTagMap[refundStatus] || null;
  const priceStr = Number(item?.refundAmount || 0).toFixed(2);
  const [priceInt, priceDec = "00"] = priceStr.split(".");
  return {
    id: item?.id || 0,
    refundNo: item?.refundNo || "",
    orderId: item?.orderId || 0,
    refundType: Number(item?.refundType || 0),
    refundTypeText: Number(item?.refundType || 0) === 2 ? "退货退款" : "仅退款",
    statusText: "退款/售后",
    statusClass: "status-muted",
    refundTag: tagMeta?.text || "售后处理中",
    refundTagClass: tagMeta?.tagClass || "refund-tag-processing",
    refundReason: item?.refundReason || "-",
    refundAmount: priceStr,
    priceInt,
    priceDec,
    createdAt: item?.createdAt || "-",
    productName: item?.productName || "",
    coverImage: item?.coverImage || "",
    skuText: item?.skuText || "",
    price: item?.price || 0,
    quantity: item?.quantity || 1,
    isRead: Number(item?.isRead || 0),
  };
}

async function loadOrders(reset = false) {
  if (activeTab.value === "refund") {
    if (reset) {
      refundList.value = [];
    }
    loadingMore.value = true;
    try {
      const data = await getRefundList({
        page: page.value,
        pageSize: 20,
        refundStatus: 0,
      });
      const list = Array.isArray(data?.list) ? data.list.map(mapRefund) : [];
      refundList.value = list;
      total.value = Number(data?.total || list.length || 0);
    } catch (err) {
      console.error("[OrderList] loadRefundList fail:", err);
    } finally {
      loadingMore.value = false;
    }
    return;
  }
  if (reset) {
    page.value = 1;
    orderList.value = [];
  }
  const tab = tabs.find((t) => t.key === activeTab.value);
  loadingMore.value = true;
  try {
    const data = await getOrderList({
      page: page.value,
      pageSize: 10,
      orderStatus: tab?.status ?? 0,
      orderNo: queryOrderNo.value,
    });
    const mappedList = (data?.list || []).map(mapOrder);
    const list = queryOrderNo.value
      ? mappedList.filter((item) => String(item.orderNo || "").trim() === queryOrderNo.value)
      : mappedList;
    if (!liveRoomCode.value) {
      const matchedOrder = list.find((item) => item.roomCode);
      if (matchedOrder?.roomCode) {
        liveRoomCode.value = matchedOrder.roomCode;
      }
    }
    if (reset) {
      orderList.value = list;
    } else {
      orderList.value = [...orderList.value, ...list];
    }
    total.value = data?.total || list.length;
  } catch (err) {
    console.error("[OrderList] loadOrders fail:", err);
  } finally {
    loadingMore.value = false;
  }
}

watch(activeTab, () => {
  loadOrders(true);
});

onLoad((options) => {
  liveRoomCode.value = resolveLiveRoomCode(options?.roomCode);
  queryOrderNo.value = String(options?.orderNo || options?.order_no || options?.outTradeNo || options?.out_trade_no || "").trim();
  if (options?.status) {
    const target = tabs.find((item) => item.key === options.status);
    if (target) activeTab.value = target.key;
  }
  loadOrders(true);
  scrollTabToCenter(activeTab.value);
});

onShow(() => {
  loadOrders(true);
});

const filteredOrders = computed(() => orderList.value);

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  uni.reLaunch({ url: "/pages/broadcast/entry" });
}

function goDetail(item) {
  const code = String(item.roomCode || liveRoomCode.value || "").trim();
  uni.navigateTo({
    url: `/pages/order/detail?id=${item.id}&status=${item.status}${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`,
  });
}

function goRefundDetail(item) {
  uni.navigateTo({
    url: `/pages/order/refund-detail?refundId=${item.id}${item.orderId ? `&orderId=${item.orderId}` : ""}`,
  });
}

async function onAction(type, item) {
  if (type === "refund") return navigateRefund(item);
  if (type === "pay") return handlePayAction(item);
  if (type === "cancel") return handleCancelAction(item);
  if (type === "logistics") return handleLogisticsAction(item);
  if (type === "remind") return showRemindToast();
  if (type === "extend") return handleExtendAction(item);
  if (type === "confirm") return handleConfirmAction(item);
  if (type === "delete") return handleDeleteAction(item);
  if (type === "rebuy") return navigateRebuy(item);
}

function navigateRefund(item) {
  const raw = item?._raw || {};
  const roomId = raw.liveRoomId || raw.roomId || raw.liveId || 0;
  const roomQuery = roomId ? `&roomId=${encodeURIComponent(roomId)}` : "";
  uni.navigateTo({ url: `/pages/order/refund?orderId=${encodeURIComponent(item.id)}${roomQuery}` });
}

async function handlePayAction(item) {
  try {
    const code = String(item.roomCode || liveRoomCode.value || "").trim();
    const payResult = await executeYeepayPayment(item.orderNo, { roomCode: code });
    if (payResult?.confirmed) {
      uni.showToast({ title: "支付成功", icon: "none" });
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/order/list?status=unsend${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`,
        });
      }, 1200);
    }
  } catch (err) {
    uni.showToast({ title: err?.message || "支付失败", icon: "none" });
  }
}

async function confirmDangerAction(msg) {
  return new Promise((resolve) => {
    uni.showModal({
      title: "提示",
      content: msg,
      confirmColor: "#ff6b2e",
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false),
    });
  });
}

async function handleCancelAction(item) {
  if (!(await confirmDangerAction("确定取消订单吗？"))) return;
  try {
    await cancelOrder(item.id);
    uni.showToast({ title: "已取消订单", icon: "none" });
    loadOrders(true);
  } catch (err) {
    uni.showToast({ title: err?.message || "取消失败", icon: "none" });
  }
}

async function handleLogisticsAction(item) {
  try {
    uni.showLoading({ title: '查询中...' });
    const data = await getLogistics(item.id);
    uni.hideLoading();
    if (!data?.logisticsCompany && !data?.trackingNo) {
      uni.showToast({ title: "暂无物流信息", icon: "none" });
      return;
    }
    logisticsData.value = data;
    logisticsVisible.value = true;
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: err?.message || "获取物流失败", icon: "none" });
  }
}

function showRemindToast() {
  uni.showToast({ title: "已提醒发货", icon: "none" });
}

async function handleExtendAction(item) {
  try {
    await extendReceive(item.id);
    uni.showToast({ title: "延长收货成功", icon: "none" });
    loadOrders(true);
  } catch (err) {
    uni.showToast({ title: err?.message || "延长收货失败", icon: "none" });
  }
}

async function handleConfirmAction(item) {
  try {
    await confirmReceive(item.id);
    uni.showToast({ title: "确认收货成功", icon: "none" });
    loadOrders(true);
  } catch (err) {
    uni.showToast({ title: err?.message || "操作失败", icon: "none" });
  }
}

async function handleDeleteAction(item) {
  if (!(await confirmDangerAction("确定删除订单吗？"))) return;
  try {
    await deleteOrder(item.id);
    uni.showToast({ title: "订单已删除", icon: "none" });
    loadOrders(true);
  } catch (err) {
    uni.showToast({ title: err?.message || "删除失败", icon: "none" });
  }
}

function navigateRebuy(item) {
  const raw = item._raw || {};
  const firstItem = raw.items?.[0] || {};
  const payload = encodeURIComponent(
    JSON.stringify({
      productId: firstItem.productId || 0,
      skuId: firstItem.skuId || 0,
      quantity: firstItem.quantity || 1,
      roomId: raw.liveRoomId || raw.roomId || 0,
      title: firstItem.productName || "",
      image: firstItem.coverImage || "",
      price: firstItem.price || 0,
    }),
  );
  uni.navigateTo({ url: "/pages/order/confirm?payload=" + payload });
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
}

.tabs-wrap {
  background: #fff;
  padding-top: 8rpx;
  overflow-x: hidden;
}
.status-scroll {
  padding: 0 0 0 32rpx;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.status-scroll::-webkit-scrollbar {
  display: none !important;
}

.status-tabs {
  display: inline-flex;
  align-items: center;
  gap: 32rpx;
  min-width: max-content;
  padding-bottom: 8rpx;
}

.status-tab-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
}

.status-tab-item-last {
  padding-right: 32rpx;
}

.status-tab-item-active::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 36rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: #ff6b2e;
}

.status-tab-text {
  font-size: 28rpx;
  color: #7f7f7f;
  line-height: 1.4;
}

.status-tab-text-active {
  color: #000;
  font-weight: 600;
}

/* ===== 订单列表 ===== */
.order-list {
  padding-top: 32rpx;
}

.order-empty {
  min-height: calc(100vh - 120rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
}

.order-empty-text {
  font-size: 30rpx;
  color: #999;
  line-height: 1.4;
}

.order-card {
  padding: 0 32rpx 32rpx;
}
.order-card + .order-card {
  border-top: 10rpx solid #f0f4f7;
  padding-top: 32rpx;
}

/* ===== 订单头部 ===== */
.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.order-no {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}
.order-status {
  font-size: 26rpx;
}
.status-highlight {
  color: #fd6119;
}
.status-success {
  color: #45a938;
}
.status-danger {
  color: #ff4d4f;
}
.status-muted {
  color: #999;
}

/* ===== 商品行 ===== */
.goods-row {
  display: flex;
  align-items: flex-start;
  margin-top: 20rpx;
  gap: 15rpx;
}
.goods-row-order {
  align-items: stretch;
}
.refund-goods-row {
  align-items: center;
}
.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}
.refund-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #fff4ed 0%, #fff 100%);
  border: 1rpx solid #ffe0cf;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.refund-placeholder-text {
  font-size: 30rpx;
  color: #fd6119;
  font-weight: 600;
}
.goods-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.goods-content-order {
  justify-content: space-between;
  min-height: 160rpx;
}
.goods-top-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}
.goods-title {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  color: #000;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.goods-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.goods-spec {
  flex: 1;
  min-width: 0;
  max-width: 414rpx;
  font-size: 28rpx;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-count {
  flex-shrink: 0;
  font-size: 28rpx;
  color: #888;
  text-align: right;
}
.goods-bottom-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
}
.goods-tag-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
  min-width: 0;
}
.win-tag {
  font-size: 26rpx;
  border-radius: 12rpx;
  padding: 8rpx 12rpx;
  color: #fd6119;
  border: 1rpx solid #fd6119;
  background: #fff7f0;
  white-space: nowrap;
  line-height: 1;
  align-self: flex-start;
}

/* ===== 价格行 ===== */
.goods-price-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10rpx;
}
.refund-amount-inline {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 600;
}
.price-tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}
.goods-price {
  font-weight: 600;
  color: #1a1a1a;
  text-align: right;
}
.price-symbol {
  font-size: 26rpx;
}
.price-int {
  font-size: 36rpx;
}
.price-dec {
  font-size: 26rpx;
}
.refund-tag {
  font-size: 26rpx;
  border-radius: 12rpx;
  padding: 8rpx 12rpx;
  background: #fff;
  white-space: nowrap;
  line-height: 1;
  align-self: flex-start;
}
.refund-tag-processing {
  color: #fd6119;
  border: 1rpx solid #fd6119;
}
.refund-tag-success {
  color: #52c41a;
  border: 1rpx solid #52c41a;
}
.refund-tag-failed {
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
}
.refund-tag-closed {
  color: #999;
  border: 1rpx solid #999;
}
.price-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 400;
}

/* ===== 操作按钮 ===== */
.action-row {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
  flex-wrap: wrap;
}
.action-btn {
  min-width: 100rpx;
  padding: 10rpx 20rpx;
  border-radius: 80rpx;
  border: 1rpx solid #adadad;
  color: #494b4f;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #fff;
  white-space: nowrap;
}
.action-btn-primary {
  min-width: 144rpx;
  border: none;
  color: #fff;
  font-weight: 600;
  background: linear-gradient(to right, #fd7d1b, #ff6c2d);
}

</style>
