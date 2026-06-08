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
import { getBestReplayUrl, getMiniProgramLiveCandidates } from '@/utils/live-route.js'

const POSITION_KEY = 'live_mini_window_position_v1'
const CLOSED_KEY = 'live_mini_window_closed_room_v1'
const CLOSED_MAX_AGE = 30 * 60 * 1000
const MINI_WIDTH_RPX = 224
const MINI_HEIGHT_RPX = 316

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

  const hasPlayableSource = computed(() => !!playUrl.value)
  const displayTitle = computed(() => title.value || '直播间')
  const statusText = computed(() => (hasPlayableSource.value ? '播放中' : '直播间'))
  const miniStyle = computed(() => ({
    left: `${position.value.left}px`,
    top: `${position.value.top}px`,
  }))

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
    playUrl.value = state.playUrl || ''
    muted.value = true
    isPlaying.value = false
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
      scheduleRefreshMini()
      return
    }
    try {
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
  }

  function applyMiniDetail(detail = {}, streamInfo = {}) {
    const source = selectMiniPlayableSource(detail, streamInfo)
    const room = safeString(firstValue(detail, 'roomCode', 'room_code') || resolveRoomCode())
    if (!room || !source.url) return false
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
    if (props.enabled === false || !code || isLiveRoute() || isClosedRoom(code)) {
      visible.value = false
      stopMiniPlayback()
      return
    }
    const seq = ++loadSeq
    const cachedState = loadLiveMiniState(code)
    if (cachedState?.playUrl) {
      applyMiniState(cachedState)
      visible.value = true
      initPosition()
      await nextTick()
      seekMiniVideo(cachedState.currentTime)
      schedulePlayMini()
      startProgressSync()
      return
    }
    try {
      const [detail, streamInfo] = await Promise.all([
        getLiveDetail(code),
        getLiveStreamInf(code).catch(() => ({})),
      ])
      if (seq !== loadSeq) return
      if (!detail || detail.needReLogin || !applyMiniDetail(detail, streamInfo || {})) {
        visible.value = false
        stopMiniPlayback()
        return
      }
      visible.value = true
      initPosition()
      await nextTick()
      schedulePlayMini()
      startProgressSync()
    } catch (error) {
      console.warn('[LiveMiniWindow] load detail fail:', error)
      visible.value = false
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
    visible.value = false
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
    startProgressSync()
  }

  function onMiniPause() {
    isPlaying.value = false
    stopProgressSync()
  }

  function onMiniTimeUpdate(event = {}) {
    syncMiniProgress(event.detail?.currentTime)
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
  }
}
