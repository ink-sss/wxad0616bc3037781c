<template>
  <view v-if="liveGo" class="live-tab">
    <view class="tabMain" @tap="backToLive">
      <image class="option-pic" :src="optionIcon"></image>
      <view>返回</view>
      <image v-if="liveGo.liveAvatar" class="liveImg" mode="aspectFill" :src="liveGo.liveAvatar"></image>
    </view>
  </view>
</template>
<script>
export default {
  name: 'LiveTab',
  data() { return { liveGo: null }; },
  computed: { optionIcon() { return (this.config?.pic_url || '') + '/20251127111915b056e6357.png'; } },
  mounted() { this.liveGo = uni.getStorageSync('is_liveGo') || null; },
  methods: {
    backToLive() {
      if (!this.liveGo) return;
      uni.removeStorageSync('is_liveGo');
      const type = this.liveGo.liveType === 'horizontal' ? 'live-horizontal' : 'live-vertical';
      uni.navigateTo({ url: '/pages/live/' + type + '?live_id=' + this.liveGo.liveId });
    }
  }
};
</script>
<style scoped>
.tabMain { position: fixed; right: 24rpx; bottom: 180rpx; z-index: 90; width: 96rpx; min-height: 112rpx; border-radius: 48rpx; background: rgba(0,0,0,.65); color: #fff; font-size: 24rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4rpx; }
.option-pic { width: 36rpx; height: 36rpx; }
.liveImg { width: 56rpx; height: 56rpx; border-radius: 50%; margin-top: 6rpx; }
</style>
