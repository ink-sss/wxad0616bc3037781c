import { submitSign } from '@/api/live.js'

export function submitLiveSign(roomId, formData = {}, context = {}) {
  return submitSign(roomId, formData, context)
}
