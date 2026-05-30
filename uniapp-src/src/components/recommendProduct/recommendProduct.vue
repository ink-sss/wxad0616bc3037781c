<template>
  <view v-if="isShow" :class="['recommend-product', themeClass]" :data-theme="themeName">
    <view class="title d-c-c"><text class="line-left"></text><text class="name">{{ showName }}</text><text class="line-right"></text></view>
    <view class="recommend-product-list">
      <view v-for="item in listData" :key="item.product_id" class="item" @tap="gotoProduct(item.product_id)">
        <view class="product-cover"><image mode="aspectFill" lazy-load :src="item.product_image"></image></view>
        <view class="product-info d-c d-b-s">
          <view class="product-title">{{ item.product_name }}</view>
          <view class="flex-1"><view class="price f24 theme-price">¥<text class="num">{{ item.product_sku && item.product_sku.product_price }}</text></view><view class="f24 gray9">已售{{ item.product_sales }}件</view></view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'RecommendProduct',
  props: { location: { type: [String, Number], default: '' } },
  data() { return { listData: [], isShow: false, showName: '' }; },
  computed: { themeName() { return typeof this.theme === 'function' ? this.theme() : ''; }, themeClass() { return this.themeName || ''; } },
  created() { this.getData(); },
  methods: {
    getData() {
      if (typeof this._post !== 'function') return;
      this._post('product.product/recommendProduct', { location: this.location }, (res) => {
        if (res?.data?.is_recommend === 1) { this.isShow = true; this.showName = res.data.recommend?.name || ''; this.listData = res.data.list || []; }
      });
    },
    gotoProduct(productId) { if (typeof this.gotoPage === 'function') this.gotoPage('pages/product/detail/detail?product_id=' + productId); }
  }
};
</script>
<style scoped>
.recommend-product { padding: 24rpx; background: #fff; }
.title { height: 88rpx; font-size: 32rpx; font-weight: 600; }
.line-left, .line-right { width: 64rpx; height: 2rpx; background: #ddd; margin: 0 20rpx; }
.recommend-product-list { display: flex; flex-direction: column; gap: 20rpx; }
.item { display: flex; gap: 20rpx; }
.product-cover image { width: 180rpx; height: 180rpx; border-radius: 8rpx; }
.product-info { min-height: 180rpx; flex: 1; }
.product-title { font-size: 28rpx; color: #222; line-height: 1.4; }
.price { color: #f03b2f; margin-top: 18rpx; }
.num { font-size: 36rpx; font-weight: 700; }
</style>
