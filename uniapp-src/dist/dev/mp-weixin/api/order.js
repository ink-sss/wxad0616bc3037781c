"use strict";
const api_h5 = require("./h5.js");
function confirmOrder(data = {}) {
  return api_h5.h5Post("/h5/order/confirm", data);
}
function createOrder(data = {}) {
  return api_h5.h5Post("/h5/order/create", data);
}
function getOrderList(params = {}) {
  return api_h5.h5Get("/h5/order/list", {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    orderStatus: params.orderStatus ?? 0
  });
}
function markOrderUnread(orderId) {
  return api_h5.h5Post("/h5/order/markUnread", { orderId });
}
function getOrderUnreadStats() {
  return api_h5.h5Get("/h5/order/unreadStats");
}
function getOrderDetail(orderId) {
  return api_h5.h5Get("/h5/order/detail", { orderId: Number(orderId || 0) });
}
function getReceiptDetail(orderNo, subMchId) {
  const data = { orderNo };
  if (subMchId)
    data.subMchId = subMchId;
  return api_h5.h5Get("/h5/order/receiptDetail", data);
}
function cancelOrder(orderId, cancelReason = "") {
  return api_h5.h5Post("/h5/order/cancel", { orderId: Number(orderId || 0), cancelReason });
}
function confirmReceive(orderId) {
  return api_h5.h5Post("/h5/order/confirmReceive", { orderId: Number(orderId || 0) });
}
function extendReceive(orderId) {
  return api_h5.h5Post("/h5/order/extendReceive", { orderId: Number(orderId || 0) });
}
function updatePrizeOrderAddress(data = {}) {
  return api_h5.h5Post("/h5/order/updatePrizeAddress", data);
}
function getLogistics(orderId) {
  return api_h5.h5Get("/h5/order/logistics", { orderId: Number(orderId || 0) });
}
function deleteOrder(orderId) {
  return api_h5.h5Post("/h5/order/delete", { orderId: Number(orderId || 0) });
}
exports.cancelOrder = cancelOrder;
exports.confirmOrder = confirmOrder;
exports.confirmReceive = confirmReceive;
exports.createOrder = createOrder;
exports.deleteOrder = deleteOrder;
exports.extendReceive = extendReceive;
exports.getLogistics = getLogistics;
exports.getOrderDetail = getOrderDetail;
exports.getOrderList = getOrderList;
exports.getOrderUnreadStats = getOrderUnreadStats;
exports.getReceiptDetail = getReceiptDetail;
exports.markOrderUnread = markOrderUnread;
exports.updatePrizeOrderAddress = updatePrizeOrderAddress;
