const UNSUPPORTED_CODE = 'WEIXIN_API_UNSUPPORTED'

export function getGlobalUni() {
  return typeof uni !== 'undefined' ? uni : null
}

export function getGlobalWx() {
  return typeof wx !== 'undefined' ? wx : null
}

export function getWeixinApi(methodName, options = {}) {
  const { preferUni = false } = options
  const uniApi = getGlobalUni()
  const wxApi = getGlobalWx()

  if (preferUni && uniApi && (!methodName || typeof uniApi[methodName] === 'function')) {
    return uniApi
  }

  if (wxApi && (!methodName || typeof wxApi[methodName] === 'function')) {
    return wxApi
  }

  if (uniApi && (!methodName || typeof uniApi[methodName] === 'function')) {
    return uniApi
  }

  return null
}

export function hasWeixinApi(methodName, options = {}) {
  return !!getWeixinApi(methodName, options)
}

export function isMpWeixinRuntime() {
  const wxApi = getGlobalWx()
  if (!wxApi) {
    return false
  }

  const uniApi = getGlobalUni()
  if (!uniApi || typeof uniApi.getSystemInfoSync !== 'function') {
    return true
  }

  try {
    const systemInfo = uniApi.getSystemInfoSync()
    return systemInfo.uniPlatform === 'mp-weixin' || systemInfo.platform === 'devtools'
  } catch (error) {
    return true
  }
}

export function unsupportedError(apiName) {
  const error = new Error(`${apiName} is only available in mp-weixin runtime`)
  error.code = UNSUPPORTED_CODE
  error.apiName = apiName
  return error
}

export function canIUse(schema) {
  const api = getWeixinApi('canIUse')
  if (!api || typeof api.canIUse !== 'function') {
    return false
  }

  try {
    return !!api.canIUse(schema)
  } catch (error) {
    return false
  }
}

export function promisifyApi(apiName, params = {}, options = {}) {
  const api = options.api || getWeixinApi(apiName, options)
  if (!api || typeof api[apiName] !== 'function') {
    return Promise.reject(unsupportedError(apiName))
  }

  return new Promise((resolve, reject) => {
    const request = {
      ...params,
      success(result) {
        if (typeof params.success === 'function') {
          params.success(result)
        }
        resolve(result)
      },
      fail(error) {
        if (typeof params.fail === 'function') {
          params.fail(error)
        }
        reject(error)
      },
      complete(result) {
        if (typeof params.complete === 'function') {
          params.complete(result)
        }
      },
    }

    try {
      api[apiName](request)
    } catch (error) {
      reject(error)
    }
  })
}

export function callSync(apiName, fallback = null, options = {}) {
  const api = options.api || getWeixinApi(apiName, options)
  if (!api || typeof api[apiName] !== 'function') {
    return fallback
  }

  try {
    return api[apiName]()
  } catch (error) {
    return fallback
  }
}

export function callContext(context, methodName, params = {}) {
  if (!context || typeof context[methodName] !== 'function') {
    return Promise.reject(unsupportedError(methodName))
  }

  return new Promise((resolve, reject) => {
    try {
      context[methodName]({
        ...params,
        success(result) {
          if (typeof params.success === 'function') {
            params.success(result)
          }
          resolve(result)
        },
        fail(error) {
          if (typeof params.fail === 'function') {
            params.fail(error)
          }
          reject(error)
        },
        complete(result) {
          if (typeof params.complete === 'function') {
            params.complete(result)
          }
        },
      })
    } catch (error) {
      reject(error)
    }
  })
}

