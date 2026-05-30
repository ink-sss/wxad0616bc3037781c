<template>
  <view class="bottom-option">
    <input
      class="comment-input"
      v-model="text"
      :disabled="disabled"
      confirm-type="send"
      placeholder="说点什么..."
      @confirm="send"
    />
    <button class="icon-btn" size="mini" @tap="$emit('clearScreen')">清屏</button>
    <button class="icon-btn" size="mini" @tap="$emit('goShop')">商品</button>
    <button v-if="Number(isTrtcGo) === 1" class="icon-btn" size="mini" @tap="openTrtcApply">连麦</button>
    <trtc-apply ref="trtcApply" :live-id="liveId" :is-trtc-go="isTrtcGo" @closeTrtc="$emit('closeTrtc')" />
  </view>
</template>

<script>
import TrtcApply from './trtc-apply.vue'

export default {
  components: { TrtcApply },
  props: {
    liveId: { type: [Number, String], default: '' },
    isTrtcGo: { type: [Number, String], default: 0 },
    disabled: { type: Boolean, default: false },
  },
  emits: ['sendBarrage', 'clearScreen', 'closeTrtc', 'goShop'],
  data() {
    return {
      text: '',
    }
  },
  methods: {
    send() {
      const content = this.text.trim()
      if (!content) return
      this.$emit('sendBarrage', content)
      this.text = ''
    },
    openTrtcApply() {
      this.$refs.trtcApply && this.$refs.trtcApply.open()
    },
  },
}
</script>

<style scoped>
.bottom-option { display: flex; align-items: center; gap: 12rpx; padding: 18rpx 20rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(0, 0, 0, .55); box-sizing: border-box; }
.comment-input { flex: 1; height: 68rpx; padding: 0 24rpx; border-radius: 34rpx; background: #fff; color: #333; font-size: 26rpx; }
.icon-btn { min-width: 92rpx; height: 64rpx; line-height: 64rpx; padding: 0 12rpx; border-radius: 8rpx; color: #fff; background: #ff5704; font-size: 24rpx; }
</style>
