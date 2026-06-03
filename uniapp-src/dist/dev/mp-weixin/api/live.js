"use strict";
const api_h5 = require("./h5.js");
const api_marketing = require("./marketing.js");
function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source == null ? void 0 : source[key];
    if (value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function toNumberLike(value) {
  if (value === void 0 || value === null || value === "")
    return void 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}
function withLiveAliases(data = {}, aliasMap = {}) {
  const payload = { ...data };
  const aliases = {
    roomId: ["room_id", "liveId", "live_id"],
    sessionId: ["session_id"],
    shareCode: ["share_code"],
    roomCode: ["room_code"],
    tenantId: ["tenant_id"],
    bindId: ["bind_id"],
    liveType: ["live_type"],
    customerId: ["customer_id", "userId", "user_id"],
    termId: ["term_id", "liveTermId", "live_term_id"],
    watchDuration: ["watch_duration"],
    watchStatus: ["watch_status"],
    lastPosition: ["last_position"],
    videoId: ["video_id", "replayVideoId", "replay_video_id"],
    productId: ["product_id", "goodsId", "goods_id"],
    count: ["likeCount", "like_count"],
    ...aliasMap
  };
  Object.entries(aliases).forEach(([canonicalKey, keys]) => {
    const value = firstValue(payload, canonicalKey, ...keys);
    if (value === void 0)
      return;
    payload[canonicalKey] = value;
    keys.forEach((key) => {
      payload[key] = value;
    });
  });
  [
    "roomId",
    "room_id",
    "liveId",
    "live_id",
    "tenantId",
    "tenant_id",
    "termId",
    "term_id",
    "liveTermId",
    "live_term_id",
    "customerId",
    "customer_id",
    "userId",
    "user_id",
    "watchDuration",
    "watch_duration",
    "watchStatus",
    "watch_status",
    "lastPosition",
    "last_position",
    "videoId",
    "video_id",
    "replayVideoId",
    "replay_video_id",
    "productId",
    "product_id",
    "goodsId",
    "goods_id",
    "count",
    "likeCount",
    "like_count"
  ].forEach((key) => {
    if (payload[key] !== void 0)
      payload[key] = toNumberLike(payload[key]);
  });
  if (payload.liveId === void 0 && payload.roomId !== void 0)
    payload.liveId = payload.roomId;
  if (payload.live_id === void 0 && payload.room_id !== void 0)
    payload.live_id = payload.room_id;
  if (payload.roomId === void 0 && payload.liveId !== void 0)
    payload.roomId = payload.liveId;
  if (payload.room_id === void 0 && payload.live_id !== void 0)
    payload.room_id = payload.live_id;
  if (payload.userId === void 0 && payload.customerId !== void 0)
    payload.userId = payload.customerId;
  if (payload.user_id === void 0 && payload.customer_id !== void 0)
    payload.user_id = payload.customer_id;
  if (payload.customerId === void 0 && payload.userId !== void 0)
    payload.customerId = payload.userId;
  if (payload.customer_id === void 0 && payload.user_id !== void 0)
    payload.customer_id = payload.user_id;
  if (payload.replayVideoId === void 0 && payload.videoId !== void 0)
    payload.replayVideoId = payload.videoId;
  if (payload.replay_video_id === void 0 && payload.video_id !== void 0)
    payload.replay_video_id = payload.video_id;
  if (payload.videoId === void 0 && payload.replayVideoId !== void 0)
    payload.videoId = payload.replayVideoId;
  if (payload.video_id === void 0 && payload.replay_video_id !== void 0)
    payload.video_id = payload.replay_video_id;
  return payload;
}
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
  return api_h5.h5Get("/h5/live/status", withLiveAliases({ roomId: Number(roomId || 0) }));
}
function enterLiveRoom(roomId, sessionId, shareCode, termId) {
  return api_h5.h5Post("/h5/live/enter", withLiveAliases({
    roomId: Number(roomId || 0),
    sessionId: sessionId || "",
    shareCode: shareCode || "",
    termId: termId ? Number(termId) : void 0
  }));
}
function leaveLiveRoom(roomId, sessionId, watchDuration) {
  return api_h5.h5Post("/h5/live/leave", withLiveAliases({
    roomId: Number(roomId || 0),
    sessionId: sessionId || "",
    watchDuration: Number(watchDuration || 0)
  }));
}
function liveHeartbeat(roomId, sessionId, watchDuration) {
  return api_h5.h5Post("/h5/live/heartbeat", withLiveAliases({
    roomId: Number(roomId || 0),
    sessionId: sessionId || "",
    watchDuration: Number(watchDuration || 0)
  }));
}
function getLiveProducts(roomId, page = 1, pageSize = 20) {
  const isObjectParam = roomId && typeof roomId === "object";
  const meta = isObjectParam ? roomId : {};
  const resolvedRoomId = firstValue(meta, "roomId", "room_id", "liveId", "live_id") || (isObjectParam ? 0 : roomId) || 0;
  const resolvedPage = firstValue(meta, "page", "current") || page;
  const resolvedPageSize = firstValue(meta, "pageSize", "page_size", "limit") || pageSize;
  return api_h5.h5Get("/h5/live/products", withLiveAliases({
    ...meta,
    roomId: Number(resolvedRoomId || 0),
    page: Number(resolvedPage || 1),
    current: Number(resolvedPage || 1),
    pageSize: Number(resolvedPageSize || 20),
    page_size: Number(resolvedPageSize || 20),
    limit: Number(resolvedPageSize || 20)
  }));
}
function getCurrentProduct(roomId, context = {}) {
  const isObjectParam = roomId && typeof roomId === "object";
  const meta = isObjectParam ? roomId : context;
  const resolvedRoomId = firstValue(meta, "roomId", "room_id", "liveId", "live_id") || (isObjectParam ? 0 : roomId) || 0;
  return api_h5.h5Get("/h5/live/currentProduct", withLiveAliases({
    ...meta,
    roomId: Number(resolvedRoomId || 0)
  }));
}
function getCommentHistory(roomId, limit = 30, replayVideoId = 0, context = {}) {
  const isObjectParam = roomId && typeof roomId === "object";
  const meta = isObjectParam ? roomId : context;
  const resolvedRoomId = firstValue(meta, "roomId", "room_id", "liveId", "live_id") || (isObjectParam ? 0 : roomId) || 0;
  const resolvedLimit = firstValue(meta, "limit", "pageSize", "page_size") || limit;
  const resolvedPage = firstValue(meta, "page", "current") || 1;
  const resolvedReplayVideoId = firstValue(meta, "replayVideoId", "replay_video_id", "videoId", "video_id") || replayVideoId || 0;
  return api_h5.h5Get("/h5/live/commentHistory", withLiveAliases({
    ...meta,
    roomId: Number(resolvedRoomId || 0),
    limit: Number(resolvedLimit || 30),
    page: Number(resolvedPage),
    current: Number(resolvedPage),
    pageSize: Number(resolvedLimit || 30),
    page_size: Number(resolvedLimit || 30),
    replayVideoId: Number(resolvedReplayVideoId || 0)
  }));
}
function sendLike(roomId, count = 1, context = {}) {
  const isObjectParam = roomId && typeof roomId === "object";
  const meta = isObjectParam ? roomId : context;
  const resolvedRoomId = firstValue(meta, "roomId", "room_id", "liveId", "live_id") || (isObjectParam ? 0 : roomId) || 0;
  const resolvedCount = firstValue(meta, "count", "likeCount", "like_count") || count;
  const payload = withLiveAliases({
    ...meta,
    roomId: Number(resolvedRoomId || 0),
    count: Number(resolvedCount || 1) > 0 ? Number(resolvedCount || 1) : 1
  });
  payload.data = {
    ...payload.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data : {},
    roomId: payload.roomId,
    room_id: payload.room_id,
    liveId: payload.liveId,
    live_id: payload.live_id,
    roomCode: payload.roomCode,
    room_code: payload.room_code,
    tenantId: payload.tenantId,
    tenant_id: payload.tenant_id,
    shareCode: payload.shareCode,
    share_code: payload.share_code,
    bindId: payload.bindId,
    bind_id: payload.bind_id,
    liveType: payload.liveType,
    live_type: payload.live_type,
    termId: payload.termId,
    term_id: payload.term_id,
    liveTermId: payload.liveTermId,
    live_term_id: payload.live_term_id,
    customerId: payload.customerId,
    customer_id: payload.customer_id,
    userId: payload.userId,
    user_id: payload.user_id,
    count: payload.count,
    likeCount: payload.likeCount,
    like_count: payload.like_count
  };
  return api_h5.h5Post("/h5/live/like", payload);
}
function sendBuyReminder(data = {}) {
  const payload = withLiveAliases({
    ...data,
    roomId: Number(firstValue(data, "roomId", "room_id", "liveId", "live_id") || 0),
    productId: Number(firstValue(data, "productId", "product_id", "goodsId", "goods_id") || 0)
  });
  payload.data = {
    ...payload.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data : {},
    roomId: payload.roomId,
    room_id: payload.room_id,
    liveId: payload.liveId,
    live_id: payload.live_id,
    roomCode: payload.roomCode,
    room_code: payload.room_code,
    tenantId: payload.tenantId,
    tenant_id: payload.tenant_id,
    shareCode: payload.shareCode,
    share_code: payload.share_code,
    bindId: payload.bindId,
    bind_id: payload.bind_id,
    liveType: payload.liveType,
    live_type: payload.live_type,
    termId: payload.termId,
    term_id: payload.term_id,
    liveTermId: payload.liveTermId,
    live_term_id: payload.live_term_id,
    videoId: payload.videoId,
    video_id: payload.video_id,
    replayVideoId: payload.replayVideoId,
    replay_video_id: payload.replay_video_id,
    productId: payload.productId,
    product_id: payload.product_id,
    goodsId: payload.goodsId,
    goods_id: payload.goods_id,
    skuId: payload.skuId,
    sku_id: payload.sku_id,
    productSkuId: payload.productSkuId,
    product_sku_id: payload.product_sku_id,
    customerId: payload.customerId,
    customer_id: payload.customer_id,
    userId: payload.userId,
    user_id: payload.user_id,
    productName: payload.productName,
    product_name: payload.product_name,
    goodsName: payload.goodsName,
    goods_name: payload.goods_name,
    productImage: payload.productImage,
    product_image: payload.product_image,
    goodsPic: payload.goodsPic,
    goods_pic: payload.goods_pic
  };
  return api_h5.h5Post("/h5/live/buyReminder", payload);
}
function buildLiveCommentPayload(roomId, comment, data = {}) {
  const meta = data && typeof data === "object" ? data : {};
  const text = String(comment || meta.content || meta.comment || meta.message || meta.text || "");
  const payload = {
    roomId: Number(roomId || 0),
    content: text,
    comment: text,
    message: text,
    text,
    data: meta
  };
  const fieldAliases = {
    roomId: ["roomId", "room_id", "liveId", "live_id"],
    msgId: ["msgId", "msg_id"],
    clientMsgId: ["clientMsgId", "client_msg_id"],
    timelineSeconds: ["timelineSeconds", "timeline_seconds"],
    replayVideoId: ["replayVideoId", "replay_video_id"],
    videoId: ["videoId", "video_id"],
    termId: ["termId", "term_id"],
    customerId: ["customerId", "customer_id", "userId", "user_id"],
    roomCode: ["roomCode", "room_code"],
    tenantId: ["tenantId", "tenant_id"],
    shareCode: ["shareCode", "share_code"],
    bindId: ["bindId", "bind_id"],
    liveType: ["liveType", "live_type"],
    nickname: ["nickname", "nick", "userName", "user_name", "customerName", "customer_name"],
    avatar: ["avatar", "headImg", "head_img", "avatarUrl", "avatar_url"]
  };
  Object.entries(fieldAliases).forEach(([canonicalKey, aliases]) => {
    const value = aliases.map((key) => payload[key] ?? meta[key]).find((item) => item !== void 0 && item !== null && item !== "");
    if (value !== void 0) {
      payload[canonicalKey] = value;
      aliases.forEach((key) => {
        payload[key] = value;
      });
    }
  });
  if (payload.replayVideoId === void 0 && payload.videoId !== void 0) {
    payload.replayVideoId = payload.videoId;
    payload.replay_video_id = payload.videoId;
  }
  if (payload.videoId === void 0 && payload.replayVideoId !== void 0) {
    payload.videoId = payload.replayVideoId;
    payload.video_id = payload.replayVideoId;
  }
  payload.data = {
    ...meta,
    content: text,
    comment: text,
    message: text,
    text,
    roomId: payload.roomId,
    room_id: payload.room_id,
    liveId: payload.liveId,
    live_id: payload.live_id,
    roomCode: payload.roomCode,
    room_code: payload.room_code,
    tenantId: payload.tenantId,
    tenant_id: payload.tenant_id,
    shareCode: payload.shareCode,
    share_code: payload.share_code,
    bindId: payload.bindId,
    bind_id: payload.bind_id,
    liveType: payload.liveType,
    live_type: payload.live_type,
    termId: payload.termId,
    term_id: payload.term_id,
    customerId: payload.customerId,
    customer_id: payload.customer_id,
    userId: payload.userId,
    user_id: payload.user_id,
    nickname: payload.nickname,
    nick: payload.nick,
    userName: payload.userName,
    user_name: payload.user_name,
    customerName: payload.customerName,
    customer_name: payload.customer_name,
    avatar: payload.avatar,
    headImg: payload.headImg,
    head_img: payload.head_img,
    avatarUrl: payload.avatarUrl,
    avatar_url: payload.avatar_url,
    msgId: payload.msgId,
    msg_id: payload.msg_id,
    clientMsgId: payload.clientMsgId,
    client_msg_id: payload.client_msg_id,
    timelineSeconds: payload.timelineSeconds,
    timeline_seconds: payload.timeline_seconds,
    replayVideoId: payload.replayVideoId,
    replay_video_id: payload.replay_video_id,
    videoId: payload.videoId,
    video_id: payload.video_id
  };
  return payload;
}
function sendLiveComment(roomId, comment, data = {}) {
  return api_h5.h5Post("/h5/live/comment", buildLiveCommentPayload(roomId, comment, data));
}
function checkSigned(roomId, context = {}) {
  const meta = context && typeof context === "object" ? context : {};
  return api_h5.h5Get("/h5/live/sign/check", withLiveAliases({
    ...meta,
    roomId: Number(firstValue(meta, "roomId", "room_id", "liveId", "live_id") || roomId || 0)
  }));
}
function submitSign(roomId, formData = {}, context = {}) {
  const meta = context && typeof context === "object" ? context : {};
  const normalizedFormData = formData && typeof formData === "object" && !Array.isArray(formData) ? { ...formData } : {};
  const payload = withLiveAliases({
    ...meta,
    ...normalizedFormData,
    roomId: Number(firstValue(meta, "roomId", "room_id", "liveId", "live_id") || roomId || 0),
    formData: normalizedFormData,
    form_data: normalizedFormData
  });
  payload.data = {
    ...payload.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data : {},
    ...normalizedFormData,
    roomId: payload.roomId,
    room_id: payload.room_id,
    liveId: payload.liveId,
    live_id: payload.live_id,
    roomCode: payload.roomCode,
    room_code: payload.room_code,
    termId: payload.termId,
    term_id: payload.term_id,
    liveTermId: payload.liveTermId,
    live_term_id: payload.live_term_id,
    customerId: payload.customerId,
    customer_id: payload.customer_id,
    userId: payload.userId,
    user_id: payload.user_id,
    formData: payload.formData,
    form_data: payload.form_data
  };
  payload.form = normalizedFormData;
  payload.signForm = normalizedFormData;
  payload.sign_form = normalizedFormData;
  return api_h5.h5Post("/h5/live/sign/submit", payload);
}
function getWsSignKey() {
  return api_h5.h5Get("/h5/live/wsSignKey");
}
function reportViewProgress(params = {}) {
  if (!params.roomId || !params.termId || !params.videoId || !params.watchDuration) {
    return Promise.resolve();
  }
  return api_h5.h5Post("/h5/live/reportViewProgress", withLiveAliases({
    roomId: Number(params.roomId || 0),
    termId: Number(params.termId || 0),
    videoId: Number(params.videoId || 0),
    lastPosition: Number(params.lastPosition || 0),
    watchDuration: Number(params.watchDuration || 0),
    watchStatus: Number(params.watchStatus || 1)
  }));
}
function getReplaySimMessages(videoId, startSec = 0, endSec = 0) {
  const data = { videoId: Number(videoId || 0) };
  if (Number(startSec || 0) > 0)
    data.startSec = Number(startSec);
  if (Number(endSec || 0) > 0)
    data.endSec = Number(endSec);
  return api_h5.h5Get("/h5/live/replaySimMessages", data);
}
function checkDistributor(roomId) {
  return api_h5.h5Get("/h5/live/distributorCheck", { roomId: Number(roomId || 0) });
}
function getDistributorShareUrl(roomId) {
  return api_h5.h5Get("/h5/live/distributorShareUrl", { roomId: Number(roomId || 0) });
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
function claimWatchReward(data = {}) {
  return api_marketing.claimWatchReward(data);
}
function getLotteryParticipants(params = {}) {
  return api_marketing.getLotteryParticipants(params);
}
function getCommentLotteryList(params = {}) {
  return api_marketing.getCommentLotteryList(params);
}
function getCommentLotteryDetail(params = {}) {
  return api_marketing.getCommentLotteryDetail(params);
}
function claimCommentReward(data = {}) {
  return api_marketing.claimCommentReward(data);
}
exports.checkDistributor = checkDistributor;
exports.checkSigned = checkSigned;
exports.claimCommentReward = claimCommentReward;
exports.claimWatchReward = claimWatchReward;
exports.enterLiveRoom = enterLiveRoom;
exports.getCommentHistory = getCommentHistory;
exports.getCommentLotteryDetail = getCommentLotteryDetail;
exports.getCommentLotteryList = getCommentLotteryList;
exports.getCurrentProduct = getCurrentProduct;
exports.getDistributorInvitedUsers = getDistributorInvitedUsers;
exports.getDistributorShareUrl = getDistributorShareUrl;
exports.getLiveDetail = getLiveDetail;
exports.getLiveProducts = getLiveProducts;
exports.getLiveStatus = getLiveStatus;
exports.getLiveStreamInf = getLiveStreamInf;
exports.getLotteryParticipants = getLotteryParticipants;
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
