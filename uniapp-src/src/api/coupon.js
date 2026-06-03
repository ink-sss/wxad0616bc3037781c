import { h5Post } from './h5.js'

export function getUsableCoupons(data = {}) {
  return h5Post('/h5/coupon/usableList', data)
}
