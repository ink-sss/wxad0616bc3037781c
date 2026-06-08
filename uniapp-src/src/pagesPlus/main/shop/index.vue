<template>
  <view class="shop-index-page">
    <view class="entry-card" @tap="gotoShopList">
      <view class="title">商户中心</view>
      <view class="desc">浏览平台商户和店铺商品</view>
    </view>
    <view class="entry-card" @tap="gotoApplication">
      <view class="title">商户入驻</view>
      <view class="desc">查看入驻申请状态</view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    gotoShopList() {
      const url = '/pages/shop/shop_list'
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.switchTab({ url })
    },
    gotoApplication() {
      const url = '/pagesPlus/main/shop/application_status'
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.shop-index-page { min-height: 100vh; background: #f7f7f7; padding: 24rpx; box-sizing: border-box; }
.entry-card { padding: 34rpx 28rpx; margin-bottom: 20rpx; border-radius: 14rpx; background: #fff; }
.title { color: #222; font-size: 32rpx; font-weight: 700; }
.desc { margin-top: 14rpx; color: #777; font-size: 26rpx; }
</style>
