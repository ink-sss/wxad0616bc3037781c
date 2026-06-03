export function setBindIdCookie(bindId = '') {
  if (!bindId) return
  try {
    uni.setStorageSync('currentBindId', bindId)
  } catch (error) {}
}
