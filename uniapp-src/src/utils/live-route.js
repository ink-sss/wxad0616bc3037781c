export function parseScene(scene = '') {
  const result = {}
  if (!scene) return result
  let decoded = ''
  try {
    decoded = decodeURIComponent(scene)
  } catch (error) {
    decoded = String(scene)
  }
  const queryTexts = []
  const pushQueryText = (text = '') => {
    if (!text) return
    const queryIndex = text.indexOf('?')
    if (queryIndex >= 0) {
      queryTexts.push(text.slice(queryIndex + 1))
    } else if (text.includes('=') || (text.includes(':') && !text.includes('://'))) {
      queryTexts.push(text.replace(/^\?/, ''))
    }
  }
  const [beforeHash = '', ...hashParts] = decoded.split('#')
  pushQueryText(beforeHash)
  hashParts.forEach(pushQueryText)
  if (!queryTexts.length) pushQueryText(decoded)
  queryTexts.forEach((queryText) => {
    queryText
      .replace(/^\?/, '')
      .split('&')
      .forEach((part) => {
        if (!part) return
        const separatorIndex = part.includes('=') ? part.indexOf('=') : part.indexOf(':')
        const rawKey = separatorIndex >= 0 ? part.slice(0, separatorIndex) : part
        const rawValue = separatorIndex >= 0 ? part.slice(separatorIndex + 1) : ''
        let key = rawKey
        let value = rawValue
        try {
          key = decodeURIComponent(rawKey)
        } catch (error) {}
        try {
          value = decodeURIComponent(rawValue)
        } catch (error) {}
        if (key) result[key] = value || ''
      })
  })
  return result
}

export function normalizeLiveRouteOptions(query = {}) {
  const scene = parseScene(query.scene)
  const merged = { ...scene, ...query }
  const shareCode = merged.shareCode || merged.share_code || ''
  const roomCode = merged.roomCode || merged.room_code || shareCode || ''
  const liveId = merged.liveId || merged.live_id || merged.roomId || merged.room_id || ''
  const mode = merged.mode || ''
  const replay = merged.replay || ''
  const rawLiveType = merged.liveType || merged.live_type || ''
  const bindId = merged.bindId || merged.bind_id || ''
  const normalizedMode = String(mode || '').toLowerCase()
  const normalizedLiveType = String(rawLiveType || '').toLowerCase()
  const liveType = rawLiveType || (normalizedMode === 'replay' ? 'replay' : '')
  const isReplay =
    String(replay || '') === '1' ||
    normalizedMode === 'replay' ||
    normalizedLiveType === 'replay'
  return {
    ...merged,
    roomCode,
    shareCode,
    liveId,
    roomId: merged.roomId || merged.room_id || liveId,
    mode,
    replay,
    liveType,
    bindId,
    isReplay,
    orientation: merged.orientation || '',
    videoId: merged.videoId || merged.video_id || '',
    termId: merged.termId || merged.term_id || '',
  }
}

export function buildBroadcastEntryUrl(input = {}) {
  const options = normalizeLiveRouteOptions(input)
  const params = []
  if (options.roomCode) params.push(`roomCode=${encodeURIComponent(options.roomCode)}`)
  if (options.shareCode && options.shareCode !== options.roomCode) params.push(`shareCode=${encodeURIComponent(options.shareCode)}`)
  if (options.liveId) params.push(`liveId=${encodeURIComponent(options.liveId)}`)
  if (options.roomId && options.roomId !== options.liveId) params.push(`roomId=${encodeURIComponent(options.roomId)}`)
  if (options.mode) params.push(`mode=${encodeURIComponent(options.mode)}`)
  if (options.replay) {
    params.push(`replay=${encodeURIComponent(options.replay)}`)
  } else if (options.isReplay) {
    params.push('replay=1')
  }
  if (options.orientation) params.push(`orientation=${encodeURIComponent(options.orientation)}`)
  if (options.videoId) params.push(`videoId=${encodeURIComponent(options.videoId)}`)
  if (options.termId) params.push(`termId=${encodeURIComponent(options.termId)}`)
  if (options.liveType) params.push(`liveType=${encodeURIComponent(options.liveType)}`)
  if (options.tenantId) params.push(`tenantId=${encodeURIComponent(options.tenantId)}`)
  if (options.bindId) params.push(`bindId=${encodeURIComponent(options.bindId)}`)
  if (options.liveName) params.push(`liveName=${encodeURIComponent(options.liveName)}`)
  if (options.cover) params.push(`cover=${encodeURIComponent(options.cover)}`)
  if (options.liveCover) params.push(`liveCover=${encodeURIComponent(options.liveCover)}`)
  if (options._tc) params.push(`_tc=${encodeURIComponent(options._tc)}`)
  if (options.wx_token) params.push(`wx_token=${encodeURIComponent(options.wx_token)}`)
  return `/pages/broadcast/entry${params.length ? `?${params.join('&')}` : ''}`
}

