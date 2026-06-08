<template>
  <view class="application-status-page">
    <view v-if="!loading && supplierStatus !== 2" class="status-card">
      <view class="title">{{ supplierStatus === 1 ? '申请审核中' : '申请入驻' }}</view>
      <view class="desc">
        {{ supplierStatus === 1 ? '您的商户入驻申请正在审核中，请耐心等待。' : '您还不是商户，请提交入驻申请。' }}
      </view>
      <button v-if="supplierStatus === 0 || supplierStatus === -1" class="primary" @tap="gotoApply">去申请</button>
    </view>
    <view v-else class="empty">加载中...</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      supplierStatus: -1,
      loading: true
    }
  },
  onLoad() {
    this.getData()
  },
  methods: {
    getData() {
      if (typeof this._get !== 'function') {
        this.loading = false
        // TODO:migration: application status needs shared _get runtime.
        return
      }
      uni.showLoading({ title: '加载中...' })
      this.loading = true
      this._get('user.index/detail', {}, (res) => {
        this.loading = false
        this.supplierStatus = res.data ? res.data.supplierStatus : -1
        if (this.supplierStatus === 2) {
          const url = '/pages/user/my_shop/my_shop'
          if (typeof this.gotoPage === 'function') this.gotoPage(url, 'redirect')
          else uni.redirectTo({ url })
        } else if (this.supplierStatus === 3) {
          uni.hideLoading()
          uni.showModal({ content: '商户异常,请联系客服处理' })
        } else {
          uni.setNavigationBarTitle({ title: this.supplierStatus === 0 ? '申请入驻' : '申请审核中' })
          uni.hideLoading()
        }
      })
    },
    gotoApply() {
      const url = '/pages/agent/apply/apply'
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.application-status-page { min-height: 100vh; background: #f7f7f7; padding: 40rpx 24rpx; box-sizing: border-box; }
.status-card { padding: 44rpx 32rpx; border-radius: 16rpx; background: #fff; text-align: center; }
.title { color: #222; font-size: 36rpx; font-weight: 700; }
.desc { margin-top: 24rpx; color: #666; font-size: 28rpx; line-height: 1.7; }
.primary { width: 420rpx; height: 78rpx; margin-top: 42rpx; border-radius: 39rpx; background: #f03b2f; color: #fff; font-size: 28rpx; line-height: 78rpx; }
.empty { padding: 120rpx 0; color: #999; text-align: center; font-size: 26rpx; }
</style>
