<template>
  <view class="shop-page">
    <view class="shop-head">
      <image v-if="shop_info.back_image" class="back-image" mode="aspectFill" :src="shop_info.back_image" />
      <view class="shop-meta">
        <image class="logo" mode="aspectFill" :src="shop_info.logos || defaultLogo" />
        <view class="meta-main">
          <view class="name">{{ shop_info.store_name || '' }}</view>
          <view class="score">评分 {{ shop_info.server_score || 0 }} · {{ shop_info.category_name || '' }}</view>
          <view class="stats">销量 {{ shop_info.product_sales || 0 }} · 关注 {{ shop_info.fav_count || 0 }}</view>
        </view>
        <button class="follow" @tap="guanzhu">{{ isfollow ? '已关注' : '+关注' }}</button>
      </view>
      <view class="shop-actions">
        <button class="action" @tap="gotoDetail">店铺详情</button>
        <button v-if="service_open" class="action" open-type="contact">联系客服</button>
      </view>
    </view>

    <view v-if="adList && adList.length" class="ad-list">
      <swiper autoplay circular class="ad-swiper" @change="changeSwiper">
        <swiper-item v-for="item in adList" :key="item.id || item.image.file_path">
          <image class="ad-image" mode="aspectFill" :src="item.image && item.image.file_path" />
        </swiper-item>
      </swiper>
    </view>

    <view class="tabs">
      <view :class="type_active === 'all' ? 'tab active' : 'tab'" @tap="tabTypeFunc('all')">综合</view>
      <view :class="type_active === 'sales' ? 'tab active' : 'tab'" @tap="tabTypeFunc('sales')">销量</view>
      <view :class="type_active === 'price' ? 'tab active' : 'tab'" @tap="tabTypeFunc('price')">价格</view>
      <view class="tab" @tap="select_type">{{ isLieBiao ? '列表' : '宫格' }}</view>
    </view>

    <view :class="isLieBiao ? 'product-list' : 'product-grid'">
      <view v-for="item in product_list" :key="item.product_id" class="product-card" @tap="goto_product(item.product_id)">
        <image class="product-image" mode="aspectFill" :src="item.product_image" />
        <view class="product-info">
          <view class="product-name">{{ item.product_name }}</view>
          <view class="sales">累计成交：{{ item.product_sales || 0 }}笔</view>
          <view class="price">¥{{ item.product_price }}</view>
        </view>
      </view>
    </view>
    <view v-if="product_list.length === 0 && !loading" class="empty">暂无商品</view>
    <uni-load-more v-else :status="loadStatus" />
  </view>
</template>

<script>
import UniLoadMore from '../../components/uni-load-more.vue'

