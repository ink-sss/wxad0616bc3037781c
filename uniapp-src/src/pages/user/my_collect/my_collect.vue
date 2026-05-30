<template>
  <view class="collect-page">
    <scroll-view class="scroll-Y" scroll-y lower-threshold="50" :style="{ height: scrollviewHigh + 'px' }" @scrolltolower="scrolltolowerFunc">
      <view class="shop_list_body">
        <view v-for="(shop, index) in shop_list" :key="index" class="shop_list_body_item">
          <view class="shop_list_body_item_shop" @tap="goto_shop(shop.shop_supplier_id)">
            <view class="shop_list_body_item_shop_logo">
              <image lazy-load :src="shop.logo" />
            </view>
            <view class="shop_list_body_item_shop_info">
              <view class="h1 title">{{ shop.store_name }}</view>
              <view class="h3 brand">主营品牌：{{ shop.categoryName }}</view>
              <view class="h3 sales">销量{{ shop.product_sales }}件</view>
            </view>
            <view class="shop_list_body_item_shop_others">
              <view class="h3 attention"><text class="red">{{ shop.fav_count }}</text>人关注</view>
              <view class="h3 collect">商户评分：<text class="red">{{ shop.score }}</text></view>
            </view>
          </view>

          <view v-if="shop.productList && shop.productList.length > 0" :class="shop.productList.length < 3 ? 'shop_list_body_item_product2' : 'shop_list_body_item_product'">
            <view v-for="(product, productIndex) in shop.productList" :key="productIndex" class="shop_list_body_item_product_item" @tap="goto_product(product.product_id)">
              <image lazy-load :src="product.logo" />
              <view class="shop_list_body_item_product_item_price">
                <view class="h4 red">¥<text class="h3">{{ product.product_price > 1000 ? Number(product.product_price) : product.product_price }}</text></view>
                <view v-if="product.line_price" class="h6 huaxianjia">¥<text class="h5">{{ product.line_price > 1000 ? Number(product.line_price) : product.line_price }}</text></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="shop_list.length === 0 && !loading" class="empty">
        <text class="iconfont icon-wushuju"></text>
        <text class="cont">亲，暂无相关记录哦</text>
      </view>
      <uni-load-more v-else :status="loadMoreStatus" />
    </scroll-view>
  </view>
</template>

<script>
import UniLoadMore from '../../../components/uni-load-more.vue'

export default {
  components: { UniLoadMore },
  data() {
    return {
      shop_list: [],
      loading: true,
      no_more: false,
      scrollviewHigh: 0,
      page: 1,
      last_page: 0,
      isfollow: '',
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.shop_list.length !== 0 && this.no_more ? 2 : 0
    },
    loadMoreStatus() {
      if (this.loading) return 'loading'
      return this.no_more ? 'noMore' : 'more'
    },
  },
  onShow() {
    this.init()
    this.getData()
  },
  methods: {
    init() {
      this.shop_list = []
      this.page = 1
      this.no_more = false
      uni.getSystemInfo({
        success: (res) => {
          this.scrollviewHigh = res.windowHeight
        },
      })
    },
    getData() {
      this.loading = true
      this._post(
        'user.Favorite/list',
        {
          page: this.page,
          type: 10,
          list_rows: 15,
        },
        (res) => {
          const list = (res.data && res.data.list) || {}
          this.loading = false
          this.shop_list = this.shop_list.concat(list.data || [])
          this.last_page = list.last_page || 0
          this.no_more = (list.last_page || 0) <= this.page
        },
      )
    },
    scrolltolowerFunc() {
      if (this.no_more) return
      this.page += 1
      if (this.page <= this.last_page) this.getData()
      else this.no_more = true
    },
    goto_shop(shopSupplierId) {
      this.gotoPage('/pages/shop/shop?shop_supplier_id=' + shopSupplierId)
    },
    goto_product(productId) {
      this.gotoPage('/pages/product/detail/detail?product_id=' + productId)
    },
  },
}
</script>

<style scoped>
.collect-page {
  background: #f2f2f2;
  min-height: 100vh;
}

.h1 {
  font-size: 32rpx;
}

.h3 {
  font-size: 24rpx;
}

.h4 {
  font-size: 20rpx;
}

.h5 {
  font-size: 16rpx;
}

.h6 {
  font-size: 12rpx;
}

.red {
  color: #e2231a;
}

.huaxianjia {
  color: #585858;
  text-decoration: line-through;
}

.shop_list_body {
  box-sizing: border-box;
  padding: 20rpx;
  width: 100%;
}

.shop_list_body_item {
  background-color: #fff;
  border-bottom: 2rpx solid #f2f2f2;
  border-radius: 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
  max-height: 470rpx;
  padding: 10rpx;
  width: 100%;
}

.shop_list_body_item_shop {
  display: flex;
  height: 150rpx;
  justify-content: space-between;
  margin-bottom: 10rpx;
  width: 100%;
}

.shop_list_body_item_shop_logo {
  flex-shrink: 0;
  height: 150rpx;
  width: 150rpx;
}

.shop_list_body_item_shop_logo image {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 15rpx;
  height: 100%;
  width: 100%;
}

.shop_list_body_item_shop_info {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 0 10rpx 10rpx;
}

.shop_list_body_item_shop_others {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 0 10rpx 10rpx;
  text-align: right;
}

.title,
.brand,
.sales {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand,
.sales {
  color: #585858;
}

.shop_list_body_item_product,
.shop_list_body_item_product2 {
  align-items: center;
  background-color: #f2f2f2;
  border-radius: 15rpx;
  box-sizing: border-box;
  display: flex;
  height: 280rpx;
  padding: 10rpx;
  width: 100%;
}

.shop_list_body_item_product {
  justify-content: space-around;
}

.shop_list_body_item_product2 {
  justify-content: flex-start;
}

.shop_list_body_item_product2 .shop_list_body_item_product_item {
  margin: 0 10rpx;
}

.shop_list_body_item_product_item {
  background-color: #fff;
  height: 240rpx;
  width: 30%;
}

.shop_list_body_item_product_item image {
  background-color: rgba(0, 0, 0, 0.1);
  height: 200rpx;
  width: 100%;
}

.shop_list_body_item_product_item_price {
  align-items: flex-end;
  display: flex;
  justify-content: flex-start;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  align-items: center;
  color: #999;
  display: flex;
  justify-content: center;
  padding: 30rpx;
}

.cont {
  margin-left: 8rpx;
}
</style>
