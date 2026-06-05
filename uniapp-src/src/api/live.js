import { h5Get, h5Post } from './h5.js'
import {
  claimCommentReward as claimMarketingCommentReward,
  claimWatchReward as claimMarketingWatchReward,
  getCommentLotteryDetail as getMarketingCommentLotteryDetail,
  getCommentLotteryList as getMarketingCommentLotteryList,
  getLotteryParticipants as getMarketingLotteryParticipants,
  getPrizeRecordList as getMarketingPrizeRecordList,
} from './marketing.js'

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function toNumberLike(value) {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : value
}

function withLiveAliases(data = {}, aliasMap = {}) {
  const payload = { ...data }
  const aliases = {
    roomId: ['room_id', 'liveId', 'live_id'],
    sessionId: ['session_id'],
    shareCode: ['share_code'],
    roomCode: ['room_code'],
    tenantId: ['tenant_id'],
    bindId: ['bind_id'],
    liveType: ['live_type'],
    customerId: ['customer_id', 'userId', 'user_id'],
    termId: ['term_id', 'liveTermId', 'live_term_id'],
    watchDuration: ['watch_duration'],
    watchStatus: ['watch_status'],
    lastPosition: ['last_position'],
    videoId: ['video_id', 'replayVideoId', 'replay_video_id'],
    productId: ['product_id', 'goodsId', 'goods_id'],
    count: ['likeCount', 'like_count'],
    ...aliasMap,
  }
  Object.entries(aliases).forEach(([canonicalKey, keys]) => {
    const value = firstValue(payload, canonicalKey, ...keys)
    if (value === undefined) return
    payload[canonicalKey] = value
    keys.forEach((key) => {
      payload[key] = value
    })
  })
  ;[
    'roomId', 'room_id', 'liveId', 'live_id',
    'tenantId', 'tenant_id',
    'termId', 'term_id', 'liveTermId', 'live_term_id',
    'customerId', 'customer_id', 'userId', 'user_id',
    'watchDuration', 'watch_duration', 'watchStatus', 'watch_status',
    'lastPosition', 'last_position',
    'videoId', 'video_id', 'replayVideoId', 'replay_video_id',
    'productId', 'product_id', 'goodsId', 'goods_id',
    'count', 'likeCount', 'like_count',
  ].forEach((key) => {
    if (payload[key] !== undefined) payload[key] = toNumberLike(payload[key])
  })
  if (payload.liveId === undefined && payload.roomId !== undefined) payload.liveId = payload.roomId
  if (payload.live_id === undefined && payload.room_id !== undefined) payload.live_id = payload.room_id
  if (payload.roomId === undefined && payload.liveId !== undefined) payload.roomId = payload.liveId
  if (payload.room_id === undefined && payload.live_id !== undefined) payload.room_id = payload.live_id
  if (payload.userId === undefined && payload.customerId !== undefined) payload.userId = payload.customerId
  if (payload.user_id === undefined && payload.customer_id !== undefined) payload.user_id = payload.customer_id
  if (payload.customerId === undefined && payload.userId !== undefined) payload.customerId = payload.userId
  if (payload.customer_id === undefined && payload.user_id !== undefined) payload.customer_id = payload.user_id
  if (payload.replayVideoId === undefined && payload.videoId !== undefined) payload.replayVideoId = payload.videoId
  if (payload.replay_video_id === undefined && payload.video_id !== undefined) payload.replay_video_id = payload.video_id
  if (payload.videoId === undefined && payload.replayVideoId !== undefined) payload.videoId = payload.replayVideoId
  if (payload.video_id === undefined && payload.replay_video_id !== undefined) payload.video_id = payload.replay_video_id
  return payload
}

export function getLiveDetail(params = {}) {
  const data = typeof params === 'string' ? { roomCode: params } : params
  return h5Get('/h5/live/detail', data)
}

export function getLiveStreamInf(roomCode) {
  return h5Get('/h5/live/streamInf', { roomCode: roomCode || '' })
}

export function getReplayFirstVideo(roomCode) {
  return h5Get('/h5/live/replayFirstVideo', { roomCode: roomCode || '' })
}

