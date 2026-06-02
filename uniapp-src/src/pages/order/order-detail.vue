<template>
  <view class="redirect-page">
    <text>正在打开订单详情...</text>
  </view>
</template>

<script>
export default {
  onLoad(query = {}) {
    const id = query.id || query.orderId || query.order_id || ''
    uni.redirectTo({ url: `/pages/order/detail?id=${encodeURIComponent(id)}` })
  },
}
</script>

<style scoped>
.redirect-page { display: flex; min-height: 100vh; align-items: center; justify-content: center; color: #777; font-size: 28rpx; }
</style>
