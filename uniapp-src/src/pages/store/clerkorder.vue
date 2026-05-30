<template>
  <view class="clerk-order-page">
    <view class="status">{{ detail.state_text || '订单核销' }}</view>

    <view v-if="detail.delivery_type && detail.delivery_type.value === 20" class="section">
      <view class="section-title">自提门店</view>
      <view>{{ extractStore.store_name }}</view>
      <view>{{ extractStore.phone }}</view>
      <view>{{ storeAddress }}</view>
    </view>

    <view class="section">
      <view class="section-title">商品信息</view>
      <view v-for="item in detail.product" :key="item.order_product_id || item.product_id" class="product-row">
        <image class="product-image" mode="aspectFill" :src="item.image && item.image.file_path" />
        <view class="product-info">
          <view class="product-name">{{ item.product_name }}</view>
          <view class="product-price">¥{{ item.product_price }} x {{ item.total_num }}</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="row"><text>订单号</text><text>{{ detail.order_no }}</text></view>
      <view class="row"><text>下单时间</text><text>{{ detail.create_time }}</text></view>
      <view class="row"><text>支付方式</text><text>{{ detail.pay_type && detail.pay_type.text }}</text></view>
      <view class="row"><text>配送方式</text><text>{{ detail.delivery_type && detail.delivery_type.text }}</text></view>
      <view class="row"><text>订单金额</text><text>¥{{ detail.order_price }}</text></view>
      <view class="row"><text>运费</text><text>¥{{ detail.express_price }}</text></view>
    </view>

    <button v-if="canExtract" class="extract-btn" type="primary" @tap="onSubmitExtract(detail.order_id)">确认核销</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      order_no: 0,
      detail: {
        order_status: {},
        address: { region: [] },
        product: [],
        pay_type: {},
        delivery_type: {},
        pay_status: {},
        delivery_status: {}
      },
      extractStore: {},
      eventChannel: null
    }
  },
  computed: {
    storeAddress() {
      const region = this.extractStore.region || {}
      return `${region.province || ''}${region.city || ''}${region.region || ''}${this.extractStore.address || ''}`
    },
    canExtract() {
      return this.detail.order_status && this.detail.order_status.value !== 20 &&
        this.detail.pay_status && this.detail.pay_status.value === 20 &&
        this.detail.delivery_type && this.detail.delivery_type.value === 20 &&
        this.detail.delivery_status && this.detail.delivery_status.value === 10
    }
  },
  onLoad(query = {}) {
    this.order_no = query.order_no || 0
  },
  mounted() {
    this.getData()
    if (typeof this.getOpenerEventChannel === 'function') {
      this.eventChannel = this.getOpenerEventChannel()
    }
  },
  methods: {
    getData() {
      if (typeof this._StorePost !== 'function') {
        // TODO:migration: store clerk order needs _StorePost runtime.
        return
      }
      uni.showLoading({ title: '加载中' })
      this._StorePost('store.order/detail', { order_no: this.order_no }, (res) => {
        this.detail = (res.data && res.data.order) || this.detail
        this.extractStore = this.detail.extractStore || {}
        uni.hideLoading()
      })
    },
    onSubmitExtract(orderId) {
      if (typeof this._StorePost !== 'function') return
      uni.showModal({
        title: '提示',
        content: '您确定要核销吗?',
        success: (modal) => {
          if (!modal.confirm) return
          this._StorePost('store.order/extract', { order_id: orderId }, (res) => {
            uni.showToast({ title: res.msg || '核销成功', duration: 2000, icon: 'success' })
            if (this.eventChannel && this.eventChannel.emit) this.eventChannel.emit('extractSuccess')
            setTimeout(() => this.getData(), 2000)
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.clerk-order-page { min-height: 100vh; background: #f7f7f7; padding: 24rpx; box-sizing: border-box; }
.status { padding: 34rpx 24rpx; margin-bottom: 20rpx; border-radius: 12rpx; background: #fff; color: #f03b2f; font-size: 34rpx; font-weight: 700; text-align: center; }
.section { padding: 24rpx; margin-bottom: 20rpx; border-radius: 12rpx; background: #fff; color: #555; font-size: 26rpx; line-height: 1.7; }
.section-title { margin-bottom: 18rpx; color: #222; font-size: 30rpx; font-weight: 700; }
.product-row { display: flex; gap: 18rpx; padding: 16rpx 0; border-bottom: 1rpx solid #f2f2f2; }
.product-image { width: 140rpx; height: 140rpx; border-radius: 8rpx; background: #eee; }
.product-info { flex: 1; min-width: 0; }
.product-name { color: #222; font-size: 28rpx; line-height: 1.4; }
.product-price { margin-top: 18rpx; color: #f03b2f; font-size: 26rpx; }
.row { display: flex; justify-content: space-between; gap: 20rpx; padding: 8rpx 0; }
.extract-btn { position: fixed; left: 32rpx; right: 32rpx; bottom: 40rpx; height: 88rpx; border-radius: 44rpx; background: #f03b2f; line-height: 88rpx; }
</style>
