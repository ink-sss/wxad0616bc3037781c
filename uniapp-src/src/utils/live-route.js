export function parseScene(scene = '') {
  const result = {}
  if (!scene) return result
  let decoded = ''
  try {
    decoded = decodeURIComponent(scene)
  } catch (error) {
    decoded = String(scene)
  }
  decoded
    .split('&')
    .forEach((part) => {
      const separator = part.includes(':') ? ':' : '='
      const [key, value] = part.split(separator)
      if (key) result[key] = value || ''
    })
  return result
}

export function normalizeLiveRouteOptions(query = {}) {
  const scene = parseScene(query.scene)
  const merged = { ...query, ...scene }
  const roomCode = merged.roomCode || merged.room_code || merged.shareCode || ''
  const liveId = merged.liveId || merged.live_id || merged.roomId || merged.room_id || ''
  return {
    ...merged,
    roomCode,
    liveId,
    roomId: merged.roomId || merged.room_id || liveId,
    mode: merged.mode || '',
    replay: merged.replay || '',
    orientation: merged.orientation || '',
    videoId: merged.videoId || merged.video_id || '',
    termId: merged.termId || merged.term_id || '',
  }
}

export function buildBroadcastEntryUrl(input = {}) {
  const options = normalizeLiveRouteOptions(input)
  const params = []
  if (options.roomCode) params.push(`roomCode=${encodeURIComponent(options.roomCode)}`)
  if (options.liveId) params.push(`liveId=${encodeURIComponent(options.liveId)}`)
  if (options.roomId && options.roomId !== options.liveId) params.push(`roomId=${encodeURIComponent(options.roomId)}`)
  if (options.mode) params.push(`mode=${encodeURIComponent(options.mode)}`)
  if (options.replay) params.push(`replay=${encodeURIComponent(options.replay)}`)
  if (options.orientation) params.push(`orientation=${encodeURIComponent(options.orientation)}`)
  if (options.videoId) params.push(`videoId=${encodeURIComponent(options.videoId)}`)
  if (options.termId) params.push(`termId=${encodeURIComponent(options.termId)}`)
  return `/pages/broadcast/entry${params.length ? `?${params.join('&')}` : ''}`
}

export function isReplayEntry(options = {}, detail = {}) {
  if (String(options.replay || '') === '1') return true
  if (String(options.mode || '') === 'replay') return true
  if (Number(detail.roomGroupType || detail.groupType || 0) === 1) return true
  const statusText = String(detail.liveStatusText || detail.statusText || detail.live_status_text || '').trim()
  if (/回放|录播/.test(statusText)) return true
  const pushStatus = Number(detail.pushStatus ?? detail.live_status ?? 0)
  const hasReplay = Number(detail.hasReplay ?? detail.has_replay ?? 0) === 1
  return hasReplay && pushStatus !== 1
}

const LIVE_SOURCE_FIELDS = [
  {
    keys: ['pullRtmpUrl', 'pull_rtmp_url', 'rtmpUrl', 'rtmp_url', 'rtmp'],
    type: 'rtmp',
    component: 'live-player',
    rank: 10,
  },
  {
    keys: ['pullFlvUrl', 'pull_flv_url', 'flvUrl', 'flv_url', 'flv'],
    type: 'flv',
    component: 'live-player',
    rank: 20,
  },
  {
    keys: ['pullHlsUrl', 'pull_hls_url', 'hlsUrl', 'hls_url', 'm3u8Url', 'm3u8_url'],
    type: 'hls',
    component: 'video',
    rank: 30,
  },
  {
    keys: ['streamUrl', 'stream_url', 'liveUrl', 'live_url', 'pullUrl', 'pull_url', 'playUrl', 'play_url', 'url'],
    type: 'auto',
    component: '',
    rank: 40,
  },
]

function asSourceObjectList(detail = {}, streamInfo = {}) {
  const list = []
  const push = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) list.push(value)
  }
  push(detail)
  push(detail.streamInf)
  push(detail.streamInfo)
  push(detail.stream_inf)
  push(detail.liveStream)
  push(detail.live_stream)
  push(streamInfo)
  push(streamInfo.streamInf)
  push(streamInfo.streamInfo)
  push(streamInfo.stream_inf)
  push(streamInfo.data)
  return list
}

function normalizeLiveUrl(url = '') {
  return String(url || '').trim()
}

function classifyLiveSource(url = '') {
  const value = normalizeLiveUrl(url).toLowerCase()
  const path = value.split('?')[0]
  if (!value) return { type: '', component: '', rank: 999 }
  if (value.startsWith('rtmp://')) return { type: 'rtmp', component: 'live-player', rank: 10 }
  if (path.endsWith('.flv') || path.includes('/flv') || value.includes('format=flv') || value.includes('protocol=flv') || value.includes('type=flv')) {
    return { type: 'flv', component: 'live-player', rank: 20 }
  }
  if (path.endsWith('.m3u8') || value.includes('format=m3u8') || value.includes('type=m3u8') || value.includes('protocol=hls')) {
    return { type: 'hls', component: 'video', rank: 30 }
  }
  return { type: 'unknown', component: 'live-player', rank: 50 }
}

