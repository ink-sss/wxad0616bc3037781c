const KEY = 'mp_live_room_context_v1'

export function saveLiveRoomContext(ctx = {}) {
  const prev = loadLiveRoomContext() || {}
  const next = { ...prev, ...ctx, updatedAt: Date.now() }
  uni.setStorageSync(KEY, next)
  return next
}

export function loadLiveRoomContext() {
  try {
    return uni.getStorageSync(KEY) || null
  } catch (error) {
    return null
  }
}

export function clearLiveRoomContext() {
  uni.removeStorageSync(KEY)
}

export function resolveLiveRoomCode(value = '') {
  if (value) return value
  const ctx = loadLiveRoomContext()
  return ctx?.roomCode || ''
}
