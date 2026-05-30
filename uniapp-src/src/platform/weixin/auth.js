import { promisifyApi } from './runtime'

export function login(options = {}) {
  return promisifyApi('login', options, { preferUni: true })
}

export function checkSession(options = {}) {
  return promisifyApi('checkSession', options)
}

export function getSetting(options = {}) {
  return promisifyApi('getSetting', options, { preferUni: true })
}

export function authorize(scope, options = {}) {
  return promisifyApi('authorize', { ...options, scope }, { preferUni: true })
}

export function openSetting(options = {}) {
  return promisifyApi('openSetting', options, { preferUni: true })
}

export function getUserProfile(options = {}) {
  return promisifyApi('getUserProfile', options)
}

export function getUserInfo(options = {}) {
  return promisifyApi('getUserInfo', options, { preferUni: true })
}

export function normalizePhoneNumberEvent(event) {
  const detail = event && event.detail ? event.detail : event
  if (!detail || detail.errMsg !== 'getPhoneNumber:ok') {
    const error = new Error((detail && detail.errMsg) || 'getPhoneNumber failed')
    error.detail = detail
    throw error
  }

  return {
    code: detail.code || '',
    encryptedData: detail.encryptedData || '',
    iv: detail.iv || '',
    cloudID: detail.cloudID || '',
    detail,
  }
}

export function normalizeAvatarEvent(event) {
  const detail = event && event.detail ? event.detail : event
  return {
    avatarUrl: detail && detail.avatarUrl ? detail.avatarUrl : '',
    detail,
  }
}
