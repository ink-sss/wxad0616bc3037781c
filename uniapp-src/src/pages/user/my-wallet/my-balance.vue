<template>
  <view class="balance-page">
    <view v-for="(item, index) in tableData" :key="index" class="log">
      <view>
        <view class="scene">{{ item.scene && item.scene.text }}</view>
        <view class="time">{{ item.create_time }}</view>
      </view>
      <view :class="Number(item.money) > 0 ? 'money plus' : 'money'">{{ item.money }}</view>
    </view>
    <view v-if="tableData.length === 0 && !loading" class="empty">暂无相关记录</view>
    <view v-else class="more">{{ loading ? '加载中...' : no_more ? '没有更多了' : '上拉加载更多' }}</view>
  </view>
</template>

<script>
import { normalizeListPage } from '../page-tools.js'

export default {
  data() {
    return {
      loading: true,
      tableData: [],
      last_page: 0,
      page: 1,
      list_rows: 20,
      no_more: false,
      type: 'all',
    }
  },
  onLoad(query = {}) {
    this.type = query.type || 'all'
    this.getData()
  },
  onReachBottom() {
    if (this.page < this.last_page) {
      this.page += 1
      this.getData()
    } else {
      this.no_more = true
    }
  },
  methods: {
    getData() {
      this.loading = true
      this._get('balance.log/lists', { page: this.page || 1, list_rows: this.list_rows, type: this.type }, (res) => {
        const page = normalizeListPage(res.data)
        this.loading = false
        this.tableData = this.tableData.concat(page.rows)
        this.last_page = page.lastPage
        if (page.lastPage <= this.page) this.no_more = true
      })
    },
  },
}
</script>

<style scoped>
.balance-page { min-height: 100vh; background: #f5f5f5; padding: 24rpx; box-sizing: border-box; }
.log { display: flex; justify-content: space-between; align-items: center; padding: 28rpx; margin-bottom: 2rpx; background: #fff; }
.scene { color: #333; font-size: 28rpx; }
.time { margin-top: 8rpx; color: #999; font-size: 24rpx; }
.money { color: #333; font-size: 30rpx; font-weight: 600; }
.plus { color: #e64340; }
.empty, .more { padding: 70rpx 0; color: #999; text-align: center; font-size: 26rpx; }
</style>
