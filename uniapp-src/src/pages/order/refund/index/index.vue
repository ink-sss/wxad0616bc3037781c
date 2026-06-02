<template>
  <view class="redirect-page">
    <text>正在打开售后列表...</text>
  </view>
</template>

<script>
export default {
  onLoad(query = {}) {
    const qs = Object.keys(query).map((key) => `${key}=${encodeURIComponent(query[key])}`).join('&')
    uni.redirectTo({ url: `/pages/order/refund-list${qs ? `?${qs}` : ''}` })
  },
}
</script>

<style scoped>
.redirect-page { display: flex; min-height: 100vh; align-items: center; justify-content: center; color: #777; font-size: 28rpx; }
</style>
