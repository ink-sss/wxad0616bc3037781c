<template>
  <view class="store-coupon" :data-theme="theme && theme()">
    <view class="tabs">
      <view :class="{ active: activeTab === 0 }" @tap="switchTab(0)">未使用</view>
      <view :class="{ active: activeTab === 1 }" @tap="switchTab(1)">已过期</view>
      <view :class="{ active: activeTab === 2 }" @tap="switchTab(2)">已使用</view>
    </view>
    <view v-for="item in listData" :key="item.coupon_id || item.id" class="coupon">
      <view class="left">
        <view class="type">{{ getCouponType(item) }}</view>
        <view class="name">{{ getCouponName(item) }}</view>
        <view v-if="getCouponRemark(item)" class="remark">{{ getCouponRemark(item) }}</view>
      </view>
      <view class="right">
        <text v-if="activeTab !== 1">x{{ toNumber(item.num) }}</text>
        <button v-if="activeTab === 0" @tap="handleCouponAction(item)">立即使用</button>
      </view>
      <view class="bottom">{{ getBottomTimeText(item) }}</view>
    </view>
    <view v-if="!loading && listData.length === 0" class="empty">暂无福利券</view>
    <view v-if="qrcode" class="qrcode">
      <view>{{ qrText }}</view>
      <text>{{ qrcode }}</text>
      <button @tap="qrcode = ''">关闭</button>
    </view>
  </view>
</template>

<script>
import { dateText } from '../../../../pages/user/page-tools.js'

export default {
  data() {
    return {
      activeTab: 0,
      page: 1,
      listRows: 20,
      lastPage: 1,
      hasMore: true,
      loading: false,
      loadingMore: false,
      listData: [],
      recordApi: 'live.roomStoreCoupon/storeCouponRecord',
      qrcode: '',
      qrText: '兑换码',
    }
  },
  onLoad() {
    this.getList(true)
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    switchTab(tab) {
      if (this.activeTab !== tab) {
        this.activeTab = tab
        this.getList(true)
      }
    },
    getListApi() {
      return this.activeTab === 2 ? this.recordApi : 'live.roomStoreCoupon/userList'
    },
    getListParams() {
      const params = { page: this.page, list_rows: this.listRows }
      if (this.activeTab === 0) params.data_type = 'not_use'
      if (this.activeTab === 1) params.data_type = 'is_expire'
      if (this.activeTab === 2) params.data_type = 'is_use'
      return params
    },
    getList(reset = false) {
      if (reset) {
        this.page = 1
        this.lastPage = 1
        this.hasMore = true
        this.listData = []
      }
      if (!this.hasMore && !reset) return
      const api = this.getListApi()
      this.loading = this.page === 1
      this.loadingMore = this.page !== 1
      this._post(api, this.getListParams(), (res) => {
        this.loading = false
        this.loadingMore = false
        const data = res.data || {}
        const rows = Array.isArray(data.data) ? data.data : []
        this.listData = this.page === 1 ? rows : this.listData.concat(rows)
        const current = Number(data.current_page || this.page)
        const last = Number(data.last_page || 0)
        this.lastPage = last || current
        this.hasMore = last > 0 ? current < last : rows.length >= this.listRows
        this.page += 1
      })
    },
    loadMore() {
      if (!this.loading && !this.loadingMore && this.hasMore) this.getList()
    },
    handleCouponAction() {
      this.getCouponCode()
    },
    getCouponCode() {
      this._get('user.qrCode/getRoomStoreCouponCode', { url: '/pages/branch/welfareVoucher' }, (res) => {
        if (res.code === 1) {
          this.qrcode = res.data.content
          this.qrText = '兑换码'
        }
      })
    },
    toNumber(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number : 0
    },
    getCouponName(item) {
      return item.name || item.coupon_name || item.title || '福利券'
    },
    getCouponType(item) {
      return item.coupon_type_name || item.type_name || '福利券'
    },
    getCouponRemark(item) {
      return String(item.remark || item.coupon_remark || item.description || '').trim()
    },
    getDateRange(item) {
      const start = dateText(item.start_time || item.startTime || item.begin_time)
      const end = dateText(item.expire_time || item.end_time || item.invalid_time || item.endTime)
      if (start && end) return start + ' - ' + end
      if (!start && end) return '到期：' + end
      if (start && !end) return start + ' - 长期有效'
      return '长期有效'
    },
    getBottomTimeText(item) {
      if (this.activeTab === 2) {
        const used = dateText(item.create_time)
        return used ? '使用时间：' + used : '使用时间：--'
      }
      return this.getDateRange(item)
    },
  },
}
</script>

<style scoped>
.store-coupon { min-height: 100vh; padding: 112rpx 24rpx 24rpx; background: #f5f5f5; box-sizing: border-box; }
.tabs { position: fixed; top: 0; left: 0; right: 0; z-index: 2; display: grid; grid-template-columns: repeat(3, 1fr); height: 96rpx; background: #fff; }
.tabs view { line-height: 96rpx; text-align: center; color: #777; font-size: 28rpx; }
.tabs .active { color: #19ad57; font-weight: 600; border-bottom: 4rpx solid #19ad57; }
.coupon { position: relative; display: flex; min-height: 172rpx; margin-bottom: 18rpx; padding: 24rpx; background: #fff; border-radius: 8rpx; box-sizing: border-box; }
.left { flex: 1; min-width: 0; }
.type { color: #19ad57; font-size: 24rpx; }
.name { margin-top: 10rpx; color: #222; font-size: 30rpx; font-weight: 600; }
.remark, .bottom { color: #777; font-size: 24rpx; }
.right { width: 150rpx; text-align: right; color: #333; font-size: 26rpx; }
.right button { margin-top: 20rpx; height: 56rpx; line-height: 56rpx; color: #fff; background: #19ad57; border-radius: 28rpx; font-size: 24rpx; }
.bottom { position: absolute; left: 24rpx; bottom: 18rpx; }
.empty { padding: 160rpx 0; color: #999; text-align: center; font-size: 28rpx; }
.qrcode { position: fixed; left: 80rpx; right: 80rpx; top: 35vh; padding: 36rpx; text-align: center; background: #fff; border-radius: 8rpx; box-shadow: 0 8rpx 40rpx rgba(0,0,0,.12); }
.qrcode text { display: block; margin: 24rpx 0; word-break: break-all; color: #333; font-size: 28rpx; }
</style>
