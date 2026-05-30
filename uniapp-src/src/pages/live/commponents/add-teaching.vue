<template>
  <view class="live-card"><slot />{{ title }}</view>
</template>
<script>
export default { props: { title: { type: String, default: '新增讲解' } } }
</script>
<style scoped>.live-card{padding:20rpx;border-radius:8rpx;background:#fff;color:#333;font-size:26rpx;}</style>
