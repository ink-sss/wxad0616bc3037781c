"use strict";
const api_h5 = require("./h5.js");
const platform_weixin_file = require("../platform/weixin/file.js");
function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source[key];
    if (value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function toNumberLike(value) {
  if (value === void 0 || value === null || value === "")
    return value;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : value;
}
function applyAliases(target, keys = [], value, options = {}) {
  if (value === void 0 || value === null || value === "")
    return;
  const normalized = options.number ? toNumberLike(value) : value;
  keys.forEach((key) => {
    if (target[key] === void 0 || target[key] === null || target[key] === "") {
      target[key] = normalized;
    }
  });
}
function withComplaintAliases(data = {}) {
  const payload = { ...data };
  const roomId = firstValue(payload, "roomId", "room_id", "liveId", "live_id");
  const roomCode = firstValue(payload, "roomCode", "room_code");
  const tenantId = firstValue(payload, "tenantId", "tenant_id");
  const termId = firstValue(payload, "termId", "term_id", "liveTermId", "live_term_id");
  const customerId = firstValue(payload, "customerId", "customer_id", "userId", "user_id");
  const replayVideoId = firstValue(
    payload,
    "replayVideoId",
    "replay_video_id",
    "videoId",
    "video_id"
  );
  const liveName = firstValue(payload, "liveName", "live_name", "roomName", "room_name");
  const cover = firstValue(payload, "cover", "coverImage", "cover_image", "liveCover", "live_cover");
  const fromPath = firstValue(payload, "fromPath", "from_path", "sourcePath", "source_path", "returnPath", "return_path");
  const isReplay = firstValue(payload, "isReplay", "is_replay", "replay");
  const liveType = firstValue(payload, "liveType", "live_type");
  const complaintType = firstValue(payload, "complaintType", "complaint_type", "type");
  const complaintId = firstValue(payload, "complaintId", "complaint_id", "id");
  const content = firstValue(payload, "content", "description", "desc", "complaintDesc", "complaint_desc");
  const phone = firstValue(payload, "reporterPhone", "reporter_phone", "phone", "mobile");
  const images = firstValue(payload, "images", "imageUrls", "image_urls", "evidenceImages", "evidence_images");
  const filename = firstValue(payload, "filename", "fileName", "file_name");
  const contentType = firstValue(payload, "contentType", "content_type", "mimeType", "mime_type");
  applyAliases(payload, ["roomId", "room_id", "liveId", "live_id"], roomId, { number: true });
  applyAliases(payload, ["roomCode", "room_code"], roomCode);
  applyAliases(payload, ["tenantId", "tenant_id"], tenantId, { number: true });
  applyAliases(payload, ["termId", "term_id", "liveTermId", "live_term_id"], termId, { number: true });
  applyAliases(payload, ["customerId", "customer_id", "userId", "user_id"], customerId, { number: true });
  applyAliases(payload, ["replayVideoId", "replay_video_id", "videoId", "video_id"], replayVideoId, { number: true });
  applyAliases(payload, ["liveName", "live_name", "roomName", "room_name"], liveName);
  applyAliases(payload, ["cover", "coverImage", "cover_image", "liveCover", "live_cover"], cover);
  applyAliases(payload, ["fromPath", "from_path", "sourcePath", "source_path", "returnPath", "return_path"], fromPath);
  applyAliases(payload, ["isReplay", "is_replay", "replay"], isReplay);
  applyAliases(payload, ["liveType", "live_type"], liveType);
  applyAliases(payload, ["complaintType", "complaint_type", "type"], complaintType, { number: true });
  applyAliases(payload, ["complaintId", "complaint_id", "id"], complaintId, { number: true });
  applyAliases(payload, ["content", "description", "desc", "complaintDesc", "complaint_desc"], content);
  applyAliases(payload, ["reporterPhone", "reporter_phone", "phone", "mobile"], phone);
  applyAliases(payload, ["images", "imageUrls", "image_urls", "evidenceImages", "evidence_images"], images);
  applyAliases(payload, ["filename", "fileName", "file_name"], filename);
  applyAliases(payload, ["contentType", "content_type", "mimeType", "mime_type"], contentType);
  return payload;
}
function fileNameFromPath(filePath = "") {
  return filePath.split("/").pop() || `complaint_${Date.now()}.jpg`;
}
function getComplaintUploadUrl(data = {}) {
  return api_h5.h5Post("/h5/complaint/getUploadUrl", withComplaintAliases(data));
}
async function uploadComplaintImage(payload = {}) {
  const filePath = payload.filePath || "";
  if (!filePath)
    throw new Error("图片路径不能为空");
  const fileName = payload.fileName || fileNameFromPath(filePath);
  const contentType = payload.contentType || "image/jpeg";
  const uploadInfo = await getComplaintUploadUrl({
    roomId: Number(firstValue(payload, "roomId", "room_id", "liveId", "live_id") || 0),
    liveId: Number(firstValue(payload, "liveId", "live_id", "roomId", "room_id") || 0),
    roomCode: firstValue(payload, "roomCode", "room_code") || "",
    tenantId: firstValue(payload, "tenantId", "tenant_id"),
    termId: firstValue(payload, "termId", "term_id", "liveTermId", "live_term_id"),
    customerId: firstValue(payload, "customerId", "customer_id", "userId", "user_id"),
    replayVideoId: firstValue(payload, "replayVideoId", "replay_video_id", "videoId", "video_id"),
    isReplay: firstValue(payload, "isReplay", "is_replay", "replay"),
    liveType: firstValue(payload, "liveType", "live_type"),
    filename: fileName,
    fileName,
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
  return api_h5.h5Post("/h5/complaint/create", withComplaintAliases(data));
}
function getComplaintList(params = {}) {
  return api_h5.h5Get("/h5/complaint/list", withComplaintAliases({
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    page_size: params.pageSize || 10,
    roomId: firstValue(params, "roomId", "room_id", "liveId", "live_id"),
    roomCode: firstValue(params, "roomCode", "room_code")
  }));
}
function getComplaintDetail(complaintId) {
  return api_h5.h5Get("/h5/complaint/detail", withComplaintAliases({ complaintId: Number(complaintId || 0) }));
}
exports.createComplaint = createComplaint;
exports.getComplaintDetail = getComplaintDetail;
exports.getComplaintList = getComplaintList;
exports.uploadComplaintImage = uploadComplaintImage;
