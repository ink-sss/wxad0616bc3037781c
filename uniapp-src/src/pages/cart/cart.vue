<template>
  <view class="cart-page" :data-theme="theme && theme()">
    <view v-if="!loadding" class="card">
      <view class="cart-content" :class="{ pb100: totalNum > 0 && isEdit }">
        <template v-if="totalNum > 0">
          <view class="address-bar d-b-c">
            <view class="f24 gray3">
              共计<text class="f28 theme-price fb">{{ totalNum || 0 }}</text>件
            </view>
            <view class="f28 gray9" @tap="isEdit = !isEdit">
              <text v-if="isEdit">取消</text>
              <text v-else>编辑</text>
            </view>
          </view>

          <view class="section">
            <view v-for="(supplierItem, supplierIndex) in tableData" :key="supplierIndex">
              <view class="supplier_list">
                <view class="supplier_list_tit">
                  <checkbox-group v-if="isEdit" @change="checkStprItem(supplierItem, supplierIndex)">
                    <label class="d-c-c">
                      <checkbox class="checkbox" color="red" :checked="supplierItem.checked" value="cb" />
                    </label>
                  </checkbox-group>
                  <view v-if="store_open" class="d-a-c" @tap="gotoPage('/pagesPlus/main/shop/shop?shop_supplier_id=' + supplierItem.supplier.shop_supplier_id)">
                    <view class="icon iconfont icon-stores"></view>
                    <text class="f28 fb gray3">{{ supplierItem.supplier.name }}</text>
                  </view>
                </view>

                <view v-for="(item, productIndex) in supplierItem.productList" :key="item.cart_id || productIndex" class="item">
                  <checkbox-group v-if="isEdit" @change="checkItem(item, supplierIndex, productIndex)">
                    <label class="d-c-c">
                      <checkbox class="checkbox" color="red" :checked="item.checked" value="cb" />
                    </label>
                  </checkbox-group>
                  <view class="cover-box">
                    <image class="cover" mode="aspectFit" :src="item.product_image" @tap="gotoPage('/pages/product/detail/detail?product_id=' + item.product_id)" />
                  </view>
                  <view class="info">
                    <view class="title text-ellipsis">{{ item.product_name }}</view>
                    <view class="describe">{{ item.product_sku && item.product_sku.product_attr }}</view>
                    <view class="level-box count_choose">
                      <view class="price fb flex-1">¥<text class="num">{{ item.product_price }}</text></view>
                      <view class="num-wrap">
                        <view class="d-c-c" @tap.stop="reduceFunc(item)">
                          <image v-if="item.total_num > 1" lazy-load class="reduce_icon" mode="" src="https://man.lqjy.cc/static/icon/reduce.png" />
                          <image v-else lazy-load class="reduce_icon" mode="" src="https://man.lqjy.cc/static/icon/reduce-gray.png" />
                        </view>
                        <view class="text-wrap">{{ item.total_num }}</view>
                        <view v-if="item.product_sku && item.total_num < item.product_sku.stock_num" class="d-c-c" @tap.stop="addFunc(item)">
                          <image lazy-load class="add_icon" mode="" src="https://man.lqjy.cc/static/icon/add.png" />
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </template>

        <view v-else class="none-data-box cart_none">
          <image lazy-load class="cart_none_img" mode="widthFix" :src="config.pic_url + '/list-null.png'" />
          <view class="f26 gray9 pt10">购物车为空</view>
          <view class="f26 gray9 pt10">赶紧去逛逛，购买心仪的商品吧</view>
          <button class="theme-btn mt30 none_btn" @tap="gotoShop">去逛逛</button>
        </view>

        <view v-if="totalNum > 0 && isEdit" class="bottom-btns f28">
          <checkbox-group @change="onCheckedAll">
            <label class="d-c-c mr20 w-nr">
              <checkbox class="checkbox" color="red" :checked="checkedAll" value="cb" />全选
            </label>
          </checkbox-group>
          <view class="bottom-action pr20">
            <button class="delete-btn theme-btn mr20" type="primary" @tap="onDelete">删除</button>
          </view>
        </view>

        <recommend-product v-if="totalNum > 0" :location="10" />
      </view>
    </view>

    <request-loading v-if="isloadding" :loadding="isloadding" />
    <tab-bar />
  </view>
</template>

<script>
import RecommendProduct from '../../components/recommendProduct/recommendProduct.vue'
import RequestLoading from '../../components/liveloading.vue'
import TabBar from '../../components/tabbar/footTabbar.vue'
import {
  decrementLocalCartItem,
  getLocalCartSummary,
  incrementLocalCartItem,
  removeLocalCartItems
} from '../../services/local-cart.js'

