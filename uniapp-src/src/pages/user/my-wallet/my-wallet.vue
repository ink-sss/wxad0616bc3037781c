<template>
  <view class="wallet-page" :data-theme="theme && theme()">
    <view class="hero">
      <view class="label">账户余额</view>
      <view class="balance">¥{{ balance || '0.00' }}</view>
      <view v-if="cash_open" class="cash-actions">
        <button @tap="gotoPage('/pages/user/cash/apply')">提现</button>
        <button @tap="gotoPage('/pages/user/cash/list')">提现记录</button>
      </view>
    </view>

    <view v-if="balance_open" class="quick">
      <view @tap="gotoPay">充值</view>
      <view @tap="gotoList('rechange')">充值记录</view>
      <view @tap="gotoList('all')">余额明细</view>
    </view>

    <view class="section-title">最近记录</view>
    <view v-for="(item, index) in dataList" :key="index" class="log">
      <view>
        <view class="scene">{{ item.scene && item.scene.text }}</view>
        <view class="time">{{ item.create_time }}</view>
      </view>
      <view :class="Number(item.money) > 0 ? 'money plus' : 'money'">{{ item.money }}</view>
    </view>
    <view v-if="!loading && dataList.length === 0" class="empty">暂无余额记录</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      dataList: [],
      balance: '',
      balance_open: 1,
      cash_open: 0,
      loading: true,
    }
  },
  onShow() {
    this.getData()
  },
  methods: {
    getData() {
      uni.showLoading({ title: '加载中...' })
      this.loading = true
      this._get(
        'balance.log/index',
        {},
        (res) => {
          this.dataList = res.data.list || []
          this.balance = res.data.balance
          this.balance_open = res.data.balance_open
          this.cash_open = res.data.cash_open
          this.loading = false
          uni.hideLoading()
        },
        false,
        () => uni.hideLoading(),
      )
    },
    gotoList(type) {
      this.gotoPage('/pages/user/my-wallet/my-balance?type=' + type)
    },
    gotoPay() {
      this.gotoPage('/pages/order/recharge')
    },
  },
}
</script>

<style scoped>
.wallet-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 40rpx; }
.hero { padding: 60rpx 36rpx 44rpx; color: #fff; background: linear-gradient(135deg, #2b2b2b, #616161); }
.label { font-size: 26rpx; opacity: .78; }
.balance { margin-top: 18rpx; font-size: 60rpx; font-weight: 700; }
.cash-actions { display: flex; gap: 20rpx; margin-top: 34rpx; }
.cash-actions button { flex: 1; height: 70rpx; line-height: 70rpx; color: #333; background: #fff; border-radius: 8rpx; font-size: 26rpx; }
.quick { display: grid; grid-template-columns: repeat(3, 1fr); margin: 24rpx; background: #fff; border-radius: 8rpx; }
.quick view { min-height: 120rpx; line-height: 120rpx; text-align: center; color: #333; font-size: 28rpx; }
.section-title { padding: 12rpx 28rpx; color: #777; font-size: 26rpx; }
.log { display: flex; justify-content: space-between; align-items: center; padding: 28rpx; margin: 0 24rpx 2rpx; background: #fff; }
.scene { color: #333; font-size: 28rpx; }
.time { margin-top: 8rpx; color: #999; font-size: 24rpx; }
.money { color: #333; font-size: 30rpx; font-weight: 600; }
.plus { color: #e64340; }
.empty { padding: 120rpx 0; text-align: center; color: #999; font-size: 28rpx; }
</style>
