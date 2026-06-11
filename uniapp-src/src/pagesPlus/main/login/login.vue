<template>
  <view class="login-page" :data-theme="theme && theme()">
    <view class="brand" @click="handleShowPageSpy">
      <image class="logo" mode="aspectFit" :src="setting.login_logo || config.pic_url + '/live/default_logo.jpeg'" />
      <view class="name">{{ setting.name }}</view>
      <view v-if="setting.login_desc" class="desc">{{ setting.login_desc }}</view>
    </view>

    <view class="actions">
      <!-- #ifdef MP-WEIXIN -->
      <button v-if="showDevtoolsLogin" class="primary" :loading="submitting" @tap="devtoolsLogin">开发者工具登录</button>
      <wechat-login
        bottomText="立即登录"
        styleCon="color: #ffffff;background-color: green;"
        @loginSuccess="pluginLoginSuccess"
        @loginFail="pluginLoginFail"
        @loginCancel="pluginLoginCancel"
      />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <button class="primary" :loading="submitting" @tap="userLogin">微信一键登录</button>
      <!-- #endif -->
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
import {
  alreadyH5LoggedIn,
  buildLoginContext,
  h5MiniWechatLogin,
  loginCode,
  loginWithWechatDevtoolsProfile,
  loginWithWechatPluginProfile,
  redirectAfterExistingH5Login,
  redirectAfterSkippedH5Login,
  toast,
} from './page-tools.js'
import { fetchLoginSetting } from '../../../api/login.js'
import { preLoginMiniProgram } from '../../../api/miniprogram-login.js'

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
      showDevtoolsLogin: false,
      setting: {
        login_desc: '',
        login_logo: '',
        name: '',
        wx_get_nickname: true,
        wx_phone: false,
        wx_phone_compulsory: false,
      },
      loginContext: {},
      leavingWithAuthRedirect: false,
    }
  },
  onLoad(query = {}) {
    if (query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
    this.invitation_id = uni.getStorageSync('invitation_id') || 0
    this.loginContext = buildLoginContext(query, '/pagesPlus/main/center/index')
    this.showDevtoolsLogin = this.isWechatDevtools()
    this.getCodeType()
    this.loadWechatLoginStatus()
    this.redirectWhenAlreadyLoggedIn()
  },
  methods: {
    goHomeFromLogin() {
      this.leavingWithAuthRedirect = true
      redirectAfterSkippedH5Login(this.loginContext)
    },
    isWechatDevtools() {
      try {
        const info = uni.getSystemInfoSync()
        return info && info.platform === 'devtools'
      } catch (error) {
        return false
      }
    },
    ensureRead() {
      if (this.isRead) return true
      toast('请勾选并同意《隐私政策》和《用户协议》')
      return false
    },
    getCodeType() {
      fetchLoginSetting()
        .then((data) => {
          this.setting = Object.assign(this.setting, data.setting || {})
        })
        .catch((error) => {
          console.warn('[MiniProgramLogin] loginSetting failed', error)
        })
    },
    loadWechatLoginStatus() {
      this.loading = true
      loginCode()
        .then((code) => preLoginMiniProgram({
          code,
          source: 'wx',
          invitation_id: this.invitation_id,
          referee_id: uni.getStorageSync('referee_id') || '',
        }))
        .then((data = {}) => {
          this.user_id = data.user_id || ''
          this.mobile = data.mobile !== undefined ? data.mobile : true
          this.is_login = !!data.is_login
          if (data.user_id) uni.setStorageSync('user_id', data.user_id)
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    redirectWhenAlreadyLoggedIn() {
      if (!alreadyH5LoggedIn()) return
      this.leavingWithAuthRedirect = true
      redirectAfterExistingH5Login(this.loginContext)
    },
    afterLogin(data) {
      if (this.setting.wx_phone && !this.mobile) {
        uni.setStorageSync('get_phone', true)
        uni.setStorageSync('wx_phone_compulsory', this.setting.wx_phone_compulsory)
      }
      this.leavingWithAuthRedirect = true
      redirectAfterExistingH5Login(this.loginContext)
    },
    async devtoolsLogin() {
      if (!this.ensureRead() || this.submitting) return
      this.submitting = true
      uni.showLoading({ title: '正在处理', mask: true })
      try {
        console.log('[MiniProgramLogin] devtools login handler')
        const data = await loginWithWechatDevtoolsProfile()
        this.afterLogin(data)
      } catch (error) {
        console.error('[MiniProgramLogin] devtools login failed', error)
        const message = error?.message || error?.msg || '授权失败，请重新登录'
        toast(message)
      } finally {
        this.submitting = false
        uni.hideLoading()
      }
    },
    async pluginLoginSuccess(event) {
      if (!this.ensureRead() || this.submitting) return
      this.submitting = true
      uni.showLoading({ title: '正在处理', mask: true })
      try {
        const data = await loginWithWechatPluginProfile(this, event)
        this.afterLogin(data)
      } catch (error) {
        console.error('[MiniProgramLogin] plugin login failed', error)
        const message = error?.message || error?.msg || '授权失败，请重新登录'
        toast(message)
      } finally {
        this.submitting = false
        uni.hideLoading()
      }
    },
    pluginLoginFail(error) {
      toast('授权失败，请重新登录')
    },
    pluginLoginCancel(error) {
      toast('授权失败，请重新登录')
    },
    async userLogin() {
      if (!this.ensureRead() || this.submitting) return
      this.submitting = true
      uni.showLoading({ title: '正在处理', mask: true })
      this.leavingWithAuthRedirect = true
      try {
        await h5MiniWechatLogin(this.loginContext)
      } catch (error) {
        this.leavingWithAuthRedirect = false
        const message = error?.message || error?.msg || '授权失败，请重新登录'
        toast(message)
      } finally {
        this.submitting = false
        uni.hideLoading()
      }
    },
    getPhoneNumber(event) {
      this.userLogin(event)
    },
    xieyi(type) {
      this.gotoPage(type === 'service' ? '/pages/agreement/service' : '/pages/agreement/privacy')
    },
    onNotLogin() {
      this.goHomeFromLogin()
    },
  },
  onBackPress() {
    this.goHomeFromLogin()
    return true
  },
  onUnload() {
    if (this.leavingWithAuthRedirect) return
    this.goHomeFromLogin()
  },
}
</script>
<script setup>
  import {  getCurrentInstance } from 'vue'
  const instance = getCurrentInstance()

  const $pageSpy = instance?.appContext.config.globalProperties.$pageSpy
 const handleShowPageSpy = () => {
  console.log($pageSpy && typeof $pageSpy.showPanel === 'function','$pageSpy');
  
  if ($pageSpy && typeof $pageSpy.showPanel === 'function') $pageSpy.showPanel()
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
