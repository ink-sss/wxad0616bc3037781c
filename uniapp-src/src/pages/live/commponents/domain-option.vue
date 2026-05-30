<template>
  <view class="domain-option">
    <view v-if="setting.notice">{{ setting.notice }}</view>
  </view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { liveId: { type: [Number, String], default: '' } },
  data() { return { setting: {} } },
  mounted() { this.load() },
  methods: {
    load() {
      requestWithVm(this, '_post', 'live.roomNew/getChatSetting', { room_id: this.liveId }).then((res) => { this.setting = res.data || {} }).catch(() => {})
    },
  },
}
</script>
<style scoped>.domain-option{padding:16rpx;color:#fff;background:rgba(0,0,0,.45);font-size:24rpx;}</style>
