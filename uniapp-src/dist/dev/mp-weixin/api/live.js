"use strict";
const api_h5 = require("./h5.js");
const api_marketing = require("./marketing.js");
function getLiveDetail(params = {}) {
  const data = typeof params === "string" ? { roomCode: params } : params;
  return api_h5.h5Get("/h5/live/detail", data);
}
function getLiveStreamInf(roomCode) {
  return api_h5.h5Get("/h5/live/streamInf", { roomCode: roomCode || "" });
}
function getReplayFirstVideo(roomCode) {
  return api_h5.h5Get("/h5/live/replayFirstVideo", { roomCode: roomCode || "" });
}
function getLiveStatus(roomId) {
  return api_h5.h5Get("/h5/live/status", { roomId: Number(roomId || 0) });
}
function enterLiveRoom(roomId, sessionId, shareCode, termId) {
  return api_h5.h5Post("/h5/live/enter", {
    roomId: Number(roomId || 0),
    sessionId: sessionId || "",
    shareCode: shareCode || "",
    termId: termId ? Number(termId) : void 0
  });
}
function leaveLiveRoom(roomId, sessionId, watchDuration) {
  return api_h5.h5Post("/h5/live/leave", {
    roomId: Number(roomId || 0),
    sessionId: sessionId || "",
    watchDuration: Number(watchDuration || 0)
  });
}
function liveHeartbeat(roomId, sessionId, watchDuration) {
  return api_h5.h5Post("/h5/live/heartbeat", {
    roomId: Number(roomId || 0),
    sessionId: sessionId || "",
    watchDuration: Number(watchDuration || 0)
  });
}
function getLiveProducts(roomId, page = 1, pageSize = 20) {
  return api_h5.h5Get("/h5/live/products", {
    roomId: Number(roomId || 0),
    page,
    pageSize
  });
}
function getCurrentProduct(roomId) {
  return api_h5.h5Get("/h5/live/currentProduct", { roomId: Number(roomId || 0) });
}
function getCommentHistory(roomId, limit = 30, replayVideoId = 0) {
  return api_h5.h5Get("/h5/live/commentHistory", {
    roomId: Number(roomId || 0),
    limit,
    replayVideoId: Number(replayVideoId || 0)
  });
}
function sendLike(roomId, count = 1) {
  return api_h5.h5Post("/h5/live/like", {
    roomId: Number(roomId || 0),
    count: Number(count || 1) > 0 ? Number(count || 1) : 1
  });
}
function sendBuyReminder(data = {}) {
  return api_h5.h5Post("/h5/live/buyReminder", {
    roomId: Number(data.roomId || 0),
    productId: Number(data.productId || 0)
  });
}
function sendLiveComment(roomId, comment, data = {}) {
  return api_h5.h5Post("/h5/live/comment", {
    roomId: Number(roomId || 0),
    content: comment,
    comment,
    data
  });
}
function checkSigned(roomId) {
  return api_h5.h5Get("/h5/live/sign/check", { roomId: Number(roomId || 0) });
}
function submitSign(roomId, formData = {}) {
  return api_h5.h5Post("/h5/live/sign/submit", {
    roomId: Number(roomId || 0),
    formData
  });
}
function getWsSignKey() {
  return api_h5.h5Get("/h5/live/wsSignKey");
}
function reportViewProgress(params = {}) {
  if (!params.roomId || !params.termId || !params.videoId || !params.watchDuration) {
    return Promise.resolve();
  }
  return api_h5.h5Post("/h5/live/reportViewProgress", {
    roomId: Number(params.roomId || 0),
    termId: Number(params.termId || 0),
    videoId: Number(params.videoId || 0),
    lastPosition: Number(params.lastPosition || 0),
    watchDuration: Number(params.watchDuration || 0),
    watchStatus: Number(params.watchStatus || 1)
  });
}
function getReplaySimMessages(videoId, startSec = 0, endSec = 0) {
  const data = { videoId: Number(videoId || 0) };
  if (Number(startSec || 0) > 0)
    data.startSec = Number(startSec);
  if (Number(endSec || 0) > 0)
    data.endSec = Number(endSec);
  return api_h5.h5Get("/h5/live/replaySimMessages", data);
}
function getDistributorInvitedUsers(params = {}) {
  return api_h5.h5Get("/h5/live/distributorInvitedUsers", {
    roomId: Number(params.roomId || 0),
    keyword: params.keyword || "",
    currentStatus: params.currentStatus || 0,
    page: params.page || 1,
    pageSize: params.pageSize || 10
  });
}
function getPrizeRecordList(params = {}) {
  return api_marketing.getPrizeRecordList(params);
}
exports.checkSigned = checkSigned;
exports.enterLiveRoom = enterLiveRoom;
exports.getCommentHistory = getCommentHistory;
exports.getCurrentProduct = getCurrentProduct;
exports.getDistributorInvitedUsers = getDistributorInvitedUsers;
exports.getLiveDetail = getLiveDetail;
exports.getLiveProducts = getLiveProducts;
exports.getLiveStatus = getLiveStatus;
exports.getLiveStreamInf = getLiveStreamInf;
exports.getPrizeRecordList = getPrizeRecordList;
exports.getReplayFirstVideo = getReplayFirstVideo;
exports.getReplaySimMessages = getReplaySimMessages;
exports.getWsSignKey = getWsSignKey;
exports.leaveLiveRoom = leaveLiveRoom;
exports.liveHeartbeat = liveHeartbeat;
exports.reportViewProgress = reportViewProgress;
exports.sendBuyReminder = sendBuyReminder;
exports.sendLike = sendLike;
exports.sendLiveComment = sendLiveComment;
exports.submitSign = submitSign;
