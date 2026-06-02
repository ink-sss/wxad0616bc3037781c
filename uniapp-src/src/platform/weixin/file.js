import { getGlobalUni, getWeixinApi, promisifyApi, unsupportedError } from './runtime'

export function chooseAddress(options = {}) {
  return promisifyApi('chooseAddress', options, { preferUni: true })
}

export function chooseImage(options = {}) {
  return promisifyApi('chooseImage', {
    count: 6,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    ...options,
  }, { preferUni: true })
}

export function uploadFile(options = {}) {
  return promisifyApi('uploadFile', options, { preferUni: true })
}

export function readFileArrayBuffer(filePath) {
  const api = getWeixinApi('getFileSystemManager') || getGlobalUni()
  if (!api || typeof api.getFileSystemManager !== 'function') {
    return Promise.reject(unsupportedError('getFileSystemManager'))
  }

  const manager = api.getFileSystemManager()
  if (!manager || typeof manager.readFile !== 'function') {
    return Promise.reject(unsupportedError('FileSystemManager.readFile'))
  }

  return new Promise((resolve, reject) => {
    manager.readFile({
      filePath,
      success: (result) => resolve(result.data),
      fail: reject,
    })
  })
}

export async function putFileToPresignedUrl(url, filePath, options = {}) {
  const uniApi = getGlobalUni()
  if (!uniApi || typeof uniApi.request !== 'function') {
    return Promise.reject(unsupportedError('request'))
  }

  try {
    const data = await readFileArrayBuffer(filePath)
    return await new Promise((resolve, reject) => {
      uniApi.request({
        url,
        method: 'PUT',
        data,
        header: {
          'content-type': options.contentType || 'application/octet-stream',
          ...(options.header || {}),
        },
        success(response) {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(response)
            return
          }
          reject(new Error(`OSS上传失败: HTTP ${response.statusCode}`))
        },
        fail: reject,
      })
    })
  } catch (error) {
    // Some mini-program bases do not expose raw file reads to uni-app builds.
    // Fall back to uploadFile so the caller still has a platform-native path;
    // strict OSS presigned PUT endpoints may reject multipart bodies and should
    // use the raw request path above during real-device validation.
    return uploadFile({
      url,
      filePath,
      name: options.name || 'file',
      method: 'PUT',
      header: {
        'content-type': options.contentType || 'application/octet-stream',
        ...(options.header || {}),
      },
    })
  }
}
