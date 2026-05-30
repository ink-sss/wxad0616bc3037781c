<template>
  <view class="bind-page">
    <view class="title">绑定手机号</view>
    <view class="sub">授权微信手机号后将同步到当前账号</view>
    <button class="primary" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">授权获取</button>
    <button class="ghost" @tap="onNotLogin">暂不绑定</button>
  </view>
</template>

<script>
import { loginCode, phonePayload, toast } from './page-tools.js'

export default {
  data() {
    return {
      sessionKey: '',
      submitting: false,
    }
  },
  onLoad() {
    this.loadSession()
  },
  methods: {
    loadSession() {
      loginCode().then((code) => {
        this._post('user.user/getSession', { code }, (res) => {
          this.sessionKey = res.data.session_key
        })
      })
    },
    getPhoneNumber(event) {
      if (this.submitting) return
      let detail
      try {
        detail = phonePayload(event)
      } catch (error) {
        toast('授权失败，请重新授权')
        return
      }
      this.submitting = true
      uni.showLoading({ title: '正在处理', mask: true })
      this._post(
        'user.user/bindMobile',
        {
          session_key: this.sessionKey,
          encrypted_data: detail.encrypted_data,
          iv: detail.iv,
        },
        () => uni.navigateBack(),
        false,
        () => {
          this.submitting = false
          uni.hideLoading()
        },
      )
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
