<template>
  <view v-if="visible" class="store-mask">
    <view class="panel">
      <view class="title">选择自提门店</view>
      <scroll-view class="list" scroll-y>
        <view v-for="item in list" :key="item.store_id" class="row" @tap="select(item)">
          <view>{{ item.store_name || item.name }}</view>
          <view class="sub">{{ item.address }}</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { requestWithVm } from '../../../page-tools.js'

export default {
  emits: ['select'],
  data() {
    return {
      visible: false,
      list: [],
    }
  },
  methods: {
    open() {
      this.visible = true
      requestWithVm(this, '_get', 'store.store/lists', {}).then((res) => {
        this.list = ((res.data || {}).list || res.data || [])
      })
    },
    select(item) {
      this.$emit('select', item)
      this.visible = false
    },
  },
}
</script>

<style scoped>
.store-mask { position: fixed; inset: 0; z-index: 240; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .4); }
.panel { width: 100%; max-height: 70vh; padding: 28rpx; border-radius: 20rpx 20rpx 0 0; background: #fff; color: #333; box-sizing: border-box; }
.title { margin-bottom: 18rpx; font-size: 32rpx; font-weight: 600; }
.list { max-height: 58vh; }
.row { padding: 18rpx 0; border-bottom: 1px solid #eee; }
.sub { margin-top: 8rpx; color: #777; font-size: 24rpx; }
</style>
