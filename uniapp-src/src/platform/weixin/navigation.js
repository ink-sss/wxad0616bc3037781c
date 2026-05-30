import { canIUse, promisifyApi } from './runtime'

export function navigateToMiniProgram(options = {}) {
  return promisifyApi('navigateToMiniProgram', options)
}

export function navigateToMiniProgramLink(link, options = {}) {
  const normalized = normalizeMiniProgramLink(link)
  if (!normalized) {
    return Promise.reject(new Error('Invalid mini program link'))
  }

  return navigateToMiniProgram({
    ...options,
    ...normalized.navigateOptions,
  })
}

export function navigateBackMiniProgram(options = {}) {
  return promisifyApi('navigateBackMiniProgram', options)
}

export function canOpenCustomerServiceChat() {
  return canIUse('openCustomerServiceChat')
}

export function openCustomerServiceChat(options = {}) {
  return promisifyApi('openCustomerServiceChat', options)
}

export function makePhoneCall(phoneNumber, options = {}) {
  return promisifyApi('makePhoneCall', {
    ...options,
    phoneNumber,
  }, { preferUni: true })
}

export function customerServiceButtonProps(options = {}) {
  return {
    openType: 'contact',
    sendMessageTitle: options.sendMessageTitle || '',
    sendMessagePath: options.sendMessagePath || '',
    sendMessageImg: options.sendMessageImg || '',
    showMessageCard: !!options.showMessageCard,
  }
}

export function officialAccountComponentProps(options = {}) {
  return {
    canUse: canIUse('official-account'),
    ...options,
  }
}

export function webViewProps(src, options = {}) {
  return {
    src,
    progressbarColor: options.progressbarColor,
    fullscreen: options.fullscreen,
  }
}

export function normalizeMiniProgramLink(value = '') {
  if (!value || typeof value !== 'string') {
    return null
  }

  if (!value.startsWith('#小程序')) {
    return null
  }

  const parts = value.split('://')
  const appId = parts[1] || ''

  return {
    appId,
    path: '',
    shortLink: value,
    raw: value,
    navigateOptions: appId
      ? {
          appId,
        }
      : {
          shortLink: value,
        },
  }
}
