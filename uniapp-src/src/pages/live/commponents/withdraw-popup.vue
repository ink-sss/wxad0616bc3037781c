<template>
  <view v-if="visible" class="withdraw-mask" @tap="close">
    <view class="panel" @tap.stop>
      <view class="title">提现</view>
      <view class="balance">可提现：￥{{ balance }}</view>
      <input v-model="money" class="input" type="digit" placeholder="提现金额" />
      <radio-group class="methods" @change="payType = Number($event.detail.value)">
        <label class="row"><radio value="10" :checked="payType === 10" />微信</label>
        <label class="row"><radio value="20" :checked="payType === 20" />支付宝</label>
        <label class="row"><radio value="30" :checked="payType === 30" />银行卡</label>
        <label class="row"><radio value="40" :checked="payType === 40" />余额</label>
      </radio-group>
      <button class="primary" :loading="submitting" @tap="submit">提交</button>
    </view>
  </view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  data() {
    return { visible: false, balance: '0.00', money: '', payType: 10, submitting: false }
  },
  methods: {
    open() { this.visible = true; this.load() },
    close() { this.visible = false },
    load() {
      requestWithVm(this, '_get', 'user.cash/index', {}).then((res) => {
        this.balance = (res.data && (res.data.balance || res.data.money)) || this.balance
      }).catch(() => {})
    },
    submit() {
      if (!this.money || this.submitting) return
      this.submitting = true
      requestWithVm(this, '_post', 'user.cash/submit', { money: this.money, pay_type: this.payType })
        .then(() => {
          uni.showToast({ title: '提交成功', icon: 'success' })
          this.close()
        })
        .finally(() => { this.submitting = false })
    },
  },
}
</script>
<style scoped>.withdraw-mask{position:fixed;inset:0;z-index:230;display:flex;align-items:flex-end;background:rgba(0,0,0,.4)}.panel{width:100%;padding:28rpx;border-radius:20rpx 20rpx 0 0;background:#fff;color:#333;box-sizing:border-box}.title{font-size:32rpx;font-weight:600}.balance{margin:16rpx 0;color:#ff5704}.input{height:76rpx;padding:0 18rpx;border:1px solid #ddd;border-radius:8rpx}.methods{margin:18rpx 0}.row{display:block;padding:12rpx 0}.primary{color:#fff;background:#ff5704}</style>
