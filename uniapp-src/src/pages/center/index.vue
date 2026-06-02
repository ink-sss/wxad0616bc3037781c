<template>
  <view class="redirect-page">
    <text>正在打开个人中心...</text>
  </view>
</template>

<script>
import { ensureH5PageAuth } from '../../services/h5-auth-context.js'
import { normalizeLiveRouteOptions } from '../../utils/live-route.js'
import { saveLiveRoomContext } from '../../utils/live-room-context.js'

export default {
  onLoad(query = {}) {
    if (query.roomCode || query.roomId || query.liveId) saveLiveRoomContext(normalizeLiveRouteOptions(query))
    if (!ensureH5PageAuth(query, '/pages/center/index')) return
    uni.switchTab({
      url: '/pages/user/index/index',
      fail: () => uni.redirectTo({ url: '/pages/user/index/index' }),
    })
  },
}
</script>

<style scoped>
.redirect-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #666; font-size: 28rpx; }
</style>
