<template>
  <view v-if="visible" class="cashier">
    <view class="panel">
      <view class="title">选择支付方式</view>
      <radio-group @change="payType = Number($event.detail.value)">
        <label class="row"><radio value="20" :checked="payType === 20" />微信支付</label>
        <label class="row"><radio value="10" :checked="payType === 10" />余额支付</label>
      </radio-group>
      <button class="primary" @tap="$emit('confirm', payType)">确认支付</button>
    </view>
  </view>
</template>

<script>
export default {
  emits: ['confirm'],
  data() {
    return {
      visible: false,
      payType: 20,
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    close() {
      this.visible = false
    },
  },
}
</script>

<style scoped>
.cashier { position: fixed; inset: 0; z-index: 230; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .4); }
.panel { width: 100%; padding: 32rpx; border-radius: 20rpx 20rpx 0 0; background: #fff; color: #333; box-sizing: border-box; }
.title { margin-bottom: 20rpx; font-size: 32rpx; font-weight: 600; }
.row { display: block; padding: 20rpx 0; border-bottom: 1px solid #eee; }
.primary { margin-top: 28rpx; color: #fff; background: #ff5704; }
</style>
