import { login as weixinLogin, normalizePhoneNumberEvent } from '../../platform/weixin/index.js'
import { bindMobileMiniProgram, loginMiniProgram } from '../../api/miniprogram-login.js'
import { loginAndRedirectWithMiniProgramWechat } from '../../services/h5-auth.js'
import {
  buildH5AuthContext,
  getCurrentPageUrl,
  hasH5Token,
  redirectAfterNativeLogin,
  redirectAfterH5LoginSkipped,
  saveH5AuthContext,
  syncH5AuthSession,
} from '../../services/h5-auth-context.js'

export function toast(title) {
  uni.showToast({ title, icon: 'none' })
}

export function getCurrentRedirect(defaultUrl = '/pages/user/index/index') {
  const route = uni.getStorageSync('currentPage')
  const options = uni.getStorageSync('currentPageOptions') || {}
  if (!route) return defaultUrl

  const query = Object.keys(options)
    .map((key) => `${key}=${encodeURIComponent(options[key])}`)
    .join('&')

  return `/${route}${query ? `?${query}` : ''}`
}

export function saveLoginSession(data = {}) {
  syncH5AuthSession(data)

  if (data.token) uni.setStorageSync('token', data.token)
  if (data.user_id) uni.setStorageSync('user_id', data.user_id)
  if (data.shop_supplier_id) uni.setStorageSync('shop_supplier_id', data.shop_supplier_id)

  const app = getApp()
  if (app && app.globalData) {
    app.globalData.is_login = true
    app.globalData.imUserId = data.im_user_id || app.globalData.imUserId
    app.globalData.imUserSig = data.im_user_sig || app.globalData.imUserSig
  }

  if (app && typeof app.imLogin === 'function') app.imLogin()
}

export function pluginUserInfo(event = {}) {
  return (
    event?.detail?.detail?.userInfo ||
    event?.detail?.userInfo ||
    event?.userInfo ||
    {}
  )
}

export function loginWithWechatPluginProfile(vm, event = {}) {
  const userInfo = pluginUserInfo(event)
  const profile = {
    nickName: userInfo.nickName || userInfo.nickname || '',
    nickname: userInfo.nickname || userInfo.nickName || '',
    avatarUrl: userInfo.avatarUrl || userInfo.avatar || '',
    avatar: userInfo.avatar || userInfo.avatarUrl || '',
  }

  return loginCode().then((code) => loginMiniProgram({
    code,
    nickName: profile.nickName,
    avatarUrl: profile.avatarUrl,
  })).then((data = {}) => {
    if (!data.token) throw new Error('登录接口未返回 token')
    const session = { ...profile, ...data }
    saveLoginSession(session)
    return session
  })
}

export function buildLoginContext(query = {}, fallback = '/pages/center/index') {
  const redirect = query.redirect || getCurrentRedirect(fallback) || getCurrentPageUrl(fallback)
  return saveH5AuthContext(buildH5AuthContext({ ...query, redirect }))
}

export function alreadyH5LoggedIn() {
  return hasH5Token()
}

export function redirectAfterExistingH5Login(context = {}) {
  redirectAfterNativeLogin()
}

export function redirectAfterSkippedH5Login(context = {}) {
  redirectAfterH5LoginSkipped(context)
}

export function saveH5LoginSession(data = {}) {
  return syncH5AuthSession(data)
}

export function h5MiniWechatLogin(context = {}) {
  return loginAndRedirectWithMiniProgramWechat(context)
}

export function loginCode() {
  return weixinLogin({ provider: 'weixin' }).then((res) => res.code)
}

export function phonePayload(event) {
  const phone = normalizePhoneNumberEvent(event)
  return {
    encrypted_data: phone.encryptedData,
    iv: phone.iv,
    code: phone.code,
  }
}

export function bindMiniProgramMobile(userId, event) {
  if (!userId) return Promise.reject(new Error('缺少用户 ID，请重新登录'))
  const detail = phonePayload(event)

  return loginCode().then((code) => bindMobileMiniProgram({
    code,
    user_id: userId,
    encrypted_data: detail.encrypted_data,
    iv: detail.iv,
  }))
}

export function mobileValid(mobile) {
  return /^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile || '')
}
