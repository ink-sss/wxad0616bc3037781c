import { login as weixinLogin, normalizePhoneNumberEvent } from '../../platform/weixin/index.js'
import { loginAndRedirectWithMiniProgramWechat } from '../../services/h5-auth.js'
import {
  buildH5AuthContext,
  getCurrentPageUrl,
  hasH5Token,
  redirectAfterH5Login,
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
  if (!vm || typeof vm._post !== 'function') {
    return Promise.reject(new Error('登录组件未初始化'))
  }

  const userInfo = pluginUserInfo(event)

  return loginCode().then((code) => new Promise((resolve, reject) => {
    const app = getApp()
    let settled = false
    vm._post(
      'user.user/userLogin',
      {
        code,
        shop_supplier_id: app?.globalData?.shop_supplier_id || uni.getStorageSync('shop_supplier_id') || '',
        nickName: userInfo.nickName || userInfo.nickname || '',
        avatarUrl: userInfo.avatarUrl || userInfo.avatar || '',
      },
      (res) => {
        settled = true
        const data = res?.data || {}
        if (!data.token) {
          reject(new Error('登录接口未返回 token'))
          return
        }
        saveLoginSession(data)
        resolve(data)
      },
      (error) => {
        settled = true
        reject(error)
      },
      () => {
        if (!settled) reject(new Error('授权失败，请重新登录'))
      },
    )
  }))
}

export function buildLoginContext(query = {}, fallback = '/pages/center/index') {
  const redirect = query.redirect || getCurrentRedirect(fallback) || getCurrentPageUrl(fallback)
  return saveH5AuthContext(buildH5AuthContext({ ...query, redirect }))
}

export function alreadyH5LoggedIn() {
  return hasH5Token()
}

export function redirectAfterExistingH5Login(context = {}) {
  redirectAfterH5Login(context)
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

export function mobileValid(mobile) {
  return /^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile || '')
}
