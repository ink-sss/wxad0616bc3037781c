export function createImHelper(options = {}) {
  const TencentCloudChat = options.TencentCloudChat
  const TIMUploadPlugin = options.TIMUploadPlugin
  const logger = options.logger || console
  const state = {
    chat: options.chat || null,
    ready: !!options.ready,
    loggingIn: false,
    loginRetryCount: 0,
    loginRetryTimer: null,
    maxLoginRetry: options.maxLoginRetry || 5,
    manualLogout: false,
    waitGroupID: '',
    waitGroupCallback: null,
  }
  const retryDelays = options.retryDelays || [1000, 2000, 4000, 8000, 12000]

  function create(createOptions = {}) {
    if (state.chat) {
      return state.chat
    }

    if (!TencentCloudChat || typeof TencentCloudChat.create !== 'function') {
      throw new Error('TencentCloudChat SDK is required to create IM helper')
    }

    state.chat = TencentCloudChat.create({
      SDKAppID: createOptions.SDKAppID || options.SDKAppID,
    })

    if (TIMUploadPlugin && typeof state.chat.registerPlugin === 'function') {
      state.chat.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin })
    }

    const readyEvent = TencentCloudChat.EVENT && TencentCloudChat.EVENT.SDK_READY
    if (readyEvent && typeof state.chat.on === 'function') {
      state.chat.on(readyEvent, () => {
        state.ready = true
        state.loggingIn = false
        state.loginRetryCount = 0
        clearLoginRetryTimer()

        if (state.waitGroupID) {
          const groupID = state.waitGroupID
          const callback = state.waitGroupCallback
          state.waitGroupID = ''
          state.waitGroupCallback = null
          joinAVChatRoom(groupID)
            .then((result) => {
              if (typeof callback === 'function') {
                callback(result)
              }
            })
            .catch((error) => {
              warn('[IM] deferred AVChatRoom join failed', error)
            })
        }
      })
    }

    return state.chat
  }

  function getChat() {
    return state.chat || create()
  }

  function clearLoginRetryTimer() {
    if (state.loginRetryTimer) {
      clearTimeout(state.loginRetryTimer)
      state.loginRetryTimer = null
    }
  }

  function scheduleLoginRetry(loginOptions = {}, error = '') {
    if (state.manualLogout || state.loginRetryCount >= state.maxLoginRetry) {
      return false
    }

    clearLoginRetryTimer()
    state.loginRetryCount += 1
    const delay = retryDelays[Math.min(state.loginRetryCount - 1, retryDelays.length - 1)]

    warn('[IM] login retry scheduled', {
      retryCount: state.loginRetryCount,
      delay,
      error,
    })

    state.loginRetryTimer = setTimeout(() => {
      state.loginRetryTimer = null
      loginWithRetry(loginOptions).catch((retryError) => {
        warn('[IM] login retry failed', retryError)
      })
    }, delay)

    return true
  }

  async function login(loginOptions = {}) {
    const chat = getChat()
    state.manualLogout = false
    state.loggingIn = true

    try {
      const result = await chat.login(loginOptions)
      state.loginRetryCount = 0
      clearLoginRetryTimer()
      return result
    } finally {
      state.loggingIn = false
    }
  }

  async function loginWithRetry(loginOptions = {}) {
    try {
      return await login(loginOptions)
    } catch (error) {
      state.ready = false
      scheduleLoginRetry(loginOptions, error)
      throw error
    }
  }

  async function logout() {
    if (!state.chat || typeof state.chat.logout !== 'function') {
      return null
    }

    state.manualLogout = true
    clearLoginRetryTimer()
    state.ready = false
    return state.chat.logout()
  }

  async function destroy() {
    if (!state.chat || typeof state.chat.destroy !== 'function') {
      state.chat = null
      state.ready = false
      return null
    }

    const result = await state.chat.destroy()
    state.chat = null
    state.ready = false
    return result
  }

  function on(eventName, handler) {
    const chat = getChat()
    if (typeof chat.on === 'function') {
      chat.on(eventName, handler)
    }
  }

  function off(eventName, handler) {
    const chat = getChat()
    if (typeof chat.off === 'function') {
      chat.off(eventName, handler)
    }
  }

  async function joinAVChatRoom(groupID) {
    if (!state.ready) {
      state.waitGroupID = groupID
      return {
        deferred: true,
        groupID,
      }
    }

    const chat = getChat()
    const groupType = TencentCloudChat && TencentCloudChat.TYPES && TencentCloudChat.TYPES.GRP_AVCHATROOM
    return chat.joinGroup({
      groupID,
      type: groupType,
    })
  }

  async function joinAVChatRoomWhenReady(groupID, callback) {
    if (!state.ready) {
      state.waitGroupID = groupID
      state.waitGroupCallback = callback
      return {
        deferred: true,
        groupID,
      }
    }

    const result = await joinAVChatRoom(groupID)
    if (typeof callback === 'function') {
      callback(result)
    }
    return result
  }

  async function quitGroup(groupID) {
    const chat = getChat()
    return chat.quitGroup(groupID)
  }

  async function sendTextMessage(options = {}) {
    const chat = getChat()
    const message = chat.createTextMessage(options)
    return chat.sendMessage(message)
  }

  function warn(...args) {
    if (logger && typeof logger.warn === 'function') {
      logger.warn(...args)
    }
  }

  return {
    create,
    getChat,
    login,
    loginWithRetry,
    logout,
    destroy,
    clearLoginRetryTimer,
    scheduleLoginRetry,
    on,
    off,
    joinAVChatRoom,
    joinAVChatRoomWhenReady,
    quitGroup,
    sendTextMessage,
    warn,
    get state() {
      return state
    },
    get constants() {
      return TencentCloudChat
        ? {
            EVENT: TencentCloudChat.EVENT,
            TYPES: TencentCloudChat.TYPES,
          }
        : {}
    },
  }
}
