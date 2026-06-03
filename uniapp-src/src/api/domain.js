import { h5Get } from './h5.js'

export function getDomainConfig(tenantId) {
  return h5Get('/h5/domain/config', { tenantId: Number(tenantId || 0) })
}

export function getRandomLandingDomain(tenantId) {
  return h5Get('/h5/domain/random-landing', { tenantId: Number(tenantId || 0) })
}
