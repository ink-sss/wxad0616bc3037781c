export const dteExchangeReady = Promise.resolve(true)

export function navigateWithDTE(targetUrl) {
  if (!targetUrl) return Promise.resolve(false)
  uni.navigateTo({
    url: targetUrl,
    fail: () => uni.redirectTo({ url: targetUrl }),
  })
  return Promise.resolve(true)
}
