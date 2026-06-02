import { h5Get, h5Post } from './h5.js'

export function createPayment(data = {}) {
  return h5Post('/h5/pay/create', data)
}

export function getPayResult(orderNo) {
  return h5Get('/h5/pay/result', { orderNo })
}

export function normalizeRequestPaymentParams(data = {}) {
  const source = data.payment || data.payParams || data.wxPay || data.jsapi || data
  return {
    timeStamp: String(source.timeStamp || source.timestamp || source.time_stamp || ''),
    nonceStr: source.nonceStr || source.nonce_str || '',
    package: source.package || source.packageValue || source.package_value || source.prepayPackage || '',
    signType: source.signType || source.sign_type || 'RSA',
    paySign: source.paySign || source.pay_sign || source.sign || '',
  }
}

export function hasRequestPaymentParams(params = {}) {
  return !!(params.timeStamp && params.nonceStr && params.package && params.paySign)
}
