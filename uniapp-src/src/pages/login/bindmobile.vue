<template>
  <view class="bind-page">
    <view class="title">绑定手机号</view>
    <view class="sub">授权微信手机号后将同步到当前账号</view>
    <button class="primary" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">授权获取</button>
    <button class="ghost" @tap="onNotLogin">暂不绑定</button>
  </view>
</template>

<script>
import { bindMiniProgramMobile, toast } from './page-tools.js'

export default {
  data() {
    return {
      userId: '',
      submitting: false,
    }
  },
  onLoad() {
    this.userId = uni.getStorageSync('user_id') || ''
  },
  methods: {
    getPhoneNumber(event) {
      if (this.submitting) return
      this.submitting = true
      uni.showLoading({ title: '正在处理', mask: true })
      bindMiniProgramMobile(this.userId, event)
        .then((data = {}) => {
          if (data.user_id) uni.setStorageSync('user_id', data.user_id)
          uni.showToast({ title: '绑定成功' })
          uni.navigateBack()
        })
        .catch((error) => {
          toast(error?.message || error?.msg || '授权失败，请重新授权')
        })
        .finally(() => {
          this.submitting = false
          uni.hideLoading()
        })
    },
    onNotLogin() {
      this.gotoPage('/pages/index/index')
    },
  },
}
</script>

<style scoped>
.bind-page { min-height: 100vh; padding: 140rpx 48rpx; text-align: center; background: #fff; box-sizing: border-box; }
.title { font-size: 40rpx; font-weight: 600; color: #222; }
.sub { margin: 24rpx 0 64rpx; font-size: 28rpx; color: #777; }
button { margin-top: 24rpx; border-radius: 8rpx; }
.primary { color: #fff; background: #19ad57; }
.ghost { color: #777; background: #f6f6f6; }
</style>
