import { h5Post } from './h5.js'
import { getRuntimeConfig } from '../utils/runtime-config.js'

export const MINIPROGRAM_LOGIN_APP_ID = 'wx9ea83e805b82f59d'
const OPEN_ID_KEYS = ['mini_program_open_id', 'open_id', 'openId', 'openid']
const UNION_ID_KEYS = ['mini_program_union_id', 'union_id', 'unionId', 'unionid', 'wechatUnionid']
const IM_USER_ID_KEYS = ['im_user_id', 'imUserId']
const IM_USER_SIG_KEYS = ['im_user_sig', 'imUserSig']

export function getMiniProgramAppId() {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.miniprogram_appid || runtimeConfig.appid) return runtimeConfig.miniprogram_appid || runtimeConfig.appid

  try {
    const stored = uni.getStorageSync('miniprogram_app_id')
    if (stored) return stored
  } catch (error) {}

  try {
    const accountInfo =
      typeof wx !== 'undefined' && typeof wx.getAccountInfoSync === 'function'
        ? wx.getAccountInfoSync()
        : null
    const runtimeAppId = accountInfo?.miniProgram?.appId
    if (runtimeAppId) return runtimeAppId
  } catch (error) {
    // Fall through to configured values for non-mp-weixin contexts.
  }

  return MINIPROGRAM_LOGIN_APP_ID
}

export function getShopSupplierId() {
  const app = getApp()
  const value = app?.globalData?.shop_supplier_id || uni.getStorageSync('shop_supplier_id') || 0
  const id = Number(value)
  return Number.isFinite(id) ? id : 0
}

export function getStoredMiniProgramOpenId() {
  try {
    for (const key of OPEN_ID_KEYS) {
      const value = uni.getStorageSync(key)
      if (value) return value
    }
  } catch (error) {}
  return ''
}

export function getStoredMiniProgramUnionId() {
  try {
    for (const key of UNION_ID_KEYS) {
      const value = uni.getStorageSync(key)
      if (value) return value
    }
  } catch (error) {}
  return ''
}

export function persistMiniProgramOpenId(openId) {
  if (!openId) return ''
  try {
    OPEN_ID_KEYS.forEach((key) => uni.setStorageSync(key, openId))
  } catch (error) {}
  try {
    const app = getApp()
    if (app?.globalData) {
      app.globalData.open_id = openId
      app.globalData.openId = openId
    }
  } catch (error) {}
  return openId
}

export function persistMiniProgramUnionId(unionId) {
  if (!unionId) return ''
  try {
    UNION_ID_KEYS.forEach((key) => uni.setStorageSync(key, unionId))
  } catch (error) {}
  try {
    const app = getApp()
    if (app?.globalData) {
      app.globalData.union_id = unionId
      app.globalData.unionId = unionId
      app.globalData.wechatUnionid = unionId
    }
  } catch (error) {}
  return unionId
}

export function persistMiniProgramLoginSession(data = {}) {
  const openId = data.open_id || data.openId || data.openid || ''
  persistMiniProgramOpenId(openId)
  const unionId = data.union_id || data.unionId || data.unionid || data.wechatUnionid || ''
  persistMiniProgramUnionId(unionId)
  const imUserId = data.im_user_id || data.imUserId || ''
  const imUserSig = data.im_user_sig || data.imUserSig || ''
  try {
    if (imUserId) IM_USER_ID_KEYS.forEach((key) => uni.setStorageSync(key, imUserId))
    if (imUserSig) IM_USER_SIG_KEYS.forEach((key) => uni.setStorageSync(key, imUserSig))
  } catch (error) {}
  try {
    const app = getApp()
    if (app?.globalData) {
      if (imUserId) app.globalData.imUserId = imUserId
      if (imUserSig) app.globalData.imUserSig = imUserSig
    }
  } catch (error) {}
  return data
}

export function buildMiniProgramLoginPayload(payload = {}) {
  return {
    app_id: getMiniProgramAppId(),
    shop_supplier_id: getShopSupplierId(),
    ...payload,
  }
}

export function preLoginMiniProgram(payload = {}) {
  const data = buildMiniProgramLoginPayload(payload)
  console.log('[MiniProgramLogin] POST /h5/miniprogram/preLogin', {
    app_id: data.app_id,
    shop_supplier_id: data.shop_supplier_id,
    hasCode: !!data.code,
  })
  return h5Post('/h5/miniprogram/preLogin', data, {
    authRedirect: false,
  }).then(persistMiniProgramLoginSession)
}

export function loginMiniProgram(payload = {}) {
  const data = buildMiniProgramLoginPayload(payload)
  console.log('[MiniProgramLogin] POST /h5/miniprogram/login', {
    app_id: data.app_id,
    shop_supplier_id: data.shop_supplier_id,
    hasCode: !!data.code,
    hasNickName: !!data.nickName,
    hasAvatarUrl: !!data.avatarUrl,
  })
  return h5Post('/h5/miniprogram/login', data, {
    authRedirect: false,
  }).then(persistMiniProgramLoginSession)
}

export function bindMobileMiniProgram(payload = {}) {
  return h5Post('/h5/miniprogram/bindMobile', {
    app_id: getMiniProgramAppId(),
    ...payload,
  }, {
    authRedirect: false,
  }).then(persistMiniProgramLoginSession)
}
