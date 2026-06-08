import { getH5ApiBaseUrl } from '@/api/h5.js'

export function ensureCurrentProtocol(url = '') {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function parseAbsoluteUrl(rawUrl = '', options = {}) {
  let value = String(rawUrl || '').trim()
  if (!value) return null

  const defaultProtocol = String(options.defaultProtocol || 'https').replace(/:$/, '')
  if (value.startsWith('//')) {
    value = `${defaultProtocol}:${value}`
  } else if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    if (options.assumeDomain === false || value.startsWith('/')) return null
    value = `${defaultProtocol}://${value}`
  }

  const match = value.match(/^([a-z][a-z\d+.-]*):\/\/([^/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/i)
  if (!match) return null

  const protocol = match[1].toLowerCase()
  const host = match[2]
  const pathname = match[3] || '/'
  const search = match[4] || ''
  const hash = match[5] || ''

  return {
    protocol,
    host,
    pathname,
    search,
    hash,
    origin: `${protocol}://${host}`,
    href: `${protocol}://${host}${pathname}${search}${hash}`,
  }
}

export function getUrlOrigin(rawUrl = '') {
  const parsed = parseAbsoluteUrl(rawUrl)
  return parsed ? parsed.origin : ''
}

export function removeUrlQueryParam(rawUrl = '', paramName = '') {
  const value = String(rawUrl || '').trim()
  const blockedName = String(paramName || '').toLowerCase()
  if (!value || !blockedName) return value

  const withoutHash = value.split('#')[0]
  const queryIndex = withoutHash.indexOf('?')
  if (queryIndex < 0) return withoutHash

  const path = withoutHash.slice(0, queryIndex)
  const query = withoutHash.slice(queryIndex + 1)
  const nextQuery = query
    .split('&')
    .filter((part) => {
      if (!part) return false
      const key = part.split('=')[0].toLowerCase()
      return key !== blockedName
    })
    .join('&')

  return `${path}${nextQuery ? `?${nextQuery}` : ''}`
}

export function normalizeDomainProtocol(domain = '') {
  return ensureCurrentProtocol(domain)
}

export function isLocalDevelopmentHost(hostname = '') {
  const host = String(hostname || '').toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

export function resolveLandingDomainsForHost(landingDomains = []) {
  return Array.isArray(landingDomains) ? landingDomains : []
}

export function getBasePath() {
  return '/'
}

export function buildRedirectUrl(targetDomain = '', hashPath = '', options = {}) {
  const domain = ensureCurrentProtocol(targetDomain).replace(/\/+$/, '')
  const pathname = options.pathname || getBasePath()
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  const normalizedHash = hashPath.startsWith('#') ? hashPath : `#${hashPath}`
  return `${domain}${normalizedPath}${normalizedHash}`
}

export function buildLoginUrl(authDomain = '', params = {}) {
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  return buildRedirectUrl(authDomain, `#/pagesPlus/main/login/login${query ? `?${query}` : ''}`)
}

export function getHashPath(fallback = '/pages/broadcast/entry') {
  return fallback
}

export function getApiBaseUrl() {
  return getH5ApiBaseUrl()
}

export function resetApiBaseCache() {}
