<template>
  <view class="barrage-list">
    <scroll-view class="message-list" scroll-y :scroll-top="scrollTop">
      <view v-for="item in messages" :key="item.sequence || item.id" class="message">
        <image v-if="item.head && !isHiddenAvatar" class="avatar" :src="item.head" />
        <view class="bubble">
          <text class="name">{{ isHiddenName ? '匿名用户' : item.name }}</text>
          <image v-if="item.msgType === 'img'" class="message-img" :src="item.text" mode="widthFix" />
          <text v-else class="text">{{ item.text }}</text>
        </view>
      </view>
    </scroll-view>
    <view v-if="explainData && explainData.product_name" class="explain" @tap="$emit('goShop', explainData.product_id, explainData.spec_sku_id)">
      正在讲解：{{ explainData.product_name }}
    </view>
  </view>
</template>

<script>
let messageSeed = 0

export default {
  props: {
    isAnonymous: { type: [Number, String], default: 0 },
    isAvatarAnonymous: { type: [Number, String], default: 0 },
    isCreatingOrder: { type: [Number, String], default: null },
    isHotSale: { type: [Number, String], default: null },
    salesOne: { type: [Number, String], default: 0 },
    isSubmitOrderSuccess: { type: [Number, String], default: 1 },
    isGrade: { type: [Number, String], default: 0 },
    liveNotice: { type: String, default: '' },
  },
  emits: [
    'goShop',
    'endLive',
    'cartChange',
    'goTrtc',
    'refresh',
    'hideLuckyBag',
    'showLuckyBag',
    'luckyBagResult',
    'authSuccess',
    'showCountdownPoints',
    'hideCountdownPoints',
    'showCountdownRedpack',
    'hideCountdownRedpack',
    'setAssistant',
  ],
  data() {
    return {
      messages: [],
      explainData: null,
      topBa: null,
      scrollTop: 0,
      imChat: null,
      messageReceivedEvent: '',
      revokeEvent: 'onMessageRevoked',
    }
  },
  computed: {
    isHiddenName() {
      return Number(this.isAnonymous) === 1
    },
    isHiddenAvatar() {
      return Number(this.isAvatarAnonymous) === 1
    },
  },
  mounted() {
    this.bindIm()
  },
  beforeUnmount() {
    this.offReceiveMessage()
    this.offRevokeMessage()
  },
  methods: {
    bindIm() {
      const app = getApp()
      const globalData = (app && app.globalData) || {}
      this.imChat = globalData.imChat
      this.messageReceivedEvent = globalData.imMessageReceived || (globalData.TIM && globalData.TIM.EVENT && globalData.TIM.EVENT.MESSAGE_RECEIVED) || ''
      if (this.imChat && this.messageReceivedEvent && typeof this.imChat.on === 'function') {
        this.imChat.on(this.messageReceivedEvent, this.onMessageReceived)
      }
      if (this.imChat && typeof this.imChat.on === 'function') {
        this.imChat.on(this.revokeEvent, this.onMessageRevoked)
      }
    },
    offReceiveMessage() {
      if (this.imChat && this.messageReceivedEvent && typeof this.imChat.off === 'function') {
        this.imChat.off(this.messageReceivedEvent, this.onMessageReceived)
      }
    },
    offRevokeMessage() {
      if (this.imChat && typeof this.imChat.off === 'function') {
        this.imChat.off(this.revokeEvent, this.onMessageRevoked)
      }
    },
    onMessageReceived(event = {}) {
      const data = Array.isArray(event.data) ? event.data : []
      data.forEach((message) => this.consumeMessage(message))
      this.trimMessages()
    },
    onMessageRevoked(event = {}) {
      const revoked = Array.isArray(event.data) ? event.data : []
      const sequences = revoked.map((item) => item.sequence)
      this.messages = this.messages.filter((item) => !sequences.includes(item.sequence))
    },
    consumeMessage(message = {}) {
      const globalData = (getApp() && getApp().globalData) || {}
      if (message.type === globalData.msgGrpSysNotice || message.type === 'TIMGroupTipElem') {
        this.consumeSystemNotice(message.payload && message.payload.userDefinedField)
        return
      }
      if (message.type === globalData.msgText || message.type === 'TIMTextElem') {
        if (message.from === 'administrator' && message.conversationType === 'C2C' && message.payload && message.payload.text === 'go-trtc---------------') {
          this.$emit('goTrtc')
          return
        }
        this.pushMessage({
          head: message.avatar,
          name: message.nick || message.from || '用户',
          text: message.payload && message.payload.text,
          msgType: 'text',
          sequence: message.sequence,
        })
      }
      if (message.type === globalData.msgImage || message.type === 'TIMImageElem') {
        const imageInfo = message.payload && message.payload.imageInfoArray && message.payload.imageInfoArray[0]
        this.pushMessage({
          head: message.avatar,
          name: message.nick || message.from || '用户',
          text: imageInfo && imageInfo.url,
          msgType: 'img',
          sequence: message.sequence,
        })
      }
    },
    consumeSystemNotice(field = '') {
      if (!field) return
      if (field.includes('@ExplainEdit---')) {
        const raw = field.replace('@ExplainEdit---', '')
        this.explainData = raw ? JSON.parse(raw) : null
      } else if (field.includes('@ForbiddenBlock---')) {
        const [, value] = field.replace('@ForbiddenBlock---', '').split('-')
        if (Number(value) === 1) uni.reLaunch({ url: '/pages/live/block' })
      } else if (field.includes('@ForbiddenIp---')) {
        uni.reLaunch({ url: '/pages/live/block' })
      } else if (field.includes('@EndLive---')) {
        this.$emit('endLive')
      } else if (field.includes('@go-trtc')) {
        this.$emit('goTrtc')
      }
    },
    pushMessage(message) {
      if (!message.text) return
      this.messages.push({
        id: ++messageSeed,
        ...message,
      })
      this.scrollTop += 200
    },
    trimMessages() {
      if (this.messages.length > 30) {
        this.messages.splice(0, this.messages.length - 30)
      }
    },
    imSendMsg(text) {
      if (!text) return
      const app = getApp()
      const globalData = (app && app.globalData) || {}
      if (this.imChat && typeof this.imChat.createTextMessage === 'function' && typeof this.imChat.sendMessage === 'function') {
        const message = this.imChat.createTextMessage({
          to: String(this.$root && this.$root.liveId ? this.$root.liveId : ''),
          conversationType: globalData.TIM && globalData.TIM.TYPES && globalData.TIM.TYPES.CONV_GROUP,
          payload: { text },
        })
        this.imChat.sendMessage(message).catch((error) => console.warn('[live] IM send failed', error))
      }
      this.pushMessage({ name: '我', text, msgType: 'text' })
    },
    setExplain(data) {
      this.explainData = data || null
    },
    setTopBa(data) {
      this.topBa = data || null
    },
    addZanNum() {
      this.pushMessage({ name: '系统', text: '点赞 +1', msgType: 'text' })
    },
  },
}
</script>

<style scoped>
.barrage-list { color: #fff; }
.message-list { max-height: 520rpx; }
.message { display: flex; align-items: flex-start; margin-top: 14rpx; }
.avatar { width: 44rpx; height: 44rpx; margin-right: 12rpx; border-radius: 50%; background: #ddd; }
.bubble { max-width: 560rpx; padding: 10rpx 16rpx; border-radius: 8rpx; background: rgba(0, 0, 0, .42); font-size: 24rpx; line-height: 34rpx; }
.name { margin-right: 8rpx; color: #ffd76a; }
.message-img { width: 160rpx; border-radius: 8rpx; }
.explain { display: inline-block; margin-top: 16rpx; padding: 10rpx 18rpx; border-radius: 28rpx; background: #ff5704; color: #fff; font-size: 24rpx; }
</style>
