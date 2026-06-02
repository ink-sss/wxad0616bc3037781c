<template>
  <view class="redirect-page">
    <text>正在进入直播间...</text>
  </view>
</template>

<script>
import { buildBroadcastEntryUrl, normalizeLiveRouteOptions } from '../../utils/live-route.js'

export default {
  onLoad(query = {}) {
    const options = normalizeLiveRouteOptions(query)
    uni.redirectTo({ url: buildBroadcastEntryUrl({ ...options, mode: 'landscape', orientation: 'horizontal' }) })
  },
}
</script>

<style scoped>
.redirect-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0b0b0f; color: #fff; font-size: 28rpx; }
</style>
