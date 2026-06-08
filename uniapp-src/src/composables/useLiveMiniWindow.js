import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getLiveDetail, getLiveStreamInf } from '@/api/live'
import { loadLiveRoomContext } from '@/utils/live-room-context'
import {
  loadLiveMiniState,
  clearLiveMiniState,
  patchLiveMiniState,
  saveLiveMiniState,
  saveLiveMiniReturnState,
  saveReplayProgressFromMiniState,
} from '@/utils/live-mini-state'
import { returnToLiveRoom } from '@/utils/live-room-navigation'
import { getBestReplayUrl, getMiniProgramLiveCandidates, isVideoSource } from '@/utils/live-route.js'

const POSITION_KEY = 'live_mini_window_position_v1'
const CLOSED_KEY = 'live_mini_window_closed_room_v1'
const CLOSED_MAX_AGE = 30 * 60 * 1000
const MINI_WIDTH_RPX = 224
const MINI_HEIGHT_RPX = 316
const DEBUG_EVENTS_LIMIT = 20

function rpxToPx(value) {
  try {
    const sys = uni.getSystemInfoSync()
    return (Number(value) / 750) * Number(sys.windowWidth || 375)
  } catch (error) {
    return Number(value) / 2
  }
}

function getWindowSize() {
  try {
    const sys = uni.getSystemInfoSync()
    return {
      width: Number(sys.windowWidth || 375),
      height: Number(sys.windowHeight || 667),
    }
  } catch (error) {
    return { width: 375, height: 667 }
  }
}

function clampPosition(left, top) {
  const win = getWindowSize()
  const width = rpxToPx(MINI_WIDTH_RPX)
  const height = rpxToPx(MINI_HEIGHT_RPX)
  const margin = rpxToPx(16)
  return {
    left: Math.min(Math.max(left, margin), Math.max(margin, win.width - width - margin)),
    top: Math.min(Math.max(top, margin), Math.max(margin, win.height - height - margin)),
  }
}

function getCurrentRoute() {
  try {
    if (typeof getCurrentPages !== 'function') return ''
    const pages = getCurrentPages() || []
    return String(pages[pages.length - 1]?.route || '').replace(/^\/+/, '')
  } catch (error) {
    return ''
  }
}

function isLiveRoute() {
  const route = getCurrentRoute()
  return route === 'pages/broadcast/entry' || route === 'pages/broadcast/replay'
}

function safeString(value) {
  return String(value || '').trim()
}

function safeNumber(value, fallback = 0) {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return String(value || '')
  }
}

