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

export async function uploadRefundImage(payload = {}) {
  const filePath = payload.filePath || ''
  if (!filePath) throw new Error('图片路径不能为空')

  return uploadFileWithComplaintUploadUrl({
    ...payload,
    filePath,
    fileType: payload.fileType || payload.file_type || 'image',
    data: {
      ...(payload.data || {}),
      orderId: Number(payload.orderId || 0),
    },
  })
}
