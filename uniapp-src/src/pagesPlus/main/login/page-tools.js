import { login as weixinLogin, normalizePhoneNumberEvent } from '../../../platform/weixin/index.js'
import {
  bindMobileMiniProgram,
  loginMiniProgram,
  persistMiniProgramLoginSession,
} from '../../../api/miniprogram-login.js'
import { loginAndRedirectWithMiniProgramWechat } from '../../../services/h5-auth.js'
import {
  buildH5AuthContext,
  getCurrentPageUrl,
  hasH5Token,
  redirectAfterNativeLogin,
  redirectAfterH5LoginSkipped,
  saveNativeLoginRedirectFromQuery,
  saveH5AuthContext,
  syncH5AuthSession,
} from '../../../services/h5-auth-context.js'

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

export function pluginUserInfo(event = {}) {
  return (
    event?.detail?.detail?.userInfo ||
    event?.detail?.userInfo ||
    event?.userInfo ||
    {}
  )
}

export function pluginLoginCode(event = {}) {
  return event?.detail?.detail?.code || event?.detail?.code || event?.code || ''
}

const DEVTOOLS_PROFILE = {
  nickName: 'ink',
  nickname: 'ink',
  avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/g6IhnkVoZ0pBaoe9Z4FXyIwZJS922PoYQiay9tZiaExCibdxOJuRkSkiaubqxbx3Rib1uOGSUyOlNUg9QkBFGM5dP8w/132',
  avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/g6IhnkVoZ0pBaoe9Z4FXyIwZJS922PoYQiay9tZiaExCibdxOJuRkSkiaubqxbx3Rib1uOGSUyOlNUg9QkBFGM5dP8w/132',
}

const DEVTOOLS_LOGIN_SESSION = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcklkIjo4NzQsInRlbmFudElkIjoxNSwib3BlbklkIjoib3QtRm4zWjRyMmUwaU42VXB1VGwxTUdVeXNnOCIsInVuaW9uSWQiOiIiLCJwaG9uZSI6IiIsIm5pY2tuYW1lIjoiaW5rIiwiYnVmZmVyVGltZSI6ODY0MDAsImlzcyI6InFtUGx1cyIsImF1ZCI6WyJINSJdLCJleHAiOjE3ODEzMTkyNzMsIm5iZiI6MTc4MDcxNDQ3M30.fAC4f3PLC9RmmZSroauQ3V9Wfjf3HmTlrSVJcM6QG_Y',
  user_id: 874,
  open_id: 'ot-Fn3Z4r2e0iN6UpuTl1MGUysg8',
  im_user_id: 'customer_874',
  im_user_sig: 'YWMtC7JZFGFTEfGl5qtxAIs4lxDcftnmIkpPnhC-J8NjAz5dDO8QYVER8b-J5xmES75EAwMAAAGemtqGyQABUYC25uR8ZjJfZn7jKdGZSv4KAqure6IJNcH7iqREAYhGPg',
  shop_supplier_id: 15,
  msg: '登录成功',
}

export function loginWithWechatDevtoolsProfile() {
  const session = { ...DEVTOOLS_PROFILE, ...DEVTOOLS_LOGIN_SESSION }
  if (!session.token) return Promise.reject(new Error('登录接口未返回 token'))

  console.log('[MiniProgramLogin] devtools login reused session', {
    hasToken: !!session.token,
    user_id: session.user_id || '',
    hasImUser: !!session.im_user_id,
  })
  saveLoginSession(session)
  return Promise.resolve(session)
}

function resolvePluginLoginCode(event = {}) {
  const fallbackCode = pluginLoginCode(event)
  return loginCode().catch((error) => {
    if (fallbackCode) {
      console.warn('[MiniProgramLogin] wx.login failed, fallback to plugin code', error)
      return fallbackCode
    }
    throw error
  })
}

export function loginWithWechatPluginProfile(vm, event = {}) {
  const userInfo = pluginUserInfo(event)
  const code = pluginLoginCode(event)
  const profile = {
    nickName: userInfo.nickName || userInfo.nickname || '',
    nickname: userInfo.nickname || userInfo.nickName || '',
    avatarUrl: userInfo.avatarUrl || userInfo.avatar || '',
    avatar: userInfo.avatar || userInfo.avatarUrl || '',
  }

  console.log('[MiniProgramLogin] plugin loginSuccess payload', {
    hasPluginCode: !!code,
    hasNickName: !!profile.nickName,
    hasAvatarUrl: !!profile.avatarUrl,
  })

  return resolvePluginLoginCode(event).then((loginCodeValue) => loginMiniProgram({
    code: loginCodeValue,
    nickName: profile.nickName,
    avatarUrl: profile.avatarUrl,
  })).then((data = {}) => {
    if (!data.token) throw new Error('登录接口未返回 token')
    console.log('[MiniProgramLogin] /h5/miniprogram/login success', {
      hasToken: !!data.token,
      user_id: data.user_id || '',
      hasImUser: !!data.im_user_id,
    })
    const session = { ...profile, ...data }
    saveLoginSession(session)
    return session
  })
}

export function buildLoginContext(query = {}, fallback = '/pagesPlus/main/center/index') {
  saveNativeLoginRedirectFromQuery(query)
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
