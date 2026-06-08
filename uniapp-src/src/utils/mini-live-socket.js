import { setSignKey, unwrapMessage, wrapMessage } from './ws-envelope.js'

const TYPE = {
  PING: 0,
  CHAT: 1,
  LIKE: 2,
  ENTER: 3,
  LEAVE: 4,
  SYSTEM: 5,
  PRODUCT: 6,
  ONLINE_COUNT: 7,
  GIFT: 8,
  SETTING_UPDATE: 9,
  COMMENT_AUDIT: 10,
  COMMENT_DELETE: 11,
  COMMENT_CLEAR: 12,
  COMMENT_TOP: 13,
  USER_MUTED: 14,
  USER_BLOCKED: 15,
  USER_UNBLOCKED: 16,
  PRODUCT_STATUS_UPDATE: 17,
  PRODUCT_LIST: 18,
  PRODUCT_STOCK: 19,
  VIDEO_LOOP_RESTART: 20,
  MUTE_WORD_FILTERED: 21,
  WIN_NOTIFY: 22,
  LOTTERY_RESULT: 23,
  WIN_RECORD_UPDATE: 24,
  REPLAY_REQUEST: 26,
  WATCH_REWARD_LIFECYCLE: 27,
  WATCH_REWARD_BROADCAST: 28,
  COMMENT_LOTTERY: 29,
  LIVE_STATUS_UPDATE: 30,
}

function getEnvelopePayload(data) {
  let value = unwrapMessage(data)
  if (!value || typeof value !== 'object') return value

  const customEvent = value.customEvent || value.custom_event || value.eventName || value.event_name
  const customExts = value.customExts || value.custom_exts || value.exts || {}
  if (customEvent || customExts.payload !== undefined) {
    let payload = customExts.payload !== undefined ? customExts.payload : value.payload
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload)
      } catch (error) {
        payload = {}
      }
    }
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      value = {
        ...payload,
        event: payload.event || customEvent || value.event,
        name: payload.name || customEvent || value.name,
        cmd: payload.cmd || value.cmd,
        action: payload.action || payload.event || value.action,
        type: payload.type ?? value.type ?? customEvent,
        data: payload.data || payload,
        from: value.from || payload.from,
      }
    }
  }

  if (value.payload !== undefined && (value.event || value.name || value.cmd || value.action)) {
    value = {
      ...value.payload,
      event: value.event || value.payload?.event,
      name: value.name || value.payload?.name,
      cmd: value.cmd || value.payload?.cmd,
      action: value.action || value.payload?.action,
      type: value.payload?.type ?? value.type,
    }
  }
  if (
    value.data &&
    typeof value.data === 'object' &&
    !Array.isArray(value.data) &&
    (
      value.event ||
      value.msgType ||
      value.eventType ||
      value.name ||
      value.cmd ||
      value.action ||
      value.data.event ||
      value.data.eventType ||
      value.data.msgType ||
      value.data.name ||
      value.data.cmd ||
      value.data.action
    )
  ) {
    value = {
      ...value.data,
      event: value.event || value.data.event,
      eventType: value.eventType || value.data.eventType,
      msgType: value.msgType || value.data.msgType,
      name: value.name || value.data.name,
      cmd: value.cmd || value.data.cmd,
      action: value.action || value.data.action,
      type: value.data.type ?? value.type,
    }
  }
  return value
}

function normalizeEventName(value = '') {
  return String(value || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s.]+/g, '_')
    .replace(/__+/g, '_')
    .toLowerCase()
}

