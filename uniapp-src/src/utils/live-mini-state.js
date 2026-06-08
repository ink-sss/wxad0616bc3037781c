const STATE_KEY = 'live_mini_window_play_state_v1'
const STATE_BACKUP_KEY = 'live_mini_window_play_state_backup_v1'
const RETURN_STATE_KEY = 'live_mini_window_return_state_v1'
const MAX_STATE_AGE = 30 * 60 * 1000

function safeString(value) {
  return String(value || '').trim()
}

function safeNumber(value, fallback = 0) {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function read(key) {
  try {
    return uni.getStorageSync(key)
  } catch (error) {
    return null
  }
}

function write(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (error) {}
}

function remove(key) {
  try {
    uni.removeStorageSync(key)
  } catch (error) {}
}

function normalizeLiveMiniState(state = {}) {
  const roomCode = safeString(state.roomCode)
  const playUrl = safeString(state.playUrl || state.url)
  const rtcAppId = safeString(state.rtcAppId)
  const rtcChannel = safeString(state.rtcChannel)
  const rtcToken = safeString(state.rtcToken)
  const hasRtcSource = !!(rtcAppId && rtcChannel && rtcToken)
  if (!roomCode || (!playUrl && !hasRtcSource)) return null

  return {
    roomCode,
    liveId: safeString(state.liveId),
    videoId: safeString(state.videoId),
    replayIndex: safeNumber(state.replayIndex, -1),
    title: safeString(state.title),
    poster: safeString(state.poster),
    playUrl,
    backupUrl: safeString(state.backupUrl),
    backupFlvUrl: safeString(state.backupFlvUrl),
    backupHlsUrl: safeString(state.backupHlsUrl),
    sourceType: safeString(state.sourceType),
    sourceComponent: safeString(state.sourceComponent),
    streamingProvider: safeNumber(state.streamingProvider),
    rtcAppId,
    rtcChannel,
    rtcToken,
    rtcUid: safeString(state.rtcUid),
    isLive: state.isLive === true || state.isReplay !== true,
    isReplay: state.isReplay === true,
    muted: state.muted !== false,
    canPlayWithSound: state.canPlayWithSound === true,
    soundMutedByUser: state.soundMutedByUser === true,
    currentTime: Math.max(0, safeNumber(state.currentTime)),
    pushStatus: safeNumber(state.pushStatus),
    updatedAt: safeNumber(state.updatedAt, Date.now()),
  }
}

export function saveLiveMiniState(state) {
  const nextState = normalizeLiveMiniState({
    ...(state || {}),
    updatedAt: Date.now(),
  })
  if (!nextState) return null
  write(STATE_KEY, nextState)
  write(STATE_BACKUP_KEY, nextState)
  return nextState
}

export function loadLiveMiniState(roomCode = '') {
  const state = normalizeLiveMiniState(read(STATE_KEY) || read(STATE_BACKUP_KEY) || {})
  if (!state) return null
  if (safeString(roomCode) && state.roomCode !== safeString(roomCode)) return null
  if (Date.now() - state.updatedAt > MAX_STATE_AGE) {
    remove(STATE_KEY)
    remove(STATE_BACKUP_KEY)
    return null
  }
  return state
}

export function clearLiveMiniState(roomCode = '') {
  const state = loadLiveMiniState()
  if (safeString(roomCode) && state?.roomCode !== safeString(roomCode)) return
  remove(STATE_KEY)
  remove(STATE_BACKUP_KEY)
}

export function patchLiveMiniState(roomCode = '', patch = {}) {
  const state = loadLiveMiniState(roomCode)
  if (!state) return null
  return saveLiveMiniState({ ...state, ...(patch || {}) })
}

export function saveLiveMiniReturnState(state = {}) {
  const nextState = normalizeLiveMiniState({
    ...(state || {}),
    updatedAt: Date.now(),
  })
  if (!nextState) return null
  write(RETURN_STATE_KEY, nextState)
  return nextState
}

export function consumeLiveMiniReturnState(roomCode = '') {
  const state = normalizeLiveMiniState(read(RETURN_STATE_KEY) || {})
  remove(RETURN_STATE_KEY)
  if (!state) return null
  if (safeString(roomCode) && state.roomCode !== safeString(roomCode)) return null
  if (Date.now() - state.updatedAt > MAX_STATE_AGE) return null
  return state
}

export function saveReplayProgressFromMiniState(state, currentTime) {
  const currentSeconds = Math.floor(safeNumber(currentTime))
  if (!state?.isReplay || !state.liveId || !state.videoId || currentSeconds <= 0) return
  try {
    uni.setStorageSync(`replay_progress_${state.liveId}_${state.videoId}`, currentSeconds)
  } catch (error) {}
}
