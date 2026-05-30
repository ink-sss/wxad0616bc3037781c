<template>
  <view class="login-page" :data-theme="theme && theme()">
    <view class="brand">
      <image class="logo" mode="aspectFit" :src="setting.login_logo || config.pic_url + '/static/live/default_logo.jpeg'" />
      <view class="name">{{ setting.name }}</view>
      <view v-if="setting.login_desc" class="desc">{{ setting.login_desc }}</view>
    </view>

    <view class="actions">
      <button v-if="setting.wx_phone && !mobile" class="primary" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
        微信手机号一键登录
      </button>
      <button v-else class="primary" :loading="submitting" @tap="userLogin">微信一键登录</button>
      <button class="ghost" @tap="onNotLogin">暂不登录</button>
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
import { getCurrentRedirect, loginCode, phonePayload, saveLoginSession, toast } from './page-tools.js'

export default {
  data() {
    return {
      loading: false,
      submitting: false,
      invitation_id: 0,
      user_id: '',
      mobile: true,
      is_login: false,
      isRead: false,
      setting: {
        login_desc: '',
        login_logo: '',
        name: '',
        wx_get_nickname: true,
        wx_phone: false,
        wx_phone_compulsory: false,
      },
    }
  },
  onLoad(query = {}) {
    if (query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
    this.invitation_id = uni.getStorageSync('invitation_id') || 0
    this.getCodeType()
    this.preLogin()
  },
  methods: {
    ensureRead() {
      if (this.isRead) return true
      toast('请勾选并同意《隐私政策》和《用户协议》')
      return false
    },
    getCodeType() {
      this._post('index/loginSetting', {}, (res) => {
        this.setting = Object.assign(this.setting, res.data.setting || {})
      })
    },
    preLogin() {
      loginCode()
        .then((code) => {
          this._post(
            'user.user/login',
            {
              code,
              source: 'wx',
              invitation_id: this.invitation_id,
              referee_id: uni.getStorageSync('referee_id'),
            },
            (res) => {
              this.user_id = res.data.user_id || ''
              this.mobile = res.data.mobile
              this.is_login = res.data.is_login
            },
            false,
            () => {
              this.loading = false
            },
          )
        })
        .catch(() => {
          this.loading = false
        })
    },
    afterLogin(data) {
      saveLoginSession(data)
      if (this.setting.wx_phone && !this.mobile) {
        uni.setStorageSync('get_phone', true)
        uni.setStorageSync('wx_phone_compulsory', this.setting.wx_phone_compulsory)
      }
      uni.redirectTo({ url: getCurrentRedirect('/pages/user/index/index') })
    },
    userLogin() {
      if (!this.ensureRead() || this.submitting) return
      this.submitting = true
      uni.showLoading({ title: '正在处理', mask: true })
      loginCode()
        .then((code) => {
          this._post(
            'user.user/userLogin',
            {
              code,
              shop_supplier_id: getApp().globalData && getApp().globalData.shop_supplier_id,
            },
            (res) => this.afterLogin(res.data),
            false,
            () => {
              this.submitting = false
              uni.hideLoading()
            },
          )
        })
        .catch(() => {
          this.submitting = false
          uni.hideLoading()
          toast('授权失败，请重新登录')
        })
    },
    getPhoneNumber(event) {
      if (!this.ensureRead() || this.submitting) return
      let detail
      try {
        detail = phonePayload(event)
      } catch (error) {
        toast('授权失败，请重新登录')
        return
      }

      this.submitting = true
      uni.showLoading({ title: '正在处理', mask: true })
      loginCode().then((code) => {
        this._post(
          'user.user/bindMobile',
          {
            code,
            user_id: this.user_id,
            encrypted_data: detail.encrypted_data,
            iv: detail.iv,
          },
          (res) => this.afterLogin(res.data),
          false,
          () => {
            this.submitting = false
            uni.hideLoading()
          },
        )
      })
    },
    xieyi(type) {
      this.gotoPage('/pages/webview/ue?type=' + type)
    },
    onNotLogin() {
      this.gotoPage('/pages/index/index')
    },
  },
}
</script>

<style scoped>
.login-page { min-height: 100vh; padding: 96rpx 48rpx; background: #f7f7f7; box-sizing: border-box; }
.brand { display: flex; flex-direction: column; align-items: center; margin-bottom: 80rpx; color: #333; }
.logo { width: 156rpx; height: 156rpx; border-radius: 28rpx; background: #fff; }
.name { margin-top: 28rpx; font-size: 34rpx; font-weight: 600; }
.desc { margin-top: 16rpx; font-size: 26rpx; color: #777; text-align: center; }
.actions { display: flex; flex-direction: column; gap: 24rpx; }
button { border-radius: 8rpx; font-size: 30rpx; }
.primary { color: #fff; background: #19ad57; }
.ghost { color: #666; background: transparent; }
.agreement { margin-top: 32rpx; color: #666; font-size: 24rpx; text-align: center; line-height: 40rpx; }
.check { display: inline-flex; align-items: center; justify-content: center; width: 30rpx; height: 30rpx; margin-right: 8rpx; border: 1px solid #bbb; border-radius: 50%; color: transparent; font-size: 20rpx; }
.check.active { color: #fff; background: #19ad57; border-color: #19ad57; }
.link { color: #1d7afc; }
</style>
