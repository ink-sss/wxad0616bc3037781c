const noop = () => {}

export const wx = {
  updateAppMessageShareData: noop,
  updateTimelineShareData: noop,
  onMenuShareAppMessage: noop,
  onMenuShareTimeline: noop,
  openAddress: noop,
}

export function initWxConfig() {
  return Promise.resolve(true)
}

export function resetWxConfig() {}

export function ensureWxShareMenusVisible() {
  return true
}