function pushLiveCandidate(candidates, seen, rawUrl, meta = {}) {
  const url = normalizeLiveUrl(rawUrl)
  if (!url || seen.has(url)) return
  seen.add(url)
  const detected = classifyLiveSource(url)
  candidates.push({
    url,
    type: meta.type && meta.type !== 'auto' ? meta.type : detected.type,
    component: meta.component || detected.component || 'live-player',
    field: meta.field || '',
    sourceIndex: meta.sourceIndex || 0,
    rank: Number(meta.rank || detected.rank || 999),
  })
}

export function getMiniProgramLiveCandidates(detail = {}, streamInfo = {}) {
  const candidates = []
  const seen = new Set()
  asSourceObjectList(detail, streamInfo).forEach((source, sourceIndex) => {
    LIVE_SOURCE_FIELDS.forEach((fieldGroup) => {
      fieldGroup.keys.forEach((field) => {
        const value = source[field]
        if (Array.isArray(value)) {
          value.forEach((url) => pushLiveCandidate(candidates, seen, url, { ...fieldGroup, field, sourceIndex }))
          return
        }
        pushLiveCandidate(candidates, seen, value, { ...fieldGroup, field, sourceIndex })
      })
    })
  })
  return candidates.sort((a, b) => a.rank - b.rank || a.sourceIndex - b.sourceIndex)
}

export function getBestLiveUrl(detail = {}, options = {}) {
  const normalizedOptions = typeof options === 'string' ? { preferredComponent: options } : (options || {})
  const candidates = getMiniProgramLiveCandidates(detail, normalizedOptions.streamInfo || {})
  const preferredComponent = normalizedOptions.preferredComponent || ''
  const match = preferredComponent
    ? candidates.find((candidate) => candidate.component === preferredComponent)
    : candidates[0]
  return (match || candidates[0] || {}).url || ''
}

export function getBestReplayUrl(detail = {}, replayVideo = {}) {
  return (
    replayVideo.videoUrl ||
    replayVideo.video_url ||
    replayVideo.url ||
    replayVideo.playUrl ||
    replayVideo.play_url ||
    replayVideo.replayUrl ||
    replayVideo.replay_url ||
    replayVideo.hlsUrl ||
    replayVideo.hls_url ||
    replayVideo.m3u8Url ||
    replayVideo.m3u8_url ||
    detail.replayVideo?.videoUrl ||
    detail.replayVideo?.video_url ||
    detail.videoUrl ||
    detail.video_url ||
    detail.pullHlsUrl ||
    detail.pull_hls_url ||
    detail.hlsUrl ||
    detail.hls_url ||
    detail.m3u8Url ||
    detail.m3u8_url ||
    detail.pullUrl ||
    detail.pull_url ||
    detail.playUrl ||
    detail.play_url ||
    ''
  )
}

export function isLivePlayerSource(url = '') {
  const value = String(url || '').trim().toLowerCase()
  if (!value) return false
  const path = value.split('?')[0]
  return (
    value.startsWith('rtmp://') ||
    path.endsWith('.flv') ||
    path.includes('/flv') ||
    value.includes('format=flv') ||
    value.includes('protocol=flv') ||
    value.includes('type=flv')
  )
}

export function isVideoSource(url = '') {
  const value = String(url || '').trim().toLowerCase()
  if (!value) return false
  const path = value.split('?')[0]
  return path.endsWith('.mp4') || path.endsWith('.m3u8') || value.includes('format=m3u8') || value.includes('type=m3u8')
}

export function normalizeRoomDetail(raw = {}, fallback = {}) {
  const detail = raw.live_detail || raw.detail || raw.room || raw
  const replayVideos = Array.isArray(detail.replayVideos)
    ? detail.replayVideos
    : Array.isArray(detail.replays)
      ? detail.replays
      : Array.isArray(detail.replayVideoList)
        ? detail.replayVideoList
        : Array.isArray(detail.videoList)
          ? detail.videoList
          : Array.isArray(detail.videos)
            ? detail.videos
      : []
  return {
    ...detail,
    id: detail.id || detail.roomId || detail.liveId || fallback.liveId || fallback.roomId || '',
    roomCode: detail.roomCode || fallback.roomCode || '',
    roomName: detail.roomName || detail.liveName || detail.name || '直播间',
    coverImage: detail.coverImage || detail.liveCover || detail.share_img || detail.cover_img || detail.image || '',
    anchorName: detail.anchorName || detail.anchor_name || detail.supplier_name || '官方直播间',
    anchorAvatar: detail.anchorAvatar || detail.anchor_avatar || detail.avatar || '',
    onlineCount: detail.onlineCount ?? detail.online_number ?? detail.viewCount ?? 0,
    likeCount: detail.likeCount || detail.like_count || 0,
    pushStatus: detail.pushStatus ?? detail.live_status ?? 0,
    replayVideos,
    setting: detail.setting || raw.room_setting || {},
    notice: detail.notice || raw.live_notice?.content || raw.live_notice?.title || '',
  }
}
