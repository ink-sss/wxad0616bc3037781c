import { getWeixinApi } from './runtime'

export function getUpdateManager() {
  const api = getWeixinApi('getUpdateManager')
  if (!api || typeof api.getUpdateManager !== 'function') {
    return null
  }

  return api.getUpdateManager()
}

export function bindUpdateManager(options = {}) {
  const manager = getUpdateManager()
  if (!manager) {
    return null
  }

  if (typeof options.onCheckForUpdate === 'function') {
    manager.onCheckForUpdate(options.onCheckForUpdate)
  }
  if (typeof options.onUpdateReady === 'function') {
    manager.onUpdateReady(options.onUpdateReady)
  }
  if (typeof options.onUpdateFailed === 'function') {
    manager.onUpdateFailed(options.onUpdateFailed)
  }

  return manager
}

export function applyUpdate(manager = getUpdateManager()) {
  if (manager && typeof manager.applyUpdate === 'function') {
    manager.applyUpdate()
    return true
  }

  return false
}