function maskUrl(value = '') {
  return String(value || '')
    .replace(/([?&](?:token|access_token|auth_key|key|sign|signature|wx_token)=)[^&#]*/gi, '$1***')
    .replace(/(\/)([A-Za-z0-9_-]{24,})(?=\/|$)/g, '$1***')
}

function isMiniWindowVideoUrl(url = '', state = {}) {
  const value = safeString(url)
  if (!value) return false
  if (state?.isReplay === true) return true
  return isVideoSource(value)
}

function resolveCachedMiniVideoState(state = null) {
  if (!state) return null
  if (isMiniWindowVideoUrl(state.playUrl, state)) return state
  const backupHlsUrl = [state.backupHlsUrl, state.backupUrl].find((url) => isMiniWindowVideoUrl(url, { ...state, isReplay: false })) || ''
  if (!backupHlsUrl) return null
  return {
    ...state,
    playUrl: backupHlsUrl,
    backupUrl: state.backupUrl || state.playUrl || '',
    backupHlsUrl,
  }
}

function snapshotStorage() {
  let miniState = null
  let liveContext = null
  let closedState = null
  try {
    miniState = loadLiveMiniState()
  } catch (error) {}
  try {
    liveContext = loadLiveRoomContext()
  } catch (error) {}
  try {
    closedState = uni.getStorageSync(CLOSED_KEY)
  } catch (error) {}
  return {
    miniState,
    liveContext,
    closedState,
  }
}

function getCachedMiniRoomCode() {
  try {
    return safeString(loadLiveMiniState()?.roomCode)
  } catch (error) {
    return ''
  }
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return ''
}

function isClosedRoom(code) {
  try {
    const saved = uni.getStorageSync(CLOSED_KEY)
    const roomCode = safeString(code)
    if (!roomCode) return false
    if (typeof saved === 'string') return saved === roomCode
    if (!saved || safeString(saved.roomCode) !== roomCode) return false
    const updatedAt = safeNumber(saved.updatedAt)
    if (updatedAt && Date.now() - updatedAt > CLOSED_MAX_AGE) {
      uni.removeStorageSync(CLOSED_KEY)
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

function markClosedRoom(code) {
  try {
    uni.setStorageSync(CLOSED_KEY, {
      roomCode: safeString(code),
      updatedAt: Date.now(),
    })
  } catch (error) {}
}

function getStoredPosition() {
  try {
    const saved = uni.getStorageSync(POSITION_KEY)
    if (saved && Number.isFinite(Number(saved.left)) && Number.isFinite(Number(saved.top))) {
      return clampPosition(Number(saved.left), Number(saved.top))
    }
  } catch (error) {}
  return null
}

function persistPosition(position) {
  try {
    uni.setStorageSync(POSITION_KEY, position)
  } catch (error) {}
}

function getReplayVideos(detail = {}) {
  return Array.isArray(detail.replayVideos)
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
}

function selectMiniPlayableSource(detail = {}, streamInfo = {}) {
  const replayVideos = getReplayVideos(detail)
  const replayVideo = detail.replayVideo || replayVideos[0] || {}
  const replayUrl = getBestReplayUrl(detail, replayVideo)
  const liveCandidates = getMiniProgramLiveCandidates(detail, streamInfo)
  const isAdaptiveHlsCandidate = (candidate) => (
    candidate?.component === 'video' &&
    candidate?.type === 'hls' &&
    (candidate.isAdaptiveHls === true || String(candidate.field || '').toLowerCase().includes('adaptive'))
  )
  const liveCandidate =
    liveCandidates.find((candidate) => candidate.component === 'video' && candidate.type === 'hls' && !isAdaptiveHlsCandidate(candidate)) ||
    liveCandidates.find(isAdaptiveHlsCandidate) ||
    null
  const liveUrl = liveCandidate?.url || ''
  const pushStatus = safeNumber(firstValue(detail, 'pushStatus', 'live_status'))
  const hasReplay = !!replayUrl && (pushStatus === 2 || safeNumber(firstValue(detail, 'hasReplay', 'has_replay')) === 1)
  const isReplay = hasReplay && !liveUrl
  return {
    url: isReplay ? replayUrl : liveUrl,
    backupUrl: liveCandidates.find((candidate) => (
      candidate.url &&
      candidate.url !== liveUrl &&
      candidate.component === 'video' &&
      candidate.type === 'hls'
    ))?.url || '',
    isReplay,
    isLive: !isReplay && !!liveUrl,
    videoId: firstValue(replayVideo, 'id', 'videoId', 'video_id', 'replayVideoId', 'replay_video_id'),
    replayIndex: replayVideos.length ? 0 : -1,
    cover:
      firstValue(detail, 'coverImage', 'warmUpVideoCoverImage', 'liveCover', 'cover', 'image') ||
      firstValue(replayVideo, 'coverImage', 'cover_image', 'cover', 'poster'),
    pushStatus,
  }
}

export function useLiveMiniWindow(props = {}) {
  const instance = getCurrentInstance()
  const visible = ref(false)
  const poster = ref('')
  const playUrl = ref('')
  const muted = ref(true)
  const isPlaying = ref(false)
  const title = ref('直播间')
  const stateRoomCode = ref('')
  const position = ref(getFallbackPosition())
  const hideReason = ref('init')
  const lastError = ref('')
  const debugCopyStatus = ref('')
  const debugEvents = ref([])

  let activePlayState = null
  let dragStart = null
  let hasMoved = false
  let closedByUser = false
  let loadSeq = 0
  let refreshTimer = null
  let progressTimer = null
  let playRetryTimer = null
  let lastRestoreAt = 0
  let suppressRestoreUntil = 0

  function getFallbackPosition() {
    const win = getWindowSize()
    return clampPosition(win.width - rpxToPx(MINI_WIDTH_RPX) - rpxToPx(24), win.height - rpxToPx(MINI_HEIGHT_RPX) - rpxToPx(props.bottomOffset || 190))
  }

  const hasPlayableSource = computed(() => isMiniWindowVideoUrl(playUrl.value, activePlayState || { isReplay: false }))
  const displayTitle = computed(() => title.value || '直播间')
  const statusText = computed(() => (hasPlayableSource.value ? '播放中' : '直播间'))
  const miniStyle = computed(() => ({
    left: `${position.value.left}px`,
    top: `${position.value.top}px`,
  }))
  const debugVisible = computed(() => true)
  const debugSummary = computed(() => [
    `visible:${visible.value ? 1 : 0}`,
    `reason:${hideReason.value || '-'}`,
    `prop:${safeString(props.roomCode) || '-'}`,
    `room:${stateRoomCode.value || resolveRoomCode() || '-'}`,
    `url:${playUrl.value ? 'yes' : 'no'}`,
    `playing:${isPlaying.value ? 1 : 0}`,
    `err:${lastError.value || '-'}`,
  ].join(' '))

  function recordDebug(event, payload = {}) {
    const item = {
      at: new Date().toISOString(),
      event,
      payload,
    }
    debugEvents.value = [...debugEvents.value.slice(-(DEBUG_EVENTS_LIMIT - 1)), item]
  }

  function setHidden(reason, payload = {}) {
    hideReason.value = reason
    visible.value = false
    recordDebug('hidden', { reason, ...payload })
  }

  function resolveRoomCode() {
    const propCode = safeString(props.roomCode)
    if (propCode) return propCode
    try {
      return safeString(loadLiveRoomContext()?.roomCode) || getCachedMiniRoomCode()
    } catch (error) {
      return getCachedMiniRoomCode()
    }
  }

  function applyMiniState(state = {}) {
    closedByUser = false
    activePlayState = state || null
    stateRoomCode.value = state.roomCode || resolveRoomCode()
    title.value = state.title || '直播间'
    poster.value = state.poster || ''
    playUrl.value = isMiniWindowVideoUrl(state.playUrl, state) ? state.playUrl : ''
    muted.value = true
    isPlaying.value = false
    hideReason.value = state.playUrl ? 'state_applied' : 'state_no_url'
    recordDebug('state_applied', {
      roomCode: stateRoomCode.value,
      hasPlayUrl: !!playUrl.value,
      isLive: state.isLive === true,
      isReplay: state.isReplay === true,
      pushStatus: state.pushStatus,
    })
  }

  function initPosition() {
    position.value = getStoredPosition() || getFallbackPosition()
  }

  function createMiniVideoContext() {
    try {
      return uni.createVideoContext('liveMiniVideo', instance?.proxy)
    } catch (error) {
      return null
    }
  }

  function seekMiniVideo(currentTime = 0) {
    const target = safeNumber(currentTime)
    if (!target || target <= 0) return
    setTimeout(() => {
      try {
        createMiniVideoContext()?.seek?.(target)
      } catch (error) {}
    }, 180)
  }

  function startProgressSync() {
    stopProgressSync()
    if (!activePlayState?.isReplay) return
    progressTimer = setInterval(() => {
      syncMiniProgress()
    }, 1500)
  }

  function stopProgressSync() {
    if (!progressTimer) return
    clearInterval(progressTimer)
    progressTimer = null
  }

  function syncMiniProgress(currentTime) {
    if (!activePlayState?.isReplay) return
    const nextTime = safeNumber(currentTime, activePlayState.currentTime || 0)
    if (nextTime <= 0) return
    activePlayState = patchLiveMiniState(activePlayState.roomCode, {
      currentTime: nextTime,
      muted: muted.value,
      canPlayWithSound: activePlayState.canPlayWithSound === true || muted.value === false,
    }) || {
      ...activePlayState,
      currentTime: nextTime,
      muted: muted.value,
      canPlayWithSound: activePlayState.canPlayWithSound === true || muted.value === false,
    }
    saveReplayProgressFromMiniState(activePlayState, nextTime)
  }

  function getReturnPlaybackState() {
    if (!activePlayState) return null
    const nextState = {
      ...activePlayState,
      roomCode: activePlayState.roomCode || stateRoomCode.value || resolveRoomCode(),
      muted: muted.value,
      canPlayWithSound: activePlayState.canPlayWithSound === true || muted.value === false,
    }
    activePlayState = patchLiveMiniState(nextState.roomCode, nextState) || nextState
    saveReplayProgressFromMiniState(activePlayState, activePlayState.currentTime)
    return activePlayState
  }

  function playMini() {
    if (!visible.value || !hasPlayableSource.value) {
      recordDebug('play_skip', {
        visible: visible.value,
        hasPlayableSource: hasPlayableSource.value,
      })
      scheduleRefreshMini()
      return
    }
    try {
      recordDebug('play_command', { playUrl: maskUrl(playUrl.value) })
      createMiniVideoContext()?.play?.()
    } catch (error) {}
  }

  function schedulePlayMini(retry = 0) {
    if (playRetryTimer) {
      clearTimeout(playRetryTimer)
      playRetryTimer = null
    }
    const delay = retry <= 0 ? 80 : retry === 1 ? 280 : 700
    playRetryTimer = setTimeout(() => {
      playRetryTimer = null
      playMini()
      if (!isPlaying.value && retry < 2) {
        schedulePlayMini(retry + 1)
      }
    }, delay)
  }

  function stopMiniPlayback() {
    if (playRetryTimer) {
      clearTimeout(playRetryTimer)
      playRetryTimer = null
    }
    stopProgressSync()
    try {
      createMiniVideoContext()?.pause?.()
    } catch (error) {}
    isPlaying.value = false
    recordDebug('playback_stopped')
  }

  function applyMiniDetail(detail = {}, streamInfo = {}) {
    const source = selectMiniPlayableSource(detail, streamInfo)
    const room = safeString(firstValue(detail, 'roomCode', 'room_code') || resolveRoomCode())
    if (!room || !source.url || !isMiniWindowVideoUrl(source.url, source)) {
      recordDebug('detail_no_source', {
        room,
        hasSourceUrl: !!source.url,
        pushStatus: source.pushStatus,
      })
      return false
    }
    const nextState = saveLiveMiniState({
      roomCode: room,
      liveId: firstValue(detail, 'roomId', 'room_id', 'liveId', 'live_id', 'id'),
      videoId: source.videoId,
      replayIndex: source.replayIndex,
      title: firstValue(detail, 'roomName', 'room_name', 'liveName', 'live_name', 'name') || '直播间',
      poster: source.cover,
      playUrl: source.url,
      backupUrl: source.backupUrl,
      backupHlsUrl: source.backupUrl,
      sourceType: source.isReplay ? 'replay' : 'hls',
      sourceComponent: 'video',
      isLive: source.isLive,
      isReplay: source.isReplay,
      muted: true,
      canPlayWithSound: false,
      currentTime: 0,
      pushStatus: source.pushStatus,
    })
    if (!nextState) return false
    applyMiniState(nextState)
    return true
  }

  async function refreshMini() {
    const code = resolveRoomCode()
    if (props.enabled === false) {
      setHidden('disabled')
      stopMiniPlayback()
      return
    }
    if (!code) {
      setHidden('no_room_code')
      stopMiniPlayback()
      return
    }
    if (isLiveRoute()) {
      setHidden('live_route', { route: getCurrentRoute() })
      stopMiniPlayback()
      return
    }
    if (isClosedRoom(code)) {
      setHidden('closed_room', { roomCode: code })
      stopMiniPlayback()
      return
    }
    const seq = ++loadSeq
    hideReason.value = 'loading'
    recordDebug('refresh_start', { roomCode: code, seq })
    const cachedState = loadLiveMiniState(code)
    const cachedVideoState = resolveCachedMiniVideoState(cachedState)
    if (cachedVideoState?.playUrl) {
      const normalizedCachedState = cachedVideoState.playUrl !== cachedState.playUrl
        ? saveLiveMiniState(cachedVideoState) || cachedVideoState
        : cachedVideoState
      applyMiniState(normalizedCachedState)
      visible.value = true
      hideReason.value = 'visible_cached'
      initPosition()
      await nextTick()
      seekMiniVideo(normalizedCachedState.currentTime)
      schedulePlayMini()
      startProgressSync()
      return
    }
    if (cachedState && !cachedVideoState) {
      visible.value = false
      playUrl.value = ''
      poster.value = cachedState.poster || poster.value
      recordDebug('cached_no_hls_source', {
        playUrl: maskUrl(cachedState.playUrl),
        backupUrl: maskUrl(cachedState.backupUrl),
        backupHlsUrl: maskUrl(cachedState.backupHlsUrl),
        isReplay: cachedState.isReplay === true,
      })
    }
    try {
      const [detail, streamInfo] = await Promise.all([
        getLiveDetail(code),
        getLiveStreamInf(code).catch(() => ({})),
      ])
      if (seq !== loadSeq) return
      if (!detail || detail.needReLogin || !applyMiniDetail(detail, streamInfo || {})) {
        setHidden(!detail ? 'detail_empty' : detail.needReLogin ? 'need_relogin' : 'detail_no_playable_source', { roomCode: code })
        stopMiniPlayback()
        return
      }
      visible.value = true
      hideReason.value = 'visible_detail'
      initPosition()
      await nextTick()
      schedulePlayMini()
      startProgressSync()
    } catch (error) {
      lastError.value = error?.message || error?.errMsg || String(error || 'load fail')
      console.warn('[LiveMiniWindow] load detail fail:', error)
      setHidden('load_error', { error: lastError.value })
      stopMiniPlayback()
    }
  }

  function scheduleRefreshMini() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
    refreshTimer = setTimeout(() => {
      refreshTimer = null
      refreshMini()
    }, 60)
  }

  function resumeMiniPlayback() {
    if (!visible.value || !hasPlayableSource.value) {
      scheduleRefreshMini()
      return
    }
    playMini()
    startProgressSync()
  }

  function closeMini() {
    const code = resolveRoomCode()
    if (code) markClosedRoom(code)
    closedByUser = true
    activePlayState = null
    setHidden('closed_by_user', { roomCode: code })
    stopMiniPlayback()
    clearLiveMiniState(stateRoomCode.value || code)
  }

  function restoreLive() {
    const now = Date.now()
    if (hasMoved || now < suppressRestoreUntil) {
      hasMoved = false
      return
    }
    if (now - lastRestoreAt < 350) return
    lastRestoreAt = now
    const code = stateRoomCode.value || resolveRoomCode()
    if (!code) return
    const returnState = getReturnPlaybackState()
    if (returnState) saveLiveMiniReturnState(returnState)
    stopMiniPlayback()
    const resumeParams = returnState?.isReplay
      ? {
          miniResumeVideoId: returnState.videoId || '',
          miniResumeTime: Math.floor(safeNumber(returnState.currentTime)),
          miniResumeIndex: Number.isFinite(Number(returnState.replayIndex)) ? Number(returnState.replayIndex) : undefined,
        }
      : {}
    returnToLiveRoom(code, resumeParams)
  }

  function onDragStart(event = {}) {
    const touch = event.touches?.[0] || event.changedTouches?.[0]
    if (!touch) return
    hasMoved = false
    dragStart = {
      x: touch.clientX,
      y: touch.clientY,
      left: position.value.left,
      top: position.value.top,
    }
  }

  function onDragMove(event = {}) {
    const touch = event.touches?.[0] || event.changedTouches?.[0]
    if (!touch || !dragStart) return
    const dx = touch.clientX - dragStart.x
    const dy = touch.clientY - dragStart.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true
    position.value = clampPosition(
      dragStart.left + dx,
      dragStart.top + dy,
    )
  }

  function onDragEnd() {
    if (!dragStart) return
    const moved = hasMoved
    dragStart = null
    if (moved) {
      persistPosition(position.value)
      suppressRestoreUntil = Date.now() + 220
      setTimeout(() => {
        hasMoved = false
      }, 0)
      return
    }
    restoreLive()
  }

  function onMiniPlay() {
    isPlaying.value = true
    hideReason.value = visible.value ? 'playing' : hideReason.value
    recordDebug('video_play')
    startProgressSync()
  }

  function onMiniPause() {
    isPlaying.value = false
    recordDebug('video_pause')
    stopProgressSync()
  }

  function onMiniTimeUpdate(event = {}) {
    syncMiniProgress(event.detail?.currentTime)
  }

  function buildDebugReport() {
    const storage = snapshotStorage()
    return safeJson({
      timestamp: new Date().toISOString(),
      route: getCurrentRoute(),
      props: {
        roomCode: safeString(props.roomCode),
        enabled: props.enabled !== false,
        bottomOffset: props.bottomOffset,
        returnOrigin: props.returnOrigin,
      },
      state: {
        visible: visible.value,
        hideReason: hideReason.value,
        stateRoomCode: stateRoomCode.value,
        resolvedRoomCode: resolveRoomCode(),
        hasPlayableSource: hasPlayableSource.value,
        playUrl: maskUrl(playUrl.value),
        poster: maskUrl(poster.value),
        muted: muted.value,
        isPlaying: isPlaying.value,
        title: title.value,
        lastError: lastError.value,
      },
      storage: {
        miniState: storage.miniState ? {
          ...storage.miniState,
          playUrl: maskUrl(storage.miniState.playUrl),
          backupUrl: maskUrl(storage.miniState.backupUrl),
          backupFlvUrl: maskUrl(storage.miniState.backupFlvUrl),
          backupHlsUrl: maskUrl(storage.miniState.backupHlsUrl),
          poster: maskUrl(storage.miniState.poster),
        } : null,
        liveContext: storage.liveContext,
        closedState: storage.closedState,
      },
      events: debugEvents.value,
    })
  }

  function copyDebugInfo() {
    const report = buildDebugReport()
    debugCopyStatus.value = '复制中...'
    uni.setClipboardData({
      data: report,
      showToast: false,
      success() {
        debugCopyStatus.value = '已复制'
      },
      fail(error) {
        debugCopyStatus.value = '复制失败'
        recordDebug('copy_failed', { error: error?.errMsg || String(error || '') })
      },
    })
  }

  onMounted(() => {
    scheduleRefreshMini()
  })

  onShow(() => {
    resumeMiniPlayback()
  })

  watch(
    () => [props.roomCode, props.enabled],
    () => {
      scheduleRefreshMini()
    },
  )

  onBeforeUnmount(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
    if (playRetryTimer) {
      clearTimeout(playRetryTimer)
      playRetryTimer = null
    }
    if (!closedByUser) {
      const state = getReturnPlaybackState()
      if (state) saveLiveMiniState(state)
    }
    stopMiniPlayback()
  })

  return {
    visible,
    poster,
    playUrl,
    hasPlayableSource,
    muted,
    isPlaying,
    displayTitle,
    statusText,
    miniStyle,
    closeMini,
    restoreLive,
    playMini,
    onMiniPlay,
    onMiniPause,
    onMiniTimeUpdate,
    onDragStart,
    onDragMove,
    onDragEnd,
    debugVisible,
    debugSummary,
    debugCopyStatus,
    copyDebugInfo,
  }
}
