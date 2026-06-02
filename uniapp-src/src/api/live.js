import { h5Get, h5Post } from './h5.js'
import { getPrizeRecordList as getMarketingPrizeRecordList } from './marketing.js'

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
  return h5Post('/h5/live/enter', {
    roomId: Number(roomId || 0),
    sessionId: sessionId || '',
    shareCode: shareCode || '',
    termId: termId ? Number(termId) : undefined,
  })
}

export function leaveLiveRoom(roomId, sessionId, watchDuration) {
  return h5Post('/h5/live/leave', {
    roomId: Number(roomId || 0),
    sessionId: sessionId || '',
    watchDuration: Number(watchDuration || 0),
  })
}

export function liveHeartbeat(roomId, sessionId, watchDuration) {
  return h5Post('/h5/live/heartbeat', {
    roomId: Number(roomId || 0),
    sessionId: sessionId || '',
    watchDuration: Number(watchDuration || 0),
  })
}

export function getLiveProducts(roomId, page = 1, pageSize = 20) {
  return h5Get('/h5/live/products', {
    roomId: Number(roomId || 0),
    page,
    pageSize,
  })
}

export function getCurrentProduct(roomId) {
  return h5Get('/h5/live/currentProduct', { roomId: Number(roomId || 0) })
}

export function getCommentHistory(roomId, limit = 30, replayVideoId = 0) {
  return h5Get('/h5/live/commentHistory', {
    roomId: Number(roomId || 0),
    limit,
    replayVideoId: Number(replayVideoId || 0),
  })
}

export function sendLike(roomId, count = 1) {
  return h5Post('/h5/live/like', {
    roomId: Number(roomId || 0),
    count: Number(count || 1) > 0 ? Number(count || 1) : 1,
  })
}

export function sendBuyReminder(data = {}) {
  return h5Post('/h5/live/buyReminder', {
    roomId: Number(data.roomId || 0),
    productId: Number(data.productId || 0),
  })
}

export function sendLiveComment(roomId, comment, data = {}) {
  return h5Post('/h5/live/comment', {
    roomId: Number(roomId || 0),
    content: comment,
    comment,
    data,
  })
}

export function checkSigned(roomId) {
  return h5Get('/h5/live/sign/check', { roomId: Number(roomId || 0) })
}

export function submitSign(roomId, formData = {}) {
  return h5Post('/h5/live/sign/submit', {
    roomId: Number(roomId || 0),
    formData,
  })
}

export function getWsSignKey() {
  return h5Get('/h5/live/wsSignKey')
}

export function reportViewProgress(params = {}) {
  if (!params.roomId || !params.termId || !params.videoId || !params.watchDuration) {
    return Promise.resolve()
  }
  return h5Post('/h5/live/reportViewProgress', {
    roomId: Number(params.roomId || 0),
    termId: Number(params.termId || 0),
    videoId: Number(params.videoId || 0),
    lastPosition: Number(params.lastPosition || 0),
    watchDuration: Number(params.watchDuration || 0),
    watchStatus: Number(params.watchStatus || 1),
  })
}

export function getReplaySimMessages(videoId, startSec = 0, endSec = 0) {
  const data = { videoId: Number(videoId || 0) }
  if (Number(startSec || 0) > 0) data.startSec = Number(startSec)
  if (Number(endSec || 0) > 0) data.endSec = Number(endSec)
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
