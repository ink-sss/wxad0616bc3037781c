import { h5Get, h5Post, normalizeH5AssetUrl } from './h5.js'
import { putFileToPresignedUrl } from '../platform/weixin/file.js'

function fileNameFromPath(filePath = '', prefix = 'refund') {
  return filePath.split('/').pop() || `${prefix}_${Date.now()}.jpg`
}

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

export function getRefundUploadUrl(data = {}) {
  return h5Post('/h5/refund/getUploadUrl', data)
}

export async function uploadRefundImage(payload = {}) {
  const filePath = payload.filePath || ''
  if (!filePath) throw new Error('图片路径不能为空')

  const fileName = payload.fileName || fileNameFromPath(filePath, 'refund')
  const contentType = payload.contentType || 'image/jpeg'
  const uploadInfo = await getRefundUploadUrl({
    orderId: Number(payload.orderId || 0),
    filename: fileName,
    contentType,
  })
  const uploadUrl = uploadInfo?.uploadUrl || ''
  const fileUrl = uploadInfo?.fileUrl || ''
  if (!uploadUrl || !fileUrl) throw new Error('获取上传地址失败')

  await putFileToPresignedUrl(uploadUrl, filePath, { contentType })
  return {
    url: normalizeH5AssetUrl(fileUrl),
    rawUrl: fileUrl,
  }
}
