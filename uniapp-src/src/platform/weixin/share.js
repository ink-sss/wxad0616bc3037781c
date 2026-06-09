import { promisifyApi } from './runtime'

export function showShareMenu(options = {}) {
  return promisifyApi('showShareMenu', options)
}

export function hideShareMenu(options = {}) {
  return promisifyApi('hideShareMenu', options)
}

export function exitMiniProgram(options = {}) {
  return promisifyApi('exitMiniProgram', options)
}
