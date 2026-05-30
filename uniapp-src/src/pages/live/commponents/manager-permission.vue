<template>
  <view class="manager">管理员</view>
</template>

<script>
export default {
  props: {
    liveId: { type: [Number, String], default: '' },
  },
}
</script>

<style scoped>
.manager { position: absolute; right: 20rpx; top: 170rpx; padding: 8rpx 18rpx; border-radius: 28rpx; color: #fff; background: rgba(255, 87, 4, .85); font-size: 24rpx; }
</style>