export default {
  components: {
    RecommendProduct,
    RequestLoading,
    TabBar
  },
  data() {
    return {
      isloadding: true,
      loadding: true,
      isEdit: false,
      tableData: [],
      arrIds: [],
      checkedAll: false,
      totalPrice: 0,
      totalProduct: 0,
      store_open: 1,
      totalNum: 0
    }
  },
  onReady() {
    uni.hideTabBar()
  },
  onShow() {
    this.getData()
  },
  methods: {
    getData() {
      this.isloadding = true
      const summary = getLocalCartSummary()
      this.isloadding = false
      this.tableData = summary.productList || []
      this.store_open = 0
      this.totalNum = summary.totalNum
      this.tableData.forEach((supplier) => {
        supplier.checked = false
      })
      this.loadding = false
      this._initGoodsChecked()
    },
    _initGoodsChecked() {
      const checkedIds = this.getCheckedData()
      let count = 0
      this.tableData.forEach((supplier, supplierIndex) => {
        supplier.productList.forEach((item) => {
          count++
          item.checked = this.inArray(`${item.cart_id}`, checkedIds)
        })
        this.onUpsupChecked(this.tableData, supplierIndex)
      })
      this.totalProduct = count
      this.isEdit = false
      this.checkedAll = checkedIds.length === this.totalProduct
      this.updateTotalPrice()
    },
    getCheckedData() {
      return uni.getStorageSync('CheckedData') || []
    },
    checkItem(item, supplierIndex, productIndex) {
      item.checked = !item.checked
      this.tableData[supplierIndex].productList.splice(productIndex, 1, item)
      this.onUpsupChecked(this.tableData, supplierIndex)
      this.onUpdateChecked()
      this.updateTotalPrice()
      this.checkedAll = this.getCheckedData().length === this.totalProduct
    },
    onUpsupChecked(tableData, supplierIndex) {
      let checked = true
      for (let i = 0; i < tableData[supplierIndex].productList.length; i++) {
        if (!tableData[supplierIndex].productList[i].checked) checked = false
      }
      tableData[supplierIndex].checked = checked
    },
    onUpdateChecked() {
      const checkedIds = []
      this.tableData.forEach((supplier) => {
        supplier.productList.forEach((item) => {
          if (item.checked === true) checkedIds.push(`${item.cart_id}`)
        })
      })
      uni.setStorageSync('CheckedData', checkedIds)
    },
    checkStprItem(supplierItem) {
      supplierItem.checked = !supplierItem.checked
      supplierItem.productList.forEach((item) => {
        item.checked = supplierItem.checked
      })
      this.updateTotalPrice()
      this.onUpdateChecked()
      this.checkedAll = this.getCheckedData().length === this.totalProduct
    },
    onCheckedAll() {
      this.checkedAll = !this.checkedAll
      this.tableData.forEach((supplier) => {
        supplier.checked = this.checkedAll
        supplier.productList.forEach((item) => {
          item.checked = this.checkedAll
        })
      })
      this.updateTotalPrice()
      this.onUpdateChecked()
    },
    updateTotalPrice() {
      let total = 0
      this.tableData.forEach((supplier) => {
        supplier.productList.forEach((item) => {
          if (item.checked === true) total += item.total_num * item.product_price
        })
      })
      this.totalPrice = total.toFixed(2)
    },
    addFunc(item) {
      incrementLocalCartItem(item)
      this.getData()
    },
    reduceFunc(item) {
      if (item.total_num <= 1) return
      decrementLocalCartItem(item)
      this.getData()
    },
    onDelete() {
      const ids = this.getCheckedIds()
      if (!ids.length) {
        this.showError('您还没有选择商品')
        return false
      }
      uni.showModal({
        title: '提示',
        content: '您确定要移除选择的商品吗?',
        success: (modal) => {
          if (modal.confirm) {
            removeLocalCartItems(ids)
            this.getData()
          }
        }
      })
    },
    getCheckedIds() {
      const ids = []
      this.tableData.forEach((supplier) => {
        supplier.productList.forEach((item) => {
          if (item.checked === true) ids.push(`${item.cart_id}`)
        })
      })
      return ids
    },
    onDeleteEvent(ids) {
      ids.forEach((id) => {
        this.tableData.forEach((supplier, supplierIndex) => {
          if (id === `${supplier.cart_id}`) this.tableData.splice(supplierIndex, 1)
        })
      })
      this.$nextTick(() => {
        this.onUpdateChecked()
      })
      return true
    },
    inArray(value, list) {
      for (const index in list) {
        if (list[index] === value) return true
      }
      return false
    },
    gotoShop() {
      this.gotoPage('/pages/index/index')
    }
  }
}
</script>

<style scoped>
.cart-page {
  background: #f2f2f2;
  min-height: 100vh;
}

.card {
  box-sizing: border-box;
  min-height: calc(100vh - 50px - env(safe-area-inset-bottom));
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}

.cart-content {
  box-sizing: border-box;
  min-height: calc(100vh - 50px - env(safe-area-inset-bottom));
  position: relative;
}

.pb100 {
  padding-bottom: 100rpx;
}

