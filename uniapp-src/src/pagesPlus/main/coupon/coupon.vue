<template>
  <view class="coupon-page">
    <view v-if="!loadding">
      <view v-if="DataList.length" class="coupon-list">
        <view v-for="item in DataList" :key="item.coupon_id" class="coupon-card">
          <view class="coupon-main">
            <view class="coupon-name">{{ item.name }}</view>
            <view class="coupon-time">{{ expireText(item) }}</view>
            <view class="coupon-rule" @tap="lookRule(item)">使用规则</view>
          </view>
          <view class="coupon-value">
            <view class="price">{{ valueText(item) }}</view>
            <view class="limit">{{ item.min_price > 0 ? '满' + Number(item.min_price) + '元可用' : '无门槛' }}</view>
            <button v-if="item.state && item.state.value > 0" class="receive-btn" @tap="receive(item.coupon_id)">领取</button>
            <button v-else class="receive-btn disabled">{{ item.state ? item.state.text : '不可领取' }}</button>
          </view>
          <view v-if="item.rule" class="rule-panel">
            <view class="rule-title">使用规则</view>
            <view class="rule-content">{{ item.rule_text || item.describe || item.rule || '暂无规则说明' }}</view>
            <button class="rule-close" @tap="closeRule(item)">关闭</button>
          </view>
          <view class="range-link" @tap="gotoDetail(item)">查看适用范围</view>
        </view>
      </view>
      <view v-else class="empty">暂无优惠券</view>
    </view>
    <view v-else class="empty">加载中...</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loadding: true,
      DataList: [],
      page: 1,
      list_rows: 10
    }
  },
  onShow() {
    this.getData()
  },
  methods: {
    expireText(item) {
      if (item.expire_type === 10) return `领取后${item.expire_day}天内有效`
      if (item.expire_type === 20) return `${item.start_time && item.start_time.text} 至 ${item.end_time && item.end_time.text}`
      return '长期有效'
    },
    valueText(item) {
      if (item.coupon_type && item.coupon_type.value === 20) return `${item.discount}折`
      return `¥${Number(item.reduce_price || 0)}`
    },
    getData() {
      if (typeof this._get !== 'function') {
        this.loadding = false
        // TODO:migration: coupon list needs shared _get runtime.
        return
      }
      uni.showLoading({ title: '加载中' })
      this._get('coupon.coupon/lists', {
        page: this.page,
        list_rows: this.list_rows
      }, (res) => {
        this.DataList = (res.data && res.data.list) || []
        this.loadding = false
        uni.hideLoading()
      })
    },
    lookRule(item) {
      item.rule = true
    },
    closeRule(item) {
      item.rule = false
    },
    receive(couponId) {
      if (typeof this._post !== 'function') return
      uni.showLoading({ title: '领取中' })
      this._post('user.coupon/receive', { coupon_id: couponId }, () => {
        uni.hideLoading()
        this.getData()
        uni.showToast({ title: '领取成功', duration: 2000, icon: 'success' })
      }, () => {
        this.getData()
      })
    },
    gotoDetail(item) {
      const url = `/pagesPlus/main/coupon/detail?coupon_id=${item.coupon_id}&apply_range=${item.apply_range || ''}`
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.coupon-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.coupon-card { position: relative; display: flex; margin-bottom: 20rpx; overflow: hidden; border-radius: 14rpx; background: #fff; box-shadow: 0 4rpx 16rpx rgba(0,0,0,.04); }
.coupon-main { flex: 1; padding: 28rpx; min-width: 0; }
.coupon-name { font-size: 30rpx; font-weight: 700; color: #222; }
.coupon-time { margin-top: 14rpx; color: #777; font-size: 24rpx; }
.coupon-rule { margin-top: 20rpx; color: #f03b2f; font-size: 24rpx; }
.coupon-value { width: 230rpx; padding: 24rpx 18rpx; background: #f03b2f; color: #fff; text-align: center; box-sizing: border-box; }
.price { font-size: 42rpx; font-weight: 700; }
.limit { margin: 10rpx 0 18rpx; font-size: 22rpx; }
.receive-btn { height: 56rpx; border-radius: 28rpx; background: #fff; color: #f03b2f; font-size: 24rpx; line-height: 56rpx; }
.receive-btn.disabled { color: #999; }
.rule-panel { position: absolute; inset: 0; z-index: 5; padding: 28rpx; background: rgba(255,255,255,.97); box-sizing: border-box; }
.rule-title { font-size: 28rpx; font-weight: 700; color: #222; }
.rule-content { margin-top: 16rpx; color: #666; font-size: 24rpx; line-height: 1.6; }
.rule-close { position: absolute; right: 24rpx; bottom: 24rpx; width: 140rpx; height: 52rpx; line-height: 52rpx; font-size: 24rpx; }
.range-link { position: absolute; left: 28rpx; bottom: 18rpx; color: #999; font-size: 22rpx; }
.empty { padding: 120rpx 0; text-align: center; color: #999; font-size: 26rpx; }
</style>
