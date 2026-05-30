<template>
  <view v-if="visible" class="task-card">
    <view class="title">签到任务</view>
    <view v-for="item in list" :key="item.id" class="task-row">
      <text>{{ item.name || item.title || '签到奖励' }}</text>
      <button size="mini" @tap="doCheck(item)">领取</button>
    </view>
  </view>
</template>

<script>
import { requestWithVm } from '../page-tools.js'

export default {
  props: {
    liveId: { type: [Number, String], default: '' },
  },
  emits: ['callBMethod'],
  data() {
    return {
      visible: false,
      list: [],
    }
  },
  methods: {
    open() {
      this.visible = true
      this.load()
    },
    load() {
      requestWithVm(this, '_post', 'live.roomNew/getCheckInListnew', { room_id: this.liveId })
        .then((res) => {
          this.list = res.data || []
        })
        .catch(() => {})
    },
    doCheck(item) {
      requestWithVm(this, '_post', 'live.roomNew/doSignincheckNew', {
        room_id: this.liveId,
        task_id: item.id,
      }).then(() => {
        this.$emit('callBMethod')
        this.load()
      })
    },
  },
}
</script>

<style scoped>
.task-card { position: fixed; left: 24rpx; right: 24rpx; bottom: 160rpx; z-index: 160; padding: 24rpx; border-radius: 12rpx; background: #fff; color: #333; }
.title { margin-bottom: 18rpx; font-weight: 600; }
.task-row { display: flex; align-items: center; justify-content: space-between; padding: 14rpx 0; border-top: 1px solid #eee; font-size: 26rpx; }
</style>
