<template>
  <view v-if="visible" class="address-edit">
    <view class="panel">
      <view class="title">新增地址</view>
      <input v-model="form.name" class="input" placeholder="收货人" />
      <input v-model="form.phone" class="input" placeholder="手机号" />
      <input v-model="form.detail" class="input" placeholder="详细地址" />
      <button class="primary" @tap="submit">保存</button>
    </view>
  </view>
</template>

<script>
import { requestWithVm } from '../../../page-tools.js'

export default {
  emits: ['close'],
  data() {
    return {
      visible: false,
      form: { name: '', phone: '', detail: '' },
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    closePopup() {
      this.visible = false
      this.$emit('close', 'add', true)
    },
    submit() {
      requestWithVm(this, '_post', 'user.address/add', this.form).then(() => this.closePopup())
    },
  },
}
</script>

<style scoped>
.address-edit { position: fixed; inset: 0; z-index: 250; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .4); }
.panel { width: 100%; padding: 28rpx; border-radius: 20rpx 20rpx 0 0; background: #fff; color: #333; box-sizing: border-box; }
.title { margin-bottom: 18rpx; font-size: 32rpx; font-weight: 600; }
.input { height: 76rpx; margin-top: 16rpx; padding: 0 18rpx; border: 1px solid #ddd; border-radius: 8rpx; font-size: 26rpx; }
.primary { margin-top: 26rpx; color: #fff; background: #ff5704; }
</style>
