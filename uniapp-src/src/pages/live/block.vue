<template>
  <view class="blocked">
    <image class="blocked-img" src="https://man.lqjy.cc/static/addBlack.png" />
    <view class="blocked-text">您当前已被拉黑</view>
    <button class="blocked-btn" type="warn" @tap="goIndex">知道了</button>
  </view>
</template>

<script>
import { goBackOrHome } from './page-tools.js'

export default {
  onLoad() {
    uni.hideShareMenu && uni.hideShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
  },
  methods: {
    goIndex() {
      goBackOrHome()
    },
  },
}
</script>

<style scoped>
.blocked { min-height: 100vh; padding-top: 300rpx; box-sizing: border-box; }
.blocked-img { width: 200rpx; height: 200rpx; margin: 0 auto; display: block; }
.blocked-text { margin: 50rpx 0; font-size: 44rpx; text-align: center; }
.blocked-btn { margin: 0 40rpx; border-radius: 10rpx; padding: 10rpx 0; font-size: 32rpx; }
</style>
