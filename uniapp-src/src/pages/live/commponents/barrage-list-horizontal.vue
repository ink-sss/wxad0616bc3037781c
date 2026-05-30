<template>
  <view class="horizontal-barrage">
    <barrage-list
      ref="inner"
      v-bind="$props"
      @goShop="(...args) => $emit('goShop', ...args)"
      @endLive="$emit('endLive')"
      @cartChange="$emit('cartChange')"
      @goTrtc="$emit('goTrtc')"
      @refresh="$emit('refresh')"
      @hideLuckyBag="$emit('hideLuckyBag')"
      @showLuckyBag="$emit('showLuckyBag')"
      @luckyBagResult="(...args) => $emit('luckyBagResult', ...args)"
      @authSuccess="$emit('authSuccess')"
      @showCountdownPoints="$emit('showCountdownPoints')"
      @hideCountdownPoints="$emit('hideCountdownPoints')"
      @showCountdownRedpack="$emit('showCountdownRedpack')"
      @hideCountdownRedpack="$emit('hideCountdownRedpack')"
      @setAssistant="(...args) => $emit('setAssistant', ...args)"
    />
  </view>
</template>

<script>
import BarrageList from './barrage-list.vue'

export default {
  components: { BarrageList },
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
    'swiperChange',
  ],
  methods: {
    imSendMsg(text) {
      this.$refs.inner && this.$refs.inner.imSendMsg(text)
    },
    setExplain(data) {
      this.$refs.inner && this.$refs.inner.setExplain(data)
    },
    setTopBa(data) {
      this.$refs.inner && this.$refs.inner.setTopBa(data)
    },
    offReceiveMessage() {
      this.$refs.inner && this.$refs.inner.offReceiveMessage()
    },
    offRevokeMessage() {
      this.$refs.inner && this.$refs.inner.offRevokeMessage()
    },
    addZanNum() {
      this.$refs.inner && this.$refs.inner.addZanNum()
    },
  },
}
</script>

<style scoped>
.horizontal-barrage { color: #333; }
</style>
