const KEY = 'mp_live_room_context_v1'

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return ''
}

function normalizeValue(value) {
  return value === undefined || value === null ? '' : String(value).trim()
}

function appendParam(params, key, value) {
  const text = normalizeValue(value)
  if (!text || text === '0') return
  params.push([key, text])
}

export function normalizeLiveRoomContext(ctx = {}) {
  const raw = ctx && typeof ctx === 'object' ? ctx : {}
  const roomCode = firstValue(raw, 'roomCode', 'room_code', 'code')
  const liveId = firstValue(raw, 'liveId', 'live_id', 'roomId', 'room_id')
  const roomId = firstValue(raw, 'roomId', 'room_id', 'liveId', 'live_id')
  const tenantId = firstValue(raw, 'tenantId', 'tenant_id')
  const shareCode = firstValue(raw, 'shareCode', 'share_code')
  const bindId = firstValue(raw, 'bindId', 'bind_id')
  const termId = firstValue(raw, 'termId', 'term_id', 'liveTermId', 'live_term_id')
  const customerId = firstValue(raw, 'customerId', 'customer_id', 'userId', 'user_id')
  const replayVideoId = firstValue(raw, 'replayVideoId', 'replay_video_id', 'videoId', 'video_id')
  const cover = firstValue(raw, 'cover', 'liveCover', 'live_cover', 'coverImage', 'cover_image', 'poster')
  const mode = firstValue(raw, 'mode')
  const replay = firstValue(raw, 'replay')
  const liveType = firstValue(raw, 'liveType', 'live_type')
  const normalizedLiveType = String(liveType || '').toLowerCase()
  const normalizedMode = String(mode || '').toLowerCase()
  const explicitlyLive =
    raw.isReplay === false ||
    replay === '0' ||
    normalizedLiveType === 'live' ||
    normalizedMode === 'live'
  const isReplay = explicitlyLive
    ? false
    : raw.isReplay === true ||
      replay === '1' ||
      normalizedLiveType === 'replay' ||
      normalizedMode === 'replay' ||
      !!replayVideoId

  return {
    ...raw,
    roomCode,
    room_code: roomCode,
    liveId,
    live_id: liveId,
    roomId,
    room_id: roomId,
    tenantId,
    tenant_id: tenantId,
    shareCode,
    share_code: shareCode,
    bindId,
    bind_id: bindId,
    termId,
    term_id: termId,
    liveTermId: termId,
    live_term_id: termId,
    customerId,
    customer_id: customerId,
    userId: customerId,
    user_id: customerId,
    replayVideoId: isReplay ? replayVideoId : '',
    replay_video_id: isReplay ? replayVideoId : '',
    videoId: isReplay ? replayVideoId : '',
    video_id: isReplay ? replayVideoId : '',
    cover,
    liveCover: cover,
    live_cover: cover,
    coverImage: cover,
    cover_image: cover,
    liveType: isReplay ? 'replay' : liveType,
    live_type: isReplay ? 'replay' : liveType,
    replay: isReplay ? '1' : '',
    mode: isReplay && !mode ? 'replay' : mode,
    isReplay,
  }
}

export function mergeLiveRoomContext(...sources) {
  const merged = {}
  sources.forEach((source) => {
    if (!source || typeof source !== 'object') return
    Object.entries(source).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      merged[key] = value
    })
  })
  return normalizeLiveRoomContext(merged)
}

export function saveLiveRoomContext(ctx = {}) {
  const prev = loadLiveRoomContext() || {}
  const next = { ...mergeLiveRoomContext(prev, ctx), updatedAt: Date.now() }
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

export function buildLiveRoomQuery(ctx = {}, options = {}) {
  const normalized = normalizeLiveRoomContext(ctx)
  const params = []
  appendParam(params, 'roomCode', normalized.roomCode)
  appendParam(params, 'liveId', normalized.liveId)
  if (normalized.roomId && normalized.roomId !== normalized.liveId) appendParam(params, 'roomId', normalized.roomId)
  appendParam(params, 'tenantId', normalized.tenantId)
  if (normalized.shareCode && normalized.shareCode !== normalized.roomCode) appendParam(params, 'shareCode', normalized.shareCode)
  appendParam(params, 'bindId', normalized.bindId)
  appendParam(params, 'termId', normalized.termId)
  appendParam(params, 'customerId', normalized.customerId)
  if (normalized.isReplay) {
    appendParam(params, 'mode', normalized.mode || 'replay')
    appendParam(params, 'replay', '1')
    appendParam(params, 'liveType', 'replay')
    appendParam(params, 'videoId', normalized.replayVideoId)
    appendParam(params, 'replayVideoId', normalized.replayVideoId)
  } else {
    appendParam(params, 'liveType', normalized.liveType)
  }
  const existingKeys = new Set((options.existingKeys || []).map((key) => String(key)))
  const query = params
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  if (!query) return ''
  return `${options.prefix === undefined ? '?' : options.prefix}${query}`
}

export function appendLiveRoomQuery(url = '', ctx = {}) {
  const target = String(url || '')
  const existingKeys = []
  target.replace(/[?&]([^=&]+)=/g, (_, key) => {
    existingKeys.push(decodeURIComponent(key))
    return ''
  })
  const query = buildLiveRoomQuery(ctx, {
    prefix: target.includes('?') ? '&' : '?',
    existingKeys,
  })
  return query ? `${target}${query}` : target
}
