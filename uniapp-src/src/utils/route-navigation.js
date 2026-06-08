function safeDecodeRoute(value = '') {
  try {
    return decodeURIComponent(value)
  } catch (e) {
    return value
  }
}

function normalizePlainRoute(route = '') {
  const value = String(route || '').trim()
  if (!value) return ''
  return value.startsWith('/') ? value : `/${value}`
}

export function extractMiniProgramRoute(route = '') {
  const raw = String(route || '').trim()
  if (!raw) return ''
  const candidates = [raw]
  const decoded = safeDecodeRoute(raw)
  if (decoded !== raw) candidates.push(decoded)

  for (const value of candidates) {
    const hashIndex = value.indexOf('#/')
    if (hashIndex >= 0) {
      return normalizePlainRoute(value.slice(hashIndex + 1))
    }
    if (value.startsWith('/pages/') || value.startsWith('pages/')) {
      return normalizePlainRoute(value)
    }
    if (/^https?:\/\//i.test(value)) {
      const pagesIndex = value.indexOf('/pages/')
      if (pagesIndex >= 0) {
        return normalizePlainRoute(value.slice(pagesIndex))
      }
    }
  }

  return ''
}

export function normalizeAppRoute(route = '') {
  const value = String(route || '').trim()
  if (!value) return '/pagesPlus/main/prize-record/index'
  const extracted = extractMiniProgramRoute(value)
  if (extracted) return extracted
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return value
  if (value.startsWith('#/')) return value.slice(1)
  return `/${value}`
}

export function navigateWithH5Fallback(route = '') {
  const url = normalizeAppRoute(route)
  if (/^https?:\/\//i.test(url)) {
    uni.showToast({ title: '请在中奖记录查看详情', icon: 'none' })
    return
  }
  uni.navigateTo({
    url,
    fail: () => uni.redirectTo({ url }),
  })
}

export function navigateToPrizeRecord(route = '/pagesPlus/main/prize-record/index') {
  navigateWithH5Fallback(route || '/pagesPlus/main/prize-record/index')
}