export function isReplayEntry(options = {}, detail = {}) {
  if (options.isReplay === true) return true
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
    keys: ['pullRtmpUrl', 'pull_rtmp_url', 'pullRtmp', 'pull_rtmp', 'rtmpUrl', 'rtmp_url', 'liveRtmpUrl', 'live_rtmp_url', 'rtmpPullUrl', 'rtmp_pull_url', 'rtmp'],
    type: 'rtmp',
    component: 'live-player',
    rank: 10,
  },
  {
    keys: ['pullFlvUrl', 'pull_flv_url', 'httpFlvUrl', 'http_flv_url', 'pullHttpFlvUrl', 'pull_http_flv_url', 'flvUrl', 'flv_url', 'liveFlvUrl', 'live_flv_url', 'flvPullUrl', 'flv_pull_url', 'flv'],
    type: 'flv',
    component: 'live-player',
    rank: 20,
  },
  {
    keys: ['pullHlsUrl', 'pull_hls_url', 'adaptiveHlsUrl', 'adaptive_hls_url', 'liveAdaptiveHlsUrl', 'live_adaptive_hls_url', 'httpHlsUrl', 'http_hls_url', 'pullHttpHlsUrl', 'pull_http_hls_url', 'hlsUrl', 'hls_url', 'liveHlsUrl', 'live_hls_url', 'hlsPullUrl', 'hls_pull_url', 'm3u8Url', 'm3u8_url', 'm3u8', 'hls'],
    type: 'hls',
    component: 'video',
    rank: 30,
  },
  {
    keys: ['streamUrl', 'stream_url', 'liveUrl', 'live_url', 'pullUrl', 'pull_url', 'playUrl', 'play_url', 'sourceUrl', 'source_url', 'mediaUrl', 'media_url', 'src', 'source', 'url', 'urls'],
    type: 'auto',
    component: '',
    rank: 40,
  },
]

const LIVE_SOURCE_LIST_FIELDS = [
  'pullStreams',
  'pull_streams',
  'streamList',
  'stream_list',
  'streams',
  'liveStreams',
  'live_streams',
  'streamInfos',
  'stream_infos',
  'playUrls',
  'play_urls',
  'urlList',
  'url_list',
  'urls',
  'lines',
  'lineList',
  'line_list',
  'sourceList',
  'source_list',
  'sources',
  'pullUrlList',
  'pull_url_list',
]

const LIVE_SOURCE_OBJECT_FIELDS = [
  'payload',
  'data',
  'result',
  'streamInf',
  'streamInfo',
  'stream_inf',
  'stream_info',
  'playInfo',
  'play_info',
  'mediaInfo',
  'media_info',
  'media',
  'liveStream',
  'live_stream',
  'liveSource',
  'live_source',
  'live',
  'liveInfo',
  'live_info',
  'pullStream',
  'pull_stream',
  'pullInfo',
  'pull_info',
  'stream',
  'urls',
  'urlInfo',
  'url_info',
  'room',
  'detail',
]

const SOURCE_TYPE_FIELDS = [
  'type',
  'sourceType',
  'source_type',
  'streamType',
  'stream_type',
  'protocol',
  'format',
  'playType',
  'play_type',
  'urlType',
  'url_type',
  'mediaType',
  'media_type',
  'ext',
]

const SOURCE_COMPONENT_FIELDS = [
  'sourceComponent',
  'source_component',
  'component',
  'playerComponent',
  'player_component',
]

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asSourceObjectList(detail = {}, streamInfo = {}) {
  const list = []
  const seen = new Set()
  const push = (value) => {
    if (!isPlainObject(value)) return
    if (seen.has(value)) return
    seen.add(value)
    list.push(value)
    LIVE_SOURCE_OBJECT_FIELDS.forEach((field) => {
      push(value[field])
    })
    LIVE_SOURCE_LIST_FIELDS.forEach((field) => {
      if (Array.isArray(value[field])) {
        value[field].forEach(push)
      }
    })
  }
  push(detail)
  push(streamInfo)
  return list
}

function normalizeLiveUrl(url = '') {
  if (typeof url !== 'string' && typeof url !== 'number') return ''
  return String(url || '').trim()
}

function normalizeLiveUrlForMatch(url = '') {
  const value = normalizeLiveUrl(url)
  try {
    return decodeURIComponent(value).toLowerCase()
  } catch (error) {
    return value.toLowerCase()
  }
}

function getLiveUrlPath(value = '') {
  return String(value || '').split('?')[0].split('#')[0]
}

function hasQueryHint(value = '', names = [], hints = []) {
  const pattern = new RegExp(`(?:^|[?&#])(?:${names.join('|')})=([^&#]*)`, 'i')
  const match = String(value || '').match(pattern)
  if (!match) return false
  return hints.some((hint) => String(match[1] || '').toLowerCase().includes(hint))
}

function isFlvSourceHint(value = '', path = '') {
  return (
    path.endsWith('.flv') ||
    path.includes('.flv/') ||
    path.includes('/flv') ||
    path.includes('httpflv') ||
    path.includes('http-flv') ||
    hasQueryHint(value, ['format', 'type', 'protocol', 'play_type', 'stream_type', 'source_type', 'media_type', 'url_type', 'ext', 'hdl', 'source'], ['flv'])
  )
}

