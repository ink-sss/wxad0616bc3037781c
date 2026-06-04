<template>
  <bottom-sheet-popup
    :visible="visible"
    height="760rpx"
    radius="32rpx 32rpx 0 0"
    :duration="500"
    :with-mask="true"
    mask-color="rgba(0, 0, 0, 0.35)"
    :allow-overflow="true"
    :show-close="false"
    @close="emit('close')"
  >
    <view class="center-popup">
      <view class="center-header">
        <image class="center-avatar" :src="avatar" mode="aspectFill" />
        <view class="center-user">
          <text class="center-name">{{ name }}</text>
        </view>
        <view class="center-entry" @click="onAction('profile')">
          <image
            class="entry-icon"
            src="https://man.lqjy.cc/static/icons/center.svg"
            mode="aspectFit"
          />
          <text class="entry-text">个人中心</text>
        </view>
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
        class="more-card"
        title="更多功能"
        :items="moreItems"
        mode="grid"
        variant="more"
        @item-click="onItemClick"
      />
    </view>
  </bottom-sheet-popup>
</template>

<script setup>
import { computed } from "vue";
import BottomSheetPopup from "@/components/bottom-sheet-popup.vue";
import CenterSectionCard from "@/components/center-section-card.vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  name: { type: String, default: "晴天" },
  avatar: { type: String, default: "" },
  orderStats: {
    type: Object,
    default: () => ({
      waitPay: 0,
      waitShip: 0,
      waitReceive: 0,
      refunding: 0,
    }),
  },
  isDistributor: { type: Boolean, default: false },
  distributorStatus: { type: Number, default: 0 },
  enableShare: { type: Number, default: 1 },
});

const emit = defineEmits(["close", "action"]);

const orderItems = computed(() => [
  {
    key: "unpay",
    label: "待付款",
    icon: "https://man.lqjy.cc/static/icons/order_0.png",
    badge: Number(props.orderStats?.waitPay || 0),
  },
  {
    key: "unsend",
    label: "待发货",
    icon: "https://man.lqjy.cc/static/icons/order_1.png",
    badge: Number(props.orderStats?.waitShip || 0),
  },
  {
    key: "unreceive",
    label: "待收货",
    icon: "https://man.lqjy.cc/static/icons/order_2.png",
    badge: Number(props.orderStats?.waitReceive || 0),
  },
  { key: "finished", label: "已完成", icon: "https://man.lqjy.cc/static/icons/order_3.png" },
  {
    key: "refund",
    label: "退款/售后",
    icon: "https://man.lqjy.cc/static/icons/order_4.png",
    badge: Number(props.orderStats?.refunding || 0),
  },
]);

const moreItems = computed(() => {
  const items = [
    { key: "prizeRecord", label: "中奖记录", icon: "https://man.lqjy.cc/static/icons/more1.png" },
  ];
   if (props.enableShare !== 0 && props.isDistributor && props.distributorStatus === 1) {
    items.push({ key: "invitationRecord", label: "邀请记录", icon: "https://man.lqjy.cc/static/icons/more2.png" });
  }
  items.push({ key: "address", label: "收货地址", icon: "https://man.lqjy.cc/static/icons/more3.png" });
  items.push({ key: "complaint", label: "投诉", icon: "https://man.lqjy.cc/static/icons/more4.png" });
  return items;
});

function onItemClick(item) {
  emit("action", item.key);
}

function onAction(type) {
  emit("action", type);
}
</script>

<style lang="scss" scoped>
.center-popup {
  min-height: 760rpx;
  background: linear-gradient(178.56deg, #ffffff 3.09%, #fff0e9 56.44%);
  border-radius: 32rpx 32rpx 0 0;
  padding: 0 24rpx 40rpx;
  box-sizing: border-box;
}

.center-header {
  position: relative;
  padding: 36rpx 12rpx 30rpx;
  margin-top: -42rpx;
  min-height: 150rpx;
}

.center-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding-top: 60rpx;
}

.center-avatar {
  position: absolute;
  left: 50%;
  top: -12rpx;
  transform: translateX(-50%);
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #f0f0f0;
  z-index: 2;
}

.center-name {
  font-size: 34rpx;
  line-height: 48rpx;
  color: #222;
  font-weight: 500;
}

.center-entry {
  position: absolute;
  right: 8rpx;
  top: 72rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.entry-icon {
  width: 28rpx;
  height: 28rpx;
}

.entry-text {
  font-size: 28rpx;
  color: #666;
}

.more-card {
  margin-top: 20rpx;
}
</style>
