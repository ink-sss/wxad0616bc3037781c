<template>
  <view>
    <view class="limited-spike m-0-20 d-b-s">
      <view class="active-name mr20"><view>预</view><view>告</view></view>
      <view class="flex-1 pt16">
        <view class="white">
          <text class="f28 fb">￥</text>
          <text class="f42 fb">{{ subPrice(detail.product_price, '1') }}.</text>
          <text class="f24 fb">{{ subPrice(detail.product_price, '2') }}</text>
        </view>
        <view v-if="detail.product_sku && detail.product_sku.line_price" class="old-price">￥{{ detail.product_sku.line_price }}</view>
      </view>
      <view class="right-time">
        <Countdown
          ref="countdown"
          active-name="previewProduct"
          :config="{ startstamp: detail.preview.start_time, endstamp: detail.preview.end_time, type: 'preview' }"
          start_name="距开始仅剩"
          end_name="距开始仅剩"
          @returnVal="returnValFunc"
        />
      </view>
    </view>
    <view class="bg-white m-0-20 mb20 p20 mt-down-box">
      <view class="f30 gray3">{{ detail.product_name }}</view>
      <view v-if="detail.selling_point" class="product-describe">{{ detail.selling_point }}</view>
      <view class="border-t d-b-c mt20">
        <button class="flex-1 active-btn d-c-c" @tap="sendFunc('showShare')">
          <text class="icon iconfont icon-fenxiang3 shoucang-icon"></text>
          <text class="f28 gray9">分享</text>
        </button>
        <button class="flex-1 active-btn d-c-c" @tap="sendFunc('favorite')">
          <text :class="is_fav ? 'icon-shoucang2 dominant' : 'icon-shoucang1'" class="icon iconfont shoucang-icon"></text>
          <text :class="is_fav ? 'dominant' : 'gray9'" class="f28">收藏</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import Countdown from '../../../../components/countdown/countdown-act.vue'

export default {
  components: {
    Countdown
  },
  props: {
    detail: {
      type: Object,
      default: () => ({ product_sku: {}, preview: {} })
    },
    is_fav: Boolean
  },
  methods: {
    sendFunc(type) {
      this.$emit('send', type)
    },
    returnValFunc() {}
  }
}
</script>

<style scoped>
.limited-spike { display: flex; align-items: stretch; min-height: 118rpx; border-radius: 16rpx 16rpx 0 0; background: linear-gradient(90deg,#ff5a2a,#ff9d2e); color: #fff; }
.active-name { display: flex; flex-direction: column; justify-content: center; width: 72rpx; text-align: center; font-size: 26rpx; font-weight: 700; background: rgba(0,0,0,.12); }
.right-time { display: flex; align-items: center; padding-right: 20rpx; }
.old-price { margin-top: 8rpx; color: rgba(255,255,255,.75); font-size: 24rpx; text-decoration: line-through; }
.mt-down-box { border-radius: 0 0 16rpx 16rpx; }
.product-describe { margin-top: 12rpx; color: #999; font-size: 26rpx; }
.active-btn { background: #fff; color: #333; font-size: 28rpx; }
.shoucang-icon { margin-right: 10rpx; font-size: 34rpx; }
</style>
