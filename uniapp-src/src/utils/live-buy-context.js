const BUY_CONTEXT_KEY = 'h5_live_buy_context'

export function saveBuyContext(context = {}) {
  try {
    uni.setStorageSync(BUY_CONTEXT_KEY, {
      ...context,
      updatedAt: Date.now(),
    })
  } catch (error) {}
}

export function loadBuyContext() {
  try {
    return uni.getStorageSync(BUY_CONTEXT_KEY) || null
  } catch (error) {
    return null
  }
}

export function clearBuyContext() {
  try {
    uni.removeStorageSync(BUY_CONTEXT_KEY)
  } catch (error) {}
}
