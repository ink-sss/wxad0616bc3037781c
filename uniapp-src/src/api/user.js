import { h5Get, h5Post, h5Put } from './h5.js'

export function getProfile() {
  return h5Get('/h5/user/profile')
}

export function updateProfile(data = {}) {
  return h5Put('/h5/user/updateProfile', data)
}

export function getCenter() {
  return h5Get('/h5/user/center')
}

export function bindPhone(data = {}) {
  return h5Post('/h5/user/bindPhone', data)
}
