import { h5Get, h5Post, normalizeH5AssetUrl } from './h5.js'
import { putFileToPresignedUrl } from '../platform/weixin/file.js'

function fileNameFromPath(filePath = '') {
  return filePath.split('/').pop() || `complaint_${Date.now()}.jpg`
}

export function getComplaintUploadUrl(data = {}) {
  return h5Post('/h5/complaint/getUploadUrl', data)
}

export async function uploadComplaintImage(payload = {}) {
  const filePath = payload.filePath || ''
  if (!filePath) throw new Error('图片路径不能为空')

  const fileName = payload.fileName || fileNameFromPath(filePath)
  const contentType = payload.contentType || 'image/jpeg'
  const uploadInfo = await getComplaintUploadUrl({
    roomId: Number(payload.roomId || 0),
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

export function createComplaint(data = {}) {
  return h5Post('/h5/complaint/create', data)
}

export function getComplaintList(params = {}) {
  return h5Get('/h5/complaint/list', {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  })
}

export function getComplaintDetail(complaintId) {
  return h5Get('/h5/complaint/detail', { complaintId: Number(complaintId || 0) })
}