export default {
  components: {
    UniLoadMore
  },
  data() {
    return {
      isLieBiao: true,
      shop_info: {},
      product_list: [],
      shop_supplier_id: '',
      isfollow: '',
      loading: true,
      no_more: false,
      type_active: 'all',
      page: 1,
      search: '',
      last_page: 0,
      is_open: 0,
      is_record: 0,
      liveList: [],
      dataModel: { qq: '', wechat: '', phone: '' },
      service_type: 0,
      service_open: 0,
      category_id: 0,
      sortPrice: 0,
      adList: [],
      swiperCurrent: 0
    }
  },
  computed: {
    loadStatus() {
      return this.loading ? 'loading' : this.product_list.length && this.no_more ? 'noMore' : 'more'
    },
    defaultLogo() {
      return (this.config && this.config.pic_url ? this.config.pic_url : '') + '/static/shop-default.png'
    }
  },
  onLoad(query = {}) {
    this.shop_supplier_id = query.shop_supplier_id
  },
  onShow() {
    this.getData()
  },
  mounted() {
    this.getProduct(this.type_active)
  },
  onPullDownRefresh() {
    this.restoreData()
    this.getData()
    this.getProduct(this.type_active)
  },
  onReachBottom() {
    this.scrolltolowerFunc()
  },
  methods: {
    changeSwiper(event) {
      this.swiperCurrent = event.detail.current
    },
    getScore(value, type) {
      const score = Number(value)
      if (score <= 0 || !score) return 0
      const decimal = score % 1
      if (type === 1) return score - decimal
      if (type === 2) return decimal === 0 ? 0 : 1
      return 0
    },
    getVisitcode() {
      return typeof this.$getVisitcode === 'function' ? this.$getVisitcode() : uni.getStorageSync('visitcode') || ''
    },
    restoreData() {
      this.product_list = []
      this.page = 1
      this.category_id = 0
      this.search = ''
      this.no_more = false
      this.sortPrice = 0
    },
    tabTypeFunc(type) {
      if (type === this.type_active) return
      this.product_list = []
      this.page = 1
      this.no_more = false
      this.loading = true
      this.type_active = type
      this.getProduct(type)
    },
    getProduct(type) {
      if (typeof this._get !== 'function') {
        this.loading = false
        // TODO:migration: shop product list needs shared _get runtime.
        return
      }
      this.loading = true
      this._get('product.product/lists', {
        page: this.page || 1,
        sortType: type,
        sortPrice: this.sortPrice,
        shop_supplier_id: this.shop_supplier_id,
        search: this.search
      }, (res) => {
        const list = (res.data && res.data.list) || {}
        this.loading = false
        this.product_list = this.product_list.concat(list.data || [])
        this.last_page = list.last_page || 0
        this.no_more = this.last_page <= 1 || this.page >= this.last_page
        uni.stopPullDownRefresh()
      })
    },
    getData() {
      if (typeof this._post !== 'function') {
        this.loading = false
        return
      }
      uni.showLoading({ title: '加载中....' })
      this._post('supplier.index/index', {
        shop_supplier_id: this.shop_supplier_id,
        visitcode: this.getVisitcode()
      }, (res) => {
        const data = res.data || {}
        this.shop_info = data.detail || {}
        this.adList = data.adList || []
        this.isfollow = this.shop_info.isfollow
        this.is_record = data.liv_status ? data.liv_status.is_record : 0
        this.is_open = data.liv_status ? data.liv_status.is_open : 0
        this.liveList = data.liveList ? data.liveList.data || [] : []
        this.service_open = data.service_open || 0
        this.service_type = data.mp_service ? data.mp_service.service_type : 10
        uni.hideLoading()
        this.getservice()
      })
    },
    getservice() {
      if (typeof this._get !== 'function') return
      this._get('index/mpService', { shop_supplier_id: this.shop_supplier_id }, (res) => {
        this.dataModel = (res.data && res.data.mp_service) || this.dataModel
      })
    },
    select_type() {
      this.isLieBiao = !this.isLieBiao
    },
    goto_product(productId) {
      const url = '/pages/product/detail/detail?product_id=' + productId
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    },
    gotoDetail() {
      const url = '/pages/shop/shop_detail?shop_supplier_id=' + this.shop_supplier_id
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    },
    guanzhu() {
      if (typeof this._post !== 'function') return
      this._post('user.Favorite/add', { pid: this.shop_supplier_id, type: 10 }, () => {
        this.isfollow = this.isfollow ? 0 : 1
      })
    },
    scrolltolowerFunc() {
      this.page += 1
      if (this.page > this.last_page) {
        this.loading = false
        this.no_more = true
        return
      }
      this.getProduct(this.type_active)
    }
  }
}
</script>

<style scoped>
.shop-page { min-height: 100vh; background: #f7f7f7; padding-bottom: 32rpx; }
.shop-head { position: relative; overflow: hidden; padding: 32rpx 24rpx 24rpx; background: #fff; }
.back-image { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .16; }
.shop-meta { position: relative; display: flex; align-items: center; gap: 20rpx; }
.logo { width: 140rpx; height: 140rpx; border-radius: 16rpx; background: #eee; }
.meta-main { flex: 1; min-width: 0; }
.name { color: #222; font-size: 34rpx; font-weight: 700; }
.score, .stats { margin-top: 10rpx; color: #666; font-size: 24rpx; }
.follow { width: 130rpx; height: 58rpx; border-radius: 29rpx; background: #f03b2f; color: #fff; font-size: 24rpx; line-height: 58rpx; }
.shop-actions { position: relative; display: flex; gap: 16rpx; margin-top: 24rpx; }
.action { flex: 1; height: 64rpx; border-radius: 32rpx; font-size: 26rpx; line-height: 64rpx; }
.ad-swiper { height: 220rpx; margin: 20rpx 24rpx 0; border-radius: 12rpx; overflow: hidden; }
.ad-image { width: 100%; height: 220rpx; }
.tabs { display: flex; height: 88rpx; margin-top: 20rpx; background: #fff; }
.tab { flex: 1; display: flex; align-items: center; justify-content: center; color: #666; font-size: 28rpx; }
.tab.active { color: #f03b2f; font-weight: 700; }
.product-list { padding: 20rpx 24rpx; }
.product-list .product-card { display: flex; gap: 20rpx; padding: 20rpx; margin-bottom: 18rpx; border-radius: 12rpx; background: #fff; }
.product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18rpx; padding: 20rpx 24rpx; }
.product-grid .product-card { overflow: hidden; border-radius: 12rpx; background: #fff; }
.product-image { width: 180rpx; height: 180rpx; border-radius: 8rpx; background: #eee; }
.product-grid .product-image { width: 100%; height: 320rpx; border-radius: 0; }
.product-info { flex: 1; min-width: 0; padding: 16rpx; box-sizing: border-box; }
.product-name { color: #222; font-size: 28rpx; line-height: 1.4; }
.sales { margin-top: 12rpx; color: #999; font-size: 22rpx; }
.price { margin-top: 14rpx; color: #f03b2f; font-size: 32rpx; font-weight: 700; }
.empty { padding: 100rpx 0; color: #999; text-align: center; font-size: 26rpx; }
</style>
