import { getWeixinApi, promisifyApi } from './runtime'

export function setVisualEffectOnCapture(options = {}) {
  return promisifyApi('setVisualEffectOnCapture', options)
}

export function hideOnCapture() {
  return setVisualEffectOnCapture({ visualEffect: 'hidden' })
}

export function resetCaptureEffect() {
  return setVisualEffectOnCapture({ visualEffect: 'none' })
}

export function onUserCaptureScreen(handler) {
  const api = getWeixinApi('onUserCaptureScreen')
  if (api && typeof api.onUserCaptureScreen === 'function') {
    api.onUserCaptureScreen(handler)
  }
}

export function offUserCaptureScreen(handler) {
  const api = getWeixinApi('offUserCaptureScreen')
  if (api && typeof api.offUserCaptureScreen === 'function') {
    api.offUserCaptureScreen(handler)
  }
}

export function getScreenRecordingState() {
  return promisifyApi('getScreenRecordingState')
}

export function onScreenRecordingStateChanged(handler) {
  const api = getWeixinApi('onScreenRecordingStateChanged')
  if (api && typeof api.onScreenRecordingStateChanged === 'function') {
    api.onScreenRecordingStateChanged(handler)
  }
}

export function offScreenRecordingStateChanged(handler) {
  const api = getWeixinApi('offScreenRecordingStateChanged')
  if (api && typeof api.offScreenRecordingStateChanged === 'function') {
    api.offScreenRecordingStateChanged(handler)
  }
}

