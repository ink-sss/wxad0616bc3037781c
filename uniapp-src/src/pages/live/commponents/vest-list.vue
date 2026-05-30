<template>
  <scroll-view class="vest-list" scroll-y>
    <view v-for="item in list" :key="item.id || item.robot_id" class="row" @tap="$emit('select', item)">
      <image class="avatar" :src="item.avatar || item.head" />
      <text>{{ item.nickname || item.name }}</text>
    </view>
  </scroll-view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  emits: ['select'],
  data() { return { list: [] } },
  mounted() { this.load() },
  methods: {
    load() {
      requestWithVm(this, '_post', 'live.RoomAssistant/getRobotList', {}).then((res) => { this.list = res.data || [] }).catch(() => {})
    },
  },
}
</script>
<style scoped>.vest-list{max-height:520rpx;background:#fff;color:#333}.row{display:flex;align-items:center;padding:18rpx;border-bottom:1px solid #eee}.avatar{width:52rpx;height:52rpx;margin-right:14rpx;border-radius:50%;background:#eee}</style>
