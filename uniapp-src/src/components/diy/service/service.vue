<template>
  <view class="diy-service drag optional drag__nomove" :style="serviceStyle">
    <view v-if="params.type === 'phone'" class="service-icon" @tap="callPhone">
      <image lazy-load mode="aspectFill" :src="params.image"></image>
    </view>
    <button v-if="params.type === 'wx'" class="service-icon" open-type="contact" session-from="wxapp" show-message-card>
      <image lazy-load mode="aspectFill" :src="params.image"></image>
    </button>
    <button v-if="params.type === 'chat' && itemData.data" class="service-icon" @tap="gotoService">
      <image lazy-load mode="aspectFill" :src="params.image"></image>
    </button>
  </view>
</template>
<script>
export default {
  name: 'DiyService',
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    params() { return this.itemData.params || {} },
    styleConfig() { return this.itemData.style || {} },
    serviceStyle() {
      const s = this.styleConfig
      return `right:${s.right || 0}%;bottom:${s.bottom || 0}%;opacity:${Number(s.opacity || 100) / 100};`
    }
  },
  methods: {
    callPhone() { if (this.params.phone_num) uni.makePhoneCall({ phoneNumber: this.params.phone_num }) },
    gotoService() {
      if (typeof this.getUserId === 'function' && this.getUserId()) this.gotoPage(`/pagesPlus/chat/chat?chat_user_id=${this.itemData.data}&nickName=平台客服`)
      else if (typeof this.doLogin === 'function') this.doLogin()
    }
  }
}
</script>
<style scoped>
.diy-service { bottom: 0; position: fixed; right: 0; z-index: 90; }
.diy-service,.diy-service .service-icon { height: 120rpx; width: 120rpx; }
.diy-service button.service-icon { background: none; border: 0; line-height: 1; padding: 0; }
.diy-service .service-icon image { height: 100%; width: 100%; }
</style>
