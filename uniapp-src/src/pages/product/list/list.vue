<template>
  <view class="product-list-page" :data-theme="theme && theme()">
    <view class="top-box">
      <view id="searchBox" class="index-search-box index-search-box_re d-b-c">
        <view class="index-search index-search_re t-c flex-1">
          <input
            v-model="search"
            class="flex-1 ml10 f26 gray3"
            confirm-type="search"
            placeholder="搜索商品"
            placeholder-class="f26 gray9"
            type="text"
            @confirm="searchFunc"
          />
        </view>
      </view>
      <view class="inner-tab">
        <view :class="type_active === 0 ? 'item active' : 'item'" @tap="tabTypeFunc(0)">
          <view class="box">综合</view>
        </view>
        <view :class="type_active === 1 ? 'item active' : 'item'" @tap="tabTypeFunc(1)">
          <view class="box">销量</view>
        </view>
        <view :class="type_active === 2 ? 'item active' : 'item'" @tap="tabTypeFunc(2)">
          <view class="box">
            <text>价格</text>
            <view class="arrows">
              <view :class="price_top && type_active === 2 ? 'arrow active' : 'arrow'">
                <view class="triangle triangle-up"></view>
              </view>
              <view :class="price_top || type_active !== 2 ? 'arrow' : 'arrow active'">
                <view class="triangle triangle-down"></view>
              </view>
            </view>
          </view>
        </view>
        <view class="item" @tap="select_type">
          <view class="box mode-icon">
            <image :src="config.pic_url + (isLieBiao ? '/202604061216345ffa53811.png' : '/20260406121801e30e33517.png')" />
          </view>
        </view>
      </view>
    </view>

    <view class="prodcut-list-wrap">
      <scroll-view class="scroll-Y" scroll-y :style="{ height: scrollviewHigh + 'px' }" lower-threshold="50" @scrolltolower="scrolltolowerFunc">
        <view :class="topRefresh ? 'top-refresh open' : 'top-refresh'">
          <view v-for="(_, index) in 3" :key="index" class="circle"></view>
        </view>

        <view v-if="isLieBiao" class="shop_body">
          <view
            v-for="(item, index) in listData"
            :key="item.product_id || index"
            class="shop_body_l_item"
            :class="{ noborder: index === listData.length - 1 }"
            @tap="gotoList(item.product_id)"
          >
            <view class="image-boxs">
              <view v-if="item.product_stock <= 0" class="sallsell-out"><view class="sallsell-out-btn">当前售罄</view></view>
              <image class="product-image-2" :src="item.product_image" />
            </view>
            <view class="shop_body_l_item_info">
              <view class="shop_body_l_item_info_title gray3 f32">{{ item.product_name }}</view>
              <view class="d-b-c pb10">
                <view class="shop_body_l_item_info_price">
                  <view class="f24 shop_red">¥<text class="f32 fb">{{ item.product_price }}</text></view>
                </view>
                <view class="shop_body_l_item_info_others f22">
                  <view class="shop_body_l_item_info_others_sales">累计成交：{{ item.product_sales }}笔</view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="shop_body2">
          <view
            v-for="(item, index) in listData"
            :key="item.product_id || index"
            class="shop_body_t_item"
            :class="index % 2 === 0 ? 'ml20 mr20' : 'mr20'"
            @tap="gotoList(item.product_id)"
          >
            <view class="image-boxs">
              <view v-if="item.product_stock <= 0" class="sallsell-out"><view class="sallsell-out-btn">当前售罄</view></view>
              <image class="product-image-2" :src="item.product_image" />
            </view>
            <view class="shop_body_t_item_info">
              <view class="shop_body_t_item_info_title f26">{{ item.product_name }}</view>
              <view class="shop_body_t_item_info_others f24 gray9 mt">
                <view class="shop_body_t_item_info_others_sales">累计成交：{{ item.product_sales }}笔</view>
              </view>
              <view class="shop_body_t_item_info_price">
                <view class="f20 theme-price">¥<text class="f32">{{ item.product_price }}</text></view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="listData.length === 0 && !loading" class="d-c-c p30 empty">
          <text class="iconfont icon-wushuju"></text>
          <text class="cont">亲，暂无相关记录哦</text>
        </view>
        <uni-load-more v-else :loading-type="loadingType" />
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { fetchProducts, normalizeProductList } from '../../../services/miniprogram-products.js'

