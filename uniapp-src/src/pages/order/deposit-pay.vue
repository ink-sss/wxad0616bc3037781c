<template>
  <view class="redirect-page">
    <text>正在打开定金支付...</text>
  </view>
</template>

<script>
export default {
  onLoad(query = {}) {
    const orderNo = query.orderNo || query.order_no || ''
    const orderId = query.id || query.orderId || query.order_id || ''
    uni.redirectTo({ url: `/pages/order/pay?orderNo=${encodeURIComponent(orderNo)}&id=${encodeURIComponent(orderId)}` })
  },
}
</script>

<style scoped>
.redirect-page { display: flex; min-height: 100vh; align-items: center; justify-content: center; color: #777; font-size: 28rpx; }
</style>
