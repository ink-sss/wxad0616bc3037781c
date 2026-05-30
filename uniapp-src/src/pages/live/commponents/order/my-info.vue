<template>
  <view class="my-info">
    <view>{{ address.name || address.linkman || '请选择收货人' }}</view>
    <view class="sub">{{ address.phone || address.mobile || '' }}</view>
    <view class="sub">{{ address.region ? address.region.join(' ') : '' }}{{ address.detail || address.address }}</view>
  </view>
</template>

<script>
export default {
  props: {
    address: { type: Object, default: () => ({}) },
  },
}
</script>

<style scoped>
.my-info { padding: 20rpx; border-radius: 8rpx; background: #fff; color: #333; }
.sub { margin-top: 8rpx; color: #777; font-size: 24rpx; }
</style>
