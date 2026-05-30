<template>
  <button class="subscribe" size="mini" @tap="subscribe">开播提醒</button>
</template>

<script>
import { requestWithVm } from '../page-tools.js'

export default {
  props: {
    liveId: { type: [Number, String], default: '' },
  },
  methods: {
    subscribe() {
      requestWithVm(this, '_post', 'live.market/subscribe', { live_id: this.liveId })
        .then(() => uni.showToast({ title: '已预约提醒', icon: 'success' }))
        .catch(() => {
          // TODO:migration Reconnect subscription template IDs for live reminders.
          uni.showToast({ title: '暂无法预约提醒', icon: 'none' })
        })
    },
  },
}
</script>

<style scoped>
.subscribe { position: relative; z-index: 2; color: #fff; background: #ff5704; }
</style>
