import { h5Get, h5Post } from './h5.js'

export function getPrizeRecordList(params = {}) {
  return h5Get('/h5/marketing/prizeRecords', {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    winType: params.winType || 0,
    month: params.month || '',
  })
}

export function claimWatchReward(data = {}) {
  return h5Post('/h5/marketing/claimWatchReward', data)
}

export function getLotteryParticipants(params = {}) {
  const { participantsUrl, ...data } = params || {}
  return h5Get(participantsUrl || '/h5/marketing/lottery/participants', data)
}

export function getCommentLotteryList(params = {}) {
  return h5Get('/h5/marketing/commentLottery/list', {
    roomId: Number(params.roomId || 0),
    termId: Number(params.termId || 0),
  })
}

export function getCommentLotteryDetail(params = {}) {
  return h5Get('/h5/marketing/commentLottery/detail', {
    activityId: Number(params.activityId || 0),
  })
}

export function claimCommentReward(data = {}) {
  return h5Post('/h5/marketing/claimCommentReward', {
    activityId: Number(data.activityId || 0),
    prizeId: Number(data.prizeId || 0) || undefined,
    comment: data.comment || '',
  })
}
