import { computed, ref } from 'vue'
import { loadLiveMiniState, clearLiveMiniState } from '@/utils/live-mini-state'
import { returnToLiveRoom } from '@/utils/live-room-navigation'

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

export function useLiveMiniWindow(props = {}) {
  const initial = loadLiveMiniState(props.roomCode) || {}
  const visible = ref(!!(props.enabled && initial.roomCode && initial.playUrl))
  const poster = ref(initial.poster || '')
  const playUrl = ref(initial.playUrl || '')
  const muted = ref(initial.muted !== false)
  const isPlaying = ref(false)
  const title = ref(initial.title || '直播间')
  const stateRoomCode = ref(initial.roomCode || props.roomCode || '')
  const start = ref(null)

  const fallback = (() => {
    const win = getWindowSize()
    return clampPosition(win.width - rpxToPx(MINI_WIDTH_RPX) - rpxToPx(24), win.height - rpxToPx(MINI_HEIGHT_RPX) - rpxToPx(props.bottomOffset || 190))
  })()
  const position = ref(fallback)

  const hasPlayableSource = computed(() => !!playUrl.value)
  const displayTitle = computed(() => title.value || '直播间')
  const statusText = computed(() => (hasPlayableSource.value ? '播放中' : '直播间'))
  const miniStyle = computed(() => ({
    left: `${position.value.left}px`,
    top: `${position.value.top}px`,
  }))

  function closeMini() {
    visible.value = false
    clearLiveMiniState(stateRoomCode.value)
  }

  function restoreLive() {
    if (!stateRoomCode.value) return
    returnToLiveRoom(stateRoomCode.value)
  }

  function playMini() {
    try {
      uni.createVideoContext('liveMiniVideo').play()
    } catch (error) {}
  }

  function onDragStart(event = {}) {
    const touch = event.touches?.[0] || event.changedTouches?.[0]
    if (!touch) return
    start.value = {
      x: touch.clientX,
      y: touch.clientY,
      left: position.value.left,
      top: position.value.top,
    }
  }

  function onDragMove(event = {}) {
    const touch = event.touches?.[0] || event.changedTouches?.[0]
    if (!touch || !start.value) return
    position.value = clampPosition(
      start.value.left + touch.clientX - start.value.x,
      start.value.top + touch.clientY - start.value.y,
    )
  }

  function onDragEnd() {
    start.value = null
  }

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
    onDragStart,
    onDragMove,
    onDragEnd,
  }
}
