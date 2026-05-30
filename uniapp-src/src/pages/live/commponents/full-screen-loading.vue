<template>
  <view class="loading">
    <view class="spinner"></view>
    <text>加载中...</text>
  </view>
</template>

<script>
export default {}
</script>

<style scoped>
.loading { position: fixed; inset: 0; z-index: 120; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; background: rgba(0, 0, 0, .28); font-size: 26rpx; }
.spinner { width: 54rpx; height: 54rpx; margin-bottom: 18rpx; border: 4rpx solid rgba(255, 255, 255, .4); border-top-color: #fff; border-radius: 50%; }
</style>
