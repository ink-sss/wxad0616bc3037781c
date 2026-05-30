<template>
  <view class="cash-list">
    <view v-for="item in tableData" :key="item.id" class="item">
      <view>
        <view class="time">{{ item.create_time }}</view>
        <view class="status" :class="{ green: item.apply_status && item.apply_status.text === '审核通过' }">
          {{ item.apply_status && item.apply_status.text }}
        </view>
      </view>
      <view class="right">
        <view class="money">¥{{ item.money }}</view>
        <button v-if="item.apply_status && item.apply_status.value === 50" class="receipt" @tap="receiptWx(item)">确认收款</button>
      </view>
    </view>
    <view v-if="tableData.length === 0 && !loading" class="empty">暂无提现记录</view>
    <view v-else class="more">{{ loading ? '加载中...' : no_more ? '没有更多了' : '上拉加载更多' }}</view>
  </view>
</template>

<script>
import { normalizeListPage, requestTransfer } from '../page-tools.js'

export default {
  data() {
    return {
      tableData: [],
      no_more: false,
      loading: true,
      last_page: 0,
      page: 1,
      list_rows: 20,
      configData: { appid: '', mchid: '' },
    }
  },
  mounted() {
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
    receiptWx(item) {
      requestTransfer({
        mchId: this.configData.mchid,
        appId: this.configData.appid,
        package: item.package_info,
      })
        .then(() => {
          this._post('user.cash/receipt', { id: item.id }, () => {
            this.tableData = []
            this.page = 1
            this.getData()
          })
        })
        .catch(() => {
          uni.showModal({ content: '微信转账收款失败，请稍后重试。', showCancel: false })
        })
    },
    getData() {
      this.loading = true
      this._get(
        'user.cash/lists',
        { status: -1, page: this.page || 1, list_rows: this.list_rows, source: this.getPlatform() },
        (res) => {
          this.loading = false
          this.configData = res.data.config || {}
          const page = normalizeListPage(res.data)
          this.tableData = this.tableData.concat(page.rows)
          this.last_page = page.lastPage
          if (page.lastPage <= this.page) this.no_more = true
        },
      )
    },
  },
}
</script>

<style scoped>
.cash-list { min-height: 100vh; padding: 24rpx; background: #f5f5f5; box-sizing: border-box; }
.item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18rpx; padding: 28rpx; background: #fff; border-radius: 8rpx; }
.time { color: #333; font-size: 28rpx; }
.status { margin-top: 10rpx; color: #999; font-size: 24rpx; }
.green { color: #19ad57; }
.right { text-align: right; }
.money { color: #e64340; font-size: 32rpx; font-weight: 600; }
.receipt { margin-top: 12rpx; height: 54rpx; line-height: 54rpx; color: #fff; background: #19ad57; border-radius: 8rpx; font-size: 24rpx; }
.empty, .more { padding: 70rpx 0; color: #999; text-align: center; font-size: 26rpx; }
</style>
