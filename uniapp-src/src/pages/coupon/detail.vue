<template>
  <view class="coupon-detail-page">
    <view v-if="!loading">
      <view class="coupon-hero">
        <view class="supplier">{{ detail.supplier ? detail.supplier.name : '平台通用' }}</view>
        <view class="name">{{ detail.name }}</view>
        <view class="value">{{ valueText(detail) }}</view>
        <view class="limit">{{ detail.min_price > 0 ? '满' + Number(detail.min_price) + '元可用' : '无门槛' }}</view>
        <view class="time">{{ expireText(detail) }}</view>
        <button v-if="detail.is_get === 0" class="receive" @tap="receiveCoupon">立即领取</button>
        <button v-else class="receive disabled" @tap="receiveCoupon">{{ detail.state && detail.state.text ? detail.state.text : '已领取' }}</button>
      </view>

      <view v-if="apply_range != 10" class="product-section">
        <view class="section-title">适用商品</view>
        <view v-for="item in listData" :key="item.product_id" class="product-item" @tap="gotoProduct(item.product_id)">
          <image class="product-image" mode="aspectFill" :src="item.product_image || defaultProductImage" />
          <view class="product-info">
            <view class="product-name">{{ item.product_name }}</view>
            <view class="sales">累计成交：{{ item.product_sales || 0 }}笔</view>
            <view class="price">¥{{ item.product_price }}</view>
          </view>
        </view>
        <view v-if="listData.length === 0" class="empty">暂无适用商品</view>
        <uni-load-more v-else :status="loadStatus" />
      </view>
    </view>
    <view v-else class="empty">加载中...</view>
  </view>
</template>

<script>
import UniLoadMore from '../../components/uni-load-more.vue'

export default {
  components: {
    UniLoadMore
  },
  data() {
    return {
      loading: true,
      coupon_id: 0,
      apply_range: 10,
      listData: [],
      last_page: 0,
      page: 1,
      no_more: false,
      detail: {
        state: { value: 0, text: '' },
        coupon_type: {},
        color: {}
      }
    }
  },
  computed: {
    loadStatus() {
      return this.loading ? 'loading' : this.no_more ? 'noMore' : 'more'
    },
    defaultProductImage() {
      return (this.config && this.config.pic_url ? this.config.pic_url : '') + '/static/live/default_logo.jpeg'
    }
  },
  onLoad(query = {}) {
    this.coupon_id = query.coupon_id || 0
    this.apply_range = query.apply_range || 10
  },
  onShow() {
    this.page = 1
    this.listData = []
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
        this.loading = false
        // TODO:migration: coupon detail needs shared _get runtime.
        return
      }
      this.loading = true
      uni.showLoading({ title: '加载中' })
      this._get('coupon.coupon/detail', { coupon_id: this.coupon_id }, (res) => {
        const data = res.data || {}
        this.detail = data.model || this.detail
        if (this.apply_range == 20) {
          this.listData = this.detail.product || []
          this.no_more = true
        } else if (this.apply_range == 30 && data.product_list) {
          this.listData = this.listData.concat(data.product_list.data || [])
          this.last_page = data.product_list.last_page || 0
          this.no_more = this.last_page <= 1
        }
        this.loading = false
        uni.hideLoading()
      })
    },
    receiveCoupon() {
      if (this.detail.is_get === 1 || typeof this._post !== 'function') return
      this._post('user.coupon/receive', { coupon_id: this.detail.coupon_id }, () => {
        uni.showToast({ title: '领取成功', icon: 'success', mask: true, duration: 2000 })
        this.detail.is_get = 1
        this.detail.state = { ...(this.detail.state || {}), text: '已领取' }
      }, () => {
        uni.navigateBack()
      })
    },
    gotoProduct(productId) {
      const url = '/pages/product/detail/detail?product_id=' + productId
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.coupon-detail-page { min-height: 100vh; background: #f7f7f7; }
.coupon-hero { margin: 24rpx; padding: 36rpx 28rpx; border-radius: 18rpx; background: linear-gradient(135deg,#f03b2f,#ff7d45); color: #fff; text-align: center; }
.supplier { font-size: 24rpx; opacity: .9; }
.name { margin-top: 12rpx; font-size: 34rpx; font-weight: 700; }
.value { margin-top: 20rpx; font-size: 58rpx; font-weight: 800; }
.limit, .time { margin-top: 10rpx; font-size: 24rpx; }
.receive { width: 360rpx; height: 72rpx; margin-top: 28rpx; border-radius: 36rpx; background: #fff; color: #f03b2f; font-size: 28rpx; line-height: 72rpx; }
.receive.disabled { color: #999; }
.product-section { padding: 0 24rpx 32rpx; }
.section-title { padding: 20rpx 0; color: #222; font-size: 30rpx; font-weight: 700; }
.product-item { display: flex; gap: 20rpx; margin-bottom: 18rpx; padding: 20rpx; border-radius: 12rpx; background: #fff; }
.product-image { width: 170rpx; height: 170rpx; border-radius: 8rpx; background: #eee; }
.product-info { flex: 1; min-width: 0; }
.product-name { color: #222; font-size: 28rpx; line-height: 1.4; }
.sales { margin-top: 14rpx; color: #999; font-size: 24rpx; }
.price { margin-top: 16rpx; color: #f03b2f; font-size: 32rpx; font-weight: 700; }
.empty { padding: 100rpx 0; color: #999; text-align: center; font-size: 26rpx; }
</style>
