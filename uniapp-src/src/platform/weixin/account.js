import { callSync, canIUse } from './runtime'

export function getAccountInfo() {
  return callSync('getAccountInfoSync', null)
}

export function getMenuButtonBoundingClientRect() {
  return callSync('getMenuButtonBoundingClientRect', null)
}

export function getLaunchOptions() {
  return callSync('getLaunchOptionsSync', null)
}

export function getEnterOptions() {
  return callSync('getEnterOptionsSync', null)
}

export function canUse(schema) {
  return canIUse(schema)
}

