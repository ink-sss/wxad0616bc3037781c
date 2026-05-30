<template>
  <view class="viewer-item">
    <image class="avatar" :src="itemData.avatar || itemData.head" />
    <view class="info">
      <view>{{ itemData.nickname || itemData.name || itemData.user_id }}</view>
      <view class="sub">{{ itemData.is_block ? '已拉黑' : '' }}</view>
    </view>
    <button size="mini" @tap="blockChange(1)">{{ itemData.is_block ? '解除拉黑' : '拉黑' }}</button>
  </view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { itemData: { type: Object, default: () => ({}) }, liveId: { type: [Number, String], default: '' } },
  emits: ['refresh'],
  methods: {
    blockChange(type) {
      requestWithVm(this, '_post', 'live.roomNew/lh', { live_id: this.liveId, user_id: this.itemData.user_id, type }).then(() => this.$emit('refresh'))
    },
  },
}
</script>
<style scoped>.viewer-item{display:flex;align-items:center;padding:18rpx;border-bottom:1px solid #eee;color:#333}.avatar{width:58rpx;height:58rpx;margin-right:14rpx;border-radius:50%;background:#eee}.info{flex:1}.sub{color:#999;font-size:22rpx}</style>
