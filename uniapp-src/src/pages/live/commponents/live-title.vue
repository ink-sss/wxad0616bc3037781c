<template>
  <view class="live-title">
    <image class="avatar" :src="avatar" />
    <view class="meta">
      <view class="name">{{ detail.name || detail.title || '直播间' }}</view>
      <view class="sub">{{ detail.author_name || detail.anchor_name || detail.look_num || '' }}</view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    detail: { type: Object, default: () => ({}) },
  },
  computed: {
    avatar() {
      return this.detail.author_avatarUrl || this.detail.avatar || this.detail.logo || 'https://weilive.yukelive.com/static/live/default_logo.jpeg'
    },
  },
}
</script>

<style scoped>
.live-title { display: flex; align-items: center; min-width: 240rpx; margin: 36rpx 20rpx 0; padding: 10rpx 18rpx 10rpx 10rpx; border-radius: 48rpx; background: rgba(0, 0, 0, .45); color: #fff; }
.avatar { width: 58rpx; height: 58rpx; border-radius: 50%; background: #ddd; }
.meta { margin-left: 12rpx; max-width: 430rpx; }
.name { font-size: 26rpx; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sub { margin-top: 4rpx; font-size: 20rpx; color: rgba(255, 255, 255, .75); }
</style>
