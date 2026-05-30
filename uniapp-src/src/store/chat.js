import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    chat: {},
    liveInfo: {}
  }),
  actions: {
    setChatSetting(value) {
      this.chat = value
    },
    setLiveInfo(value) {
      this.liveInfo = value
    }
  }
})

export default useChatStore