.f24 { font-size: 24rpx; }
.f26 { font-size: 26rpx; }
.f28 { font-size: 28rpx; }
.f40 { font-size: 40rpx; }
.fb { font-weight: 700; }
.gray3 { color: #333; }
.gray9 { color: #999; }
.mr20 { margin-right: 20rpx; }
.mt30 { margin-top: 30rpx; }
.pr20 { padding-right: 20rpx; }
.pt10 { padding-top: 10rpx; }
.w-nr { white-space: nowrap; }

.theme-price,
.price {
  color: #ff5704;
}

.theme-btn {
  background: #ff5704;
  border: none;
  color: #fff;
}

.theme-btn::after {
  border: 0;
}

.checkbox {
  transform: scale(.7);
}

.address-bar {
  background: #fff;
  box-sizing: border-box;
  height: 92rpx;
  padding: 0 45rpx;
}

.section {
  background: #f2f2f2;
  box-sizing: border-box;
  padding: 20rpx;
}

.supplier_list {
  background: #fff;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.supplier_list_tit {
  align-items: center;
  border-bottom: 1px solid #eee;
  display: flex;
  height: 90rpx;
  margin: 0 23rpx;
}

.icon-stores {
  color: #333;
  font-size: 34rpx;
  margin: 0 17rpx;
}

.item {
  align-items: center;
  display: flex;
  margin: 0 26rpx;
  padding: 29rpx 0;
}

.cover-box {
  border-radius: 25rpx;
  flex: 0 0 102rpx;
  height: 102rpx;
  overflow: hidden;
  width: 102rpx;
}

.cover {
  border-radius: 25rpx;
  height: 102rpx;
  width: 102rpx;
}

.info {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  padding-left: 30rpx;
}

.title {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  font-size: 26rpx;
  line-height: 34rpx;
  overflow: hidden;
  width: 100%;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}

.describe {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: #999;
  display: -webkit-box;
  font-size: 24rpx;
  line-height: 32rpx;
  margin-top: 20rpx;
  min-height: 32rpx;
  overflow: hidden;
}

.level-box {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.price {
  font-size: 30rpx;
}

.price .num {
  font-size: 38rpx;
}

.num-wrap {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

.text-wrap {
  background: #f4f4f4;
  border-radius: 10rpx;
  font-size: 24rpx;
  height: 46rpx;
  line-height: 46rpx;
  margin: 0 10rpx;
  text-align: center;
  width: 66rpx;
}

.bottom-btns {
  align-items: center;
  background: #fff;
  bottom: calc(50px + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, .1);
  box-sizing: border-box;
  display: flex;
  height: 90rpx;
  justify-content: space-between;
  left: 0;
  padding: 0 0 0 20rpx;
  position: fixed;
  white-space: nowrap;
  width: 100%;
  z-index: 80;
}

.bottom-action {
  box-sizing: border-box;
  min-width: 0;
}

.total {
  min-width: 0;
}

.delete-btn {
  border-radius: 68rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  height: 68rpx;
  line-height: 68rpx;
  margin: 0;
  padding: 0;
  width: 222rpx;
}

.none-data-box {
  align-items: center;
  box-sizing: border-box;
  color: #999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 50px - env(safe-area-inset-bottom));
  padding: 120rpx 40rpx calc(50px + 120rpx + env(safe-area-inset-bottom));
  text-align: center;
  width: 100%;
}

.cart_none .cart_none_img {
  height: 222rpx;
  width: 348rpx;
}

.none_btn {
  border-radius: 44rpx;
  font-size: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
  width: 342rpx;
}

.add_icon,
.reduce_icon {
  height: 18rpx;
  width: 18rpx;
}

[data-theme=theme0] .theme-price,
[data-theme=theme0] .price { color: #ff5704 !important; }
[data-theme=theme1] .theme-price,
[data-theme=theme1] .price { color: #19ad57 !important; }
[data-theme=theme2] .theme-price,
[data-theme=theme2] .price { color: #ffcc00 !important; }
[data-theme=theme3] .theme-price,
[data-theme=theme3] .price { color: #33a7ff !important; }
[data-theme=theme4] .theme-price,
[data-theme=theme4] .price { color: #e4e4e4 !important; }
[data-theme=theme5] .theme-price,
[data-theme=theme5] .price { color: #c8ba97 !important; }
[data-theme=theme6] .theme-price,
[data-theme=theme6] .price { color: #623ceb !important; }

[data-theme=theme0] .theme-btn { background-color: #ff5704 !important; }
[data-theme=theme1] .theme-btn { background-color: #19ad57 !important; }
[data-theme=theme2] .theme-btn { background-color: #ffcc00 !important; }
[data-theme=theme3] .theme-btn { background-color: #33a7ff !important; }
[data-theme=theme4] .theme-btn { background-color: #e4e4e4 !important; }
[data-theme=theme5] .theme-btn { background-color: #c8ba97 !important; }
[data-theme=theme6] .theme-btn { background-color: #623ceb !important; }
</style>
