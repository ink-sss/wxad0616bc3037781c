<template>
  <view class="end-topicon" @tap="$emit('goShop')">商品</view>
</template>
<script>
export default { emits: ['goShop'] }
</script>
<style scoped>.end-topicon{padding:8rpx 18rpx;border-radius:24rpx;color:#fff;background:rgba(0,0,0,.45);font-size:24rpx;}</style>
