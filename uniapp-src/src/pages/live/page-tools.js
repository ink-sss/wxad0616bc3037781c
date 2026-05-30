export function toast(title, icon = 'none') {
  if (!title) return
  uni.showToast({ title, icon })
}

export function parseScene(scene = '') {
  const result = {}
  if (!scene) return result

  decodeURIComponent(scene)
    .split('&')
    .forEach((part) => {
      const [key, value] = part.includes(':') ? part.split(':') : part.split('=')
      if (key) result[key] = value
    })

  return result
}

export function normalizeLiveOptions(query = {}) {
  const sceneData = parseScene(query.scene)
  return {
    ...query,
    ...sceneData,
    live_id: query.live_id || sceneData.live_id || query.room_id || sceneData.room_id || '',
    referee_id: query.referee_id || query.uid || sceneData.referee_id || sceneData.uid || '',
    store_id: query.store_id || sceneData.store_id || '',
  }
}

export function requestWithVm(vm, method, endpoint, data = {}) {
  return new Promise((resolve, reject) => {
    const fn = vm && vm[method]
    if (typeof fn !== 'function') {
      // TODO:migration Verify shared runtime installation before full live parity.
      reject(new Error(`${method} is not installed on this page instance`))
      return
    }

    fn.call(vm, endpoint, data, resolve, reject)
  })
}

export function getLiveStream(detail = {}) {
  return (
    detail.live_url ||
    detail.push_url ||
    detail.pull_url ||
    detail.play_url ||
    detail.url ||
    detail.rtmp_url ||
    detail.m3u8_url ||
    ''
  )
}

export function isEndedStatus(status) {
  return [102, 103, 104, 109].includes(Number(status))
}

export function isWaitingStatus(status) {
  return [100, 105, 106, 107].includes(Number(status))
}

export function goBackOrHome() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
  if (pages.length > 1) {
    uni.navigateBack({})
    return
  }

  uni.switchTab({
    url: '/pages/index/index',
    fail() {
      uni.reLaunch({ url: '/pages/index/index' })
    },
  })
}

export function safeNavigate(url) {
  if (!url) return
  const method = url.startsWith('/pages/index') || url.startsWith('/pages/user/index') ? 'switchTab' : 'navigateTo'
  uni[method]({
    url,
    fail() {
      uni.navigateTo({ url })
    },
  })
}
