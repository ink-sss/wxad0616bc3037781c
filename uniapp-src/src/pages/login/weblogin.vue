<template>
  <view class="web-login">
    <view class="tabs">
      <view :class="{ active: mode === 'sms' }" @tap="mode = 'sms'">验证码登录</view>
      <view :class="{ active: mode === 'password' }" @tap="mode = 'password'">密码登录</view>
    </view>

    <view v-if="screen === 'login'" class="panel">
      <input v-model="formData.mobile" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
      <view v-if="mode === 'sms' && sms_open" class="code-row">
        <input v-model="formData.code" class="input flex" type="number" placeholder="请输入验证码" />
        <button class="code-btn" :disabled="is_send" @tap="sendCode">{{ send_btn_txt }}</button>
      </view>
      <input v-else v-model="formData.password" class="input" type="password" placeholder="请输入密码" />
      <button class="primary" @tap="formSubmit">登录</button>
      <view class="links">
        <text @tap="screen = 'reset'">忘记密码</text>
        <text @tap="quickLogin">快捷登录</text>
      </view>
    </view>

    <view v-else class="panel">
      <input v-model="resetpassword.mobile" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
      <view class="code-row">
        <input v-model="resetpassword.code" class="input flex" type="number" placeholder="请输入验证码" />
        <button class="code-btn" :disabled="is_send" @tap="sendCode">{{ send_btn_txt }}</button>
      </view>
      <input v-model="resetpassword.password" class="input" type="password" placeholder="请输入新密码" />
      <input v-model="resetpassword.repassword" class="input" type="password" placeholder="请再次输入新密码" />
      <button class="primary" @tap="resetpasswordSub">重置密码</button>
      <button class="ghost" @tap="screen = 'login'">返回登录</button>
    </view>

    <view class="agreement" @tap="isRead = !isRead">
      <text class="check" :class="{ active: isRead }">✓</text>
      我已阅读并接受
      <text class="link" @tap.stop="xieyi('service')">《用户协议》</text>
      和
      <text class="link" @tap.stop="xieyi('privacy')">《隐私政策》</text>
    </view>
  </view>
</template>

<script>
import { getCurrentRedirect, mobileValid, toast } from './page-tools.js'

export default {
  data() {
    return {
      formData: { mobile: '', password: '', code: '' },
      resetpassword: { mobile: '', password: '', repassword: '', code: '' },
      is_send: false,
      send_btn_txt: '获取验证码',
      second: 60,
      screen: 'login',
      mode: 'sms',
      sms_open: false,
      isRead: true,
    }
  },
  onLoad(query = {}) {
    if (query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
  },
  onShow() {
    this.getCodeType()
  },
  methods: {
    getCodeType() {
      this._post('index/loginSetting', {}, (res) => {
        this.sms_open = !!(res.data.setting && res.data.setting.h5_sms_open)
        if (!this.sms_open) this.mode = 'password'
      })
    },
    submitSuccess(data) {
      if (data.token) uni.setStorageSync('token', data.token)
      if (data.user_id) uni.setStorageSync('user_id', data.user_id)
      this.gotoPage(getCurrentRedirect('/pages/user/index/index'), 'redirect')
    },
    formSubmit() {
      if (!this.isRead) {
        toast('请先阅读并接受用户协议及隐私政策')
        return
      }
      if (!mobileValid(this.formData.mobile)) {
        toast('手机有误,请重填！')
        return
      }
      const payload = {
        mobile: this.formData.mobile,
        invitation_id: this.invitation_id || 0,
        referee_id: uni.getStorageSync('referee_id') || 0,
      }
      let endpoint = 'user.useropen/phonelogin'
      if (this.mode === 'sms') {
        if (this.sms_open && !this.formData.code) {
          toast('验证码不能为空！')
          return
        }
        payload.code = this.formData.code
        endpoint = 'user.useropen/smslogin'
      } else {
        if (!this.formData.password) {
          toast('密码不能为空！')
          return
        }
        payload.password = this.formData.password
      }
      uni.showLoading({ title: '正在提交' })
      this._post(endpoint, payload, (res) => this.submitSuccess(res.data), false, () => uni.hideLoading())
    },
    resetpasswordSub() {
      if (!mobileValid(this.resetpassword.mobile)) {
        toast('手机有误,请重填！')
        return
      }
      if (!this.resetpassword.code) {
        toast('验证码不能为空！')
        return
      }
      if (this.resetpassword.password.length < 6) {
        toast('密码至少6位数！')
        return
      }
      if (this.resetpassword.password !== this.resetpassword.repassword) {
        toast('两次密码输入不一致！')
        return
      }
      uni.showLoading({ title: '正在提交' })
      this._post(
        'user.useropen/resetpassword',
        this.resetpassword,
        () => {
          uni.showToast({ title: '重置成功' })
          this.formData.mobile = this.resetpassword.mobile
          this.resetpassword = { mobile: '', password: '', repassword: '', code: '' }
          this.screen = 'login'
          this.mode = 'password'
        },
        false,
        () => uni.hideLoading(),
      )
    },
    sendCode() {
      const mobile = this.screen === 'reset' ? this.resetpassword.mobile : this.formData.mobile
      if (!mobileValid(mobile)) {
        toast('手机有误,请重填！')
        return
      }
      this._post('user.useropen/sendCode', { mobile, type: this.screen === 'reset' ? 'login' : 'sms' }, (res) => {
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
    quickLogin() {
      uni.showLoading({ title: '登录中...' })
      this._post(
        'user.user/getUserByTokenH5',
        { source: 'wx', referee_id: uni.getStorageSync('referee_id') || 0 },
        (res) => this.submitSuccess(res.data),
        false,
        () => uni.hideLoading(),
      )
    },
    xieyi(type) {
      this.gotoPage('/pages/webview/ue?type=' + type)
    },
  },
}
</script>

<style scoped>
.web-login { min-height: 100vh; padding: 48rpx; background: #fff; box-sizing: border-box; }
.tabs { display: flex; height: 88rpx; margin-bottom: 40rpx; border-bottom: 1px solid #eee; color: #777; font-size: 30rpx; }
.tabs view { flex: 1; text-align: center; line-height: 88rpx; }
.tabs .active { color: #111; font-weight: 600; border-bottom: 4rpx solid #19ad57; }
.panel { display: flex; flex-direction: column; gap: 22rpx; }
.input { height: 88rpx; padding: 0 24rpx; background: #f7f7f7; border-radius: 8rpx; font-size: 28rpx; box-sizing: border-box; }
.code-row { display: flex; gap: 18rpx; align-items: center; }
.flex { flex: 1; }
.code-btn { width: 210rpx; height: 88rpx; line-height: 88rpx; font-size: 26rpx; color: #19ad57; background: #eef8f2; }
button { border-radius: 8rpx; }
.primary { margin-top: 18rpx; color: #fff; background: #19ad57; }
.ghost { color: #666; background: #f7f7f7; }
.links { display: flex; justify-content: space-between; color: #666; font-size: 26rpx; }
.agreement { margin-top: 36rpx; color: #666; font-size: 24rpx; line-height: 40rpx; text-align: center; }
.check { display: inline-flex; align-items: center; justify-content: center; width: 30rpx; height: 30rpx; margin-right: 8rpx; border: 1px solid #bbb; border-radius: 50%; color: transparent; font-size: 20rpx; }
.check.active { color: #fff; background: #19ad57; border-color: #19ad57; }
.link { color: #1d7afc; }
</style>
