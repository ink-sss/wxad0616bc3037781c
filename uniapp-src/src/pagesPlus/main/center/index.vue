<template>
  <view class="center-page">
    <view class="center-main">
      <view class="profile-row">
        <image class="profile-avatar" :src="avatar" mode="aspectFill" />
        <text class="profile-name" @click="handleNameTap">{{ name }}</text>
      </view>

      <center-section-card
        title="我的订单"
        :items="orderItems"
        mode="grid"
        variant="order"
        :show-link="true"
        @link="onAction('orders')"
        @item-click="onItemClick"
      />

      <center-section-card
        class="profile-more-card"
        title="更多功能"
        :items="moreItems"
        mode="grid"
        variant="more"
        @item-click="onItemClick"
      />
    </view>

    <view class="back-pill" @click="goBack">
      <text class="back-arrow">‹</text>
      <text class="back-text">返回</text>
    </view>
    <live-mini-window :room-code="liveRoomCode" :bottom-offset="140" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import CenterSectionCard from "@/components/center-section-card.vue";
import LiveMiniWindow from "@/components/live-mini-window.vue";
import { getOrderUnreadStats } from "@/api/order";
import { getRefundUnreadStats } from "@/api/refund";
import { checkCurrentDistributor } from "@/api/live";
import { getCenter } from "@/api/user";
import { useUserStore } from "@/stores/user";
import { logoutAndRedirect } from "@/services/logout";
import { handleH5Unauthorized, readCachedH5Customer } from "@/services/h5-auth-context";
import { appendLiveRoomQuery, loadLiveRoomContext, mergeLiveRoomContext, resolveLiveRoomCode, saveLiveRoomContext } from "@/utils/live-room-context";
import { normalizeLiveRouteOptions } from "@/utils/live-route";
import { returnToLiveRoom } from "@/utils/live-room-navigation";
import { navigateToPrizeRecord } from "@/utils/route-navigation";

const DEFAULT_AVATAR = "https://man.lqjy.cc/static/login-default.png";
const iconBase = "https://man.lqjy.cc/static/icons/";

const name = ref("用户");
const avatar = ref(DEFAULT_AVATAR);
const liveRoomCode = ref("");
const liveRoomId = ref(0);
const liveRoomContext = ref({});
const isDistributor = ref(false);
const distributorStatus = ref(0);
const enableShare = ref(1);
const nameTapCount = ref(0);
let nameTapTimer = null;
let lastQuery = {};

const orderStats = ref({
  waitPay: 0,
  waitShip: 0,
  waitReceive: 0,
  waitReview: 0,
  refunding: 0,
});

const orderItems = computed(() => [
  {
    key: "unpay",
    label: "待付款",
    icon: `${iconBase}order_0.png`,
    badge: orderStats.value.waitPay || 0,
  },
  {
    key: "unsend",
    label: "待发货",
    icon: `${iconBase}order_1.png`,
    badge: orderStats.value.waitShip || 0,
  },
  {
    key: "unreceive",
    label: "待收货",
    icon: `${iconBase}order_2.png`,
    badge: orderStats.value.waitReceive || 0,
  },
  {
    key: "finished",
    label: "已完成",
    icon: `${iconBase}order_3.png`,
    badge: orderStats.value.waitReview || 0,
  },
  {
    key: "refund",
    label: "退款/售后",
    icon: `${iconBase}order_4.png`,
    badge: orderStats.value.refunding || 0,
  },
]);

const moreItems = computed(() => {
  const items = [
    {
      key: "prizeRecord",
      label: "中奖记录",
      icon: `${iconBase}more1.png`,
    },
  ];
  if (enableShare.value !== 0 && isDistributor.value && distributorStatus.value === 1) {
    items.push({
      key: "invitationRecord",
      label: "邀请记录",
      icon: `${iconBase}more2.png`,
    });
  }
  items.push({ key: "address", label: "收货地址", icon: `${iconBase}more3.png` });
  items.push({ key: "complaint", label: "投诉", icon: `${iconBase}more4.png` });
  return items;
});

