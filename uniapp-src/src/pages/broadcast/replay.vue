<template>
  <view class="redirect-page">
    <text>正在进入录播...</text>
  </view>
</template>

<script>
import { buildBroadcastEntryUrl, normalizeLiveRouteOptions } from '../../utils/live-route.js'
import { ensureH5Authenticated } from '../../services/h5-auth-context.js'

export default {
  onLoad(query = {}) {
    const options = normalizeLiveRouteOptions({ ...query, replay: '1', mode: query.mode || 'replay' })
    const url = buildBroadcastEntryUrl(options)
    if (!ensureH5Authenticated({ ...query, ...options, redirect: url })) return
    uni.redirectTo({ url })
  },
}
</script>

<style scoped>
.redirect-page { display: flex; min-height: 100vh; align-items: center; justify-content: center; background: #fff; color: #999; font-size: 28rpx; }
</style>
