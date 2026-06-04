import { h5Post } from './h5.js'
import { config } from '../env/config.js'

export const MINIPROGRAM_LOGIN_APP_ID = 'wx43134e071b752953'

export function getMiniProgramAppId() {
  try {
    const stored = uni.getStorageSync('miniprogram_login_app_id') || uni.getStorageSync('miniprogram_app_id')
    if (stored) return stored
  } catch (error) {}

  if (config.miniprogram_login_app_id) return config.miniprogram_login_app_id

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

  return config.miniprogram_appid || config.appid || MINIPROGRAM_LOGIN_APP_ID
}

export function getShopSupplierId() {
  const app = getApp()
  return app?.globalData?.shop_supplier_id || uni.getStorageSync('shop_supplier_id') || ''
}

export function buildMiniProgramLoginPayload(payload = {}) {
  return {
    app_id: getMiniProgramAppId(),
    shop_supplier_id: getShopSupplierId(),
    ...payload,
  }
}

export function preLoginMiniProgram(payload = {}) {
  return h5Post('/h5/miniprogram/preLogin', buildMiniProgramLoginPayload(payload), {
    authRedirect: false,
  })
}

export function loginMiniProgram(payload = {}) {
  return h5Post('/h5/miniprogram/login', buildMiniProgramLoginPayload(payload), {
    authRedirect: false,
  })
}

export function bindMobileMiniProgram(payload = {}) {
  return h5Post('/h5/miniprogram/bindMobile', {
    app_id: getMiniProgramAppId(),
    ...payload,
  }, {
    authRedirect: false,
  })
}
