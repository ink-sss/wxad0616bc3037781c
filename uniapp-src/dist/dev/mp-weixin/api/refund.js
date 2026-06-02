"use strict";
const api_h5 = require("./h5.js");
const platform_weixin_file = require("../platform/weixin/file.js");
function fileNameFromPath(filePath = "", prefix = "refund") {
  return filePath.split("/").pop() || `${prefix}_${Date.now()}.jpg`;
}
function applyRefund(data = {}) {
  return api_h5.h5Post("/h5/refund/apply", data);
}
function getRefundList(params = {}) {
  return api_h5.h5Get("/h5/refund/list", {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    refundStatus: params.refundStatus ?? 0
  });
}
function getRefundUnreadStats() {
  return api_h5.h5Get("/h5/refund/unreadStats");
}
function getRefundDetail(refundId) {
  return api_h5.h5Get("/h5/refund/detail", { refundId: Number(refundId || 0) });
}
function submitLogistics(data = {}) {
  return api_h5.h5Post("/h5/refund/submitLogistics", data);
}
function getRefundUploadUrl(data = {}) {
  return api_h5.h5Post("/h5/refund/getUploadUrl", data);
}
async function uploadRefundImage(payload = {}) {
  const filePath = payload.filePath || "";
  if (!filePath)
    throw new Error("图片路径不能为空");
  const fileName = payload.fileName || fileNameFromPath(filePath, "refund");
  const contentType = payload.contentType || "image/jpeg";
  const uploadInfo = await getRefundUploadUrl({
    orderId: Number(payload.orderId || 0),
    filename: fileName,
    contentType
  });
  const uploadUrl = (uploadInfo == null ? void 0 : uploadInfo.uploadUrl) || "";
  const fileUrl = (uploadInfo == null ? void 0 : uploadInfo.fileUrl) || "";
  if (!uploadUrl || !fileUrl)
    throw new Error("获取上传地址失败");
  await platform_weixin_file.putFileToPresignedUrl(uploadUrl, filePath, { contentType });
  return {
    url: api_h5.normalizeH5AssetUrl(fileUrl),
    rawUrl: fileUrl
  };
}
exports.applyRefund = applyRefund;
exports.getRefundDetail = getRefundDetail;
exports.getRefundList = getRefundList;
exports.getRefundUnreadStats = getRefundUnreadStats;
exports.submitLogistics = submitLogistics;
exports.uploadRefundImage = uploadRefundImage;
