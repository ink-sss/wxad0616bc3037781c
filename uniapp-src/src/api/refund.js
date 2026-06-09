import { h5Get, h5Post } from './h5.js'
import { uploadFileWithComplaintUploadUrl } from './upload.js'

export function applyRefund(data = {}) {
  return h5Post('/h5/refund/apply', data)
}

export function getRefundList(params = {}) {
  return h5Get('/h5/refund/list', {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    refundStatus: params.refundStatus ?? 0,
  })
}

export function getRefundUnreadStats() {
  return h5Get('/h5/refund/unreadStats')
}

export function getRefundDetail(refundId) {
  return h5Get('/h5/refund/detail', { refundId: Number(refundId || 0) })
}

export function cancelRefund(refundId) {
  return h5Post('/h5/refund/cancel', { refundId: Number(refundId || 0) })
}

export function submitLogistics(data = {}) {
  return h5Post('/h5/refund/submitLogistics', data)
}

export function negotiate(data = {}) {
  return h5Post('/h5/refund/negotiate', data)
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function toPositiveNumber(value) {
  const numberValue = Number(value || 0)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0
}

export async function uploadRefundImage(payload = {}) {
  const filePath = payload.filePath || ''
  if (!filePath) throw new Error('图片路径不能为空')
  const roomId = toPositiveNumber(firstValue(payload, 'RoomId', 'roomId', 'room_id', 'liveRoomId', 'live_room_id', 'liveId', 'live_id'))
  if (!roomId) throw new Error('直播间信息异常，无法上传凭证')

  const data = {
    ...(payload.data || {}),
    orderId: Number(payload.orderId || 0),
    roomId,
  }

  return uploadFileWithComplaintUploadUrl({
    ...payload,
    filePath,
    fileType: payload.fileType || payload.file_type || 'image',
    data,
  })
}
