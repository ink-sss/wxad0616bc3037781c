import { callContext, getWeixinApi, unsupportedError } from './runtime'

export function createLivePlayerContext(id = 'live-video', component) {
  const api = getWeixinApi('createLivePlayerContext')
  if (!api || typeof api.createLivePlayerContext !== 'function') {
    return null
  }

  return component ? api.createLivePlayerContext(id, component) : api.createLivePlayerContext(id)
}

export function createLivePusherContext(component) {
  if (component && typeof component.createLivePusherContext === 'function') {
    return component.createLivePusherContext()
  }

  const api = getWeixinApi('createLivePusherContext')
  if (!api || typeof api.createLivePusherContext !== 'function') {
    return null
  }

  return api.createLivePusherContext()
}

export function liveContextCall(context, methodName, options = {}) {
  return callContext(context, methodName, options)
}

export function playLive(context, options = {}) {
  return liveContextCall(context, 'play', options)
}

export function stopLive(context, options = {}) {
  return liveContextCall(context, 'stop', options)
}

export function pauseLive(context, options = {}) {
  return liveContextCall(context, 'pause', options)
}

export function resumeLive(context, options = {}) {
  return liveContextCall(context, 'resume', options)
}

export function requestLiveFullScreen(context, options = {}) {
  return liveContextCall(context, 'requestFullScreen', options)
}

export function exitLiveFullScreen(context, options = {}) {
  return liveContextCall(context, 'exitFullScreen', options)
}

export function startPush(context, options = {}) {
  return liveContextCall(context, 'start', options)
}

export function stopPush(context, options = {}) {
  return liveContextCall(context, 'stop', options)
}

export function pausePush(context, options = {}) {
  return liveContextCall(context, 'pause', options)
}

export function resumePush(context, options = {}) {
  return liveContextCall(context, 'resume', options)
}

export function switchCamera(context, options = {}) {
  return liveContextCall(context, 'switchCamera', options)
}

export function callTrtc(instance, methodName, ...args) {
  if (!instance || typeof instance[methodName] !== 'function') {
    return Promise.reject(unsupportedError(`TRTC.${methodName}`))
  }

  try {
    return Promise.resolve(instance[methodName](...args))
  } catch (error) {
    return Promise.reject(error)
  }
}