export function getLiveStatus(roomId) {
  return h5Get('/h5/live/status', { roomId: Number(roomId || 0) })
}

export function enterLiveRoom(roomId, sessionId, shareCode, termId) {
  return h5Post('/h5/live/enter', withLiveAliases({
    roomId: Number(roomId || 0),
    sessionId: sessionId || '',
    shareCode: shareCode || '',
    termId: termId ? Number(termId) : undefined,
  }))
}

export function leaveLiveRoom(roomId, sessionId, watchDuration) {
  return h5Post('/h5/live/leave', withLiveAliases({
    roomId: Number(roomId || 0),
    sessionId: sessionId || '',
    watchDuration: Number(watchDuration || 0),
  }))
}

export function liveHeartbeat(roomId, sessionId, watchDuration) {
  return h5Post('/h5/live/heartbeat', withLiveAliases({
    roomId: Number(roomId || 0),
    sessionId: sessionId || '',
    watchDuration: Number(watchDuration || 0),
  }))
}

export function getLiveProducts(roomId, page = 1, pageSize = 20) {
  const isObjectParam = roomId && typeof roomId === 'object'
  const meta = isObjectParam ? roomId : {}
  const resolvedRoomId = firstValue(meta, 'roomId', 'room_id', 'liveId', 'live_id') || (isObjectParam ? 0 : roomId) || 0
  const resolvedPage = firstValue(meta, 'page', 'current') || page
  const resolvedPageSize = firstValue(meta, 'pageSize', 'page_size', 'limit') || pageSize
  return h5Get('/h5/live/products', {
    roomId: Number(resolvedRoomId || 0),
    page: Number(resolvedPage || 1),
    pageSize: Number(resolvedPageSize || 20),
  })
}

export function getCurrentProduct(roomId, context = {}) {
  const isObjectParam = roomId && typeof roomId === 'object'
  const meta = isObjectParam ? roomId : context
  const resolvedRoomId = firstValue(meta, 'roomId', 'room_id', 'liveId', 'live_id') || (isObjectParam ? 0 : roomId) || 0
  return h5Get('/h5/live/currentProduct', {
    roomId: Number(resolvedRoomId || 0),
  })
}

export function getCommentHistory(roomId, limit = 30, replayVideoId = 0, context = {}) {
  const isObjectParam = roomId && typeof roomId === 'object'
  const meta = isObjectParam ? roomId : context
  const resolvedRoomId = firstValue(meta, 'roomId', 'room_id', 'liveId', 'live_id') || (isObjectParam ? 0 : roomId) || 0
  const resolvedLimit = firstValue(meta, 'limit', 'pageSize', 'page_size') || limit
  const resolvedReplayVideoId =
    firstValue(meta, 'replayVideoId', 'replay_video_id', 'videoId', 'video_id') || replayVideoId || 0
  const resolvedMode = firstValue(meta, 'mode')
  const data = {
    roomId: Number(resolvedRoomId || 0),
    limit: Number(resolvedLimit || 30),
    replayVideoId: Number(resolvedReplayVideoId || 0),
  }
  if (resolvedMode) data.mode = resolvedMode
  return h5Get('/h5/live/commentHistory', data)
}

export function sendLike(roomId, count = 1, context = {}) {
  const isObjectParam = roomId && typeof roomId === 'object'
  const meta = isObjectParam ? roomId : context
  const resolvedRoomId = firstValue(meta, 'roomId', 'room_id', 'liveId', 'live_id') || (isObjectParam ? 0 : roomId) || 0
  const resolvedCount = firstValue(meta, 'count', 'likeCount', 'like_count') || count
  return h5Post('/h5/live/like', {
    roomId: Number(resolvedRoomId || 0),
    count: Number(resolvedCount || 1) > 0 ? Number(resolvedCount || 1) : 1,
  })
}

export function sendBuyReminder(data = {}) {
  return h5Post('/h5/live/buyReminder', {
    roomId: Number(firstValue(data, 'roomId', 'room_id', 'liveId', 'live_id') || 0),
    productId: Number(firstValue(data, 'productId', 'product_id', 'goodsId', 'goods_id') || 0),
  })
}

