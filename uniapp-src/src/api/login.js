import { getRuntimeConfig } from '../utils/runtime-config.js'

function normalizeLoginSettingResponse(response = {}) {
  const body = response.data || {}
  if (response.statusCode !== 200 || !body || typeof body !== 'object') {
    throw new Error('登录配置请求失败')
  }
  if (body.code === 0 || body.code === -1 || body.code === -2) {
    throw new Error(body.msg || '登录配置请求失败')
  }
  return body.data || body
}

export function fetchLoginSetting() {
  const runtimeConfig = getRuntimeConfig()
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${runtimeConfig.app_url}/index.php/api/index/loginSetting`,
      data: {},
      dataType: 'json',
      method: 'POST',
      header: {
        'content-type': 'application/json;charset=UTF-8',
      },
      success(response) {
        try {
          resolve(normalizeLoginSettingResponse(response))
        } catch (error) {
          reject(error)
        }
      },
      fail(error) {
        reject(new Error(error?.errMsg || '登录配置请求失败'))
      },
    })
  })
}
