<template>
  <view class="redirect-page">
    <text>正在打开直播分享...</text>
  </view>
</template>

<script>
import { buildBroadcastEntryUrl, normalizeLiveRouteOptions } from '../../../utils/live-route.js'

export default {
  onLoad(query = {}) {
    uni.redirectTo({ url: buildBroadcastEntryUrl(normalizeLiveRouteOptions(query)) })
  },
}
</script>

<style scoped>
.redirect-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #666; font-size: 28rpx; }
</style>
