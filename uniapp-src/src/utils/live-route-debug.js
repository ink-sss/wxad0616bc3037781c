import { parseScene } from './live-route.js'

export const LIVE_ROUTE_DEBUG_PREFIX = '[BroadcastQrRouteDebug]'
const LIVE_ROUTE_DEBUG_STORAGE_KEY = '__broadcast_qr_route_debug_last__'

function safeDecodeScene(scene) {
  if (!scene) return ''
  try {
    return decodeURIComponent(scene)
  } catch (e) {
    return String(scene)
  }
}

function pickShortLink(options = {}) {
  return (
    options.shortLink ||
    options.short_link ||
    options.miniProgramShortLink ||
    options.mini_program_short_link ||
    ''
  )
}

function getRuntimeConsole() {
  try {
    const root = typeof globalThis !== 'undefined' ? globalThis : {}
    return root && root.console ? root.console : null
  } catch (e) {
    return null
  }
}

function persistDebugPayload(stage, payload) {
  try {
    if (typeof uni === 'undefined' || !uni?.setStorageSync) return
    uni.setStorageSync(LIVE_ROUTE_DEBUG_STORAGE_KEY, {
      prefix: LIVE_ROUTE_DEBUG_PREFIX,
      stage,
      payload,
      ts: Date.now(),
    })
  } catch (e) {}
}

export function emitLiveRouteDebug(stage, payload = {}) {
  const logger = getRuntimeConsole()
  persistDebugPayload(stage, payload)
  try {
    const method = logger?.log || logger?.info || logger?.warn
    if (typeof method === 'function') {
      method.call(logger, `${LIVE_ROUTE_DEBUG_PREFIX} ${stage}`, payload)
    }
  } catch (e) {}
}

export function logLiveRouteInput(stage, options = {}, extra = {}) {
  const rawScene = options?.scene || ''
  emitLiveRouteDebug(stage, {
    ...extra,
    options,
    rawScene,
    decodedScene: safeDecodeScene(rawScene),
    parsedScene: parseScene(rawScene),
    shortLink: pickShortLink(options),
  })
}

export function logLiveRouteNormalized(stage, options = {}, extra = {}) {
  emitLiveRouteDebug(stage, {
    ...extra,
    options,
    rawScene: options.scene || '',
    roomCode: options.roomCode || '',
    shareCode: options.shareCode || '',
    liveId: options.liveId || '',
    roomId: options.roomId || '',
    tenantId: options.tenantId || options.tenant_id || '',
    bindId: options.bindId || options.bind_id || '',
    liveType: options.liveType || options.live_type || '',
    isReplay: !!options.isReplay,
    videoId: options.videoId || options.video_id || '',
    termId: options.termId || options.term_id || '',
    _tc: options._tc || '',
    shortLink: pickShortLink(options),
  })
}
