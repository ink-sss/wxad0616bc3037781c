<template>
  <view class="wait-countdown">
    <view class="label">距离开播</view>
    <view class="time">{{ display }}</view>
  </view>
</template>

<script>
export default {
  props: {
    endTime: { type: [Number, String], default: 0 },
  },
  emits: ['countdownEnd'],
  data() {
    return {
      left: 0,
      timer: null,
    }
  },
  computed: {
    display() {
      const seconds = Math.max(0, this.left)
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
      const s = String(seconds % 60).padStart(2, '0')
      return `${h}:${m}:${s}`
    },
  },
  mounted() {
    this.start()
  },
  beforeUnmount() {
    this.destroyInterval()
  },
  methods: {
    start() {
      const target = Number(this.endTime || 0)
      this.left = target > 1000000000 ? Math.floor(target - Date.now() / 1000) : target
      this.timer = setInterval(() => {
        this.left -= 1
        if (this.left <= 0) {
          this.destroyInterval()
          this.$emit('countdownEnd')
        }
      }, 1000)
    },
    destroyInterval() {
      if (this.timer) clearInterval(this.timer)
      this.timer = null
    },
  },
}
</script>

<style scoped>
.wait-countdown { position: relative; z-index: 1; padding: 28rpx 44rpx; border-radius: 12rpx; background: rgba(0, 0, 0, .45); color: #fff; text-align: center; }
.label { font-size: 26rpx; }
.time { margin-top: 12rpx; font-size: 46rpx; font-weight: 600; }
</style>