function buildLiveCommentPayload(roomId, comment, data = {}) {
  const meta = data && typeof data === 'object' ? data : {}
  const text = String(comment || meta.content || meta.comment || meta.message || meta.text || '')
  const payload = {
    roomId: Number(roomId || 0),
    content: text,
    comment: text,
    message: text,
    text,
    data: meta,
  }
  const fieldAliases = {
    roomId: ['roomId', 'room_id', 'liveId', 'live_id'],
    msgId: ['msgId', 'msg_id'],
    clientMsgId: ['clientMsgId', 'client_msg_id'],
    timelineSeconds: ['timelineSeconds', 'timeline_seconds'],
    replayVideoId: ['replayVideoId', 'replay_video_id'],
    videoId: ['videoId', 'video_id'],
    termId: ['termId', 'term_id'],
    customerId: ['customerId', 'customer_id', 'userId', 'user_id'],
    roomCode: ['roomCode', 'room_code'],
    tenantId: ['tenantId', 'tenant_id'],
    shareCode: ['shareCode', 'share_code'],
    bindId: ['bindId', 'bind_id'],
    liveType: ['liveType', 'live_type'],
    nickname: ['nickname', 'nick', 'userName', 'user_name', 'customerName', 'customer_name'],
    avatar: ['avatar', 'headImg', 'head_img', 'avatarUrl', 'avatar_url'],
  }
  Object.entries(fieldAliases).forEach(([canonicalKey, aliases]) => {
    const value = aliases
      .map((key) => payload[key] ?? meta[key])
      .find((item) => item !== undefined && item !== null && item !== '')
    if (value !== undefined) {
      payload[canonicalKey] = value
      aliases.forEach((key) => {
        payload[key] = value
      })
    }
  })
  if (payload.replayVideoId === undefined && payload.videoId !== undefined) {
    payload.replayVideoId = payload.videoId
    payload.replay_video_id = payload.videoId
  }
  if (payload.videoId === undefined && payload.replayVideoId !== undefined) {
    payload.videoId = payload.replayVideoId
    payload.video_id = payload.replayVideoId
  }
  payload.data = {
    ...meta,
    content: text,
    comment: text,
    message: text,
    text,
    roomId: payload.roomId,
    room_id: payload.room_id,
    liveId: payload.liveId,
    live_id: payload.live_id,
    roomCode: payload.roomCode,
    room_code: payload.room_code,
    tenantId: payload.tenantId,
    tenant_id: payload.tenant_id,
    shareCode: payload.shareCode,
    share_code: payload.share_code,
    bindId: payload.bindId,
    bind_id: payload.bind_id,
    liveType: payload.liveType,
    live_type: payload.live_type,
    termId: payload.termId,
    term_id: payload.term_id,
    customerId: payload.customerId,
    customer_id: payload.customer_id,
    userId: payload.userId,
    user_id: payload.user_id,
    nickname: payload.nickname,
    nick: payload.nick,
    userName: payload.userName,
    user_name: payload.user_name,
    customerName: payload.customerName,
    customer_name: payload.customer_name,
    avatar: payload.avatar,
    headImg: payload.headImg,
    head_img: payload.head_img,
    avatarUrl: payload.avatarUrl,
    avatar_url: payload.avatar_url,
    msgId: payload.msgId,
    msg_id: payload.msg_id,
    clientMsgId: payload.clientMsgId,
    client_msg_id: payload.client_msg_id,
    timelineSeconds: payload.timelineSeconds,
    timeline_seconds: payload.timeline_seconds,
    replayVideoId: payload.replayVideoId,
    replay_video_id: payload.replay_video_id,
    videoId: payload.videoId,
    video_id: payload.video_id,
  }
  return payload
}

export function sendLiveComment(roomId, comment, data = {}) {
  return h5Post('/h5/live/comment', buildLiveCommentPayload(roomId, comment, data))
}

