import { authorize, getSetting, openSetting } from './auth'
import { callContext, getWeixinApi, promisifyApi, unsupportedError } from './runtime'

const USER_LOCATION_SCOPE = 'scope.userLocation'

export function getLocation(options = {}) {
  return promisifyApi('getLocation', options, { preferUni: true })
}

export function chooseLocation(options = {}) {
  return promisifyApi('chooseLocation', options, { preferUni: true })
}

export function openLocation(options = {}) {
  return promisifyApi('openLocation', options, { preferUni: true })
}

export async function ensureLocationAuthorized() {
  const setting = await getSetting()
  const authSetting = setting.authSetting || {}

  if (authSetting[USER_LOCATION_SCOPE] === true) {
    return true
  }

  if (authSetting[USER_LOCATION_SCOPE] === false) {
    await openSetting()
    const nextSetting = await getSetting()
    return nextSetting.authSetting && nextSetting.authSetting[USER_LOCATION_SCOPE] === true
  }

  await authorize(USER_LOCATION_SCOPE)
  return true
}

export function createMapContext(mapId, component) {
  const api = getWeixinApi('createMapContext')
  if (!api || typeof api.createMapContext !== 'function') {
    return null
  }

  return component ? api.createMapContext(mapId, component) : api.createMapContext(mapId)
}

export function mapContextCall(context, methodName, options = {}) {
  return callContext(context, methodName, options)
}

export function moveToMapLocation(context, options = {}) {
  if (!context || typeof context.moveToLocation !== 'function') {
    return Promise.reject(unsupportedError('moveToLocation'))
  }

  context.moveToLocation(options)
  return Promise.resolve()
}

export function includeMapPoints(context, points = [], options = {}) {
  return mapContextCall(context, 'includePoints', {
    ...options,
    points,
  })
}

