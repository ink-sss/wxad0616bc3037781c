<template>
  <view v-if="Visible" :class="['usable-coupon', Visible ? 'open' : 'close']">
    <view class="popup-bg" @tap="closePopup"></view>
    <view class="main" @tap.stop>
      <view class="pop-title">
        <view class="f36 fb">优惠</view>
        <view class="pop-close" @tap="closePopup"><text class="icon iconfont icon-guanbi"></text></view>
      </view>

      <view class="p-0-20">
        <view v-if="discount.product_reduce.length > 0">
          <view class="f22 gray3 line-h-50 p-20-0">
            <text class="text-box">满减</text>
            <text v-for="(item, index) in discount.product_reduce" :key="index">
              <text v-if="item.full_type === 1" class="ml20">满{{ item.full_value }}元</text>
              <text v-if="item.full_type === 2" class="ml20">满{{ item.full_value }}件</text>
              <text v-if="item.reduce_type === 1">减{{ item.reduce_value }}元</text>
              <text v-if="item.reduce_type === 2">{{ (100 - item.reduce_value) / 10 }}折</text>
            </text>
          </view>
        </view>
        <view v-if="discount.give_points > 0" class="p-20-0 line-h-50 f22 gray3">
          <text class="text-box">返{{ points_name() }}</text>商城购物返{{ points_name() }}，订单完成后最高返{{ discount.give_points }}{{ points_name() }}
        </view>
      </view>

      <scroll-view class="scroll-Y scroll-coupon" scroll-y :style="{ height: scrollviewHigh + 'px' }">
        <view class="scroll-coupon-tit">可领取优惠券</view>
        <view v-for="(item, index) in datalist" :key="item.coupon_id || index" class="item-wrap">
          <view :class="item.is_get ? 'coupon-item coupon-item-gray' : 'coupon-item coupon-item-' + item.color.text">
            <view class="operation d-b-c">
              <view class="flex-1 coupon-content">
                <view class="mb20"><text class="f40 fb">{{ item.name }}</text></view>
                <view class="f22 gray9 mb20">
                  <block v-if="item.expire_type === 10">有效期：领取{{ item.expire_day }}天内有效</block>
                  <block v-if="item.expire_type === 20">有效期：{{ item.start_time.text }}至{{ item.end_time.text }}</block>
                </view>
                <view v-if="item.coupon_type.value === 20" class="f22">
                  {{ item.max_price > 0 ? '最多抵扣' + Number(item.max_price) + '元' : '无最高抵扣限制' }}
                </view>
              </view>
              <view class="right-box d-c-c d-c">
                <view v-if="item.coupon_type.value === 10" class="theme-price mb10">
                  <text class="f24">￥</text><text class="f52 fb">{{ Number(item.reduce_price) }}</text>
                </view>
                <view v-if="item.coupon_type.value === 20" class="mb10 theme-price">
                  <text class="f52 fb">{{ item.discount }}</text><text class="f24">折</text>
                </view>
                <view class="f24 mb10">{{ item.min_price > 0 ? '满' + Number(item.min_price) + '元可用' : '无门槛' }}</view>
                <view v-if="!item.is_receive" class="f26 coupon-btn theme-btn" @tap="selectCoupon(item, index)">立即领取</view>
                <view v-else class="f26 coupon-btn btn-gray white"><text>已领取</text></view>
              </view>
            </view>
          </view>
          <view v-if="item.apply_range === 20" class="range_item d-b-c" @tap="gotoPage('/pagesPlus/main/coupon/detail?coupon_id=' + item.coupon_id + '&apply_range=' + item.apply_range)">
            <view class="gray9 f24">限指定部分商品<text class="icon iconfont icon-you"></text></view>
            <view class="gray9 f24">本券不支持转赠</view>
          </view>
          <view v-else-if="item.apply_range === 30" class="range_item d-b-c" @tap="gotoPage('/pagesPlus/main/coupon/detail?coupon_id=' + item.coupon_id + '&apply_range=' + item.apply_range)">
            <view class="gray9 f24">限指定分类商品<text class="icon iconfont icon-you"></text></view>
            <view class="gray9 f24">本券不支持转赠</view>
          </view>
          <view v-else class="range_item d-b-c">
            <view class="gray9 f24">全场通用<text class="icon iconfont icon-you"></text></view>
            <view class="gray9 f24">本券不支持转赠</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    isCoupon: Boolean,
    couponList: {
      type: [Array, Object],
      default: () => []
    },
    discount: {
      type: Object,
      default: () => ({ product_reduce: [], give_points: 0, product_coupon: [] })
    }
  },
  data() {
    return {
      phoneHeight: 0,
      scrollviewHigh: 0,
      Visible: false,
      datalist: {},
      ratio: 1
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    isCoupon(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.Visible = newValue
        this.datalist = this.couponList
        this.getHeight()
      }
    }
  },
  methods: {
    init() {
      uni.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight
          this.ratio = res.windowWidth / 750
          this.getHeight()
        }
      })
    },
    getHeight() {
      const count = Object.keys(this.couponList).length
      if (count > 2) this.scrollviewHigh = 0.5 * this.phoneHeight
      else if (count === 1) this.scrollviewHigh = 250 * this.ratio + 60
      else if (count === 2) this.scrollviewHigh = 460 * this.ratio + 60
    },
    selectCoupon(item, index) {
      uni.showLoading({ title: '领取中' })
      this._post('user.coupon/receive', {
        coupon_id: item.coupon_id
      }, () => {
        uni.hideLoading()
        uni.showToast({ title: '领取成功', duration: 2000, icon: 'success' })
        this.datalist[index].is_receive = true
      })
    },
    closePopup() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.usable-coupon { position: fixed; inset: 0; z-index: 85; pointer-events: none; opacity: 0; transition: opacity .2s; }
.usable-coupon.open { pointer-events: auto; opacity: 1; }
.popup-bg { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.main { position: absolute; left: 0; right: 0; bottom: 0; max-height: 78vh; border-radius: 28rpx 28rpx 0 0; background: #fff; overflow: hidden; }
.pop-title { display: flex; align-items: center; justify-content: center; height: 104rpx; position: relative; border-bottom: 1rpx solid #f4f4f4; }
.pop-close { position: absolute; right: 30rpx; top: 30rpx; color: #999; }
.text-box { display: inline-block; margin-right: 12rpx; padding: 2rpx 10rpx; border-radius: 4rpx; background: #fff2ed; color: #ff5704; }
.scroll-coupon { padding: 0 20rpx; box-sizing: border-box; }
.scroll-coupon-tit { padding: 20rpx 0; color: #333; font-size: 28rpx; font-weight: 700; }
.item-wrap { margin-bottom: 20rpx; }
.coupon-item { overflow: hidden; border-radius: 16rpx 16rpx 0 0; background: #fff7f2; }
.coupon-item-gray { background: #f5f5f5; color: #999; }
.operation { padding: 24rpx; }
.theme-price { color: #e2231a; }
.coupon-btn { min-width: 132rpx; height: 52rpx; border-radius: 26rpx; line-height: 52rpx; text-align: center; }
.btn-gray { background: #ccc; }
.range_item { padding: 18rpx 24rpx; border-radius: 0 0 16rpx 16rpx; background: #fafafa; }
</style>