function compactEventName(value = '') {
  return normalizeEventName(value).replace(/_/g, '')
}

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function getObjectPayload(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function parseJsonObject(text = '') {
  if (!text) return {}
  try {
    const value = JSON.parse(text)
    return getObjectPayload(value)
  } catch (error) {
    return {}
  }
}

function normalizeLegacySystemNotice(data = {}) {
  const field =
    data?.payload?.userDefinedField ||
    data?.payload?.user_defined_field ||
    data?.userDefinedField ||
    data?.user_defined_field ||
    data?.data?.payload?.userDefinedField ||
    data?.data?.payload?.user_defined_field ||
    data?.data?.userDefinedField ||
    data?.data?.user_defined_field ||
    ''
  if (typeof field !== 'string' || !field.includes('@ExplainEdit---')) return null
  const raw = field.split('@ExplainEdit---').pop() || ''
  const product = parseJsonObject(raw)
  return {
    ...data,
    ...product,
    type: 'product_status_update',
    action: product.action || 'explaining',
    data: product,
    product,
  }
}

function getMergedPayload(data = {}) {
  const nested = getObjectPayload(data.data)
  const nestedPayload = getObjectPayload(nested.payload)
  const payload = getObjectPayload(data.payload)
  return {
    ...payload,
    ...nestedPayload,
    ...nested,
  }
}

function matchEventName(name, aliases = []) {
  const normalized = normalizeEventName(name)
  const compact = compactEventName(name)
  return aliases.some((alias) => {
    const next = normalizeEventName(alias)
    return normalized === next || compact === next.replace(/_/g, '')
  })
}

function normalizeByName(data = {}) {
  const name = data.event || data.eventType || data.msgType || data.name || data.cmd || data.action || data.type || ''
  if (!name) return data
  const nested = getMergedPayload(data)
  if (matchEventName(name, ['pong', 'heartbeat_pong']) || data.content === 'pong') return { ...data, type: 'pong' }
  if (matchEventName(name, ['chat', 'comment', 'message'])) {
    return {
      ...data,
      type: 'chat',
      nick: data.nickname || data.nick || data.userName || data.user_name || data.customerName || data.customer_name,
    }
  }
  if (matchEventName(name, ['like', 'liked'])) {
    return {
      ...data,
      type: 'like',
      totalLikes: firstPresent(
        data.totalLikes, data.total_likes, data.likeCount, data.like_count, data.likes,
        data.totalLike, data.total_like, data.likeTotal, data.like_total, data.zanCount, data.zan_count,
        nested.totalLikes, nested.total_likes, nested.likeCount, nested.like_count, nested.likes,
        nested.totalLike, nested.total_like, nested.likeTotal, nested.like_total, nested.zanCount, nested.zan_count,
      ),
      likeDelta: firstPresent(
        data.likeDelta, data.like_delta, data.delta, data.count, data.likeCountDelta, data.like_count_delta,
        data.addCount, data.add_count, data.likeNum, data.like_num,
        nested.likeDelta, nested.like_delta, nested.delta, nested.count, nested.likeCountDelta, nested.like_count_delta,
        nested.addCount, nested.add_count, nested.likeNum, nested.like_num,
      ),
    }
  }
  if (matchEventName(name, ['enter', 'join'])) return { ...data, type: 'enter', nick: data.nickname || data.nick || data.data?.nickname || data.data?.nick }
  if (matchEventName(name, ['leave', 'quit'])) return { ...data, type: 'leave', nick: data.nickname || data.nick || data.data?.nickname || data.data?.nick }
  if (matchEventName(name, ['online_count', 'viewer_count', 'onlinecount', 'viewercount'])) return { ...data, type: 'viewer_count', count: data.onlineCount || data.online_count || data.viewerCount || data.viewer_count || data.count || nested.onlineCount || nested.online_count || nested.viewerCount || nested.viewer_count || nested.count }
  if (matchEventName(name, ['r_to_buy', 'buy_reminder', 'buying_notice', 'paid_order_notice'])) return { ...data, type: 'r_to_buy' }
  if (matchEventName(name, ['product', 'current_product', 'current_goods'])) return { ...data, type: 'product' }
  if (matchEventName(name, [
    'product_status_update',
    'productstatusupdate',
    'product_status',
    'explain_edit',
    'explainedit',
    'explain_product',
    'product_explain',
    'explain_goods',
    'goods_explain',
    'goods_explaining',
    'current_product_update',
    'current_goods_update',
  ])) return { ...data, type: 'product_status_update' }
  if (matchEventName(name, [
    'product_list',
    'productlist',
    'goods_list',
    'goodslist',
    'live_product_list',
    'live_goods_list',
    'product_shelf',
    'goods_shelf',
    'shelf_product',
    'shelf_goods',
    'product_update',
    'goods_update',
  ])) return { ...data, type: 'product_list' }
  if (matchEventName(name, ['product_stock', 'productstock'])) return { ...data, type: 'product_stock' }
  if (matchEventName(name, ['setting_update', 'room_setting_update'])) return { ...data, type: 'setting_update' }
  if (matchEventName(name, ['comment_audit'])) return { ...data, type: 'comment_audit' }
  if (matchEventName(name, ['comment_delete', 'delete_comment'])) return { ...data, type: 'comment_delete' }
  if (matchEventName(name, ['comment_clear', 'clear_comment'])) return { ...data, type: 'comment_clear' }
  if (matchEventName(name, ['comment_top', 'top_comment'])) return { ...data, type: 'comment_top' }
  if (matchEventName(name, ['user_muted', 'mute_user'])) return { ...data, type: 'user_muted' }
  if (matchEventName(name, ['user_blocked', 'block_user'])) return { ...data, type: 'user_blocked' }
  if (matchEventName(name, ['user_unblocked', 'unblock_user'])) return { ...data, type: 'user_unblocked' }
  if (matchEventName(name, ['mute_word_filtered'])) return { ...data, type: 'mute_word_filtered' }
  if (matchEventName(name, ['live_ended', 'live_end'])) return { ...data, type: 'live_ended' }
  if (matchEventName(name, ['video_loop_restart'])) return { ...data, type: 'video_loop_restart' }
  if (matchEventName(name, [
    'win_notify',
    'lottery_win_notify',
    'watch_reward_win_notify',
    'watch_reward_win',
    'watch_reward_winner',
    'watch_reward_result',
    'watch_duration_reward_win',
    'watch_duration_reward_result',
  ])) return { ...data, type: 'win_notify' }
  if (matchEventName(name, ['lottery_result', 'normal_lottery_result'])) return { ...data, type: 'lottery_result' }
  if (matchEventName(name, ['win_record_update', 'winrecordupdate'])) return { ...data, type: 'win_record_update' }
  if (matchEventName(name, [
    'watch_reward_lifecycle',
    'watch_reward_update',
    'watch_reward_changed',
    'watch_reward_open',
    'watch_reward_close',
    'watch_reward_delete',
    'watch_reward_activity_update',
    'watch_duration_reward_lifecycle',
    'watch_duration_reward_update',
  ])) return { ...data, type: 'watch_reward_lifecycle' }
  if (matchEventName(name, [
    'watch_reward_broadcast',
    'watch_reward_notice',
    'watch_reward_award_notice',
    'watch_reward_win_broadcast',
    'watch_duration_reward_notice',
    'watch_duration_reward_broadcast',
  ])) return { ...data, type: 'watch_reward_broadcast' }
  if (matchEventName(name, ['comment_lottery_event', 'begin_comment_lottery_prize', 'begincommentlotteryprize', 'open_prize', 'openprize', 'update_comment_lottery_config', 'updatecommentlotteryconfig'])) return { ...data, type: 'comment_lottery_event' }
  if (matchEventName(name, ['comment_lottery'])) return { ...data, type: 'comment_lottery' }
  if (matchEventName(name, ['live_status_update', 'live_status', 'live_status_snapshot'])) return { ...data, type: 'live_status_update' }
  return data
}

function normalizeMessage(data) {
  if (!data || typeof data !== 'object') return data
  const payload = getEnvelopePayload(data)
  if (!payload || typeof payload !== 'object') return payload
  const legacyNotice = normalizeLegacySystemNotice(payload)
  if (legacyNotice) return legacyNotice

  const byName = normalizeByName(payload)
  if (byName.type && typeof byName.type === 'string' && Number.isNaN(Number(byName.type))) return byName

  const type = Number(byName.type)
  if (type === TYPE.PING || byName.content === 'pong') return { ...byName, type: byName.content === 'pong' ? 'pong' : 'ping' }
  if (type === TYPE.CHAT) {
    return {
      ...byName,
      type: 'chat',
      nick: byName.nickname || byName.nick || byName.userName || byName.user_name || byName.customerName || byName.customer_name,
    }
  }
  if (type === TYPE.LIKE) {
    const nested = getMergedPayload(byName)
    return {
      ...byName,
      type: 'like',
      totalLikes: firstPresent(
        nested.totalLikes, nested.total_likes, nested.likeCount, nested.like_count, nested.likes,
        nested.totalLike, nested.total_like, nested.likeTotal, nested.like_total, nested.zanCount, nested.zan_count,
        byName.totalLikes, byName.total_likes, byName.likeCount, byName.like_count, byName.likes,
        byName.totalLike, byName.total_like, byName.likeTotal, byName.like_total, byName.zanCount, byName.zan_count,
      ),
      likeDelta: firstPresent(
        nested.likeDelta, nested.like_delta, nested.delta, nested.count, nested.likeCountDelta, nested.like_count_delta,
        nested.addCount, nested.add_count, nested.likeNum, nested.like_num,
        byName.likeDelta, byName.like_delta, byName.delta, byName.count, byName.likeCountDelta, byName.like_count_delta,
        byName.addCount, byName.add_count, byName.likeNum, byName.like_num,
      ),
    }
  }
  if (type === TYPE.ENTER) return { ...byName, type: 'enter', nick: byName.nickname || byName.nick || byName.data?.nickname || byName.data?.nick }
  if (type === TYPE.LEAVE) return { ...byName, type: 'leave', nick: byName.nickname || byName.nick || byName.data?.nickname || byName.data?.nick }
  if (type === TYPE.SYSTEM) return { ...byName, type: 'system' }
  if (type === TYPE.PRODUCT) return { ...byName, type: 'product' }
  if (type === TYPE.ONLINE_COUNT) return { ...byName, type: 'viewer_count', count: byName.data?.onlineCount || byName.data?.online_count || byName.data?.viewerCount || byName.data?.viewer_count || byName.onlineCount || byName.online_count || byName.viewerCount || byName.viewer_count || byName.count }
  if (type === TYPE.GIFT) return { ...byName, type: 'gift' }
  if (type === TYPE.SETTING_UPDATE) return { ...byName, type: 'setting_update' }
  if (type === TYPE.COMMENT_AUDIT) return { ...byName, type: 'comment_audit' }
  if (type === TYPE.COMMENT_DELETE) return { ...byName, type: 'comment_delete' }
  if (type === TYPE.COMMENT_CLEAR) return { ...byName, type: 'comment_clear' }
  if (type === TYPE.COMMENT_TOP) return { ...byName, type: 'comment_top' }
  if (type === TYPE.USER_MUTED) return { ...byName, type: 'user_muted' }
  if (type === TYPE.USER_BLOCKED) return { ...byName, type: 'user_blocked' }
  if (type === TYPE.USER_UNBLOCKED) return { ...byName, type: 'user_unblocked' }
  if (type === TYPE.PRODUCT_STATUS_UPDATE) return { ...byName, type: 'product_status_update' }
  if (type === TYPE.PRODUCT_LIST) return { ...byName, type: 'product_list' }
  if (type === TYPE.PRODUCT_STOCK) return { ...byName, type: 'product_stock' }
  if (type === TYPE.VIDEO_LOOP_RESTART) return { ...byName, type: 'video_loop_restart' }
  if (type === TYPE.MUTE_WORD_FILTERED) return { ...byName, type: 'mute_word_filtered' }
  if (type === TYPE.WIN_NOTIFY) return { ...byName, type: 'win_notify' }
  if (type === TYPE.LOTTERY_RESULT) return { ...byName, type: 'lottery_result' }
  if (type === TYPE.WIN_RECORD_UPDATE) return { ...byName, type: 'win_record_update' }
  if (type === TYPE.WATCH_REWARD_LIFECYCLE) return { ...byName, type: 'watch_reward_lifecycle' }
  if (type === TYPE.WATCH_REWARD_BROADCAST) return { ...byName, type: 'watch_reward_broadcast' }
  if (type === TYPE.COMMENT_LOTTERY) return { ...byName, type: 'comment_lottery_event' }
  if (type === TYPE.LIVE_STATUS_UPDATE) return { ...byName, type: 'live_status_update' }
  return byName
}

function getMessageRoomId(message = {}) {
  if (!message || typeof message !== 'object') return 0
  const nested = message.data && typeof message.data === 'object' ? message.data : {}
  const payload = message.payload && typeof message.payload === 'object' ? message.payload : {}
  const value =
    message.roomId ||
    message.room_id ||
    message.liveId ||
    message.live_id ||
    nested.roomId ||
    nested.room_id ||
    nested.liveId ||
    nested.live_id ||
    payload.roomId ||
    payload.room_id ||
    payload.liveId ||
    payload.live_id ||
    0
  const id = Number(value || 0)
  return Number.isFinite(id) ? id : 0
}

function bindSocketTaskEvent(socket, taskMethodName, globalMethodName, globalOffMethodName, callback) {
  if (socket && typeof socket[taskMethodName] === 'function') {
    socket[taskMethodName](callback)
    return () => {}
  }
  if (typeof uni[globalMethodName] === 'function') {
    uni[globalMethodName](callback)
    return () => {
      if (typeof uni[globalOffMethodName] === 'function') uni[globalOffMethodName](callback)
    }
  }
  return () => {}
}

function buildRoomPayload(roomId) {
  const id = Number(roomId || 0)
  return {
    roomId: id,
    room_id: id,
    liveId: id,
    live_id: id,
  }
}

function normalizeSocketContext(context = {}) {
  const roomId = Number(context.roomId || context.room_id || context.liveId || context.live_id || 0)
  const termId = Number(context.termId || context.term_id || context.liveTermId || context.live_term_id || 0)
  const customerId = Number(context.customerId || context.customer_id || context.userId || context.user_id || 0)
  const tenantId = Number(context.tenantId || context.tenant_id || 0)
  return {
    ...(roomId ? buildRoomPayload(roomId) : {}),
    ...(termId ? {
      termId,
      term_id: termId,
      liveTermId: termId,
      live_term_id: termId,
    } : {}),
    ...(customerId ? {
      customerId,
      customer_id: customerId,
      userId: customerId,
      user_id: customerId,
    } : {}),
    ...(tenantId ? {
      tenantId,
      tenant_id: tenantId,
    } : {}),
    roomCode: context.roomCode || context.room_code || '',
    room_code: context.room_code || context.roomCode || '',
    shareCode: context.shareCode || context.share_code || '',
    share_code: context.share_code || context.shareCode || '',
    bindId: context.bindId || context.bind_id || '',
    bind_id: context.bind_id || context.bindId || '',
    liveType: context.liveType || context.live_type || '',
    live_type: context.live_type || context.liveType || '',
  }
}

function safeJsonParse(text = '') {
  try {
    return JSON.parse(text)
  } catch (error) {
    return text
  }
}

function maskDebugText(text = '') {
  return String(text || '').replace(/(token=)[^&"]+/gi, '$1***')
}

export class MiniLiveSocket {
  constructor(options = {}) {
    this.url = options.url || ''
    this.token = options.token || ''
    this.liveId = options.liveId || ''
    this.context = normalizeSocketContext(options.context || {})
    this.user = options.user || {}
    this.signKey = options.signKey || ''
    this.sendEnterOnOpen = options.sendEnterOnOpen === true
    this.enterSendDelay = Number(options.enterSendDelay || 80)
    this.enterRetryDelay = Number(options.enterRetryDelay || 300)
    this.onOpen = options.onOpen || null
    this.onMessage = options.onMessage || null
    this.onClose = options.onClose || null
    this.onError = options.onError || null
    this.onStateChange = options.onStateChange || null
    this.heartbeatInterval = options.heartbeatInterval || 25000
    this.heartbeatTimeout = options.heartbeatTimeout || this.heartbeatInterval * 2 + 5000
    this.reconnectBaseInterval = options.reconnectBaseInterval || 1000
    this.reconnectMaxInterval = options.reconnectMaxInterval || 30000
    this.maxReconnect = options.maxReconnect || 20
    this.heartbeatTimer = null
    this.reconnectTimer = null
    this.socket = null
    this.closed = false
    this.open = false
    this.connectedOnce = false
    this.enterSentOnce = false
    this.reconnectCount = 0
    this.lastPongAt = 0
    this.lastSeq = 0
    this.enterSendTimer = null
    this.debugEvents = []
    this.debugState = {
      state: 'idle',
      url: maskDebugText(this.url),
      connectUrl: '',
      liveId: this.liveId,
      hasToken: !!this.token,
      hasSignKey: !!this.signKey,
      sendEnterOnOpen: this.sendEnterOnOpen,
      sendEnterDelay: this.enterSendDelay,
      sendEnterRetryDelay: this.enterRetryDelay,
      openCount: 0,
      implicitOpenCount: 0,
      sendCount: 0,
      sendOkCount: 0,
      sendFailCount: 0,
      lastEvent: 'init',
      lastSendType: '',
      lastSendOk: null,
      lastSendMethod: '',
      lastSendPayload: null,
      lastSendPayloadText: '',
      lastSendFail: '',
      closeFailCount: 0,
      lastCloseFail: '',
      lastEnterMsgId: '',
      lastEnterAttempt: 0,
      lastEnterScheduledAt: '',
      lastEnterSentAt: '',
      lastError: '',
      events: this.debugEvents,
    }
    this.unbindSocketEvents = []
    this.state = 'idle'
    this.recordDebug('init', { url: this.url, hasToken: !!this.token, hasSignKey: !!this.signKey })
  }

  recordDebug(event, payload = {}) {
    const item = {
      at: new Date().toISOString(),
      event,
      ...payload,
    }
    this.debugEvents.push(item)
    if (this.debugEvents.length > 30) this.debugEvents.splice(0, this.debugEvents.length - 30)
    this.debugState = {
      ...this.debugState,
      state: this.state,
      lastEvent: event,
      events: this.debugEvents,
      ...payload,
    }
  }

  getDebugState() {
    return {
      ...this.debugState,
      state: this.state,
      open: this.open,
      closed: this.closed,
      liveId: this.liveId,
      hasToken: !!this.token,
      hasSignKey: !!this.signKey,
      sendEnterOnOpen: this.sendEnterOnOpen,
      events: this.debugEvents.slice(),
    }
  }

  setState(state) {
    this.state = state || this.state
    this.debugState.state = this.state
    this.onStateChange?.(state)
  }

  getState() {
    return this.state
  }

  connect() {
    if (!this.url) return
    this.closed = false
    this.open = false
    this.setState(this.connectedOnce ? 'reconnecting' : 'connecting')
    if (this.signKey) setSignKey(this.signKey)
    this.clearSocketEvents()

    const joiner = this.url.includes('?') ? '&' : '?'
    const url = this.token ? `${this.url}${joiner}token=${encodeURIComponent(this.token)}` : this.url
    this.recordDebug('connect_start', { connectUrl: maskDebugText(url) })
    this.socket = uni.connectSocket({ url })
    this.unbindSocketEvents = [
      bindSocketTaskEvent(this.socket, 'onOpen', 'onSocketOpen', 'offSocketOpen', () => {
        this.open = true
        this.enterSentOnce = false
        this.lastPongAt = Date.now()
        this.reconnectCount = 0
        this.setState('open')
        this.recordDebug('open', { openCount: Number(this.debugState.openCount || 0) + 1 })
        this.startHeartbeat()
        if (this.sendEnterOnOpen) this.sendOpenEnter()
        this.onOpen?.({ isReconnect: this.connectedOnce })
        if (this.connectedOnce && this.lastSeq > 0) this.requestReplay(this.lastSeq)
        this.connectedOnce = true
      }),
      bindSocketTaskEvent(this.socket, 'onMessage', 'onSocketMessage', 'offSocketMessage', (res) => {
        let data = res.data
        try {
          data = JSON.parse(data)
        } catch (error) {
          // Keep raw payload for non-JSON server messages.
        }
        const message = normalizeMessage(data)
        if (!message) return
        if (message.type === 'pong') {
          this.lastPongAt = Date.now()
          return
        }
        if (message.type === 'ping') {
          this.send({ type: TYPE.PING, content: 'pong' })
          return
        }
        if (!this.open) this.markOpenFromMessage(message)
        const incomingRoomId = getMessageRoomId(message)
        const currentRoomId = Number(this.liveId || 0)
        if (incomingRoomId > 0 && currentRoomId > 0 && incomingRoomId !== currentRoomId) return
        if (message.seq && Number(message.seq) > this.lastSeq) this.lastSeq = Number(message.seq)
        this.onMessage?.(message)
      }),
      bindSocketTaskEvent(this.socket, 'onClose', 'onSocketClose', 'offSocketClose', (event) => {
        this.open = false
        this.stopHeartbeat()
        this.recordDebug('close', { lastClose: event || '' })
        this.onClose?.(event)
        if (this.closed) this.setState('closed')
        else this.scheduleReconnect()
      }),
      bindSocketTaskEvent(this.socket, 'onError', 'onSocketError', 'offSocketError', (event) => {
        this.open = false
        this.stopHeartbeat()
        this.recordDebug('error', { lastError: event?.errMsg || event?.message || event || '' })
        this.onError?.(event)
        this.scheduleReconnect()
      }),
    ]
  }

  markOpenFromMessage(message = {}) {
    this.open = true
    this.closed = false
    this.lastPongAt = Date.now()
    this.setState('open')
    this.recordDebug('implicit_open_from_message', {
      implicitOpenCount: Number(this.debugState.implicitOpenCount || 0) + 1,
      lastMessageType: message.type || '',
    })
    this.startHeartbeat()
    if (this.sendEnterOnOpen) this.sendOpenEnter()
  }

  send(payload = {}) {
    if (!this.socket || !this.open) return Promise.resolve(false)
    const msgId = payload.type && !payload.msgId && payload.type !== TYPE.PING
      ? Math.random().toString(36).slice(2, 10)
      : payload.msgId
    const roomId = Number(this.liveId || 0)
    const roomPayload = buildRoomPayload(roomId)
    const contextPayload = normalizeSocketContext(this.context)
    const body = {
      ...roomPayload,
      ...contextPayload,
      ...payload,
      data: payload.data && typeof payload.data === 'object'
        ? {
            ...roomPayload,
            ...contextPayload,
            ...payload.data,
          }
        : payload.data,
      ...(msgId ? { msgId } : {}),
    }
    const data = wrapMessage(body, this.signKey || undefined)
    return new Promise((resolve) => {
      const send = this.socket && typeof this.socket.send === 'function'
        ? this.socket.send.bind(this.socket)
        : typeof uni.sendSocketMessage === 'function'
          ? uni.sendSocketMessage.bind(uni)
          : null
      if (!send) {
        resolve(false)
        return
      }
      send({
        data,
        success: () => resolve(true),
        fail: () => resolve(false),
      })
    })
  }

  sendRaw(payload = {}) {
    if (!this.socket || !this.open) {
      this.recordDebug('send_skipped', {
        lastSendType: payload.type,
        lastSendOk: false,
        lastSendFail: !this.socket ? 'no_socket' : 'not_open',
      })
      return Promise.resolve(false)
    }
    const data = wrapMessage(payload, this.signKey || undefined)
    const parsedPayload = safeJsonParse(data)
    this.recordDebug('send_start', {
      sendCount: Number(this.debugState.sendCount || 0) + 1,
      lastSendType: payload.type,
      lastSendOk: null,
      lastSendMethod: this.socket && typeof this.socket.send === 'function' ? 'socket.send' : (typeof uni.sendSocketMessage === 'function' ? 'uni.sendSocketMessage' : 'none'),
      lastSendPayload: parsedPayload,
      lastSendPayloadText: maskDebugText(data),
      lastSendFail: '',
    })
    return new Promise((resolve) => {
      const send = this.socket && typeof this.socket.send === 'function'
        ? this.socket.send.bind(this.socket)
        : typeof uni.sendSocketMessage === 'function'
          ? uni.sendSocketMessage.bind(uni)
          : null
      if (!send) {
        this.recordDebug('send_no_method', {
          lastSendOk: false,
          lastSendFail: 'no_send_method',
          sendFailCount: Number(this.debugState.sendFailCount || 0) + 1,
        })
        resolve(false)
        return
      }
      send({
        data,
        success: () => {
          this.recordDebug('send_success', {
            lastSendOk: true,
            sendOkCount: Number(this.debugState.sendOkCount || 0) + 1,
          })
          resolve(true)
        },
        fail: (error) => {
          this.recordDebug('send_fail', {
            lastSendOk: false,
            lastSendFail: error?.errMsg || error?.message || error || 'send_fail',
            sendFailCount: Number(this.debugState.sendFailCount || 0) + 1,
          })
          resolve(false)
        },
      })
    })
  }

  sendChat(content, data, options = {}) {
    const msgId = options?.msgId || Math.random().toString(36).slice(2, 10)
    const text = String(content || data?.content || data?.comment || data?.message || data?.text || '')
    const payload = {
      type: TYPE.CHAT,
      content: text,
      msgId,
    }
    if (data) payload.data = data
    if (options?.msgId) payload.msgId = options.msgId
    return this.sendRaw(payload)
  }

  sendLike(count = 1, context = {}) {
    const roomPayload = buildRoomPayload(this.liveId)
    const contextPayload = normalizeSocketContext({
      ...this.context,
      ...(context && typeof context === 'object' && !Array.isArray(context) ? context : {}),
    })
    const resolvedCount = Number(count || contextPayload.count || contextPayload.likeCount || contextPayload.like_count || 1)
    const safeCount = resolvedCount > 0 ? resolvedCount : 1
    return this.send({
      type: TYPE.LIKE,
      ...roomPayload,
      ...contextPayload,
      count: safeCount,
      likeCount: safeCount,
      like_count: safeCount,
      data: {
        ...roomPayload,
        ...contextPayload,
        ...this.getAudiencePayload(),
        count: safeCount,
        likeCount: safeCount,
        like_count: safeCount,
      },
    })
  }

  sendEnter(options = {}) {
    const msgId = options?.msgId || Math.random().toString(36).slice(2, 10)
    this.recordDebug('send_enter_call', {
      lastEnterMsgId: msgId,
      lastEnterAttempt: options?.attempt || 0,
    })
    return this.sendRaw({
      type: TYPE.ENTER,
      msgId,
    })
  }

  sendOpenEnter() {
    if (this.enterSentOnce) {
      this.recordDebug('send_enter_skip_duplicate', { lastEnterMsgId: this.debugState.lastEnterMsgId || '' })
      return
    }
    this.enterSentOnce = true
    this.clearEnterSendTimer()
    const msgId = Math.random().toString(36).slice(2, 10)
    const delay = Number.isFinite(this.enterSendDelay) && this.enterSendDelay >= 0 ? this.enterSendDelay : 80
    this.recordDebug('send_enter_scheduled', {
      lastEnterMsgId: msgId,
      lastEnterAttempt: 1,
      lastEnterScheduledAt: new Date().toISOString(),
    })
    this.enterSendTimer = setTimeout(async () => {
      this.enterSendTimer = null
      if (this.closed || !this.open) return
      this.recordDebug('send_enter_attempt', { lastEnterMsgId: msgId, lastEnterAttempt: 1, lastEnterSentAt: new Date().toISOString() })
      const firstOk = await this.sendEnter({ msgId, attempt: 1 })
      if (firstOk !== false || this.closed || !this.open) return
      const retryDelay = Number.isFinite(this.enterRetryDelay) && this.enterRetryDelay >= 0 ? this.enterRetryDelay : 300
      this.recordDebug('send_enter_retry_scheduled', { lastEnterMsgId: msgId, lastEnterAttempt: 2 })
      this.enterSendTimer = setTimeout(async () => {
        this.enterSendTimer = null
        if (this.closed || !this.open) return
        this.recordDebug('send_enter_attempt', { lastEnterMsgId: msgId, lastEnterAttempt: 2, lastEnterSentAt: new Date().toISOString() })
        const retryOk = await this.sendEnter({ msgId, attempt: 2 })
        if (retryOk === false) {
          console.warn('[MiniLiveSocket] enter send failed')
        }
      }, retryDelay)
    }, delay)
  }

  sendLeave() {
    const roomPayload = buildRoomPayload(this.liveId)
    const contextPayload = normalizeSocketContext(this.context)
    return this.send({
      type: TYPE.LEAVE,
      ...roomPayload,
      ...contextPayload,
      data: {
        ...roomPayload,
        ...contextPayload,
        ...this.getAudiencePayload(),
      },
    })
  }

  getAudiencePayload() {
    const userId = this.user.id || this.user.userId || this.user.user_id || this.user.customerId || this.user.customer_id || 0
    const customerId = this.user.customerId || this.user.customer_id || this.user.id || this.user.userId || this.user.user_id || 0
    const nickname = this.user.nickname || this.user.nick || this.user.userName || this.user.user_name || this.user.customerName || this.user.customer_name || ''
    const avatar = this.user.avatar || this.user.headImg || this.user.head_img || this.user.avatarUrl || this.user.avatar_url || ''
    return {
      userId,
      user_id: userId,
      customerId,
      customer_id: customerId,
      nickname,
      nick: nickname,
      userName: nickname,
      user_name: nickname,
      customerName: nickname,
      customer_name: nickname,
      avatar,
      headImg: avatar,
      head_img: avatar,
      avatarUrl: avatar,
      avatar_url: avatar,
    }
  }

  requestReplay(lastSeq = this.lastSeq) {
    if (!lastSeq) return Promise.resolve(false)
    const roomPayload = buildRoomPayload(this.liveId)
    return this.send({
      type: TYPE.REPLAY_REQUEST,
      ...roomPayload,
      data: {
        ...roomPayload,
        sinceSeq: Number(lastSeq),
        lastSeq: Number(lastSeq),
      },
    })
  }

  safeCloseSocket(reason = 'close', force = false) {
    if (!this.socket) {
      this.recordDebug('close_socket_skip', { closeReason: reason, lastCloseFail: 'no_socket' })
      return false
    }
    if (!force && !this.open) {
      this.recordDebug('close_socket_skip', { closeReason: reason, lastCloseFail: 'not_open' })
      return false
    }
    const socket = this.socket
    if (typeof socket.close !== 'function') {
      this.recordDebug('close_socket_skip', { closeReason: reason, lastCloseFail: 'no_close_method' })
      return false
    }
    try {
      this.recordDebug('close_socket_request', { closeReason: reason, lastCloseFail: '' })
      socket.close({
        fail: (error) => {
          this.recordDebug('close_socket_fail', {
            closeReason: reason,
            lastCloseFail: error?.errMsg || error?.message || error || 'close_fail',
            closeFailCount: Number(this.debugState.closeFailCount || 0) + 1,
          })
        },
      })
      return true
    } catch (error) {
      this.recordDebug('close_socket_fail', {
        closeReason: reason,
        lastCloseFail: error?.errMsg || error?.message || error || 'close_throw',
        closeFailCount: Number(this.debugState.closeFailCount || 0) + 1,
      })
      return false
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now()
      if (this.open && this.lastPongAt && now - this.lastPongAt > this.heartbeatTimeout) {
        this.stopHeartbeat()
        this.safeCloseSocket('heartbeat_timeout')
        this.open = false
        this.scheduleReconnect()
        return
      }
      this.send({ type: TYPE.PING, content: 'ping', ts: now })
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  clearEnterSendTimer() {
    if (this.enterSendTimer) clearTimeout(this.enterSendTimer)
    this.enterSendTimer = null
  }

  clearSocketEvents() {
    this.unbindSocketEvents.forEach((unbind) => {
      try {
        unbind?.()
      } catch (error) {}
    })
    this.unbindSocketEvents = []
  }

  scheduleReconnect() {
    if (this.closed || this.reconnectTimer) return
    if (this.reconnectCount >= this.maxReconnect) {
      this.setState('max_reconnect')
      return
    }
    this.setState('reconnecting')
    const exp = Math.min(this.reconnectBaseInterval * Math.pow(2, this.reconnectCount), this.reconnectMaxInterval)
    const jitter = exp * 0.2 * (Math.random() * 2 - 1)
    const delay = Math.round(exp + jitter)
    this.reconnectCount += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.closed) this.connect()
    }, delay)
  }

  close() {
    const shouldCloseSocketTask = !!this.socket && this.open
    if (this.socket && this.open) this.sendLeave().catch?.(() => {})
    this.closed = true
    this.enterSentOnce = false
    this.stopHeartbeat()
    this.clearEnterSendTimer()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
    if (shouldCloseSocketTask) {
      this.safeCloseSocket('manual_close')
    } else {
      this.recordDebug('close_socket_skip', {
        closeReason: 'manual_close',
        lastCloseFail: this.socket ? 'not_open' : 'no_socket',
      })
    }
    this.open = false
    this.clearSocketEvents()
    this.socket = null
    this.setState('closed')
  }
}
