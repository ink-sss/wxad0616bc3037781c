"use strict";
const api_h5 = require("./h5.js");
const platform_weixin_file = require("../platform/weixin/file.js");
function fileNameFromPath(filePath = "") {
  return filePath.split("/").pop() || `complaint_${Date.now()}.jpg`;
}
function getComplaintUploadUrl(data = {}) {
  return api_h5.h5Post("/h5/complaint/getUploadUrl", data);
}
async function uploadComplaintImage(payload = {}) {
  const filePath = payload.filePath || "";
  if (!filePath)
    throw new Error("图片路径不能为空");
  const fileName = payload.fileName || fileNameFromPath(filePath);
  const contentType = payload.contentType || "image/jpeg";
  const uploadInfo = await getComplaintUploadUrl({
    roomId: Number(payload.roomId || 0),
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
function createComplaint(data = {}) {
  return api_h5.h5Post("/h5/complaint/create", data);
}
function getComplaintList(params = {}) {
  return api_h5.h5Get("/h5/complaint/list", {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  });
}
function getComplaintDetail(complaintId) {
  return api_h5.h5Get("/h5/complaint/detail", { complaintId: Number(complaintId || 0) });
}
exports.createComplaint = createComplaint;
exports.getComplaintDetail = getComplaintDetail;
exports.getComplaintList = getComplaintList;
exports.uploadComplaintImage = uploadComplaintImage;
