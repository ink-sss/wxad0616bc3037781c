export function deriveMp4FromM3u8(url = '') {
  return String(url || '').replace(/\.m3u8(\?|#|$)/i, '.mp4$1')
}

export function deriveHlsFromFlv(url = '') {
  return String(url || '').replace(/\.flv(\?|#|$)/i, '.m3u8$1')
}

function normalizeMediaUrl(url = '') {
  return String(url || '').trim()
}

function getMediaPath(url = '') {
  return normalizeMediaUrl(url).split('?')[0].split('#')[0].toLowerCase()
}

export function isReplayVideoSource(url = '') {
  const value = normalizeMediaUrl(url).toLowerCase()
  const path = getMediaPath(value)
  if (!value) return false
  if (value.startsWith('rtmp://')) return false
  if (
    path.endsWith('.flv') ||
    path.includes('/flv') ||
    value.includes('format=flv') ||
    value.includes('protocol=flv') ||
    value.includes('type=flv')
  ) {
    return false
  }
  return (
    path.endsWith('.mp4') ||
    path.endsWith('.m3u8') ||
    value.includes('format=mp4') ||
    value.includes('type=mp4') ||
    value.includes('format=m3u8') ||
    value.includes('type=m3u8') ||
    value.includes('protocol=hls')
  )
}

function getReplaySourceCandidates(source = {}) {
  const push = (list, url, type = '') => {
    const value = normalizeMediaUrl(url)
    if (!value || list.some((item) => item.url === value)) return
    list.push({ url: value, type })
  }
  const explicit = []
  push(explicit, source.videoUrl, '')
  push(explicit, source.video_url, '')
  push(explicit, source.playUrl, '')
  push(explicit, source.play_url, '')
  push(explicit, source.replayUrl, '')
  push(explicit, source.replay_url, '')
  push(explicit, source.fileUrl, '')
  push(explicit, source.file_url, '')
  push(explicit, source.url, '')
  push(explicit, source.mp4Url, 'mp4')
  push(explicit, source.mp4_url, 'mp4')
  push(explicit, source.m3u8Url, 'hls')
  push(explicit, source.m3u8_url, 'hls')
  push(explicit, source.hlsUrl, 'hls')
  push(explicit, source.hls_url, 'hls')
  return explicit
}

function isDefinitelyUnsupportedReplayUrl(url = '') {
  const value = normalizeMediaUrl(url).toLowerCase()
  const path = getMediaPath(value)
  if (!value) return true
  return (
    value.startsWith('rtmp://') ||
    path.endsWith('.flv') ||
    path.includes('/flv') ||
    value.includes('format=flv') ||
    value.includes('protocol=flv') ||
    value.includes('type=flv')
  )
}

function inferReplaySourceType(url = '') {
  const value = normalizeMediaUrl(url).toLowerCase()
  const path = getMediaPath(value)
  if (path.endsWith('.mp4') || value.includes('format=mp4') || value.includes('type=mp4')) return 'mp4'
  if (path.endsWith('.m3u8') || value.includes('format=m3u8') || value.includes('type=m3u8') || value.includes('protocol=hls')) return 'hls'
  return ''
}

export function selectReplayVideoPlaybackSource(source = {}) {
  const candidates = getReplaySourceCandidates(source)
  const playable = candidates.find((item) => isReplayVideoSource(item.url))
  const fallback = candidates.find((item) => !isDefinitelyUnsupportedReplayUrl(item.url))
  const selected = playable || fallback || null
  const playUrl = selected?.url || ''
  const mp4Backup = inferReplaySourceType(playUrl) === 'hls' ? deriveMp4FromM3u8(playUrl) : ''
  const backupUrl = mp4Backup && mp4Backup !== playUrl ? mp4Backup : ''
  return {
    playUrl,
    backupUrl,
    sourceType: selected?.type || inferReplaySourceType(playUrl),
  }
}

export function createVideoPlayer(options = {}) {
  const id = options.id || 'liveVideo'
  const getVideoContext = () => {
    try {
      const context = options.createMediaContext?.(id, 'video')
      if (context) return context
      return uni.createVideoContext ? uni.createVideoContext(id) : null
    } catch (error) {
      return null
    }
  }
  const getLiveContext = () => {
    try {
      const context = options.createMediaContext?.(id, 'live-player')
      if (context) return context
      return uni.createLivePlayerContext ? uni.createLivePlayerContext(id) : null
    } catch (error) {
      return null
    }
  }
  const getContext = () => (options.live || player.live)
    ? (getLiveContext() || getVideoContext())
    : (getVideoContext() || getLiveContext())
  const player = {
    id,
    url: options.url || '',
    backupUrl: options.backupUrl || '',
    live: !!options.live,
    muted: !!options.muted,
    onEnded: options.onEnded || null,
    play() {
      try { getContext()?.play?.() } catch (error) {}
    },
    pause() {
      try { getContext()?.pause?.() } catch (error) {}
    },
    stop() {
      try { getContext()?.stop?.() } catch (error) {}
    },
    seek(time = 0) {
      try { getVideoContext()?.seek?.(Number(time || 0)) } catch (error) {}
    },
    setMuted(value) {
      this.muted = !!value
    },
    unmute() {
      this.setMuted(false)
      this.play()
    },
    playFromUserGesture() {
      this.play()
    },
    destroy() {
      try { getContext()?.pause?.() } catch (error) {}
    },
    _startAutoplayWatchdog() {},
    getActiveType() {
      return this.live ? 'live-player' : 'video'
    },
    getVideoElement() {
      return null
    },
  }
  return player
}
