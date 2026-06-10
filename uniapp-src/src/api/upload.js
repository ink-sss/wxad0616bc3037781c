import { h5Post, normalizeH5AssetUrl } from './h5.js'
import { putFileToPresignedUrl } from '../platform/weixin/file.js'

const MIME_BY_EXT = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
}

function fileNameFromPath(filePath = '', prefix = 'upload') {
  const cleanPath = String(filePath || '').split('?')[0]
  return cleanPath.split('/').pop() || `${prefix}_${Date.now()}.jpg`
}

function inferContentType(filePath = '', options = {}) {
  if (options.contentType) return options.contentType
  const ext = String(filePath || '').split('?')[0].split('.').pop()?.toLowerCase()
  if (ext && MIME_BY_EXT[ext]) return MIME_BY_EXT[ext]
  return options.fileType === 'video' || options.file_type === 'video' ? 'video/mp4' : 'image/jpeg'
}

function normalizeUploadInfo(uploadInfo = {}) {
  const data = uploadInfo?.data && typeof uploadInfo.data === 'object' ? uploadInfo.data : uploadInfo
  const uploadUrl = data.uploadUrl || data.upload_url || data.presignedUrl || data.presigned_url || ''
  const fileUrl = data.fileUrl || data.file_url || data.url || data.path || data.filePath || data.file_path || ''
  return { data, uploadUrl, fileUrl }
}

function isBlobLike(file) {
  if (!file || typeof file !== 'object') return false
  if (typeof Blob !== 'undefined' && file instanceof Blob) return true
  return typeof file.arrayBuffer === 'function' && typeof file.size === 'number'
}

function putBlobToPresignedUrl(url, file, contentType) {
  const headerValue = contentType || file?.type || 'application/octet-stream'
  if (typeof XMLHttpRequest !== 'undefined') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      let settled = false
      const finish = (handler) => {
        if (settled) return
        settled = true
        handler()
      }
      xhr.open('PUT', url, true)
      xhr.setRequestHeader('Content-Type', headerValue)
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          finish(() => resolve({ statusCode: xhr.status }))
          return
        }
        finish(() => reject(new Error(`OSS上传失败: HTTP ${xhr.status}`)))
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return
        if (xhr.status >= 200 && xhr.status < 300) {
          finish(() => resolve({ statusCode: xhr.status }))
          return
        }
        if (xhr.status > 0) {
          finish(() => reject(new Error(`OSS上传失败: HTTP ${xhr.status}`)))
        }
      }
      xhr.onerror = () => finish(() => reject(new Error('OSS上传网络错误')))
      xhr.onabort = () => finish(() => reject(new Error('OSS上传已取消')))
      xhr.ontimeout = () => finish(() => reject(new Error('OSS上传超时')))
      xhr.send(file)
    })
  }
  if (typeof fetch === 'function') {
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': headerValue },
      body: file,
    }).then((response) => {
      if (response.ok) return response
      throw new Error(`OSS上传失败: HTTP ${response.status}`)
    })
  }
  return Promise.reject(new Error('当前环境不支持文件上传'))
}

function canReadPathAsBlob(filePath = '') {
  return /^(blob:|data:)/i.test(String(filePath || ''))
}

function readPathAsBlob(filePath = '') {
  if (!canReadPathAsBlob(filePath)) return Promise.resolve(null)
  if (typeof fetch === 'function') {
    return fetch(filePath)
      .then((response) => {
        if (!response.ok) throw new Error('读取图片文件失败')
        return response.blob()
      })
      .catch(() => readPathAsBlobWithXhr(filePath))
  }
  return readPathAsBlobWithXhr(filePath)
}

function readPathAsBlobWithXhr(filePath = '') {
  if (typeof XMLHttpRequest === 'undefined') return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', filePath, true)
    xhr.responseType = 'blob'
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response)
        return
      }
      reject(new Error('读取图片文件失败'))
    }
    xhr.onerror = () => reject(new Error('读取图片文件失败'))
    xhr.send()
  })
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function applyRoomIdAliases(data = {}) {
  const roomId = firstValue(data, 'RoomId', 'roomId', 'room_id', 'liveRoomId', 'live_room_id', 'liveId', 'live_id')
  if (roomId === undefined) return data
  const normalized = Number(roomId)
  const value = Number.isFinite(normalized) ? normalized : roomId
  return {
    ...data,
    RoomId: firstValue(data, 'RoomId') ?? value,
    roomId: firstValue(data, 'roomId') ?? value,
  }
}

function normalizeUploadedFile(fileUrl = '', uploadInfo = {}) {
  const normalizedUrl = normalizeH5AssetUrl(fileUrl)
  return {
    ...uploadInfo,
    url: normalizedUrl,
    file_path: normalizedUrl,
    filePath: normalizedUrl,
    file_url: fileUrl,
    rawUrl: fileUrl,
  }
}

/**
 * Get a presigned upload URL from the unified H5 upload endpoint.
 *
 * All uni-app business uploads must go through /h5/complaint/getUploadUrl so
 * Mini Program domain whitelisting and storage routing stay centralized.
 */
export function getUploadUrl(data = {}) {
  return h5Post('/h5/complaint/getUploadUrl', data)
}

/**
 * Upload one local file using the unified complaint getUploadUrl flow.
 *
 * @param {object} payload
 * @param {string} payload.filePath Local temp file path from uni.chooseImage/chooseVideo.
 * @param {string} [payload.fileName] Uploaded file name.
 * @param {string} [payload.contentType] MIME type.
 * @param {string} [payload.fileType] Business file type, for example image/video.
 * @param {object} [payload.data] Extra metadata sent to getUploadUrl.
 * @returns {Promise<object>} Uploaded file descriptor compatible with legacy file_path consumers.
 */
export async function uploadFileWithComplaintUploadUrl(payload = {}) {
  const filePath = payload.filePath || ''
  if (!filePath) throw new Error('文件路径不能为空')

  const fileType = payload.fileType || payload.file_type || 'image'
  const fileName = payload.fileName || payload.file_name || fileNameFromPath(filePath, fileType)
  const contentType = inferContentType(fileName || filePath, { ...payload, fileType })
  const requestData = {
    ...(payload.data || {}),
    filename: fileName,
    fileName,
    contentType,
    content_type: contentType,
    fileType,
    file_type: fileType,
  }
  const { data, uploadUrl, fileUrl } = normalizeUploadInfo(await getUploadUrl(applyRoomIdAliases(requestData)))
  if (!uploadUrl || !fileUrl) throw new Error('获取上传地址失败')

  const h5File = isBlobLike(payload.file) ? payload.file : await readPathAsBlob(filePath)
  if (h5File) {
    await putBlobToPresignedUrl(uploadUrl, h5File, contentType)
  } else {
    await putFileToPresignedUrl(uploadUrl, filePath, {
      contentType,
      name: payload.name || 'file',
      header: payload.header,
    })
  }
  return normalizeUploadedFile(fileUrl, data)
}

export function uploadFilesWithComplaintUploadUrl(filePaths = [], options = {}) {
  const list = Array.isArray(filePaths) ? filePaths : [filePaths]
  return Promise.all(
    list.filter(Boolean).map((filePath) =>
      uploadFileWithComplaintUploadUrl({
        ...options,
        filePath,
      }),
    ),
  )
}