export default {
  data() {
    return {
      isLieBiao: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      topRefresh: false,
      loading: true,
      no_more: false,
      type_active: 0,
      price_top: false,
      listData: [],
      page: 1,
      category_id: 0,
      search: '',
      sortType: '',
      sortPrice: 0,
      list_rows: 10,
      last_page: 0
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.listData.length !== 0 && this.no_more ? 2 : 0
    }
  },
  onLoad(query) {
    this.category_id = query.category_id || 0
    if (query.search) this.search = query.search
    if (query.sortType) this.sortType = query.sortType
    if (query.sortPrice) this.sortPrice = query.sortPrice
  },
  mounted() {
    this.init()
    this.getData()
  },
  onPullDownRefresh() {
    this.restoreData()
    this.getData()
  },
  onShareAppMessage() {
    return {
      title: '全部分类',
      path: '/pages/product/category?' + this.getShareUrlParams()
    }
  },
  methods: {
    searchFunc() {
      this.listData = []
      this.page = 1
      this.getData()
    },
    init() {
      uni.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight
          uni.createSelectorQuery().select('.top-box').boundingClientRect((rect) => {
            this.scrollviewHigh = this.phoneHeight - ((rect && rect.height) || 0)
          }).exec()
        }
      })
    },
    restoreData() {
      this.listData = []
      this.category_id = 0
      this.search = ''
      this.sortType = ''
      this.sortPrice = 0
    },
    tabTypeFunc(type) {
      this.listData = []
      this.page = 1
      this.no_more = false
      this.loading = true
      if (type === 2) {
        this.price_top = !this.price_top
        this.sortPrice = this.price_top === true ? 0 : 1
        this.sortType = 'price'
      } else if (type === 1) {
        this.price_top = !this.price_top
        this.sortType = 'sales'
      }
      this.type_active = type
      this.getData()
    },
    getData() {
      this.loading = true
      fetchProducts({
        page: this.page || 1,
        categoryId: this.category_id || '',
        search: this.search,
        sortType: this.sortType,
        sortPrice: this.sortPrice,
        pageSize: this.list_rows
      }).then((data) => {
        const list = normalizeProductList(data || {}, this.list_rows)
        this.loading = false
        this.listData = this.listData.concat(list.data)
        this.last_page = list.last_page
        if (list.last_page <= 1 || this.page >= list.last_page) this.no_more = true
      }).catch(() => {
        this.loading = false
        this.no_more = true
      })
    },
    gotoList(productId) {
      this.gotoPage('pages/product/detail/detail?product_id=' + productId)
    },
    gotoSearch() {
      this.gotoPage('/pages/product/search/search')
    },
    scrolltolowerFunc() {
      this.bottomRefresh = true
      this.page++
      this.loading = true
      if (this.page > this.last_page) {
        this.loading = false
        this.no_more = true
        return
      }
      this.getData()
    },
    select_type() {
      this.isLieBiao = !this.isLieBiao
    },
    goback() {
      const pages = getCurrentPages()
      if (pages.length <= 1) this.gotoPage('/pages/index/index')
      else uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.product-list-page {
  min-height: 100vh;
  background: #f2f2f2;
}
.flex-1 {
  flex: 1;
  min-width: 0;
}
.d-b-c {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.d-c-c {
  display: flex;
  align-items: center;
  justify-content: center;
}
.t-c {
  text-align: center;
}
.ml10 {
  margin-left: 10rpx;
}
.ml20 {
  margin-left: 20rpx;
}
.mr20 {
  margin-right: 20rpx;
}
.mt {
  margin-top: 0;
}
.pb10 {
  padding-bottom: 10rpx;
}
.p30 {
  padding: 30rpx;
}
.f20 {
  font-size: 20rpx;
}
.f22 {
  font-size: 22rpx;
}
.f24 {
  font-size: 24rpx;
}
.f26 {
  font-size: 26rpx;
}
.f32 {
  font-size: 32rpx;
}
.fb {
  font-weight: 700;
}
.gray3 {
  color: #333;
}
.gray9 {
  color: #999;
}
.top-box {
  background: #fff;
}
.index-search-box {
  padding: 20rpx;
}
.index-search {
  display: flex;
  align-items: center;
  height: 68rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 34rpx;
  box-sizing: border-box;
}
.index-search input {
  height: 68rpx;
  line-height: 68rpx;
}
.inner-tab {
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
  z-index: 9;
  height: 100rpx;
  background: #fff;
}
.inner-tab .item {
  flex: 1;
  position: relative;
  height: 100%;
  color: #999;
  font-size: 32rpx;
  line-height: 90rpx;
}
.inner-tab .item.active {
  color: #333;
  font-weight: 700;
}
.inner-tab .item.active:after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 14rpx;
  left: 0;
  width: 72rpx;
  height: 4rpx;
  margin: auto;
  background: #ff5704;
  border-radius: 2rpx;
}
.inner-tab .box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.arrows {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 10rpx;
  line-height: 0;
}
.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20rpx;
  height: 20rpx;
  color: #b8b8b8;
}
.arrow.active {
  color: #333;
}
.triangle-up {
  width: 0;
  height: 0;
  border-right: 7rpx solid transparent;
  border-bottom: 9rpx solid currentColor;
  border-left: 7rpx solid transparent;
}
.triangle-down {
  width: 0;
  height: 0;
  border-top: 9rpx solid currentColor;
  border-right: 7rpx solid transparent;
  border-left: 7rpx solid transparent;
}
.mode-icon image {
  display: block;
  width: 36rpx;
  height: 36rpx;
}
.prodcut-list-wrap {
  padding-top: 20rpx;
  background: #f2f2f2;
}
.scroll-Y {
  background: #f2f2f2;
}
.top-refresh {
  display: none;
}
.top-refresh.open {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}
.circle {
  width: 12rpx;
  height: 12rpx;
  margin: 0 6rpx;
  background: #ddd;
  border-radius: 50%;
}
.shop_body {
  width: 100%;
  padding: 0 20rpx;
  background: #fff;
  box-sizing: border-box;
}
.shop_body_l_item {
  display: flex;
  margin: 0 auto;
  padding: 40rpx 0;
  background: #fff;
  border-bottom: 1rpx solid #d9d9d9;
  box-sizing: border-box;
}
.noborder {
  border-bottom: 0;
}
.shop_body_l_item .image-boxs {
  position: relative;
  overflow: hidden;
  width: 150rpx;
  height: 150rpx;
  border-radius: 20rpx;
}
.shop_body_l_item .product-image-2 {
  display: block;
  width: 150rpx;
  height: 150rpx;
  background: #f5f5f5;
}
.shop_body_l_item .sallsell-out {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150rpx;
  height: 150rpx;
  background: rgba(0,0,0,.45);
}
.sallsell-out-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 106rpx;
  height: 46rpx;
  border: 1rpx solid #fff;
  border-radius: 5rpx;
  color: #fff;
  font-size: 24rpx;
}
.shop_body_l_item_info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding-left: 20rpx;
  box-sizing: border-box;
}
.shop_body_l_item_info_title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 44rpx;
  text-overflow: ellipsis;
  word-break: break-all;
}
.shop_body_l_item_info_price {
  display: flex;
  align-items: flex-end;
}
.shop_body_l_item_info_price > view {
  margin-right: 15rpx;
}
.shop_body_l_item_info_others {
  display: flex;
  justify-content: space-between;
  height: 30rpx;
}
.shop_body_l_item_info_others_sales {
  color: #333;
  line-height: 30rpx;
}
.shop_red {
  color: #f6220c;
}
.theme-price {
  color: #ff5704;
}
.shop_body2 {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  background: #f2f2f2;
}
.shop_body_t_item {
  width: 345rpx;
  height: 520rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 12rpx;
}
.shop_body_t_item .image-boxs {
  position: relative;
  overflow: hidden;
  width: 345rpx;
  height: 345rpx;
}
.shop_body_t_item .product-image-2 {
  display: block;
  width: 345rpx;
  height: 345rpx;
  background: #f5f5f5;
}
.shop_body_t_item .sallsell-out {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 345rpx;
  height: 345rpx;
  background: rgba(0,0,0,.45);
}
.shop_body_t_item_info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 20rpx;
  box-sizing: border-box;
}
.shop_body_t_item_info_title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  margin-bottom: 30rpx;
  line-height: 36rpx;
  text-overflow: ellipsis;
  word-break: break-all;
}
.shop_body_t_item_info_others {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.shop_body_t_item_info_others_sales {
  color: #999;
}
.shop_body_t_item_info_price {
  display: flex;
  align-items: flex-end;
}
.empty {
  flex-direction: column;
  color: #999;
  font-size: 26rpx;
}
.empty .iconfont {
  font-size: 84rpx;
  line-height: 1;
}
.empty .cont {
  margin-top: 16rpx;
}
[data-theme=theme0] .inner-tab .item.active:after {
  background-color: #ff5704!important;
}
[data-theme=theme1] .inner-tab .item.active:after {
  background-color: #19ad57!important;
}
[data-theme=theme2] .inner-tab .item.active:after {
  background-color: #fc0!important;
}
[data-theme=theme3] .inner-tab .item.active:after {
  background-color: #33a7ff!important;
}
[data-theme=theme4] .inner-tab .item.active:after {
  background-color: #e4e4e4!important;
}
[data-theme=theme5] .inner-tab .item.active:after {
  background-color: #c8ba97!important;
}
[data-theme=theme6] .inner-tab .item.active:after {
  background-color: #623ceb!important;
}
[data-theme=theme0] .shop_red,
[data-theme=theme0] .theme-price {
  color: #ff5704!important;
}
[data-theme=theme1] .shop_red,
[data-theme=theme1] .theme-price {
  color: #19ad57!important;
}
[data-theme=theme2] .shop_red,
[data-theme=theme2] .theme-price {
  color: #fc0!important;
}
[data-theme=theme3] .shop_red,
[data-theme=theme3] .theme-price {
  color: #33a7ff!important;
}
[data-theme=theme4] .shop_red,
[data-theme=theme4] .theme-price {
  color: #e4e4e4!important;
}
[data-theme=theme5] .shop_red,
[data-theme=theme5] .theme-price {
  color: #c8ba97!important;
}
[data-theme=theme6] .shop_red,
[data-theme=theme6] .theme-price {
  color: #623ceb!important;
}
</style>
