"use strict";
const api_h5 = require("./h5.js");
function getPrizeRecordList(params = {}) {
  return api_h5.h5Get("/h5/marketing/prizeRecords", {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    winType: params.winType || 0,
    month: params.month || ""
  });
}
function claimWatchReward(data = {}) {
  return api_h5.h5Post("/h5/marketing/claimWatchReward", data);
}
function getLotteryParticipants(params = {}) {
  const { participantsUrl, ...data } = params || {};
  return api_h5.h5Get(participantsUrl || "/h5/marketing/lottery/participants", data);
}
function getCommentLotteryList(params = {}) {
  return api_h5.h5Get("/h5/marketing/commentLottery/list", {
    roomId: Number(params.roomId || 0),
    termId: Number(params.termId || 0)
  });
}
function claimCommentReward(data = {}) {
  return api_h5.h5Post("/h5/marketing/claimCommentReward", {
    activityId: Number(data.activityId || 0),
    prizeId: Number(data.prizeId || 0) || void 0,
    comment: data.comment || ""
  });
}
exports.claimCommentReward = claimCommentReward;
exports.claimWatchReward = claimWatchReward;
exports.getCommentLotteryList = getCommentLotteryList;
exports.getLotteryParticipants = getLotteryParticipants;
exports.getPrizeRecordList = getPrizeRecordList;
