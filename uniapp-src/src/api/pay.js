import { h5Get, h5Post } from './h5.js'

export function createPayment(data = {}) {
  return h5Post('/h5/pay/create', data)
}

export function getPayResult(orderNo) {
  return h5Get('/h5/pay/result', { orderNo })
}

function parseJsonObject(value) {
  if (!value || typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch (error) {
    return null
  }
}

function pickPaySource(data = {}) {
  const candidates = [
    data.payment,
    data.payParams,
    data.wxPay,
    data.jsapi,
    data,
  ].filter((item) => item && typeof item === 'object')

  for (const candidate of candidates) {
    const prePayTn = candidate.prePayTn || candidate.prepayTn || candidate.pre_pay_tn
    const parsed = parseJsonObject(prePayTn)
    if (parsed) return { ...candidate, ...parsed }
  }

  return candidates[0] || {}
}

export function normalizeRequestPaymentParams(data = {}) {
  const source = pickPaySource(data)
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
