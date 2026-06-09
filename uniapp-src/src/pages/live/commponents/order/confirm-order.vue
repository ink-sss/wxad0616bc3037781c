<template>
  <view v-if="visible" class="confirm-mask">
    <view class="confirm-panel">
      <view class="head">
        <view class="title">确认订单</view>
        <text class="close" @tap="closePopup">×</text>
      </view>
      <scroll-view class="body" scroll-y>
        <view v-for="item in products" :key="item.product_id || item.order_product_id" class="product">
          <image class="product-img" :src="item.product_image || item.image" />
          <view class="product-info">
            <view class="product-name">{{ item.product_name || item.name }}</view>
            <view class="product-spec">{{ item.product_attr || item.spec || '' }}</view>
            <view class="price">￥{{ item.product_price || item.price }} × {{ item.total_num || item.product_num || 1 }}</view>
          </view>
        </view>
        <textarea v-model="remark" class="remark" placeholder="订单备注" />
      </scroll-view>
      <view class="footer">
        <view class="total">合计：￥{{ totalPrice }}</view>
        <button class="submit" :loading="submitting" @tap="submitOrder">提交订单</button>
      </view>
    </view>
  </view>
</template>

<script>
import { requestPayment } from '../../../../platform/weixin/payment.js'
import { requestWithVm } from '../../page-tools.js'

export default {
  props: {
    product_id_n: { type: [String, Number], default: 0 },
    product_num_n: { type: [String, Number], default: 1 },
    product_sku_id_n: { type: [String, Number], default: '0' },
    liveId: { type: [Number, String], default: 0 },
  },
  data() {
    return {
      visible: false,
      options: { order_type: 'buy' },
      confirm: {},
      products: [],
      remark: '',
      pay_type: 20,
      submitting: false,
      currentOrderId: 0,
    }
  },
  computed: {
    totalPrice() {
      return this.confirm.order_pay_price || this.confirm.pay_price || this.confirm.total_price || '0.00'
    },
  },
  mounted() {
    this.product_id = this.product_id_n
    this.product_num = this.product_num_n
    this.product_sku_id = this.product_sku_id_n
  },
  methods: {
    showShowList(options = {}) {
      this.visible = true
      this.options = { ...this.options, ...options }
      this.getData()
    },
    closePopup() {
      this.visible = false
    },
    getData() {
      const orderType = this.options.order_type || 'buy'
      const endpointMap = {
        buy: 'order.order/buy',
        cart: 'order.order/cart',
        seckill: 'plus.seckill.order/buy',
        bargain: 'plus.bargain.order/buy',
        assemble: 'plus.assemble.order/buy',
        points: 'plus.points.order/buy',
        advance: 'plus.advance.Order/buy',
        frontBuy: 'plus.advance.Order/frontBuy',
      }
      requestWithVm(this, '_get', endpointMap[orderType] || 'order.order/buy', {
        product_id: this.product_id,
        product_num: this.product_num,
        product_sku_id: this.product_sku_id,
        live_id: this.liveId,
        ...this.options,
      }).then((res) => {
        this.confirm = res.data || {}
        this.products = this.confirm.product_list || this.confirm.ProductData || this.confirm.products || []
      })
    },
    submitOrder() {
      if (this.submitting) return
      this.submitting = true
      requestWithVm(this, '_post', 'user.order/pay', {
        order_id: this.currentOrderId,
        pay_type: this.pay_type,
        remark: this.remark,
        live_id: this.liveId,
      })
        .then((res) => {
          const payment = (res.data && (res.data.payment || res.data)) || {}
          return requestPayment(payment)
        })
        .then(() => {
          uni.showToast({ title: '支付成功', icon: 'none' })
          this.closePopup()
        })
        .finally(() => {
          this.submitting = false
        })
    },
    refreshData() {
      this.getData()
    },
  },
}
</script>

<style scoped>
.confirm-mask { position: fixed; inset: 0; z-index: 210; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .4); }
.confirm-panel { width: 100%; max-height: 86vh; border-radius: 20rpx 20rpx 0 0; background: #fff; color: #333; overflow: hidden; }
.head, .footer { display: flex; align-items: center; justify-content: space-between; padding: 24rpx; border-bottom: 1px solid #eee; }
.footer { border-bottom: 0; border-top: 1px solid #eee; }
.title { font-size: 32rpx; font-weight: 600; }
.close { font-size: 44rpx; color: #999; }
.body { max-height: 58vh; padding: 0 24rpx; box-sizing: border-box; }
.product { display: flex; padding: 20rpx 0; border-bottom: 1px solid #eee; }
.product-img { width: 140rpx; height: 140rpx; border-radius: 8rpx; background: #f2f2f2; }
.product-info { flex: 1; min-width: 0; margin-left: 18rpx; }
.product-name { font-size: 28rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-spec { margin-top: 8rpx; color: #888; font-size: 24rpx; }
.price { margin-top: 16rpx; color: #ff5704; }
.remark { width: 100%; height: 140rpx; margin: 20rpx 0; padding: 18rpx; border: 1px solid #eee; border-radius: 8rpx; box-sizing: border-box; font-size: 26rpx; }
.total { color: #ff5704; font-weight: 600; }
.submit { min-width: 220rpx; color: #fff; background: #ff5704; }
</style>