function isHlsSourceHint(value = '', path = '') {
  return (
    path.endsWith('.m3u8') ||
    path.includes('.m3u8/') ||
    path.includes('/hls/') ||
    path.includes('/m3u8') ||
    path.includes('httphls') ||
    path.includes('http-hls') ||
    hasQueryHint(value, ['format', 'type', 'protocol', 'play_type', 'stream_type', 'source_type', 'media_type', 'url_type', 'ext', 'source'], ['hls', 'm3u8'])
  )
}

function isMp4SourceHint(value = '', path = '') {
  return (
    path.endsWith('.mp4') ||
    path.includes('.mp4/') ||
    hasQueryHint(value, ['format', 'type', 'protocol', 'play_type', 'stream_type', 'source_type', 'media_type', 'url_type', 'ext', 'source'], ['mp4'])
  )
}

function classifySourceToken(token = '') {
  const value = String(token || '').toLowerCase().replace(/[_\s]/g, '-')
  if (!value) return null
  if (value.includes('rtmp')) return { type: 'rtmp', component: 'live-player', rank: 10 }
  if (value.includes('flv')) return { type: 'flv', component: 'live-player', rank: 20 }
  if (value.includes('hls') || value.includes('m3u8')) return { type: 'hls', component: 'video', rank: 30 }
  if (value.includes('mp4') || value === 'video' || value.includes('vod') || value.includes('replay')) {
    return { type: 'mp4', component: 'video', rank: 35 }
  }
  if (value.includes('live-player') || value.includes('liveplayer')) return { type: 'live', component: 'live-player', rank: 20 }
  return null
}

function inferSourceMeta(source = {}) {
  if (!isPlainObject(source)) return {}
  const tokens = []
  SOURCE_TYPE_FIELDS.forEach((field) => {
    if (source[field] !== undefined && source[field] !== null) tokens.push(source[field])
  })
  SOURCE_COMPONENT_FIELDS.forEach((field) => {
    if (source[field] !== undefined && source[field] !== null) tokens.push(source[field])
  })
  for (const token of tokens) {
    const meta = classifySourceToken(token)
    if (meta) return meta
  }
  return {}
}

function mergeCandidateMeta(fieldGroup = {}, source = {}, field = '', sourceIndex = 0) {
  const sourceMeta = inferSourceMeta(source)
  if (fieldGroup.type && fieldGroup.type !== 'auto') {
    return { ...sourceMeta, ...fieldGroup, field, sourceIndex }
  }
  return { ...fieldGroup, ...sourceMeta, field, sourceIndex }
}

function classifyLiveSource(url = '') {
  const value = normalizeLiveUrlForMatch(url)
  const path = getLiveUrlPath(value)
  if (!value) return { type: '', component: '', rank: 999 }
  if (value.startsWith('rtmp://')) return { type: 'rtmp', component: 'live-player', rank: 10 }
  if (isFlvSourceHint(value, path)) {
    return { type: 'flv', component: 'live-player', rank: 20 }
  }
  if (isHlsSourceHint(value, path)) {
    return { type: 'hls', component: 'video', rank: 30 }
  }
  if (isMp4SourceHint(value, path)) {
    return { type: 'mp4', component: 'video', rank: 35 }
  }
  return { type: 'unknown', component: 'live-player', rank: 50 }
}

function pushLiveCandidate(candidates, seen, rawUrl, meta = {}) {
  const url = normalizeLiveUrl(rawUrl)
  if (!url || seen.has(url)) return
  seen.add(url)
  const detected = classifyLiveSource(url)
  const hasExplicitType = meta.type && meta.type !== 'auto'
  candidates.push({
    url,
    type: hasExplicitType ? meta.type : detected.type,
    component: meta.component || detected.component || 'live-player',
    field: meta.field || '',
    sourceIndex: meta.sourceIndex || 0,
    rank: Number(hasExplicitType ? (meta.rank || detected.rank || 999) : (detected.rank || meta.rank || 999)),
  })
}

export function getMiniProgramLiveCandidates(detail = {}, streamInfo = {}) {
  const candidates = []
  const seen = new Set()
  asSourceObjectList(detail, streamInfo).forEach((source, sourceIndex) => {
    LIVE_SOURCE_FIELDS.forEach((fieldGroup) => {
      fieldGroup.keys.forEach((field) => {
        const meta = mergeCandidateMeta(fieldGroup, source, field, sourceIndex)
        const value = source[field]
        if (Array.isArray(value)) {
          value.forEach((url) => pushLiveCandidate(candidates, seen, url, meta))
          return
        }
        pushLiveCandidate(candidates, seen, value, meta)
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
  return classifyLiveSource(url).component === 'live-player'
}

export function isVideoSource(url = '') {
  return classifyLiveSource(url).component === 'video'
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