function normalizeCustomerName(customer = {}) {
  return (
    customer.nickname ||
    customer.nickName ||
    customer.userName ||
    customer.username ||
    customer.name ||
    customer.mobile ||
    customer.phone ||
    "用户"
  );
}

function normalizeCustomerAvatar(customer = {}) {
  return (
    customer.avatar ||
    customer.avatarUrl ||
    customer.headimgurl ||
    customer.headImg ||
    customer.head ||
    DEFAULT_AVATAR
  );
}

function applyCustomer(customer = {}) {
  if (!customer || typeof customer !== "object") return;
  name.value = normalizeCustomerName(customer);
  avatar.value = normalizeCustomerAvatar(customer);
}

function applyCachedCustomer() {
  const userStore = useUserStore();
  const cached = readCachedH5Customer() || userStore.userInfo || null;
  if (cached) applyCustomer(cached);
}

function resetNameTapState() {
  nameTapCount.value = 0;
  if (nameTapTimer) {
    clearTimeout(nameTapTimer);
    nameTapTimer = null;
  }
}

function handleNameTap() {
  nameTapCount.value += 1;
  if (nameTapTimer) {
    clearTimeout(nameTapTimer);
  }
  if (nameTapCount.value >= 10) {
    resetNameTapState();
    logoutAndRedirect();
    return;
  }
  nameTapTimer = setTimeout(() => {
    resetNameTapState();
  }, 3000);
}

function normalizeStats(orderUnreadStats = {}, refundUnreadStats = {}) {
  return {
    waitPay: Number(orderUnreadStats.unpay || orderUnreadStats.waitPay || orderUnreadStats.wait_pay || 0),
    waitShip: Number(orderUnreadStats.unsend || orderUnreadStats.waitShip || orderUnreadStats.wait_ship || 0),
    waitReceive: Number(orderUnreadStats.unreceive || orderUnreadStats.waitReceive || orderUnreadStats.wait_receive || 0),
    waitReview: Number(orderUnreadStats.finished || orderUnreadStats.waitReview || orderUnreadStats.wait_review || 0),
    refunding: Number(refundUnreadStats.refund || refundUnreadStats.refunding || refundUnreadStats.refundCount || 0),
  };
}

function applyCenterPayload(data = {}) {
  const customer = data.customer || data.userInfo || data.user || {};
  if (customer && Object.keys(customer).length > 0) {
    applyCustomer(customer);
    useUserStore().setUserInfo(customer);
  }
  enableShare.value = Number(data.enableShare ?? data.enable_share ?? enableShare.value);
}

async function loadDistributorStatus() {
  try {
    const result = await checkCurrentDistributor();
    const nextIsDistributor = !!result?.isDistributor;
    const nextDistributorStatus = Number(result?.status || 0);
    const nextInvitationRecordVisible = nextIsDistributor && nextDistributorStatus === 1;
    isDistributor.value = nextIsDistributor;
    distributorStatus.value = nextDistributorStatus;
    saveLiveRoomContext({
      roomCode: liveRoomCode.value || liveRoomContext.value?.roomCode || "",
      liveId: liveRoomId.value || "",
      roomId: liveRoomId.value || "",
      isDistributor: nextIsDistributor,
      distributorStatus: nextDistributorStatus,
      invitationRecordVisible: nextInvitationRecordVisible,
    });
  } catch (err) {
    console.warn("[Center] checkDistributor fail:", err);
  }
}

function refreshDistributorStatus() {
  loadDistributorStatus();
}

async function loadCenter() {
  applyCachedCustomer();
  try {
    const [data, orderUnreadStats, refundUnreadStats] = await Promise.all([
      getCenter(),
      getOrderUnreadStats(),
      getRefundUnreadStats(),
    ]);
    applyCenterPayload(data || {});
    orderStats.value = normalizeStats(orderUnreadStats || {}, refundUnreadStats || {});
  } catch (err) {
    if (!handleH5Unauthorized(err, { ...lastQuery, redirect: "/pagesPlus/main/center/index" })) {
      console.error("[Center] loadCenter fail:", err);
      applyCachedCustomer();
    }
  }
}

