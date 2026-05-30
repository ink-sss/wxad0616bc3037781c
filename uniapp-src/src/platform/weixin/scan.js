import { promisifyApi } from './runtime'

export function scanCode(options = {}) {
  return promisifyApi('scanCode', options, { preferUni: true })
}

export function scanQrCode(options = {}) {
  return scanCode({
    onlyFromCamera: true,
    scanType: ['qrCode'],
    ...options,
  })
}

