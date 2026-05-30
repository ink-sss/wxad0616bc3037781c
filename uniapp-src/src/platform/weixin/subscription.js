import { promisifyApi } from './runtime'

export function requestSubscribeMessage(tmplIds = [], options = {}) {
  return promisifyApi('requestSubscribeMessage', {
    ...options,
    tmplIds,
  })
}

export function requestSubscribeDeviceMessage(options = {}) {
  return promisifyApi('requestSubscribeDeviceMessage', options)
}

