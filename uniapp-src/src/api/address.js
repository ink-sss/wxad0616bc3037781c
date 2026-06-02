import { h5Delete, h5Get, h5Post, h5Put } from './h5.js'

export function getAddressList() {
  return h5Get('/h5/address/list')
}

export function createAddress(data = {}) {
  return h5Post('/h5/address/create', data)
}

export function updateAddress(data = {}) {
  return h5Put('/h5/address/update', data)
}

export function deleteAddress(id) {
  return h5Delete('/h5/address/delete', { id: Number(id || 0) })
}

export function setDefaultAddress(id) {
  return h5Put('/h5/address/setDefault', { id: Number(id || 0) })
}
