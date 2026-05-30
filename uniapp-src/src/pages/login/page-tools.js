import { login as weixinLogin, normalizePhoneNumberEvent } from '../../platform/weixin/index.js'

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
