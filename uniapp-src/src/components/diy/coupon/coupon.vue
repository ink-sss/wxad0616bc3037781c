<template>
  <view v-if="listData.length" class="diy-coupon" :style="wrapperStyle">
    <view class="pr coupon-wrapper-box" :style="boxStyle">
      <image v-if="Number(styleConfig.bgtype) === 2" class="bg-couponbg" :src="styleConfig.bgimage" :style="radiusStyle"></image>
      <scroll-view scroll-x>
        <view class="coupon-wrapper-list d-s-c">
          <view v-for="(coupon, index) in listData" :key="coupon.coupon_id || index" class="coupon-wrapper">
            <view class="coupon-item d-c-c d-c">
              <view :style="`height:78px;border-bottom:1px dashed;border-color:${styleConfig.btncolor || ''};`">
                <view class="content-top" :style="`color:${styleConfig.pricecolor || ''};`">
                  <block v-if="coupon.coupon_type && coupon.coupon_type.value === 10">
                    <text class="f24">￥</text><text class="f48 fb">{{ Number(coupon.reduce_price || 0) }}</text>
                  </block>
                  <block v-if="coupon.coupon_type && coupon.coupon_type.value === 20">
                    <text class="f48 fb">{{ coupon.discount }}</text><text class="f24">折</text>
                  </block>
                </view>
                <view class="content-bottom d-c f22" :style="`color:${styleConfig.cillcolor || ''};`">
                  <text>{{ Number(coupon.min_price || 0) > 0 ? `满${Number(coupon.min_price)}元可用` : '无门槛' }}</text>
                </view>
                <view class="tc f22" :style="`color:${styleConfig.descolor || ''};`">
                  <text v-if="coupon.apply_range === 10">全品类券</text>
                  <text v-if="coupon.apply_range === 20">指定商品可用</text>
                  <text v-if="coupon.apply_range === 30">指定品类可用</text>
                </view>
              </view>
              <view class="d-c-c" style="height:38px">
                <view v-if="coupon.state && coupon.state.value === 1" class="right-receive" :style="buttonStyle" @tap="receiveCoupon(index)">{{ params.btntext }}</view>
                <view v-else class="right-receive" :style="buttonStyle">{{ coupon.state && coupon.state.text }}</view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiyCoupon',
  props: { itemData: { type: Object, default: () => ({}) } },
  data() { return { listData: [] } },
  computed: {
    styleConfig() { return this.itemData.style || {} },
    params() { return this.itemData.params || {} },
    wrapperStyle() {
      const s = this.styleConfig
      return `background:${s.bgcolor || ''};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};`
    },
    radiusStyle() {
      const top = 2 * Number(this.styleConfig.topRadio || 0)
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0)
      return `border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`
    },
    boxStyle() {
      return `background:${Number(this.styleConfig.bgtype) === 1 ? this.styleConfig.background : 'none'};${this.radiusStyle}`
    },
    buttonStyle() {
      const s = this.styleConfig
      return `color:${s.btnTxtcolor || ''};border-radius:${s.btnRadio || 0}px;background-color:${s.btncolor || ''};`
    }
  },
  created() { this.listData = Array.isArray(this.itemData.data) ? this.itemData.data : [] },
  methods: {
    toRpx(value) { return `${2 * Number(value || 0)}rpx` },
    receiveCoupon(index) {
      const coupon = this.listData[index]
      if (!coupon || (coupon.state && coupon.state.value === 0) || typeof this._post !== 'function') return
      this._post('user.coupon/receive', { coupon_id: coupon.coupon_id }, () => {
        uni.showToast({ title: '领取成功', icon: 'success', mask: true, duration: 2000 })
        coupon.state.value = 0
        coupon.state.text = '已领取'
      })
    }
  }
}
</script>
<style scoped>
.diy-coupon { align-items: center; display: flex; justify-content: flex-start; }
.coupon-wrapper { flex-shrink: 0; height: 232rpx; margin-right: 20rpx; position: relative; width: 208rpx; }
.coupon-item { background: #fff; height: 232rpx; overflow: hidden; position: relative; width: 208rpx; z-index: 1; }
.content-top { font-size: 24rpx; text-align: center; }
.content-bottom { font-size: 20rpx; text-align: center; }
.right-receive { align-items: center; box-sizing: border-box; display: flex; flex-shrink: 0; font-size: 11px; height: 48rpx; justify-content: center; min-width: 142rpx; padding: 0 20rpx; text-align: center; }
.coupon-wrapper-box { box-sizing: border-box; padding: 28rpx 0; width: 100%; }
.coupon-wrapper-list { flex-wrap: nowrap; overflow-x: auto; padding-left: 22rpx; }
.bg-couponbg { height: 100%; left: 0; position: absolute; top: 0; width: 100%; z-index: 0; }
</style>
