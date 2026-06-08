import { useUserStore } from '@/stores/user'

export function clearWechatAuthCache() {
  try {
    uni.removeStorageSync('wx_auth_pending')
    uni.removeStorageSync('wx_oauth_redirect')
    uni.removeStorageSync('wx_upgraded_userinfo')
  } catch (error) {}
}

export async function logoutAndRedirect(redirectUrl = '', targetTenantId = 0) {
  const userStore = useUserStore()
  userStore.clearAuth()
  clearWechatAuthCache()
  const queryParts = []
  if (redirectUrl) queryParts.push(`redirect=${encodeURIComponent(redirectUrl)}`)
  if (targetTenantId) queryParts.push(`tenantId=${encodeURIComponent(targetTenantId)}`)
  const url = `/pagesPlus/main/login/login${queryParts.length ? `?${queryParts.join('&')}` : ''}`
  uni.reLaunch({ url })
}
