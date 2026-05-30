<template>
  <view class="phone-page">
    <input v-model="formData.mobile" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
    <view class="code-row">
      <input v-model="formData.code" class="input flex" type="number" placeholder="请输入验证码" />
      <button class="code-btn" :disabled="is_send" @tap="sendCode">{{ send_btn_txt }}</button>
    </view>
    <button class="primary" @tap="formSubmit">绑定手机号</button>
  </view>
</template>

<script>
import { mobileValid, toast } from '../page-tools.js'

export default {
  data() {
    return {
      formData: { mobile: '', code: '' },
      is_send: false,
      send_btn_txt: '获取验证码',
      second: 60,
    }
  },
  methods: {
    formSubmit() {
      if (!mobileValid(this.formData.mobile)) {
        toast('手机有误,请重填！')
        return
      }
      if (!this.formData.code) {
        toast('请输入验证码')
        return
      }
      uni.showLoading({ title: '正在提交' })
      this._post(
        'user.userweb/bindMobile',
        this.formData,
        (res) => {
          uni.showToast({ title: res.msg || '绑定成功' })
          setTimeout(() => uni.navigateBack(), 800)
        },
        false,
        () => uni.hideLoading(),
      )
    },
    sendCode() {
      if (!mobileValid(this.formData.mobile)) {
        toast('手机有误,请重填！')
        return
      }
      this._post('user.userweb/sendCode', { mobile: this.formData.mobile, type: 'register' }, (res) => {
        if (res.code === 1) {
          uni.showToast({ title: '发送成功' })
          this.is_send = true
          this.changeMsg()
        }
      })
    },
    changeMsg() {
      if (this.second > 0) {
        this.send_btn_txt = this.second + '秒'
        this.second -= 1
        setTimeout(() => this.changeMsg(), 1000)
      } else {
        this.send_btn_txt = '获取验证码'
        this.second = 60
        this.is_send = false
      }
    },
  },
}
</script>

<style scoped>
.phone-page { min-height: 100vh; padding: 48rpx; background: #fff; box-sizing: border-box; }
.input { height: 88rpx; padding: 0 24rpx; margin-bottom: 24rpx; background: #f7f7f7; border-radius: 8rpx; font-size: 28rpx; box-sizing: border-box; }
.code-row { display: flex; gap: 18rpx; }
.flex { flex: 1; }
.code-btn { width: 210rpx; height: 88rpx; line-height: 88rpx; font-size: 26rpx; color: #19ad57; background: #eef8f2; border-radius: 8rpx; }
.primary { margin-top: 32rpx; color: #fff; background: #19ad57; border-radius: 8rpx; }
</style>
