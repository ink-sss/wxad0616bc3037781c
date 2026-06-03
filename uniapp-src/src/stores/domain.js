import { defineStore } from 'pinia'
import { getDomainConfig } from '@/api/domain'
import { normalizeDomainProtocol, resolveLandingDomainsForHost } from '@/utils/url-helpers'

const DOMAIN_CONFIG_KEY = 'domainConfig'
const DOMAIN_CONFIG_CACHEDAT_KEY = 'domainConfig_cachedAt'
const DOMAIN_CONFIG_TTL_MS = 10 * 60 * 1000

function readFreshDomainCache(tid) {
  try {
    const cached = uni.getStorageSync(DOMAIN_CONFIG_KEY)
    if (!cached || !cached.payAuthDomain) return null
    if (tid && Number(cached.tenantId) !== Number(tid)) return null
    const cachedAt = Number(uni.getStorageSync(DOMAIN_CONFIG_CACHEDAT_KEY) || 0)
    if (!cachedAt || Date.now() - cachedAt > DOMAIN_CONFIG_TTL_MS) return null
    return cached
  } catch (error) {
    return null
  }
}

export const useDomainStore = defineStore('domain', {
  state: () => ({
    tenantId: 0,
    tenantCode: '',
    payAuthDomain: '',
    appId: '',
    subscribeTemplateId: '',
    h5Domain: '',
    shareDomains: [],
    landingDomains: [],
    assetsCdnDomain: '',
    loaded: false,
  }),
  actions: {
    _hydrateFromCache(cached, tid) {
      this.tenantId = tid || Number(cached.tenantId || 0)
      this.tenantCode = cached.tenantCode || ''
      this.payAuthDomain = cached.payAuthDomain || ''
      this.appId = cached.appId || ''
      this.subscribeTemplateId = cached.subscribeTemplateId || ''
      this.h5Domain = cached.h5Domain || ''
      this.shareDomains = Array.isArray(cached.shareDomains) && cached.shareDomains.length
        ? cached.shareDomains
        : (cached.h5Domain ? [cached.h5Domain] : [])
      this.landingDomains = resolveLandingDomainsForHost(cached.landingDomains || [])
      this.assetsCdnDomain = cached.assetsCdnDomain || ''
      this.loaded = true
    },
    _applyDomainConfig(data = {}, tid) {
      this.tenantId = tid || Number(data.tenantId || 0)
      this.tenantCode = data.tenantCode || ''
      this.payAuthDomain = data.payAuthDomain || data.pay_auth_domain || ''
      this.appId = data.appId || data.app_id || ''
      this.subscribeTemplateId = data.subscribeTemplateId || data.subscribe_template_id || ''
      this.h5Domain = data.h5Domain || data.h5_domain || data.shareDomain || ''
      this.shareDomains = Array.isArray(data.shareDomains) ? data.shareDomains : (this.h5Domain ? [this.h5Domain] : [])
      this.landingDomains = resolveLandingDomainsForHost(data.landingDomains || data.landing_domains || [])
      this.assetsCdnDomain = data.assetsCdnDomain || data.assets_cdn_domain || ''
      this.loaded = true
    },
    _saveDomainConfigCache(tid) {
      try {
        uni.setStorageSync(DOMAIN_CONFIG_KEY, {
          tenantId: tid || this.tenantId,
          tenantCode: this.tenantCode,
          payAuthDomain: this.payAuthDomain,
          appId: this.appId,
          subscribeTemplateId: this.subscribeTemplateId,
          h5Domain: this.h5Domain,
          shareDomains: this.shareDomains,
          landingDomains: this.landingDomains,
          assetsCdnDomain: this.assetsCdnDomain,
        })
        uni.setStorageSync(DOMAIN_CONFIG_CACHEDAT_KEY, Date.now())
      } catch (error) {}
    },
    async load(tid) {
      const tenantId = Number(tid || 0)
      if (!tenantId) return
      const fresh = readFreshDomainCache(tenantId)
      if (fresh) {
        this._hydrateFromCache(fresh, tenantId)
        return
      }
      if (this.loaded && this.tenantId === tenantId && this.payAuthDomain) return
      const data = await getDomainConfig(tenantId)
      this._applyDomainConfig(data, tenantId)
      this._saveDomainConfigCache(tenantId)
    },
    isOnPayAuthDomain() {
      return false
    },
    getPayAuthDomainUrl() {
      return normalizeDomainProtocol(this.payAuthDomain)
    },
  },
})
