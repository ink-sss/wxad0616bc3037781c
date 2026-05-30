<template>
  <view v-if="visible" class="coupon-claim" @tap="receive">{{ text }}</view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { couponId: { type: [Number, String], default: '' }, text: { type: String, default: '领券' } },
  data() { return { visible: true } },
  methods: {
    receive() {
      requestWithVm(this, '_post', 'user.coupon/receive', { coupon_id: this.couponId }).then(() => {
        uni.showToast({ title: '领取成功', icon: 'success' })
        this.visible = false
      })
    },
  },
}
</script>
<style scoped>.coupon-claim{position:absolute;padding:10rpx 18rpx;border-radius:28rpx;color:#fff;background:#ff5704;font-size:24rpx;}</style>
