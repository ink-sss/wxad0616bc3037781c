import { config } from '../env/config.js'
import { handleH5Unauthorized } from '../services/h5-auth-context.js'

function getStorageToken() {
  try {
    return uni.getStorageSync('h5_token') || uni.getStorageSync('token') || ''
  } catch (error) {
    return ''
  }
}

function getStorageH5ApiBaseUrl() {
  try {
    return (
      uni.getStorageSync('h5_api_base_url') ||
      uni.getStorageSync('h5ApiBaseUrl') ||
      uni.getStorageSync('mp_h5_api_base_url') ||
      ''
    )
  } catch (error) {
    return ''
  }
}

function isMissingControllerResponse(body) {
  if (!body || typeof body !== 'object') return false
  const message = String(body.msg || body.message || '')
  return !body.data && /controller\s+not\s+exists/i.test(message)
}

export function getH5Token() {
  return getStorageToken()
}

export function getH5ApiBaseUrl() {
  const explicit = getStorageH5ApiBaseUrl() || config.h5_api_url || config.h5_url
  const base = explicit || `${config.app_url}/api`
  return String(base).replace(/\/$/, '')
}

function normalizeUrl(url = '') {
  if (/^https?:\/\//i.test(url)) return url
  const path = url.startsWith('/') ? url : `/${url}`
  return `${getH5ApiBaseUrl()}${path}`
}

export function h5Request(options = {}) {
  const { url, method = 'GET', data = {}, header = {}, timeout = 30000, authRedirect = true } = options
  if (!url) return Promise.reject(new Error('h5Request: url is required'))

  const token = getStorageToken()
  const finalHeader = { ...header }
  if (token) {
    finalHeader.Authorization = `Bearer ${token}`
    finalHeader['X-Token'] = token
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: normalizeUrl(url),
      method,
      data,
      timeout,
      header: finalHeader,
      success(response) {
        const body = response.data
        if (response.statusCode < 200 || response.statusCode >= 300) {
          if (authRedirect && handleH5Unauthorized({ ...body, statusCode: response.statusCode })) {
            reject(body || response)
            return
          }
          reject(body || response)
          return
        }
        if (body && typeof body === 'object' && 'code' in body) {
          if (isMissingControllerResponse(body)) {
            reject(body)
            return
          }
          if (Number(body.code) === 0 || Number(body.code) === 200 || body.success === true) {
            resolve(body.data !== undefined ? body.data : body)
            return
          }
          if (authRedirect && handleH5Unauthorized(body)) {
            reject(body)
            return
          }
          reject(body)
          return
        }
        resolve(body)
      },
      fail(error) {
        if (authRedirect && handleH5Unauthorized(error)) {
          reject(error)
          return
        }
        reject(error)
      },
    })
  })
}

export function h5Get(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: 'GET' })
}

export function h5Post(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: 'POST' })
}

export function h5Put(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: 'PUT' })
}

export function h5Delete(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: 'DELETE' })
}

export function normalizeH5AssetUrl(url = '') {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const base = getH5ApiBaseUrl().replace(/\/api$/, '')
  return `${base}${url.startsWith('/') ? url : `/${url}`}`
}

export default h5Request
