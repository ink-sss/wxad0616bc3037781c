import { getGlobalUni, getWeixinApi, promisifyApi, unsupportedError } from './runtime'
import { getSetting, openSetting } from './auth'

export function chooseAddress(options = {}) {
  return promisifyApi('chooseAddress', options)
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

export function downloadFile(options = {}) {
  return promisifyApi('downloadFile', options, { preferUni: true })
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
    const response = await uploadFile({
      url,
      filePath,
      name: options.name || 'file',
      method: 'PUT',
      header: {
        'content-type': options.contentType || 'application/octet-stream',
        ...(options.header || {}),
      },
    })
    if (response?.statusCode >= 200 && response.statusCode < 300) {
      return response
    }
    throw new Error(`OSS上传失败: HTTP ${response?.statusCode || 'unknown'}`)
  }
}

function getFileSystemManager() {
  const wxApi = getWeixinApi(null)
  const uniApi = getGlobalUni()
  const api = wxApi && typeof wxApi.getFileSystemManager === 'function' ? wxApi : uniApi
  if (!api || typeof api.getFileSystemManager !== 'function') {
    throw unsupportedError('getFileSystemManager')
  }
  return {
    manager: api.getFileSystemManager(),
    userDataPath: api.env?.USER_DATA_PATH || wxApi?.env?.USER_DATA_PATH || '',
  }
}

export function writeBase64ImageToTempFile(dataUrl, fileName = `share-${Date.now()}.png`) {
  const normalizedDataUrl = normalizeBase64ImageDataUrl(dataUrl)
  if (!normalizedDataUrl) {
    return Promise.reject(new Error('图片数据为空'))
  }
  const match = normalizedDataUrl.match(/^data:image\/([\w.+-]+);base64,(.+)$/)
  if (!match) {
    return Promise.reject(new Error('不是有效的图片 dataURL'))
  }
  const ext = (match[1] || 'png').toLowerCase().replace('jpeg', 'jpg')
  const base64Data = match[2]
  const { manager, userDataPath } = getFileSystemManager()
  if (!manager || typeof manager.writeFile !== 'function' || !userDataPath) {
    return Promise.reject(unsupportedError('FileSystemManager.writeFile'))
  }
  const safeName = String(fileName || `share-${Date.now()}.${ext}`).replace(/[^\w.-]/g, '_')
  const filePath = `${userDataPath}/${safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`}`
  return new Promise((resolve, reject) => {
    manager.writeFile({
      filePath,
      data: base64Data,
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: reject,
    })
  })
}

export function normalizeBase64ImageDataUrl(value, mimeType = 'image/png') {
  const text = String(value || '').trim()
  if (!text) return ''
  const match = text.match(/^(data:image\/[a-zA-Z0-9.+-]+;base64,)([\s\S]+)$/)
  if (match) return `${match[1]}${String(match[2] || '').replace(/\s+/g, '')}`
  const compact = text.replace(/\s+/g, '')
  if (!compact) return ''
  return `data:${mimeType || 'image/png'};base64,${compact}`
}

export function saveImageToAlbum(filePath) {
  if (!filePath) return Promise.reject(new Error('图片路径为空'))
  return promisifyApi('saveImageToPhotosAlbum', { filePath }, { preferUni: true })
}

function isAlbumAuthError(error = {}) {
  const message = String(error?.errMsg || error?.message || error || '')
  return message.includes('auth deny') ||
    message.includes('auth denied') ||
    message.includes('authorize no response') ||
    message.includes('scope.writePhotosAlbum')
}

async function ensureAlbumWritable() {
  try {
    const setting = await getSetting()
    if (setting?.authSetting?.['scope.writePhotosAlbum'] === false) {
      await openSetting()
    }
  } catch (_) {}
}

export async function saveImageToAlbumWithAuth(filePath) {
  try {
    return await saveImageToAlbum(filePath)
  } catch (error) {
    if (!isAlbumAuthError(error)) throw error
    await ensureAlbumWritable()
    return saveImageToAlbum(filePath)
  }
}

export async function saveImageUrlToAlbum(url, fileName) {
  if (!url) throw new Error('图片路径为空')
  let filePath = url
  if (/^data:image\//.test(url)) {
    filePath = await writeBase64ImageToTempFile(url, fileName)
  } else if (/^https?:\/\//.test(url)) {
    const result = await downloadFile({ url })
    if (result?.statusCode && result.statusCode !== 200) {
      throw new Error(`图片下载失败: HTTP ${result.statusCode}`)
    }
    filePath = result.tempFilePath
  }
  return saveImageToAlbumWithAuth(filePath)
}
