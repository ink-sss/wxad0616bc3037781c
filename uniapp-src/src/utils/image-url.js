import { normalizeH5AssetUrl } from '@/api/h5.js'

export function toSizedImageUrl(url = '') {
  return normalizeH5AssetUrl(url)
}
