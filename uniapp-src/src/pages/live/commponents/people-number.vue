<template>
  <view class="people-number" @tap="$emit('goShop')">
    <text>在线 {{ displayNumber }}</text>
  </view>
</template>

<script>
export default {
  props: {
    liveId: { type: [Number, String], default: '' },
    onlineNumber: { type: [Number, String], default: 0 },
  },
  emits: ['goShop', 'sendLbMsg', 'callBMethod'],
  computed: {
    displayNumber() {
      const value = Number(this.onlineNumber || 0)
      return value > 9999 ? `${(value / 10000).toFixed(1)}万` : value
    },
  },
  methods: {
    getLuckyBag() {
      // TODO:migration Reconnect lucky bag/countdown reward detail popups.
      this.$emit('callBMethod')
    },
  },
}
</script>

<style scoped>
.people-number { position: absolute; right: 20rpx; top: 120rpx; padding: 8rpx 18rpx; border-radius: 28rpx; color: #fff; background: rgba(0, 0, 0, .45); font-size: 24rpx; }
</style>
