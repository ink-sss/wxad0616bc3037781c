<template>
  <view v-if="visible" class="mask" @tap="close">
    <view class="panel" @tap.stop>
      <view class="title">申请连麦</view>
      <view class="desc">申请后等待主播同意，连麦会启用麦克风权限。</view>
      <button class="primary" :loading="submitting" @tap="applyTrtc">申请连麦</button>
      <button class="ghost" :loading="submitting" @tap="applyCancel">取消申请</button>
    </view>
  </view>
</template>

<script>
import { requestWithVm } from '../page-tools.js'

export default {
  props: {
    liveId: { type: [Number, String], default: '' },
    isTrtcGo: { type: [Number, String], default: 0 },
  },
  emits: ['closeTrtc'],
  data() {
    return {
      visible: false,
      submitting: false,
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    close() {
      this.visible = false
    },
    applyTrtc() {
      if (this.submitting) return
      this.submitting = true
      requestWithVm(this, '_post', 'live.trtc/applyTrtc', { live_id: this.liveId })
        .then(() => {
          uni.showToast({ title: '申请已发送', icon: 'none' })
          this.close()
        })
        .finally(() => {
          this.submitting = false
        })
    },
    applyGo() {
      return requestWithVm(this, '_post', 'live.trtc/applyGo', { live_id: this.liveId })
    },
    applyCancel() {
      if (this.submitting) return
      this.submitting = true
      requestWithVm(this, '_post', 'live.trtc/applyCancel', { live_id: this.liveId })
        .then(() => {
          this.$emit('closeTrtc')
          this.close()
        })
        .finally(() => {
          this.submitting = false
        })
    },
  },
}
</script>

<style scoped>
.mask { position: fixed; inset: 0; z-index: 200; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .45); }
.panel { width: 100%; padding: 32rpx; border-radius: 20rpx 20rpx 0 0; background: #fff; color: #333; box-sizing: border-box; }
.title { font-size: 34rpx; font-weight: 600; }
.desc { margin: 18rpx 0 28rpx; color: #666; font-size: 26rpx; line-height: 38rpx; }
.primary { color: #fff; background: #ff5704; }
.ghost { margin-top: 16rpx; color: #666; background: #f5f5f5; }
</style>
