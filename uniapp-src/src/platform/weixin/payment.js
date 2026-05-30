import { canIUse, promisifyApi, unsupportedError } from './runtime'

export function requestPayment(params = {}) {
  return promisifyApi('requestPayment', params, { preferUni: true })
}

export function canRequestMerchantTransfer() {
  return canIUse('requestMerchantTransfer')
}

export function requestMerchantTransfer(params = {}) {
  if (!canRequestMerchantTransfer()) {
    return Promise.reject(unsupportedError('requestMerchantTransfer'))
  }

  return promisifyApi('requestMerchantTransfer', params)
}

