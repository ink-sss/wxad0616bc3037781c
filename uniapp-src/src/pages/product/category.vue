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
              <view v-for="(item, index) in listData" :key="item.category_id || index" :class="select_index === index ? 'item active' : 'item'" @tap="selectCategory(index)">
                <text>{{ item.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view v-if="(style === 1 && show_type === 20) || (style === 4 && show_type === 10)" class="category-tab f-s-0">
          <scroll-view class="scroll-Y" scroll-y :style="{ height: scrollviewHigh + 'px' }">
            <view class="cotegory-padding">
              <view v-for="(item, index) in listData" :key="item.category_id || index" :class="select_index === index ? 'item active' : 'item'" @tap="selectCategory(index)">
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
                <view class="flex-1 d-c d-b-s product-info">
                  <view class="text-ellipsis-2 f28 gray3">{{ item.product_name }}</view>
                  <view class="theme-price f36 fb price-wrap">
                    <text class="f24">￥</text>{{ item.product_min_price }}
                    <view v-if="shoppingPrice && item.isActivity !== 1 && isBuyFast() && item.is_virtual !== 1 && item.custom_form === ''" class="add-shopping-wrap theme-bg" @tap.stop="addShopping(item)">
                      <view class="icon iconfont icon-icozhuanhuan"></view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <category-mask-vue ref="categoryMaskRef" :data-list="productArr" @get-shopping-num="getShoppingNum" />

    <view v-if="isBuyFast()" id="shopping" class="shopping d-b-c customTabBar">
      <view class="shopping-l d-s-c">
        <view class="shopping-circle" @tap="lookProduct">
          <view class="shopping-icon icon iconfont icon-icozhuanhuan"></view>
          <view v-if="shoppingNum && shoppingNum !== 0" class="shopping-num">{{ shoppingNum }}</view>
        </view>
        <view class="shopping-price d-s-c">
          <view class="shopping-symbol">￥</view>
          <view>{{ shoppingPrice }}</view>
        </view>
      </view>
      <button class="shopping-r" @tap="Submit">去结算</button>
    </view>

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
      show_type: 3,
      style: 1,
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
      isLogin: false,
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
      openPopCate: false
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.productlist.length !== 0 && this.no_more ? 2 : 0
    },
    topSearchStyle() {
      return this.topBarHeight && this.topBarHeight() === 0 ? '' : `height:${this.topBarHeight()}px;padding-top:${this.topBarTop()}px`
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
      title: this.templet.share_title,
      path: '/pages/product/category?' + this.getShareUrlParams()
    }
  },
  methods: {
    lookProduct() {
      this.$refs.categoryMaskRef.open()
    },
    isBuyFast() {
      if (this.isLogin && ((this.show_type === 10 && this.style === 4) || (this.show_type === 20 && this.style === 3))) {
        const height = this.phoneHeight - this.searchHeight - this.shoppingHeight
        this.scrollviewHigh = height - this.footerHeight
        return true
      }
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
          }).exec()
          uni.createSelectorQuery().select('#footBottom').boundingClientRect((rect) => {
            if (rect && rect.height) this.footerHeight = rect.height
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
      this._get('product.category/index', {}, (res) => {
        this.show_type = res.data.template.category_style
        this.style = res.data.template.wind_style
        this.listData = res.data.list
        if (this.listData && this.listData.length > 0) {
          if (this.listData[0].child && this.show_type === 20) {
            this.category_id = this.listData[0].child[0].category_id
            this.childlist = this.listData[0].child
          } else {
            this.category_id = this.listData[0].category_id
          }
        }
        if (this.style === 2 || ((this.show_type === 10 && this.style === 4) || (this.show_type === 20 && this.style === 3))) {
          this.getProduct()
          if ((this.show_type === 10 && this.style === 4) || (this.show_type === 20 && this.style === 3)) this.getShoppingNum()
        }
        this.background = res.data.background
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
      const ids = this.getCheckedIds()
      if (ids.length === 0) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return false
      }
      this.gotoPage('/pages/order/confirm-order?order_type=cart&cart_ids=' + ids)
    },
    getShoppingNum() {
      this._post('product.Category/lists', {}, (res) => {
        const productList = res.data.productList
        this.isLogin = false
        if (productList) {
          this.isLogin = true
          this.tableData = productList
          let num = 0
          let price = 0
          const products = []
          productList.forEach((supplier) => {
            if (supplier.productList && supplier.productList.length > 0) {
              supplier.productList.forEach((item) => {
                products.push(item)
                num += item.total_num
                price += parseFloat(item.total_num) * parseFloat(item.product_price)
              })
            }
          })
          this.productArr = products
          this.shoppingNum = num
          this.shoppingPrice = price.toFixed(2)
        }
      }, () => {
        this.productlist = []
        this.no_more = false
        this.page = 1
        this.getData()
      })
    },
    addShopping(item) {
      if (item.spec_type === 20) this.getSpecData(item.product_id)
      else this.addSingleSpec(item.product_id)
    },
    addSingleSpec(productId) {
      this._post('order.cart/add', {
        product_id: productId,
        total_num: 1,
        spec_sku_id: 0
      }, () => {
        this.getShoppingNum()
      })
    },
    scrolltolowerFunc() {
      if (this.no_more) return
      this.page++
      if (this.page <= this.last_page) this.getProduct()
      else this.no_more = true
    },
    getSpecData(productId) {
      this._get('product.product/detail', {
        product_id: productId,
        url: this.url,
        visitcode: this.getVisitcode()
      }, (res) => {
        if (res.data.specData) {
          this.isPopup = false
          this.detail = res.data.detail
          this.specData = res.data.specData
          this.initSpecData(res.data.specData)
        } else {
          uni.showToast({ title: '暂无规格，请于后台添加!', mask: false, duration: 1500, icon: 'none' })
        }
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
      this._get('product.product/lists', {
        page: this.page || 1,
        category_id: this.category_id,
        search: '',
        sortType: '',
        sortPrice: '',
        list_rows: 20
      }, (res) => {
        this.loading = false
        this.productlist = this.productlist.concat(res.data.list.data)
        this.last_page = res.data.list.last_page
        if (res.data.list.last_page <= 1) this.no_more = true
      })
    },
    selectCategory(index) {
      throttle(() => {
        if (this.show_type === 10) {
          this.select_index = index
          this.catename = this.listData[this.select_index].name
          this.changeCategory(this.listData[this.select_index].category_id)
        } else if (this.listData[index].child) {
          this.childlist = this.listData[index].child
          this.select_index = index
          this.catename = this.listData[this.select_index].name
          this.changeCategory(this.childlist[0].category_id)
        } else {
          this.select_index = index
          this.childlist = []
          this.catename = this.listData[this.select_index].name
          this.changeCategory(this.listData[this.select_index].category_id)
        }
      })
    },
    hasSelect() {},
    gotoList(categoryId) {
      this.gotoPage('/pages/product/list/list?category_id=' + categoryId + '&sortType=all&search=&sortPrice=0')
    },
    wxGetUserInfo(event) {
      if (!event.detail.iv) {
        uni.showToast({ title: '您取消了授权,登录失败', icon: 'none' })
        return false
      }
    },
    gotoSearch() {
      this.gotoPage('/pages/product/search/search')
    }
  }
}
</script>

<style scoped>
.category-wrap {
  min-height: 0;
  background: #fff;
}

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
</style>
