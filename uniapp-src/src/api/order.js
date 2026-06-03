import { h5Get, h5Post } from './h5.js'

export function confirmOrder(data = {}) {
  return h5Post('/h5/order/confirm', data)
}

export function createOrder(data = {}) {
  return h5Post('/h5/order/create', data)
}

export function getOrderList(params = {}) {
  const data = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    orderStatus: params.orderStatus ?? 0,
  }
  const orderNo = params.orderNo || params.order_no || params.outTradeNo || params.out_trade_no || ''
  if (orderNo) data.orderNo = orderNo
  return h5Get('/h5/order/list', data)
}

export function markOrderUnread(orderId) {
  return h5Post('/h5/order/markUnread', { orderId })
}

export function getOrderUnreadStats() {
  return h5Get('/h5/order/unreadStats')
}

export function getOrderDetail(orderId) {
  return h5Get('/h5/order/detail', { orderId: Number(orderId || 0) })
}

export function getReceiptDetail(orderNo, subMchId) {
  const data = { orderNo }
  if (subMchId) data.subMchId = subMchId
  return h5Get('/h5/order/receiptDetail', data)
}

export function getPublicReceiptDetail({ orderNo, subMchId } = {}) {
  return getReceiptDetail(orderNo, subMchId)
}

export function cancelOrder(orderId, cancelReason = '') {
  return h5Post('/h5/order/cancel', { orderId: Number(orderId || 0), cancelReason })
}

export function confirmReceive(orderId) {
  return h5Post('/h5/order/confirmReceive', { orderId: Number(orderId || 0) })
}

export function extendReceive(orderId) {
  return h5Post('/h5/order/extendReceive', { orderId: Number(orderId || 0) })
}

export function updatePrizeOrderAddress(data = {}) {
  return h5Post('/h5/order/updatePrizeAddress', data)
}

export function getLogistics(orderId) {
  return h5Get('/h5/order/logistics', { orderId: Number(orderId || 0) })
}

export function deleteOrder(orderId) {
  return h5Post('/h5/order/delete', { orderId: Number(orderId || 0) })
}
