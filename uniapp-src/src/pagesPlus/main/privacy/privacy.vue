<template>
  <view class="privacy-page" :style="{ minHeight: windowHeight + 'px' }">
    <view class="privacy-card">
      <view class="title">隐私保护提示</view>
      <view class="content">
        请阅读并同意
        <text class="link" @tap="xieyi('service')">《用户协议》</text>
        和
        <text class="link" @tap="xieyi('privacy')">《隐私协议》</text>
        后继续使用。
      </view>
      <view class="actions">
        <button class="secondary" @tap="quit">不同意</button>
        <button class="primary" type="primary" @tap="submit">同意并继续</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      windowHeight: 0,
      windowWidth: 0
    }
  },
  onLoad() {
    const info = uni.getSystemInfoSync()
    this.windowWidth = info.windowWidth
    this.windowHeight = info.windowHeight
  },
  methods: {
    submit() {
      uni.setStorageSync('firstEnter', 1)
      uni.reLaunch({ url: '/pages/index/index' })
    },
    quit() {
      // TODO:migration: compiled app called plus.runtime APIs, which are not available in mp-weixin.
      uni.showToast({ title: '已取消授权', icon: 'none' })
    },
    xieyi(type) {
      const url = '/pagesPlus/main/webview/ue?type=' + type
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.privacy-page { display: flex; align-items: center; justify-content: center; padding: 40rpx; background: #f7f7f7; box-sizing: border-box; }
.privacy-card { width: 100%; padding: 44rpx 32rpx; border-radius: 18rpx; background: #fff; box-sizing: border-box; }
.title { color: #222; font-size: 36rpx; font-weight: 700; text-align: center; }
.content { margin-top: 28rpx; color: #555; font-size: 28rpx; line-height: 1.8; }
.link { color: #f03b2f; }
.actions { display: flex; gap: 20rpx; margin-top: 44rpx; }
.secondary, .primary { flex: 1; height: 76rpx; border-radius: 38rpx; font-size: 28rpx; line-height: 76rpx; }
.secondary { background: #f5f5f5; color: #666; }
.primary { background: #f03b2f; }
</style>
