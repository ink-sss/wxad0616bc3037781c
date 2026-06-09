import { createQrMatrix } from '@/utils/qrcode-matrix.js'
import { getWeixinApi, unsupportedError } from './runtime'

const DEFAULT_SIZE = 360
const DEFAULT_MARGIN = 4

export function createQrCodeTempFile(text, options = {}) {
  const api = getWeixinApi('createOffscreenCanvas')
  if (!api || typeof api.createOffscreenCanvas !== 'function') {
    return Promise.reject(unsupportedError('createOffscreenCanvas'))
  }

  const matrix = createQrMatrix(text)
  const size = Number(options.size || DEFAULT_SIZE)
  const margin = Number(options.margin == null ? DEFAULT_MARGIN : options.margin)
  const moduleCount = matrix.length + margin * 2
  const scale = Math.max(1, Math.floor(size / moduleCount))
  const imageSize = moduleCount * scale
  const canvas = api.createOffscreenCanvas({ type: '2d', width: imageSize, height: imageSize })
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, imageSize, imageSize)
  ctx.fillStyle = '#000000'
  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (!dark) return
      ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale)
    })
  })

  return canvasToTempFilePath(canvas)
}

function canvasToTempFilePath(canvas) {
  if (canvas && typeof canvas.toTempFilePath === 'function') {
    return new Promise((resolve, reject) => {
      canvas.toTempFilePath({
        fileType: 'png',
        success: (result) => resolve(result.tempFilePath),
        fail: reject,
      })
    })
  }

  const api = getWeixinApi('canvasToTempFilePath')
  if (api && typeof api.canvasToTempFilePath === 'function') {
    return new Promise((resolve, reject) => {
      api.canvasToTempFilePath({
        canvas,
        fileType: 'png',
        success: (result) => resolve(result.tempFilePath),
        fail: reject,
      })
    })
  }

  return Promise.reject(unsupportedError('canvas.toTempFilePath'))
}
