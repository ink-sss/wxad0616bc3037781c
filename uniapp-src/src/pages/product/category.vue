<template>
  <view class="category-wrap" :class="theme && theme()" :data-theme="theme && theme()">
    <view id="searchBox" class="index-search-box-cate d-b-c" :style="topSearchStyle">
      <view class="index-search-cate flex-1 t-c" @tap="gotoSearch">
        <text class="icon iconfont icon-sousuo"></text>
        <text class="ml10">{{ searchName }}</text>
      </view>
      <view class="wx-top-right"></view>
    </view>

    <view class="category-content">
      <view v-if="show_type === 10 && style === 3" class="cotegory-type cotegory-type-1">
        <scroll-view class="scroll-Y" scroll-y :style="{ height: scrollviewHigh + 'px' }">
          <view class="list cotegory-padding">
            <view v-for="(item, index) in listData" :key="item.category_id || index" class="item" @tap="gotoList(item.category_id)">
              <view class="pic"><image mode="widthFix" :src="hasImages(item)" /></view>
              <view class="p-20-0 tc f28">{{ item.name }}</view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="showCategoryType3" class="cotegory-type cotegory-type-3">
        <view v-if="showTwo()" class="category-tab f-s-0">
          <scroll-view class="scroll-Y" scroll-y :style="{ height: scrollviewHigh + 'px' }">
            <view class="cotegory-padding">
              <view v-for="(item, index) in categoryTabs" :key="item.category_id || index" :class="select_index === index ? 'item active' : 'item'" @tap="selectCategory(index)">
                <text>{{ item.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view v-if="(style === 1 && show_type === 20) || (style === 4 && show_type === 10)" class="category-tab f-s-0">
          <scroll-view class="scroll-Y" scroll-y :style="{ height: scrollviewHigh + 'px' }">
            <view class="cotegory-padding">
              <view v-for="(item, index) in categoryTabs" :key="item.category_id || index" :class="select_index === index ? 'item active' : 'item'" @tap="selectCategory(index)">
                <text>{{ item.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view v-if="style === 1 && show_type === 20" class="cotegory-type cotegory-type-2 flex-1">
          <scroll-view class="scroll-Y" scroll-y :style="{ height: scrollviewHigh + 'px' }">
            <view class="list cotegory-padding">
              <view v-for="(item, index) in childlist" :key="item.category_id || index" class="item" @tap="gotoList(item.category_id)">
                <image mode="widthFix" :src="hasImages(item)" />
                <text>{{ item.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view v-if="style === 1 && show_type === 10" class="cotegory-type cotegory-type-2 flex-1">
          <scroll-view class="scroll-Y" scroll-y :style="{ height: scrollviewHigh + 'px' }">
            <view class="list cotegory-padding">
              <view v-for="(item, index) in listData" :key="item.category_id || index" class="item" @tap="gotoList(item.category_id)">
                <image mode="widthFix" :src="hasImages(item)" />
                <text>{{ item.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view v-if="style === 2 || style === 3 || style === 4" class="category-content pr">
          <scroll-view class="scroll-Y scroll-3" scroll-y lower-threshold="10" :style="{ height: scrollviewHigh + 'px' }" @scrolltolower="scrolltolowerFunc">
            <view v-if="show_type === 20 && (style === 2 || style === 3)" class="catescroll2-top">
              <view v-for="(item, index) in childlist" :key="item.category_id || index" class="catescroll2-top-item" :class="{ active: item.category_id === category_id }" @tap.stop="changeCategory(item.category_id)">
                {{ item.name }}
              </view>
            </view>
            <view class="cotegory-padding">
              <view v-for="(item, index) in productlist" :key="item.product_id || index" class="product-item-2" @tap="gotoPage('/pages/product/detail/detail?product_id=' + item.product_id)">
                <view class="image-boxs">
                  <view v-if="item.product_stock <= 0" class="sallsell-out"><view class="sallsell-out-btn">当前售罄</view></view>
                  <image class="product-image-2" :src="item.product_image" />
                </view>
                <view class="flex-1 d-c d-b-s product-info" style="height:154rpx">
                  <view class="text-ellipsis-2 f28 gray3">{{ item.product_name }}</view>
                  <view class="theme-price f36 fb price-wrap">
                    <text class="f24">￥</text>{{ item.product_min_price }}
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <category-mask-vue ref="categoryMaskRef" :data-list="productArr" @get-shopping-num="getShoppingNum" />

    <view v-if="isDomHeight && osName !== 'android'" id="footBottom"></view>
    <tab-bar :is-scroll="true" />
    <spec :is-popup="isPopup" :is-category="true" :product-model="productModel" @close="closePopup" />

    <view v-if="openPopCate" class="pop-bg" @tap="openPopCate = false">
      <view class="pop-cate">
        <view class="ww100" :style="{ height: searchHeight + 'px' }"></view>
        <view
          v-for="(item, index) in childlist"
          :key="item.category_id || index"
          class="pop-cate-item text-ellipsis"
          :class="{ active: item.category_id === category_id }"
          @tap.stop="changeCategory(item.category_id)"
        >
          {{ item.name }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TabBar from '../../components/tabbar/footTabbar.vue'
import { addLocalCartItem, getLocalCartSummary } from '../../services/local-cart.js'
import {
  fetchCategories,
  fetchProductDetail,
  fetchProducts,
  normalizeCategory,
  normalizeProductDetail,
  normalizeProductList
} from '../../services/miniprogram-products.js'

let throttleTimer = null
function throttle(fn, wait = 500) {
  if (throttleTimer) return
  throttleTimer = setTimeout(() => {
    throttleTimer = null
  }, wait)
  if (typeof fn === 'function') fn()
}

export default {
  components: {
    TabBar,
    spec: () => import('./detail/popup/spec.vue'),
    categoryMaskVue: () => import('./categoryMask.vue')
  },
  data() {
    return {
      loading: true,
      searchName: '搜索商品',
      show_type: 10,
      style: 4,
      phoneHeight: 0,
      scrollviewHigh: 0,
      listData: [],
      childlist: [],
      select_index: 0,
      catename: '全部商品',
      productlist: [],
      page: 1,
      category_id: 0,
      tableData: [],
      isLogin: true,
      shoppingNum: 0,
      shoppingPrice: null,
      productModel: {},
      isPopup: false,
      specData: null,
      detail: null,
      isDomHeight: true,
      shoppingHeight: 0,
      searchHeight: 0,
      footerHeight: 0,
      productArr: [],
      url: '',
      platFormType: '',
      osName: '',
      openPopCate: false,
      background: '#ffffff',
      no_more: false
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.productlist.length !== 0 && this.no_more ? 2 : 0
    },
    topSearchStyle() {
      const top = typeof this.topBarTop === 'function' ? this.topBarTop() : 0
      const height = typeof this.topBarHeight === 'function' ? this.topBarHeight() : 0
      return height === 0 ? '' : `height:${top + Math.max(height, 38) + 10}px;padding-top:${top}px`
    },
    categoryTabs() {
      return this.listData.length > 0 ? this.listData : [{ category_id: 0, name: '全部商品', child: [] }]
    },
    showCategoryType3() {
      return (this.show_type === 20 && (this.style === 1 || this.style === 2 || this.style === 3)) ||
        (this.show_type === 10 && (this.style === 1 || this.style === 2 || this.style === 4))
    }
  },
  onReady() {
    uni.hideTabBar()
  },
  onLoad() {
    const system = uni.getSystemInfoSync()
    this.platFormType = system.uniPlatform
    uni.getSystemInfo({
      success: (res) => {
        this.osName = res.osName
      }
    })
  },
  mounted() {
    this.init()
  },
  onShow() {
    this.productlist = []
    this.no_more = false
    this.page = 1
    this.select_index = 0
    this.getData()
  },
  onShareAppMessage() {
    return {
      title: '商品分类',
      path: '/pages/product/category?' + this.getShareUrlParams()
    }
  },
  methods: {
    lookProduct() {
      this.$refs.categoryMaskRef.open()
    },
    isBuyFast() {
      this.scrollviewHigh = this.phoneHeight - this.searchHeight - this.footerHeight
      return false
    },
    showTwo() {
      return (this.show_type === 20 && (this.style === 2 || this.style === 3)) || (this.show_type === 10 && this.style === 2)
    },
    init() {
      uni.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight
          uni.createSelectorQuery().select('#searchBox').boundingClientRect((rect) => {
            this.searchHeight = (rect && rect.height) || 0
            uni.createSelectorQuery().select('#footBottom').boundingClientRect((footerRect) => {
              this.footerHeight = (footerRect && footerRect.height) || 0
              this.scrollviewHigh = this.phoneHeight - this.searchHeight - this.footerHeight
            }).exec()
          }).exec()
          this.isDomHeight = false
        }
      })
    },
    hasImages(item) {
      return item.images != null && item.images.file_path != null ? item.images.file_path : ''
    },
    getData() {
      this.loading = true
      fetchCategories().then((data) => {
        const categories = Array.isArray(data) ? data.map(normalizeCategory) : []
        this.show_type = 10
        this.style = 2
        this.listData = categories
        if (this.listData && this.listData.length > 0) {
          if (this.listData[0].child && this.show_type === 20) {
            this.category_id = this.listData[0].child[0] ? this.listData[0].child[0].category_id : this.listData[0].category_id
            this.childlist = this.listData[0].child
          } else {
            this.category_id = this.listData[0].category_id
          }
        } else {
          this.category_id = 0
          this.childlist = []
        }
        if (this.style === 2 || ((this.show_type === 10 && this.style === 4) || (this.show_type === 20 && this.style === 3))) {
          this.getProduct()
        }
        this.background = '#ffffff'
        this.loading = false
      }).catch(() => {
        this.listData = []
        this.childlist = []
        this.category_id = 0
        this.productlist = []
        this.no_more = true
        this.loading = false
      })
    },
    changeCategory(categoryId) {
      this.category_id = categoryId
      this.productlist = []
      this.page = 1
      this.no_more = false
      this.openPopCate = false
      this.getProduct()
    },
    getCheckedIds() {
      const ids = []
      this.productArr.forEach((item) => {
        ids.push(`${item.cart_id}`)
      })
      return ids
    },
    Submit() {
      uni.showToast({ title: '购物车暂不支持结算', icon: 'none' })
    },
    getShoppingNum() {
      const summary = getLocalCartSummary()
      this.isLogin = true
      this.tableData = summary.productList
      this.productArr = summary.items
      this.shoppingNum = summary.totalNum
      this.shoppingPrice = summary.totalPrice
    },
    addShopping(item) {
      if (item.spec_type === 20) this.getSpecData(item.product_id)
      else this.addSingleSpec(item)
    },
    addSingleSpec(item) {
      addLocalCartItem({
        ...item,
        product_price: item.product_min_price || item.product_price,
        stock_num: item.product_stock,
        spec_sku_id: 0
      })
      this.getShoppingNum()
      uni.showToast({ title: '已加入购物车', icon: 'success' })
    },
    scrolltolowerFunc() {
      if (this.no_more) return
      this.page++
      if (this.page <= this.last_page) this.getProduct()
      else this.no_more = true
    },
    getSpecData(productId) {
      fetchProductDetail(productId).then((data) => {
        const detailData = normalizeProductDetail(data || {})
        if (detailData.specData) {
          this.isPopup = false
          this.detail = detailData.detail
          this.specData = detailData.specData
          this.initSpecData(detailData.specData)
        } else {
          uni.showToast({ title: '暂无规格，请于后台添加!', mask: false, duration: 1500, icon: 'none' })
        }
      }).catch(() => {
        uni.showToast({ title: '商品规格加载失败', mask: false, duration: 1500, icon: 'none' })
      })
    },
    initMaskPopup() {
      this.productModel = {
        specData: this.specData,
        detail: this.detail,
        productSpecArr: this.specData != null ? new Array(this.specData.spec_attr.length) : [],
        show_sku: {
          sku_image: '',
          price: 0,
          product_sku_id: 0,
          line_price: 0,
          stock: 0,
          sum: 1
        },
        plus_sku: null,
        type: 'card',
        plus_name: ''
      }
      this.isPopup = true
    },
    initSpecData(specData) {
      for (const index in specData.spec_attr) {
        for (const itemIndex in specData.spec_attr[index].spec_items) {
          specData.spec_attr[index].spec_items[itemIndex].checked = false
        }
      }
      this.specData = specData
      this.initMaskPopup()
    },
    closePopup() {
      this.isPopup = false
      this.getShoppingNum()
    },
    getProduct() {
      this.loading = true
      fetchProducts({
        page: this.page || 1,
        categoryId: this.category_id || '',
        search: '',
        sortType: '',
        sortPrice: '',
        pageSize: 20
      }).then((data) => {
        const list = normalizeProductList(data || {}, 20)
        this.loading = false
        this.productlist = this.productlist.concat(list.data)
        this.last_page = list.last_page
        if (list.last_page <= 1 || this.page >= list.last_page) this.no_more = true
      }).catch(() => {
        this.loading = false
        this.no_more = true
      })
    },
    selectCategory(index) {
      throttle(() => {
        const tabs = this.categoryTabs
        const selected = tabs[index]
        if (!selected) return
        if (this.show_type === 10) {
          this.select_index = index
          this.catename = selected.name
          this.changeCategory(selected.category_id)
        } else if (selected.child && selected.child.length > 0) {
          this.childlist = selected.child
          this.select_index = index
          this.catename = selected.name
          this.changeCategory(this.childlist[0].category_id)
        } else {
          this.select_index = index
          this.childlist = []
          this.catename = selected.name
          this.changeCategory(selected.category_id)
        }
      })
    },
    hasSelect() {},
    gotoList(categoryId) {
      this.gotoPage('/pagesPlus/main/product/list/list?category_id=' + categoryId + '&sortType=all&search=&sortPrice=0')
    },
    wxGetUserInfo(event) {
      if (!event.detail.iv) {
        uni.showToast({ title: '您取消了授权,登录失败', icon: 'none' })
        return false
      }
    },
    gotoSearch() {
      this.gotoPage('/pagesPlus/main/product/search/search')
    }
  }
}
</script>

<style>
page {
  min-height: 0;
}

.category-wrap {
  background: #fff;
  min-height: 0;
}

.pr { position: relative; }
.ww100 { width: 100%; }
.t-c,
.tc { text-align: center; }
.ml10 { margin-left: 10rpx; }
.f24 { font-size: 24rpx; }
.f28 { font-size: 28rpx; }
.f36 { font-size: 36rpx; }
.fb { font-weight: 700; }
.gray3 { color: #333; }

.index-search-box-cate {
  position: relative;
  z-index: 10;
  padding: 20rpx;
  background: #fff;
  box-sizing: border-box;
}

.index-search-cate {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 68rpx;
  border-radius: 34rpx;
  background: #f4f4f4;
  color: #999;
  font-size: 26rpx;
}

.foot_ {
  height: 50px;
  width: 100%;
}

.cotegory-padding {
  box-sizing: border-box;
  padding-bottom: calc(50px + 96rpx);
}

.cotegory-type {
  background: #fff;
  line-height: 40rpx;
}

.cotegory-type image {
  width: 100%;
}

.cotegory-type-1 .list {
  padding: 20rpx;
}

.cotegory-type-1 .list.cotegory-padding {
  box-sizing: border-box;
  padding-bottom: calc(50px + 96rpx);
}

.cotegory-type-1 .list .item {
  margin-top: 30rpx;
}

.cotegory-type-1 .list .item .pic {
  border-radius: 8px;
  height: auto;
  overflow: hidden;
  width: 710rpx;
}

.cotegory-type-1 .list .item image {
  height: 100%;
  width: 100%;
}

.cotegory-type-2 .list,
.cotegory-type-3 .list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 0 20rpx;
}

.cotegory-type-2 .list .item,
.cotegory-type-3 .list .item {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cotegory-type-3 .list .item {
  font-size: 24rpx;
  height: 200rpx;
  margin-right: 20rpx;
  margin-top: 40rpx;
  width: 140rpx;
}

.cotegory-type-2 .list .item {
  box-sizing: border-box;
  font-size: 28rpx;
  height: 300rpx;
  margin: 0 0 16rpx;
  padding: 0 16rpx;
  width: 33.3%;
}

.cotegory-type-2 .list .item image {
  margin-bottom: 20rpx;
  width: 100%;
}

.cotegory-type-3 {
  display: flex;
}

.cotegory-type-3 .category-tab {
  background: #fff;
  width: 200rpx;
}

[data-theme=theme0] .cotegory-type-3 .category-tab {
  background-color: rgba(255, 204, 0, .09) !important;
}

[data-theme=theme1] .cotegory-type-3 .category-tab {
  background-color: rgba(25, 173, 87, .05) !important;
}

[data-theme=theme2] .cotegory-type-3 .category-tab {
  background-color: rgba(255, 204, 0, .05) !important;
}

[data-theme=theme3] .cotegory-type-3 .category-tab {
  background-color: rgba(51, 167, 255, .05) !important;
}

[data-theme=theme4] .cotegory-type-3 .category-tab {
  background-color: hsla(0, 0%, 89%, .09) !important;
}

[data-theme=theme5] .cotegory-type-3 .category-tab {
  background-color: hsla(43, 31%, 69%, .05) !important;
}

[data-theme=theme6] .cotegory-type-3 .category-tab {
  background-color: rgba(98, 60, 235, .05) !important;
}

.showShopping {
  box-sizing: border-box;
  padding-bottom: 96rpx;
}

.cotegory-type-3 .category-tab .item {
  color: #666;
  font-size: 26rpx;
  font-weight: 700;
  padding: 40rpx 0;
  text-align: center;
}

.cotegory-type-3 .category-tab .item.active {
  background: #fff;
  color: #333;
  position: relative;
}

.cotegory-type-3 .category-tab .item.active:after {
  bottom: 40rpx;
  content: "";
  height: 22rpx;
  left: 0;
  margin: auto;
  position: absolute;
  top: 40rpx;
  width: 6rpx;
}

[data-theme=theme0] .cotegory-type-3 .category-tab .item.active:after {
  background: linear-gradient(180deg, #f11e0b, #f77636) !important;
}

[data-theme=theme1] .cotegory-type-3 .category-tab .item.active:after {
  background: linear-gradient(180deg, #19ad57, #148d47) !important;
}

[data-theme=theme2] .cotegory-type-3 .category-tab .item.active:after {
  background: linear-gradient(180deg, #f11e0b, #f77636) !important;
}

[data-theme=theme3] .cotegory-type-3 .category-tab .item.active:after {
  background: linear-gradient(180deg, #1774ff, #0e6bf5) !important;
}

[data-theme=theme4] .cotegory-type-3 .category-tab .item.active:after {
  background: linear-gradient(180deg, #2e2e2e, #424242) !important;
}

[data-theme=theme5] .cotegory-type-3 .category-tab .item.active:after {
  background: linear-gradient(180deg, #bfb18f, #c8ba97) !important;
}

[data-theme=theme6] .cotegory-type-3 .category-tab .item.active:after {
  background: linear-gradient(180deg, #592ef7, #623ceb) !important;
}

.cotegory-type-3 .category-content {
  flex: 1;
}

.cotegory-type-3 .list .item:nth-child(3n) {
  margin-right: 0;
}

.cotegory-type-3 .list .item image {
  height: 140rpx;
  width: 140rpx;
}

.cotegory-type-2 .list .item text,
.cotegory-type-3 .list .item text {
  color: #818181;
  display: block;
  font-size: 26rpx;
  height: 80rpx;
  line-height: 60rpx;
  margin-top: 20rpx;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.scroll-3 {
  background: #fff;
  border-radius: 12px;
  position: absolute;
}

.catename {
  border-bottom: 1rpx solid #eee;
  line-height: 60rpx;
  padding-top: 10rpx;
}

.catescroll2-top {
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20rpx 0 20rpx 20rpx;
  position: relative;
}

.open-jiantou {
  background-image: linear-gradient(270deg, #fff, rgba(255, 255, 255, 0));
  height: 58rpx;
  padding: 0 17rpx 0 0;
  position: absolute;
  right: 0;
  top: 20rpx;
  z-index: 2;
}

.open-jiantou .icon.icon-jiantouxia-copy {
  border-radius: 29rpx;
  color: #333;
  display: block;
  font-size: 22rpx;
  width: 58rpx;
}

.catescroll2-top-item,
.open-jiantou .icon.icon-jiantouxia-copy {
  background: #f6f6f6;
  height: 58rpx;
  line-height: 58rpx;
  text-align: center;
}

.catescroll2-top-item {
  border: 1rpx solid #f6f6f6;
  border-radius: 29rpx;
  box-sizing: border-box;
  color: #666;
  margin-right: 14rpx;
  padding: 0 23rpx;
  white-space: nowrap;
}

.catescroll2-top-item.active {
  border: 1rpx solid #ee252a;
  color: #fff;
}

[data-theme=theme0] .catescroll2-top-item.active {
  background-color: #ff5704 !important;
  border-color: #ff5704 !important;
}

[data-theme=theme1] .catescroll2-top-item.active {
  background-color: #19ad57 !important;
  border-color: #19ad57 !important;
}

[data-theme=theme2] .catescroll2-top-item.active {
  background-color: #fc0 !important;
  border-color: #fc0 !important;
}

[data-theme=theme3] .catescroll2-top-item.active {
  background-color: #33a7ff !important;
  border-color: #33a7ff !important;
}

[data-theme=theme4] .catescroll2-top-item.active {
  background-color: #e4e4e4 !important;
  border-color: #e4e4e4 !important;
}

[data-theme=theme5] .catescroll2-top-item.active {
  background-color: #c8ba97 !important;
  border-color: #c8ba97 !important;
}

[data-theme=theme6] .catescroll2-top-item.active {
  background-color: #623ceb !important;
  border-color: #623ceb !important;
}

.product-item-2:first-child {
  margin-top: 20rpx;
}

.product-item-2 {
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0 20rpx 25rpx;
}

.product-item-2 .image-boxs {
  border-radius: 20rpx;
  margin-right: 20rpx;
  overflow: hidden;
  position: relative;
}

.product-item-2 .image-boxs .sallsell-out {
  align-items: center;
  background: rgba(0, 0, 0, .45);
  display: flex;
  height: 194rpx;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 194rpx;
  z-index: 1;
}

.product-item-2 .image-boxs .sallsell-out .sallsell-out-btn {
  align-items: center;
  border: 1px solid #fff;
  border-radius: 5rpx;
  color: #fff;
  display: flex;
  font-size: 24rpx;
  height: 46rpx;
  justify-content: center;
  width: 106rpx;
}

.product-item-2 .image-boxs .product-image-2 {
  display: block;
  height: 194rpx;
  width: 194rpx;
}

.catescroll2-top::-webkit-scrollbar,
.uni-scroll-view::-webkit-scrollbar {
  -webkit-appearance: default-button;
  display: block;
  height: 0rpx !important;
  width: 0rpx !important;
}

.catescroll2-top::-webkit-scrollbar-thumb,
.uni-scroll-view::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 10px;
}

.catescroll2-top::-webkit-scrollbar-track,
.uni-scroll-view::-webkit-scrollbar-track {
  background: #ededed;
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, .2);
}

.product-info {
  height: 154rpx;
}

.price-wrap {
  position: relative;
  width: 100%;
}

.add-shopping-wrap {
  border-radius: 50%;
  height: 48rpx;
  line-height: 48rpx;
  position: absolute;
  right: 0;
  top: 0;
  width: 48rpx;
}

.add-shopping-wrap .icon {
  align-items: center;
  color: #fff;
  display: flex;
  font-weight: 400;
  height: 48rpx;
  justify-content: center;
  width: 48rpx;
}

#emptyShopping {
  height: 96rpx;
  opacity: 0;
  width: 100%;
}

#footBottom {
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
}

.shopping {
  background: #fff;
  border-top: 1px solid #eee;
  bottom: 0;
  box-sizing: border-box;
  height: 96rpx;
  left: 0;
  padding: 0 34rpx;
  position: fixed;
  width: 100%;
}

.shopping.H5 {
  bottom: var(--window-bottom, 0);
}

.shopping.customTabBar {
  bottom: calc(env(safe-area-inset-bottom) + 50px);
  z-index: 2;
}

.shopping .shopping-l .shopping-circle {
  background: #fff;
  border-radius: 50%;
  height: 70rpx;
  line-height: 70rpx;
  position: relative;
  width: 70rpx;
}

[data-theme=theme0] .shopping .shopping-l .shopping-circle,
[data-theme=theme0] .shopping .shopping-r {
  background-color: #ff5704 !important;
}

[data-theme=theme1] .shopping .shopping-l .shopping-circle,
[data-theme=theme1] .shopping .shopping-r {
  background-color: #19ad57 !important;
}

[data-theme=theme2] .shopping .shopping-l .shopping-circle,
[data-theme=theme2] .shopping .shopping-r {
  background-color: #fc0 !important;
}

[data-theme=theme3] .shopping .shopping-l .shopping-circle,
[data-theme=theme3] .shopping .shopping-r {
  background-color: #33a7ff !important;
}

[data-theme=theme4] .shopping .shopping-l .shopping-circle,
[data-theme=theme4] .shopping .shopping-r {
  background-color: #e4e4e4 !important;
}

[data-theme=theme5] .shopping .shopping-l .shopping-circle,
[data-theme=theme5] .shopping .shopping-r {
  background-color: #c8ba97 !important;
}

[data-theme=theme6] .shopping .shopping-l .shopping-circle,
[data-theme=theme6] .shopping .shopping-r {
  background-color: #623ceb !important;
}

.shopping .shopping-l .shopping-icon {
  font-size: 45rpx !important;
  margin-top: 3rpx;
  text-align: center;
}

[data-theme=theme0] .shopping .shopping-l .shopping-icon,
[data-theme=theme1] .shopping .shopping-l .shopping-icon,
[data-theme=theme2] .shopping .shopping-l .shopping-icon,
[data-theme=theme3] .shopping .shopping-l .shopping-icon,
[data-theme=theme4] .shopping .shopping-l .shopping-icon,
[data-theme=theme5] .shopping .shopping-l .shopping-icon,
[data-theme=theme6] .shopping .shopping-l .shopping-icon {
  color: #fff !important;
}

.shopping .shopping-l .shopping-num {
  border-radius: 50%;
  color: #fff;
  font-size: 23rpx;
  height: 28rpx;
  line-height: 28rpx;
  position: absolute;
  right: 0;
  text-align: center;
  top: 0;
  width: 28rpx;
}

[data-theme=theme0] .shopping .shopping-l .shopping-num {
  background-color: #ff4c01 !important;
}

[data-theme=theme1] .shopping .shopping-l .shopping-num {
  background-color: #e31c28 !important;
}

[data-theme=theme2] .shopping .shopping-l .shopping-num {
  background-color: #f55234 !important;
}

[data-theme=theme3] .shopping .shopping-l .shopping-num {
  background-color: #ff4645 !important;
}

[data-theme=theme4] .shopping .shopping-l .shopping-num {
  background-color: #ff4d4d !important;
}

[data-theme=theme5] .shopping .shopping-l .shopping-num {
  background-color: #e7032c !important;
}

[data-theme=theme6] .shopping .shopping-l .shopping-num {
  background-color: #e31c28 !important;
}

.shopping .shopping-l .shopping-price {
  font-size: 36rpx;
  font-weight: 700;
  margin-left: 42rpx;
}

[data-theme=theme0] .shopping .shopping-l .shopping-price {
  color: #ff5704 !important;
}

[data-theme=theme1] .shopping .shopping-l .shopping-price {
  color: #19ad57 !important;
}

[data-theme=theme2] .shopping .shopping-l .shopping-price {
  color: #fc0 !important;
}

[data-theme=theme3] .shopping .shopping-l .shopping-price {
  color: #33a7ff !important;
}

[data-theme=theme4] .shopping .shopping-l .shopping-price {
  color: #e4e4e4 !important;
}

[data-theme=theme5] .shopping .shopping-l .shopping-price {
  color: #c8ba97 !important;
}

[data-theme=theme6] .shopping .shopping-l .shopping-price {
  color: #623ceb !important;
}

.shopping .shopping-l .shopping-price .shopping-symbol {
  font-size: 22rpx;
}

.shopping .shopping-r {
  border-radius: 31rpx;
  color: #fff;
  font-size: 30rpx;
  height: 62rpx;
  line-height: 62rpx;
  width: 178rpx;
}

.pop-bg {
  align-items: flex-start;
  background: rgba(0, 0, 0, .7);
  bottom: 0;
  display: flex;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
}

.pop-bg .pop-cate {
  align-items: center;
  background-color: #fff;
  border-radius: 0rpx 0rpx 20rpx 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 15rpx 12rpx;
  width: 100%;
}

.pop-bg .pop-cate .pop-cate-item {
  align-items: center;
  background: #f4f4f4;
  border-radius: 58rpx;
  color: #666;
  display: flex;
  font-size: 24rpx;
  height: 58rpx;
  justify-content: center;
  margin: 15rpx 12rpx;
  padding: 0 24rpx;
  white-space: nowrap;
}

[data-theme=theme0] .pop-bg .pop-cate .pop-cate-item.active {
  background-color: #ff5704 !important;
}

[data-theme=theme1] .pop-bg .pop-cate .pop-cate-item.active {
  background-color: #19ad57 !important;
}

[data-theme=theme2] .pop-bg .pop-cate .pop-cate-item.active {
  background-color: #fc0 !important;
}

[data-theme=theme3] .pop-bg .pop-cate .pop-cate-item.active {
  background-color: #33a7ff !important;
}

[data-theme=theme4] .pop-bg .pop-cate .pop-cate-item.active {
  background-color: #e4e4e4 !important;
}

[data-theme=theme5] .pop-bg .pop-cate .pop-cate-item.active {
  background-color: #c8ba97 !important;
}

[data-theme=theme6] .pop-bg .pop-cate .pop-cate-item.active {
  background-color: #623ceb !important;
}

[data-theme=theme0] .pop-bg .pop-cate .pop-cate-item.active,
[data-theme=theme1] .pop-bg .pop-cate .pop-cate-item.active,
[data-theme=theme2] .pop-bg .pop-cate .pop-cate-item.active,
[data-theme=theme3] .pop-bg .pop-cate .pop-cate-item.active,
[data-theme=theme4] .pop-bg .pop-cate .pop-cate-item.active,
[data-theme=theme5] .pop-bg .pop-cate .pop-cate-item.active,
[data-theme=theme6] .pop-bg .pop-cate .pop-cate-item.active {
  color: #fff !important;
}

/* Final uni-app overrides for legacy category layout parity. */
.category-wrap {
  height: 100vh;
  overflow: hidden;
}

.category-wrap > .category-content {
  width: 100%;
}

.category-wrap .index-search-box-cate {
  align-items: center;
  gap: 16rpx;
  min-height: 108rpx;
  padding: 20rpx;
}

.category-wrap .index-search-cate {
  min-width: 0;
}

.category-wrap .index-search-cate .iconfont {
  font-size: 28rpx;
  line-height: 1;
}

.category-wrap .wx-top-right {
  flex: 0 0 200rpx;
  height: 2rpx;
  width: 200rpx;
}

.cotegory-type-3 {
  align-items: stretch;
  display: flex;
  width: 100%;
}

.cotegory-type-3 .category-tab {
  flex: 0 0 200rpx;
  overflow: hidden;
  width: 200rpx;
}

.cotegory-type-3 > .category-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.cotegory-type-3 .scroll-3 {
  border-radius: 0;
  box-sizing: border-box;
  left: 0;
  position: relative;
  top: 0;
  width: 100%;
}

.cotegory-type-3 .category-content .cotegory-padding {
  padding: 0 0 calc(50px + 60rpx + env(safe-area-inset-bottom));
}

.product-item-2 {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  margin: 18rpx 20rpx 26rpx;
  width: auto;
}

.product-item-2:first-child {
  margin-top: 20rpx;
}

.product-item-2 .image-boxs {
  border-radius: 14rpx;
  flex: 0 0 176rpx;
  height: 176rpx;
  margin-right: 20rpx;
  width: 176rpx;
}

.product-item-2 .image-boxs .product-image-2 {
  height: 176rpx;
  width: 176rpx;
}

.product-item-2 .product-info {
  flex: 1;
  min-width: 0;
  padding: 4rpx 0;
}

.product-item-2 .price-wrap {
  min-height: 50rpx;
  padding-right: 0;
}

.product-item-2 .f36 {
  font-size: 32rpx;
}

.product-item-2 .f28 {
  font-size: 27rpx;
  line-height: 38rpx;
}

.theme-price {
  color: #ff5704;
}

.theme-bg {
  background-color: #ff5704;
}
</style>
