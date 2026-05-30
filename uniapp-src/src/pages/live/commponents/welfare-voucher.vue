<template>
  <view class="voucher" @tap="receive">{{ title }}</view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { liveId: { type: [Number, String], default: '' }, couponId: { type: [Number, String], default: '' }, title: { type: String, default: '领取福利券' } },
  emits: ['received'],
  methods: {
    receive() {
      requestWithVm(this, '_post', 'live.roomStoreCoupon/receive', { room_id: this.liveId, coupon_id: this.couponId }).then((res) => {
        uni.showToast({ title: '领取成功', icon: 'success' })
        this.$emit('received', res.data)
      })
    },
  },
}
</script>
<style scoped>.voucher{display:inline-block;padding:10rpx 18rpx;border-radius:28rpx;color:#fff;background:#ff5704;font-size:24rpx}</style>
