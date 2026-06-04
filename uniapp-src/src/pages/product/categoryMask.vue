<template>
  <view v-if="show" class="cart-mask">
    <view class="popup-bg" @tap="closeMask"></view>
    <view class="main">
      <view class="mask-title d-b-c">
        <text class="f32 fb">购物车</text>
        <text class="f26 gray9" @tap="onDelete">清空</text>
      </view>
      <scroll-view class="scroll-Y goods-scroll" scroll-y>
        <view v-for="item in dataList" :key="item.local_cart_id || item.cart_id" class="goods-item">
          <image class="cover" mode="aspectFill" :src="item.product_image" />
          <view class="info">
            <view class="title text-ellipsis">{{ item.product_name }}</view>
            <view v-if="item.product_attr" class="attr">{{ item.product_attr }}</view>
            <view class="d-b-c">
              <view class="price">¥{{ item.product_price }}</view>
              <view class="num-wrap">
                <text class="icon-btn" @tap="reduceFunc(item)">-</text>
                <text class="num">{{ item.total_num }}</text>
                <text class="icon-btn" @tap="addFunc(item)">+</text>
              </view>
            </view>
          </view>
          <text class="icon iconfont icon-lajitong del" @tap="clickDel(item)"></text>
        </view>
      </scroll-view>
      <view class="close" @tap="closeMask">关闭</view>
    </view>
  </view>
</template>

<script>
import {
  clearLocalCartItems,
  decrementLocalCartItem,
  incrementLocalCartItem,
  removeLocalCartItems
} from '../../services/local-cart.js'

export default {
  props: {
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: false,
      is_auto: 0,
      platFormType: ''
    }
  },
  methods: {
    open() {
      const tabBar = uni.getStorageSync('TabBar')
      if (tabBar) this.is_auto = tabBar.is_auto
      this.platFormType = uni.getSystemInfoSync().uniPlatform
      if (this.dataList && this.dataList.length > 0) this.show = !this.show
    },
    closeMask() {
      this.show = false
    },
    addFunc(item) {
      incrementLocalCartItem(item)
      this.$emit('get-shopping-num')
    },
    reduceFunc(item) {
      if (item.total_num <= 1) return
      decrementLocalCartItem(item)
      this.$emit('get-shopping-num')
    },
    clickDel(item) {
      uni.showModal({
        title: '提示',
        content: '您确定要移除该商品吗?',
        success: (modal) => {
          if (modal.confirm) {
            removeLocalCartItems([item.local_cart_id || item.cart_id])
            this.$emit('get-shopping-num')
          }
        }
      })
    },
    getCheckedIds() {
      const ids = []
      if (this.dataList) {
        this.dataList.forEach((item) => {
          ids.push(item.local_cart_id || item.cart_id)
        })
      }
      return ids
    },
    onDelete() {
      const ids = this.getCheckedIds()
      if (!ids.length) {
        this.showError('您还没有选择商品')
        return false
      }
      uni.showModal({
        title: '提示',
        content: '您确定要清空购物车吗?',
        success: (modal) => {
          if (modal.confirm) {
            clearLocalCartItems()
            this.$emit('get-shopping-num')
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.cart-mask { position: fixed; inset: 0; z-index: 80; }
.popup-bg { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.main { position: absolute; left: 0; right: 0; bottom: 0; max-height: 70vh; border-radius: 28rpx 28rpx 0 0; background: #fff; overflow: hidden; }
.mask-title { height: 88rpx; padding: 0 30rpx; border-bottom: 1rpx solid #f1f1f1; }
.goods-scroll { max-height: 52vh; }
.goods-item { display: flex; align-items: center; gap: 20rpx; padding: 24rpx 30rpx; border-bottom: 1rpx solid #f4f4f4; }
.cover { width: 112rpx; height: 112rpx; border-radius: 16rpx; background: #f5f5f5; }
.info { flex: 1; min-width: 0; }
.title { font-size: 26rpx; color: #333; }
.attr { margin: 10rpx 0; font-size: 22rpx; color: #999; }
.price { color: #e2231a; font-size: 28rpx; font-weight: 700; }
.num-wrap { display: flex; align-items: center; gap: 16rpx; }
.icon-btn { width: 42rpx; height: 42rpx; border-radius: 50%; background: #f4f4f4; line-height: 42rpx; text-align: center; }
.del { color: #999; font-size: 30rpx; }
.close { height: 88rpx; line-height: 88rpx; text-align: center; color: #666; }
</style>
