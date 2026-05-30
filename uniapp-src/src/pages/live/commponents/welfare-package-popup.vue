<template>
  <view v-if="visible" class="welfare-mask" @tap="close">
    <view class="panel" @tap.stop>
      <view class="title">福利礼包</view>
      <view v-for="item in list" :key="item.id || item.coupon_id" class="row">
        <text>{{ item.name || item.coupon_name || '福利券' }}</text>
        <button size="mini" @tap="receive(item)">领取</button>
      </view>
    </view>
  </view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { liveId: { type: [Number, String], default: '' } },
  data() { return { visible: false, list: [] } },
  methods: {
    open() { this.visible = true; this.load() },
    close() { this.visible = false },
    load() {
      requestWithVm(this, '_post', 'live.roomStoreCoupon/userList', { room_id: this.liveId }).then((res) => { this.list = res.data || [] }).catch(() => {})
    },
    receive(item) {
      requestWithVm(this, '_post', 'live.roomStoreCoupon/receive', { id: item.id, coupon_id: item.coupon_id, room_id: this.liveId }).then(() => {
        uni.showToast({ title: '领取成功', icon: 'success' })
        this.load()
      })
    },
  },
}
</script>
<style scoped>.welfare-mask{position:fixed;inset:0;z-index:230;display:flex;align-items:flex-end;background:rgba(0,0,0,.4)}.panel{width:100%;max-height:70vh;padding:28rpx;border-radius:20rpx 20rpx 0 0;background:#fff;color:#333;box-sizing:border-box}.title{font-size:32rpx;font-weight:600}.row{display:flex;align-items:center;justify-content:space-between;padding:18rpx 0;border-bottom:1px solid #eee;font-size:26rpx}</style>