export function checkSigned(roomId, context = {}) {
  const meta = context && typeof context === 'object' ? context : {}
  return h5Get('/h5/live/sign/check', withLiveAliases({
    ...meta,
    roomId: Number(firstValue(meta, 'roomId', 'room_id', 'liveId', 'live_id') || roomId || 0),
  }))
}

export function submitSign(roomId, formData = {}, context = {}) {
  const meta = context && typeof context === 'object' ? context : {}
  const normalizedFormData = formData && typeof formData === 'object' && !Array.isArray(formData)
    ? { ...formData }
    : {}
  const payload = withLiveAliases({
    ...meta,
    ...normalizedFormData,
    roomId: Number(firstValue(meta, 'roomId', 'room_id', 'liveId', 'live_id') || roomId || 0),
    formData: normalizedFormData,
    form_data: normalizedFormData,
  })
  payload.data = {
    ...(payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : {}),
    ...normalizedFormData,
    roomId: payload.roomId,
    room_id: payload.room_id,
    liveId: payload.liveId,
    live_id: payload.live_id,
    roomCode: payload.roomCode,
    room_code: payload.room_code,
    termId: payload.termId,
    term_id: payload.term_id,
    liveTermId: payload.liveTermId,
    live_term_id: payload.live_term_id,
    customerId: payload.customerId,
    customer_id: payload.customer_id,
    userId: payload.userId,
    user_id: payload.user_id,
    formData: payload.formData,
    form_data: payload.form_data,
  }
  payload.form = normalizedFormData
  payload.signForm = normalizedFormData
  payload.sign_form = normalizedFormData
  return h5Post('/h5/live/sign/submit', payload)
}

export function getWsSignKey() {
  return h5Get('/h5/live/wsSignKey')
}

export function reportViewProgress(params = {}) {
  if (!params.roomId || !params.termId || !params.videoId || !params.watchDuration) {
    return Promise.resolve()
  }
  return h5Post('/h5/live/reportViewProgress', withLiveAliases({
    ...params,
    roomId: Number(params.roomId || 0),
    termId: Number(params.termId || 0),
    videoId: Number(params.videoId || 0),
    lastPosition: Number(params.lastPosition || 0),
    watchDuration: Number(params.watchDuration || 0),
    watchStatus: Number(params.watchStatus || 1),
  }))
}

export function getReplaySimMessages(videoId, startSec = 0, endSec = 0, context = {}) {
  context = context && typeof context === 'object' ? context : {}
  const data = withLiveAliases({
    ...context,
    videoId: Number(videoId || 0),
    liveType: context.liveType || context.live_type || 'replay',
  })
  if (Number(startSec || 0) > 0) {
    data.startSec = Number(startSec)
    data.start_sec = Number(startSec)
  }
  if (Number(endSec || 0) > 0) {
    data.endSec = Number(endSec)
    data.end_sec = Number(endSec)
  }
  return h5Get('/h5/live/replaySimMessages', data)
}

export function getImToken(roomId) {
  return h5Get('/h5/live/imToken', { roomId: Number(roomId || 0) })
}

export function checkDistributor(roomId) {
  return h5Get('/h5/live/distributorCheck', { roomId: Number(roomId || 0) })
}

export function getDistributorShareUrl(roomId) {
  return h5Get('/h5/live/distributorShareUrl', { roomId: Number(roomId || 0) })
}

export function getDistributorInvitedUsers(params = {}) {
  return h5Get('/h5/live/distributorInvitedUsers', {
    roomId: Number(params.roomId || 0),
    keyword: params.keyword || '',
    currentStatus: params.currentStatus || 0,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  })
}

export function getPrizeRecordList(params = {}) {
  return getMarketingPrizeRecordList(params)
}

export function claimWatchReward(data = {}) {
  return claimMarketingWatchReward(data)
}

export function getLotteryParticipants(params = {}) {
  return getMarketingLotteryParticipants(params)
}

export function getCommentLotteryList(params = {}) {
  return getMarketingCommentLotteryList(params)
}

export function getCommentLotteryDetail(params = {}) {
  return getMarketingCommentLotteryDetail(params)
}

export function claimCommentReward(data = {}) {
  return claimMarketingCommentReward(data)
}
