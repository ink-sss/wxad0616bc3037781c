<template>
  <view class="anchor-page" :data-theme="theme && theme()">
    <image class="logo" mode="aspectFit" :src="setting.login_logo || config.pic_url + '/live/default_logo.jpeg'" />
    <view class="name">{{ setting.name || '主播登录' }}</view>
    <input v-model="formData.mobile" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
    <input v-model="formData.password" class="input" type="password" placeholder="请输入密码" />
    <button class="primary" :loading="submitting" @tap="formSubmit">登录</button>
    <button v-if="isFromIndex" class="ghost" @tap="createAccount">创建账号</button>
    <button class="ghost" @tap="goLiveList">返回直播列表</button>
  </view>
</template>

<script>
import { mobileValid, saveLoginSession, toast } from './page-tools.js'

export default {
  data() {
    return {
      formData: { mobile: '', password: '' },
      setting: { name: '', login_logo: '' },
      isFromIndex: false,
      submitting: false,
    }
  },
  onLoad(query = {}) {
    this.isFromIndex = query.from === 'index'
    const app = getApp()
    const setting = uni.getStorageSync('setting_' + ((app && app.globalData && app.globalData.app_id) || ''))
    if (setting) this.setting = setting
    uni.hideShareMenu()
  },
  methods: {
    createAccount() {
      uni.setStorageSync('auto_open_add_streamer', true)
      uni.navigateBack()
    },
    goLiveList() {
      uni.reLaunch({ url: '/pages/live-push/live-list' })
    },
    formSubmit() {
      if (!mobileValid(this.formData.mobile)) {
        toast('手机有误,请重填！')
        return
      }
      if (!this.formData.password) {
        toast('密码不能为空！')
        return
      }
      this.submitting = true
      uni.showLoading({ title: '正在提交' })
      this._post(
        'user.user/anchorLogin',
        this.formData,
        (res) => {
          saveLoginSession(res.data)
          const app = getApp()
          if (app && typeof app.imLogout === 'function') app.imLogout(() => app.imLogin && app.imLogin())
          uni.showToast({ title: res.msg || '登录成功', icon: 'success' })
          setTimeout(() => uni.reLaunch({ url: '/pages/live-push/live-list' }), 1000)
        },
        false,
        () => {
          this.submitting = false
          uni.hideLoading()
        },
      )
    },
  },
}
</script>

<style scoped>
.anchor-page { min-height: 100vh; padding: 80rpx 44rpx; background: #fff; box-sizing: border-box; }
.logo { display: block; width: 150rpx; height: 150rpx; margin: 0 auto 24rpx; border-radius: 24rpx; }
.name { margin-bottom: 48rpx; text-align: center; font-size: 34rpx; font-weight: 600; }
.input { height: 88rpx; margin-bottom: 24rpx; padding: 0 24rpx; background: #f7f7f7; border-radius: 8rpx; font-size: 28rpx; box-sizing: border-box; }
button { margin-top: 24rpx; border-radius: 8rpx; }
.primary { color: #fff; background: #19ad57; }
.ghost { color: #666; background: #f6f6f6; }
</style>
