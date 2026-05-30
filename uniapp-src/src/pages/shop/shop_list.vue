<template>
  <view class="shop-list-page">
    <view class="top-box">
      <view class="search-row">
        <input v-model="searchtxt" class="search-input" confirm-type="search" placeholder="搜索商户" @confirm="search" />
        <button class="search-btn" @tap="search">搜索</button>
      </view>
      <view class="tabs">
        <view :class="type_active === 'all' ? 'tab active' : 'tab'" @tap="tabTypeFunc('all')">综合</view>
        <view :class="type_active === 'sales' ? 'tab active' : 'tab'" @tap="tabTypeFunc('sales')">销量</view>
        <view :class="type_active === 'score' ? 'tab active' : 'tab'" @tap="tabTypeFunc('score')">评分</view>
      </view>
    </view>

    <scroll-view class="shop-scroll" scroll-y :style="{ height: scrollviewHigh + 'px' }" refresher-enabled :refresher-triggered="triggered" @refresherrefresh="onRefresh" @refresherrestore="onRestore" @scrolltolower="scrolltolowerFunc">
      <view v-for="item in shopData" :key="item.shop_supplier_id" class="shop-card" @tap="gotoShop(item.shop_supplier_id)">
        <image class="logo" mode="aspectFill" :src="item.logos || defaultLogo" />
        <view class="info">
          <view class="name">{{ item.store_name || item.name }}</view>
          <view class="score">评分 {{ item.server_score || 0 }} · 已售 {{ item.product_sales || 0 }}</view>
          <view class="address">{{ item.address || item.category_name }}</view>
        </view>
      </view>
      <view v-if="shopData.length === 0 && !loading" class="empty">暂无商户</view>
      <uni-load-more v-else :status="loadStatus" />
    </scroll-view>
    <tab-bar />
  </view>
</template>

<script>
import UniLoadMore from '../../components/uni-load-more.vue'
import TabBar from '../../components/tabbar/footTabbar.vue'

export default {
  components: {
    UniLoadMore,
    TabBar
  },
  data() {
    return {
      triggered: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      no_more: false,
      loading: false,
      last_page: 0,
      page: 1,
      list_rows: 10,
      type_active: 'all',
      shopData: [],
      searchtxt: '',
      keyWord: '',
      footerHeight: ''
    }
  },
  computed: {
    loadStatus() {
      return this.loading ? 'loading' : this.shopData.length && this.no_more ? 'noMore' : 'more'
    },
    defaultLogo() {
      return (this.config && this.config.pic_url ? this.config.pic_url : '') + '/static/shop-default.png'
    }
  },
  onReady() {
    uni.hideTabBar()
  },
  mounted() {
    this.init()
    this.restoreData()
    this.getData()
  },
  methods: {
    init() {
      uni.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight
          uni.createSelectorQuery().select('.top-box').boundingClientRect((rect) => {
            this.scrollviewHigh = this.phoneHeight - ((rect && rect.height) || 0) - 60
          }).exec()
        }
      })
    },
    restoreData() {
      this.shopData = []
      this.page = 1
      this.no_more = false
    },
    tabTypeFunc(type) {
      if (this.loading || type === this.type_active) return
      this.type_active = type
      this.restoreData()
      this.getData()
    },
    getData() {
      if (typeof this._post !== 'function') {
        this.loading = false
        // TODO:migration: shop list needs shared _post runtime.
        return
      }
      if (this.loading) return
      this.loading = true
      this._post('supplier.index/list', {
        page: this.page || 1,
        list_rows: this.list_rows,
        sortType: this.type_active,
        name: this.keyWord
      }, (res) => {
        const list = (res.data && res.data.list) || {}
        this.loading = false
        this.last_page = list.last_page || 0
        this.shopData = this.shopData.concat(list.data || [])
        this.no_more = this.last_page <= 1 || this.page >= this.last_page
      })
    },
    onRefresh() {
      this.restoreData()
      this.getData()
      setTimeout(() => {
        this.triggered = false
      }, 1000)
    },
    onRestore() {
      this.triggered = false
    },
    search() {
      this.keyWord = this.searchtxt
      this.restoreData()
      this.getData()
    },
    scrolltolowerFunc() {
      if (this.no_more) return
      this.page += 1
      if (this.page <= this.last_page) this.getData()
      else this.no_more = true
    },
    gotoShop(shopSupplierId) {
      const url = '/pages/shop/shop?shop_supplier_id=' + shopSupplierId
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.shop-list-page { min-height: 100vh; background: #f7f7f7; padding-bottom: 120rpx; }
.top-box { background: #fff; padding: 20rpx 24rpx 0; }
.search-row { display: flex; align-items: center; gap: 16rpx; }
.search-input { flex: 1; height: 68rpx; padding: 0 24rpx; border-radius: 34rpx; background: #f5f5f5; font-size: 26rpx; box-sizing: border-box; }
.search-btn { width: 140rpx; height: 68rpx; border-radius: 34rpx; background: #f03b2f; color: #fff; font-size: 26rpx; line-height: 68rpx; }
.tabs { display: flex; height: 88rpx; align-items: center; justify-content: space-around; }
.tab { flex: 1; text-align: center; color: #666; font-size: 28rpx; }
.tab.active { color: #f03b2f; font-weight: 700; }
.shop-card { display: flex; gap: 20rpx; margin: 20rpx 24rpx 0; padding: 24rpx; border-radius: 14rpx; background: #fff; }
.logo { width: 150rpx; height: 150rpx; border-radius: 12rpx; background: #eee; }
.info { flex: 1; min-width: 0; }
.name { color: #222; font-size: 30rpx; font-weight: 700; }
.score, .address { margin-top: 14rpx; color: #777; font-size: 24rpx; line-height: 1.4; }
.empty { padding: 120rpx 0; text-align: center; color: #999; font-size: 26rpx; }
</style>
