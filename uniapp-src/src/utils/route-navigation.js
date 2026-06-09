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

const MINI_PROGRAM_ROUTE_PREFIXES = ['/pages/', '/pagesPlus/']
const DEFAULT_PRIZE_RECORD_ROUTE = '/pagesPlus/main/prize-record/index'
const LEGACY_PRIZE_RECORD_ROUTES = new Set([
  '/pages/prize-record/index',
  '/pages/user/winRecord',
])

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
    if (MINI_PROGRAM_ROUTE_PREFIXES.some((prefix) => value.startsWith(prefix) || value.startsWith(prefix.slice(1)))) {
      return normalizePlainRoute(value)
    }
    if (/^https?:\/\//i.test(value)) {
      for (const prefix of MINI_PROGRAM_ROUTE_PREFIXES) {
        const routeIndex = value.indexOf(prefix)
        if (routeIndex >= 0) {
          return normalizePlainRoute(value.slice(routeIndex))
        }
      }
    }
  }

  return ''
}

export function normalizeAppRoute(route = '') {
  const value = String(route || '').trim()
  if (!value) return DEFAULT_PRIZE_RECORD_ROUTE
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

function normalizePrizeRecordRoute(route = DEFAULT_PRIZE_RECORD_ROUTE) {
  const normalized = normalizeAppRoute(route || DEFAULT_PRIZE_RECORD_ROUTE)
  if (!normalized || /^https?:\/\//i.test(normalized)) return DEFAULT_PRIZE_RECORD_ROUTE
  const [path, query = ''] = normalized.split('?')
  if (path === DEFAULT_PRIZE_RECORD_ROUTE) return normalized
  if (LEGACY_PRIZE_RECORD_ROUTES.has(path)) {
    return `${DEFAULT_PRIZE_RECORD_ROUTE}${query ? `?${query}` : ''}`
  }
  return DEFAULT_PRIZE_RECORD_ROUTE
}

export function navigateToPrizeRecord(route = DEFAULT_PRIZE_RECORD_ROUTE, options = {}) {
  const url = normalizePrizeRecordRoute(route)
  const uniApi = options.uniApi || uni
  uniApi.navigateTo({
    url,
    fail: () => uniApi.redirectTo({ url }),
  })
}
