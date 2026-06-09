import { fetchLoginSetting, reportMiniProgramVersion } from '@/api/login.js'
import { getAccountInfo } from '@/platform/weixin/account.js'
import { getRuntimeConfig } from '@/utils/runtime-config.js'
import { normalizeLiveRouteOptions } from '@/utils/live-route.js'
import { saveLiveRoomContext } from '@/utils/live-room-context.js'

function safeGetApp() {
  try {
    return typeof getApp === 'function' ? getApp() : null
  } catch (error) {
    return null
  }
}

function safeSetStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (error) {}
}

function safeRemoveStorage(key) {
  try {
    uni.removeStorageSync(key)
  } catch (error) {}
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return ''
}

function resolveLaunchQuery(options = {}) {
  if (options?.query && typeof options.query === 'object') return options.query
  return options && typeof options === 'object' ? options : {}
}

function resolveAppId(accountInfo = null) {
  const runtimeConfig = getRuntimeConfig()
  return (
    accountInfo?.miniProgram?.appId ||
    runtimeConfig.appid ||
    runtimeConfig.miniprogram_appid ||
    ''
  )
}

function resolveConfiguredAppId() {
  const runtimeConfig = getRuntimeConfig()
  return runtimeConfig.app_id || runtimeConfig.appid || runtimeConfig.miniprogram_appid || ''
}

function getGlobalData(app) {
  const runtimeApp = app || safeGetApp()
  if (!runtimeApp) return null
  if (!runtimeApp.globalData) runtimeApp.globalData = {}
  return runtimeApp.globalData
}

export function persistMiniProgramStartupScene(options = {}, app) {
  const query = resolveLaunchQuery(options)
  const normalized = normalizeLiveRouteOptions(query)
  const globalData = getGlobalData(app)
  const refereeId = firstValue(normalized, 'referee_id', 'uid')
  const liveId = firstValue(normalized, 'liveId', 'live_id', 'roomId', 'room_id')
  const shopSupplierId = firstValue(normalized, 'shop_supplier_id', 'shopSupplierId', 'supplier_id')

  if (refereeId) safeSetStorage('referee_id', refereeId)
  if (liveId && globalData) globalData.live_id = liveId
  if (shopSupplierId) {
    safeSetStorage('shop_supplier_id', shopSupplierId)
    if (globalData) globalData.shop_supplier_id = shopSupplierId
  }
  if (!normalized.me) safeRemoveStorage('me')

  if (normalized.roomCode || normalized.liveId || normalized.tenantId || normalized.liveType || normalized._tc) {
    saveLiveRoomContext(normalized)
  }

  return normalized
}

function syncLoginSettingToRuntime(data = {}, app) {
  const setting = data.setting || {}
  const imSetting = data.im_setting || data.imSetting || {}
  const globalData = getGlobalData(app)
  const runtimeConfig = getRuntimeConfig()

  if (globalData) {
    globalData.SDKAppID = imSetting.im_sdk_appid || imSetting.imSdkAppid || globalData.SDKAppID || ''
    globalData.imUserId = imSetting.im_user_id || imSetting.imUserId || globalData.imUserId || ''
    globalData.imUserSig = imSetting.im_user_sig || imSetting.imUserSig || globalData.imUserSig || ''
    globalData.is_login = setting.is_login
    globalData.live_page = setting.live_page || globalData.live_page || '1'
  }

  safeSetStorage('mpState', setting.mp_open)
  safeSetStorage('wxOpen', setting.wx_open)
  safeSetStorage('wxBinding', setting.wx_phone)
  safeSetStorage('smsOpen', setting.h5_sms_open)
  safeSetStorage(`setting_${runtimeConfig.app_id}`, setting)

  return { setting, imSetting, appVersion: data.appVersion || data.app_version || '' }
}

async function updateVersionIfNeeded(appVersion) {
  const accountInfo = getAccountInfo()
  const version = accountInfo?.miniProgram?.version || ''
  if (!version || version === appVersion) return false
  await reportMiniProgramVersion(version, {
    app_id: resolveConfiguredAppId(),
    appid: resolveAppId(accountInfo),
  })
  return true
}

export async function syncMiniProgramLoginSetting(app) {
  const data = await fetchLoginSetting()
  const synced = syncLoginSettingToRuntime(data, app)
  await updateVersionIfNeeded(synced.appVersion).catch(() => false)
  return synced
}

export async function runMiniProgramStartup(options = {}, app) {
  const normalized = persistMiniProgramStartupScene(options, app)
  await syncMiniProgramLoginSetting(app)
  return normalized
}
