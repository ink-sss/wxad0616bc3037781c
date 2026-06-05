import { getWeixinApi } from './runtime'

const UPDATE_MANAGER_STATE_KEY = '__UNIAPP_WEIXIN_UPDATE_MANAGER_STATE__'

const moduleState = {
  manager: null,
  bound: false,
  handlers: {
    onCheckForUpdate: null,
    onUpdateReady: null,
    onUpdateFailed: null,
  },
}

function getUpdateManagerState() {
  const host = typeof globalThis !== 'undefined' ? globalThis : null
  if (!host) {
    return moduleState
  }
  if (!host[UPDATE_MANAGER_STATE_KEY]) {
    host[UPDATE_MANAGER_STATE_KEY] = {
      manager: null,
      bound: false,
      handlers: {
        onCheckForUpdate: null,
        onUpdateReady: null,
        onUpdateFailed: null,
      },
    }
  }
  return host[UPDATE_MANAGER_STATE_KEY]
}

export function getUpdateManager() {
  const state = getUpdateManagerState()
  if (state.manager) {
    return state.manager
  }

  const api = getWeixinApi('getUpdateManager')
  if (!api || typeof api.getUpdateManager !== 'function') {
    return null
  }

  state.manager = api.getUpdateManager()
  return state.manager
}

export function bindUpdateManager(options = {}) {
  const manager = getUpdateManager()
  if (!manager) {
    return null
  }
  const state = getUpdateManagerState()

  if (typeof options.onCheckForUpdate === 'function') {
    state.handlers.onCheckForUpdate = options.onCheckForUpdate
  }
  if (typeof options.onUpdateReady === 'function') {
    state.handlers.onUpdateReady = options.onUpdateReady
  }
  if (typeof options.onUpdateFailed === 'function') {
    state.handlers.onUpdateFailed = options.onUpdateFailed
  }

  if (!state.bound) {
    if (typeof manager.onCheckForUpdate === 'function') {
      manager.onCheckForUpdate((result) => {
        state.handlers.onCheckForUpdate?.(result)
      })
    }
    if (typeof manager.onUpdateReady === 'function') {
      manager.onUpdateReady(() => {
        state.handlers.onUpdateReady?.()
      })
    }
    if (typeof manager.onUpdateFailed === 'function') {
      manager.onUpdateFailed((error) => {
        state.handlers.onUpdateFailed?.(error)
      })
    }
    state.bound = true
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
