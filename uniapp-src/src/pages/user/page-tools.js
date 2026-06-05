import { login as weixinLogin, normalizePhoneNumberEvent, requestMerchantTransfer } from '../../platform/weixin/index.js'
import { bindMobileMiniProgram, persistMiniProgramLoginSession } from '../../api/miniprogram-login.js'

export function toast(title) {
  uni.showToast({ title, icon: 'none' })
}

export function mobileValid(mobile) {
  return /^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile || '')
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

export function saveLoginSession(data = {}) {
  persistMiniProgramLoginSession(data)
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

export function requestTransfer(params) {
  return requestMerchantTransfer(params)
}

export function normalizeListPage(payload = {}) {
  const list = payload.list || payload
  if (Array.isArray(list)) {
    return {
      rows: list,
      currentPage: 1,
      lastPage: 1,
    }
  }

  return {
    rows: Array.isArray(list.data) ? list.data : [],
    currentPage: Number(list.current_page || 1),
    lastPage: Number(list.last_page || 1),
  }
}

export function dateText(value) {
  const text = String(value || '').trim()
  return text.length >= 10 ? text.slice(0, 10) : text
}
