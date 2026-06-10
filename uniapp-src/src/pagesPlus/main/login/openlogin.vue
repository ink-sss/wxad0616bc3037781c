<template>
  <view class="open-login">
    <view class="tabs">
      <view :class="{ active: is_login === 1 }" @tap="is_login = 1">登录</view>
      <view :class="{ active: is_login === 2 }" @tap="is_login = 2">注册</view>
      <view :class="{ active: is_login === 0 }" @tap="is_login = 0">找回</view>
    </view>

    <view v-if="is_login === 1" class="panel">
      <input v-model="formData.mobile" class="input" type="number" maxlength="11" placeholder="手机号" />
      <view v-if="is_code" class="code-row">
        <input v-model="formData.code" class="input flex" type="number" placeholder="验证码" />
        <button class="code-btn" :disabled="is_send" @tap="sendCode">{{ send_btn_txt }}</button>
      </view>
      <input v-else v-model="loging_password" class="input" type="password" placeholder="密码" />
      <button class="switch" @tap="isCode">{{ is_code ? '使用密码登录' : '使用验证码登录' }}</button>
      <button class="primary" @tap="formSubmit">登录</button>
    </view>

    <view v-else-if="is_login === 2" class="panel">
      <input v-model="register.mobile" class="input" type="number" maxlength="11" placeholder="手机号" />
      <input v-model="register.password" class="input" type="password" placeholder="密码" />
      <input v-model="register.repassword" class="input" type="password" placeholder="确认密码" />
      <view v-if="sms_open" class="code-row">
        <input v-model="register.code" class="input flex" type="number" placeholder="验证码" />
        <button class="code-btn" :disabled="is_send" @tap="sendCode">{{ send_btn_txt }}</button>
      </view>
      <button class="primary" @tap="registerSub">注册</button>
    </view>

    <view v-else class="panel">
      <input v-model="resetpassword.mobile" class="input" type="number" maxlength="11" placeholder="手机号" />
      <view class="code-row">
        <input v-model="resetpassword.code" class="input flex" type="number" placeholder="验证码" />
        <button class="code-btn" :disabled="is_send" @tap="sendCode">{{ send_btn_txt }}</button>
      </view>
      <input v-model="resetpassword.password" class="input" type="password" placeholder="新密码" />
      <input v-model="resetpassword.repassword" class="input" type="password" placeholder="确认密码" />
      <button class="primary" @tap="resetpasswordSub">重置密码</button>
    </view>

    <view class="agreement" @tap="isRead = !isRead">
      <text class="check" :class="{ active: isRead }">✓</text>
      同意
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
      formData: { mobile: '', code: '' },
      loging_password: '',
      register: { mobile: '', password: '', repassword: '', code: '' },
      resetpassword: { mobile: '', password: '', repassword: '', code: '' },
      is_send: false,
      send_btn_txt: '获取验证码',
      second: 60,
      is_login: 1,
      is_code: false,
      isRead: false,
      sms_open: false,
    }
  },
  onShow() {
    this.getCodeType()
  },
  methods: {
    getCodeType() {
      this._get('index/loginSetting', {}, (res) => {
        this.sms_open = !!(res.data.setting && res.data.setting.h5_sms_open)
        this.is_code = this.sms_open
      })
    },
    submitSuccess(data) {
      if (data.token) uni.setStorageSync('token', data.token)
      if (data.user_id) uni.setStorageSync('user_id', data.user_id)
      this.gotoPage(getCurrentRedirect('/pages/user/index/index'))
    },
    formSubmit() {
      if (!this.isRead) {
        toast('请同意并勾选协议内容')
        return
      }
      if (!mobileValid(this.formData.mobile)) {
        toast('手机有误,请重填！')
        return
      }
      const payload = { mobile: this.formData.mobile }
      let endpoint = 'user.useropen/phonelogin'
      if (this.is_code) {
        if (!this.formData.code) {
          toast('验证码不能为空！')
          return
        }
        payload.code = this.formData.code
        endpoint = 'user.useropen/smslogin'
      } else {
        if (!this.loging_password) {
          toast('密码不能为空！')
          return
        }
        payload.password = this.loging_password
      }
      uni.showLoading({ title: '正在提交' })
      this._post(endpoint, payload, (res) => this.submitSuccess(res.data), false, () => uni.hideLoading())
    },
    registerSub() {
      if (!mobileValid(this.register.mobile)) {
        toast('手机有误,请重填！')
        return
      }
      if (this.sms_open && !this.register.code) {
        toast('验证码不能为空！')
        return
      }
      if (this.register.password.length < 6) {
        toast('密码至少6位数！')
        return
      }
      if (this.register.password !== this.register.repassword) {
        toast('两次密码输入不一致！')
        return
      }
      if (!this.isRead) {
        toast('请同意并勾选协议内容')
        return
      }
      const payload = Object.assign({}, this.register, {
        invitation_id: uni.getStorageSync('invitation_id') || 0,
        reg_source: 'app',
        referee_id: uni.getStorageSync('referee_id'),
      })
      uni.showLoading({ title: '正在提交' })
      this._post(
        'user.useropen/register',
        payload,
        () => {
          uni.showToast({ title: '注册成功' })
          this.formData.mobile = this.register.mobile
          this.register = { mobile: '', password: '', repassword: '', code: '' }
          this.is_login = 1
        },
        false,
        () => uni.hideLoading(),
      )
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
          this.is_login = 1
        },
        false,
        () => uni.hideLoading(),
      )
    },
    isCode() {
      this.is_code = !this.is_code
    },
    sendCode() {
      let mobile = this.formData.mobile
      let type = 'login'
      if (this.is_login === 2) {
        mobile = this.register.mobile
        type = 'register'
      }
      if (this.is_login === 0) mobile = this.resetpassword.mobile
      if (!mobileValid(mobile)) {
        toast('手机有误,请重填！')
        return
      }
      this._post('user.useropen/sendCode', { mobile, type }, (res) => {
        if (res.code === 1) {
          uni.showToast({ title: '发送成功' })
          this.is_send = true
          this.changeMsg()
        }
      })
    },
    xieyi(type) {
      this.gotoPage(type === 'service' ? '/pages/agreement/service' : '/pages/agreement/privacy')
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
.open-login { min-height: 100vh; padding: 48rpx; background: #fff; box-sizing: border-box; }
.tabs { display: flex; margin-bottom: 40rpx; border-bottom: 1px solid #eee; }
.tabs view { flex: 1; height: 88rpx; line-height: 88rpx; text-align: center; color: #777; font-size: 30rpx; }
.tabs .active { color: #111; font-weight: 600; border-bottom: 4rpx solid #19ad57; }
.panel { display: flex; flex-direction: column; gap: 22rpx; }
.input { height: 88rpx; padding: 0 24rpx; background: #f7f7f7; border-radius: 8rpx; font-size: 28rpx; box-sizing: border-box; }
.code-row { display: flex; gap: 18rpx; align-items: center; }
.flex { flex: 1; }
button { border-radius: 8rpx; }
.code-btn { width: 210rpx; height: 88rpx; line-height: 88rpx; font-size: 26rpx; color: #19ad57; background: #eef8f2; }
.switch { color: #666; background: #f7f7f7; font-size: 26rpx; }
.primary { color: #fff; background: #19ad57; }
.agreement { margin-top: 36rpx; color: #666; font-size: 24rpx; line-height: 40rpx; text-align: center; }
.check { display: inline-flex; align-items: center; justify-content: center; width: 30rpx; height: 30rpx; margin-right: 8rpx; border: 1px solid #bbb; border-radius: 50%; color: transparent; font-size: 20rpx; }
.check.active { color: #fff; background: #19ad57; border-color: #19ad57; }
.link { color: #1d7afc; }
</style>