function syncLiveContext(options = {}) {
  const normalized = normalizeLiveRouteOptions(options || {});
  if (normalized.roomCode || normalized.roomId || normalized.liveId) {
    saveLiveRoomContext(normalized);
  }
  liveRoomContext.value = mergeLiveRoomContext(loadLiveRoomContext() || {}, normalized || {});
  liveRoomCode.value = resolveLiveRoomCode(normalized.roomCode);
  const ctx = liveRoomContext.value;
  liveRoomId.value = Number(normalized.roomId || normalized.liveId || ctx?.liveId || ctx?.roomId || 0);
  if (ctx) {
    isDistributor.value = !!ctx.invitationRecordVisible || (!!ctx.isDistributor && Number(ctx.distributorStatus || 0) === 1);
    distributorStatus.value = Number(ctx.distributorStatus || (isDistributor.value ? 1 : 0) || 0);
    enableShare.value = Number(ctx.enableShare ?? ctx.enable_share ?? enableShare.value);
  }
}

onLoad((options = {}) => {
  lastQuery = options || {};
  syncLiveContext(options);
  applyCachedCustomer();
  refreshDistributorStatus();
  loadCenter();
});

onShow(() => {
  syncLiveContext(lastQuery);
  refreshDistributorStatus();
  loadCenter();
});

function onItemClick(item) {
  onAction(item.key);
}

function withLiveQuery(url) {
  return appendLiveRoomQuery(url, liveRoomContext.value);
}

function onAction(type) {
  if (["orders", "unpay", "unsend", "unreceive", "finished", "refund"].includes(type)) {
    if (type === "refund") {
      uni.navigateTo({ url: withLiveQuery("/pages/order/list?status=refund") });
      return;
    }
    const statusMap = {
      orders: "all",
      unpay: "unpay",
      unsend: "unsend",
      unreceive: "unreceive",
      finished: "finished",
    };
    uni.navigateTo({ url: withLiveQuery(`/pages/order/list?status=${statusMap[type]}`) });
    return;
  }
  if (type === "complaint") {
    uni.navigateTo({ url: withLiveQuery("/pagesPlus/main/report/report-type?fromPath=%2Fpages%2Fcenter%2Findex") });
    return;
  }
  if (type === "prizeRecord") {
    navigateToPrizeRecord(withLiveQuery("/pagesPlus/main/prize-record/index"));
    return;
  }
  if (type === "invitationRecord") {
    uni.navigateTo({
      url: "/pagesPlus/main/invitation-record/index",
    });
    return;
  }
  if (type === "address") {
    uni.navigateTo({ url: withLiveQuery("/pagesPlus/main/address/index") });
  }
}

function goBack() {
  if (liveRoomCode.value) {
    returnToLiveRoom(liveRoomCode.value, liveRoomContext.value);
    return;
  }
  uni.navigateBack({
    fail: () => uni.reLaunch({ url: "/pages/broadcast/entry" }),
  });
}
</script>

<style lang="scss" scoped>
.center-page {
  min-height: 100vh;
  background: linear-gradient(178.72deg, #fff0e9 1.09%, #ffffff 18.82%);

  padding: 26rpx 20rpx 60rpx;
  box-sizing: border-box;
}

.center-main {
  padding-top: 26rpx;
}

.profile-row {
  display: flex;
  align-items: center;
  padding: 20rpx 12rpx 34rpx;
}

.profile-avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}

.profile-name {
  margin-left: 20rpx;
  font-size: 40rpx;
  line-height: 56rpx;
  color: #333;
  font-weight: 500;
}

.profile-more-card {
  margin-top: 18rpx;
}

.back-pill {
  margin-top: 220rpx;
  margin-left: -20rpx;
  width: 120rpx;
  height: 64rpx;
  border-radius: 0 32rpx 32rpx 0;
  background: #fff;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.back-arrow,
.back-text {
  font-size: 24rpx;
  color: #ff6b2e;
}
</style>
