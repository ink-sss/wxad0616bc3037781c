<template>
  <view v-if="visible" class="order-mask" @tap="close">
    <view class="order-panel" @tap.stop>
      <view class="tabs">
        <view v-for="tab in tabs" :key="tab.type" class="tab" :class="{ active: dataType === tab.type }" @tap="changeTab(tab.type)">{{ tab.text }}</view>
      </view>
      <scroll-view class="orders" scroll-y @scrolltolower="loadMore">
        <view v-for="item in listData" :key="item.order_id" class="order">
          <view class="order-no">订单号：{{ item.order_no || item.order_id }}</view>
          <view class="amount">￥{{ item.pay_price || item.total_price || item.order_price }}</view>
          <button v-if="item.pay_status === 10" size="mini" @tap="pay(item)">去支付</button>
          <button v-if="item.order_status === 10" size="mini" @tap="cancel(item)">取消</button>
        </view>
        <view class="load-tip">{{ noMore ? '已经到底了' : '上拉加载更多' }}</view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { requestPayment } from '../../../platform/weixin/payment.js'
import { requestWithVm } from '../page-tools.js'

export default {
  data() {
    return {
      visible: false,
      tabs: [
        { type: 'all', text: '全部' },
        { type: 'payment', text: '待付款' },
        { type: 'delivery', text: '待发货' },
        { type: 'received', text: '待收货' },
      ],
      dataType: 'all',
      listData: [],
      page: 1,
      noMore: false,
      loading: false,
    }
  },
  methods: {
    showMyList() {
      this.visible = true
      this.searchFunc()
    },
    close() {
      this.visible = false
    },
    changeTab(type) {
      this.dataType = type
      this.searchFunc()
    },
    searchFunc() {
      this.page = 1
      this.noMore = false
      this.listData = []
      this.loadMore()
    },
    loadMore() {
      if (this.loading || this.noMore) return
      this.loading = true
      requestWithVm(this, '_get', 'user.order/lists', {
        dataType: this.dataType,
        page: this.page,
        list_rows: 10,
      })
        .then((res) => {
          const rows = (((res.data || {}).list || {}).data || res.data || [])
          if (rows.length) {
            this.listData = this.listData.concat(rows)
            this.page += 1
          } else {
            this.noMore = true
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    cancel(item) {
      uni.showModal({
        title: '提示',
        content: '您确定要取消吗?',
        success: (res) => {
          if (!res.confirm) return
          requestWithVm(this, '_get', 'user.order/cancel', { order_id: item.order_id }).then(() => this.searchFunc())
        },
      })
    },
    pay(item) {
      requestWithVm(this, '_post', 'user.order/pay', { order_id: item.order_id, pay_type: 20 }).then((res) => {
        const payment = (res.data && (res.data.payment || res.data)) || {}
        requestPayment(payment).then(() => this.searchFunc())
      })
    },
  },
}
</script>

<style scoped>
.order-mask { position: fixed; inset: 0; z-index: 190; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .35); }
.order-panel { width: 100%; max-height: 78vh; padding: 24rpx; border-radius: 20rpx 20rpx 0 0; background: #fff; color: #333; box-sizing: border-box; }
.tabs { display: flex; gap: 12rpx; margin-bottom: 18rpx; }
.tab { flex: 1; padding: 14rpx 0; border-radius: 8rpx; background: #f3f3f3; text-align: center; font-size: 24rpx; }
.tab.active { color: #fff; background: #ff5704; }
.orders { height: 60vh; }
.order { padding: 20rpx 0; border-bottom: 1px solid #eee; }
.order-no { color: #666; font-size: 24rpx; }
.amount { margin: 12rpx 0; color: #ff5704; font-size: 30rpx; font-weight: 600; }
.load-tip { padding: 24rpx; color: #999; text-align: center; font-size: 24rpx; }
</style>
