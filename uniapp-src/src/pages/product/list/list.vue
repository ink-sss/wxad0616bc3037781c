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
                <text class="icon iconfont icon-sanjiao2"></text>
              </view>
              <view :class="price_top || type_active !== 2 ? 'arrow' : 'arrow active'">
                <text class="icon iconfont icon-sanjiao1"></text>
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
      this._get('product.product/lists', {
        page: this.page || 1,
        category_id: this.category_id,
        search: this.search,
        sortType: this.sortType,
        sortPrice: this.sortPrice,
        list_rows: this.list_rows
      }, (res) => {
        this.loading = false
        this.listData = this.listData.concat(res.data.list.data)
        this.last_page = res.data.list.last_page
        if (res.data.list.last_page <= 1) this.no_more = true
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
.product-list-page { min-height: 100vh; background: #f7f7f7; }
.top-box { background: #fff; }
.index-search-box { padding: 20rpx; }
.index-search { display: flex; align-items: center; height: 68rpx; padding: 0 24rpx; border-radius: 34rpx; background: #f5f5f5; box-sizing: border-box; }
.inner-tab { display: flex; align-items: center; justify-content: space-around; height: 100rpx; background: #fff; position: relative; z-index: 9; }
.inner-tab .item { flex: 1; height: 100%; color: #999; font-size: 32rpx; line-height: 90rpx; position: relative; }
.inner-tab .item.active { color: #333; font-weight: 700; }
.inner-tab .item.active:after { content: ""; position: absolute; left: 0; right: 0; bottom: 14rpx; width: 72rpx; height: 4rpx; margin: auto; border-radius: 2rpx; background: #ff5704; }
.inner-tab .box { display: flex; align-items: center; justify-content: center; height: 100%; }
.arrows { margin-left: 10rpx; line-height: 0; }
.arrow { width: 20rpx; height: 20rpx; color: #999; }
.arrow.active { color: #333; }
.mode-icon image { width: 36rpx; height: 36rpx; }
.prodcut-list-wrap { padding-top: 20rpx; }
.shop_body { padding: 0 20rpx; background: #fff; box-sizing: border-box; }
.shop_body_l_item { display: flex; padding: 40rpx 0; border-bottom: 1rpx solid #d9d9d9; background: #fff; }
.noborder { border-bottom: 0; }
.image-boxs { position: relative; overflow: hidden; border-radius: 20rpx; }
.product-image-2 { width: 150rpx; height: 150rpx; background: #f5f5f5; }
.sallsell-out { position: absolute; left: 0; top: 0; z-index: 2; display: flex; align-items: center; justify-content: center; width: 150rpx; height: 150rpx; background: rgba(0,0,0,.45); }
.sallsell-out-btn { color: #fff; font-size: 22rpx; }
.shop_body_l_item_info { flex: 1; min-width: 0; padding-left: 24rpx; }
.shop_body_l_item_info_title { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 78rpx; line-height: 39rpx; }
.shop_red, .theme-price { color: #e2231a; }
.shop_body2 { display: flex; flex-wrap: wrap; padding-top: 20rpx; }
.shop_body_t_item { width: 340rpx; margin-bottom: 20rpx; border-radius: 16rpx; background: #fff; overflow: hidden; }
.shop_body_t_item .product-image-2 { width: 340rpx; height: 340rpx; }
.shop_body_t_item_info { padding: 18rpx; }
.shop_body_t_item_info_title { height: 72rpx; line-height: 36rpx; overflow: hidden; }
.empty { color: #999; font-size: 26rpx; }
</style>
