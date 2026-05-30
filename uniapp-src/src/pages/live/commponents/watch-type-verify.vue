<template>
  <view v-if="visible" class="verify-mask">
    <view class="verify-panel">
      <view class="title">{{ currentMode === 'mobile' ? '手机号验证' : '观看密码' }}</view>
      <input v-model="value" class="input" :password="currentMode !== 'mobile'" :placeholder="currentMode === 'mobile' ? '请输入手机号' : '请输入观看密码'" />
      <button class="primary" :loading="submitting" @tap="submit">确认</button>
    </view>
  </view>
</template>

<script>
import { requestWithVm } from '../page-tools.js'

export default {
  props: {
    liveId: { type: [Number, String], default: '' },
    mode: { type: String, default: 'password' },
  },
  emits: ['ok'],
  data() {
    return {
      visible: false,
      value: '',
      submitting: false,
      currentMode: this.mode,
    }
  },
  methods: {
    open(mode = this.mode) {
      this.currentMode = mode
      this.visible = true
    },
    close() {
      this.visible = false
    },
    submit() {
      if (!this.value || this.submitting) return
      this.submitting = true
      const endpoint = this.currentMode === 'mobile' ? 'live.index/verifyWatchMobile' : 'live.index/verifyWatchPwd'
      requestWithVm(this, '_post', endpoint, {
        live_id: this.liveId,
        value: this.value,
        mobile: this.value,
        password: this.value,
      })
        .then(() => {
          this.close()
          this.$emit('ok')
        })
        .finally(() => {
          this.submitting = false
        })
    },
  },
}
</script>

<style scoped>
.verify-mask { position: fixed; inset: 0; z-index: 220; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, .5); }
.verify-panel { width: 620rpx; padding: 32rpx; border-radius: 12rpx; background: #fff; color: #333; box-sizing: border-box; }
.title { margin-bottom: 24rpx; font-size: 32rpx; font-weight: 600; text-align: center; }
.input { height: 76rpx; padding: 0 20rpx; border: 1px solid #ddd; border-radius: 8rpx; font-size: 28rpx; }
.primary { margin-top: 28rpx; color: #fff; background: #ff5704; }
</style>
