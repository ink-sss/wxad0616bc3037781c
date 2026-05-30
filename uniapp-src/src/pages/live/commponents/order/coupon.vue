<template>
  <view class="coupon-list">
    <view v-for="item in list" :key="item.coupon_id || item.id" class="coupon" @tap="$emit('select', item)">
      <view class="name">{{ item.name || item.coupon_name }}</view>
      <view class="amount">{{ item.reduce_price || item.discount || '' }}</view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    list: { type: Array, default: () => [] },
  },
  emits: ['select'],
}
</script>

<style scoped>
.coupon { display: flex; justify-content: space-between; padding: 18rpx 0; border-bottom: 1px solid #eee; color: #333; }
.amount { color: #ff5704; }
</style>
