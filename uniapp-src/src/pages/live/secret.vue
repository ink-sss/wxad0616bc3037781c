<template>
  <view class="secret">
    <image class="secret-img" src="https://man.lqjy.cc/static/addBlack.png" />
    <view class="secret-text">您暂时无权访问</view>
    <button class="secret-btn" type="warn" @tap="goIndex">知道了</button>
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
.secret { min-height: 100vh; padding-top: 300rpx; box-sizing: border-box; }
.secret-img { width: 200rpx; height: 200rpx; margin: 0 auto; display: block; }
.secret-text { margin: 50rpx 0; font-size: 44rpx; text-align: center; }
.secret-btn { margin: 0 40rpx; border-radius: 10rpx; padding: 10rpx 0; font-size: 32rpx; }
</style>
