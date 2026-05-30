<template>
  <view class="store-info">
    <view class="name">{{ store.name || store.store_name || '自提门店' }}</view>
    <view class="sub">{{ store.address }}</view>
  </view>
</template>

<script>
export default {
  props: {
    store: { type: Object, default: () => ({}) },
  },
}
</script>

<style scoped>
.store-info { padding: 20rpx; border-radius: 8rpx; background: #fff; color: #333; }
.name { font-weight: 600; }
.sub { margin-top: 8rpx; color: #777; font-size: 24rpx; }
</style>
