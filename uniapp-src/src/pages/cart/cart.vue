<template>
  <view class="cart-page" :data-theme="theme && theme()">
    <view v-if="!loadding" class="card">
      <view :class="{ pb100: totalNum > 0 }" style="position:relative">
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
                  <checkbox-group @change="checkStprItem(supplierItem, supplierIndex)">
                    <label class="d-c-c">
                      <checkbox class="checkbox" color="red" :checked="supplierItem.checked" value="cb" />
                    </label>
                  </checkbox-group>
                  <view v-if="store_open" class="d-a-c" @tap="gotoPage('/pages/shop/shop?shop_supplier_id=' + supplierItem.supplier.shop_supplier_id)">
                    <view class="icon iconfont icon-stores"></view>
                    <text class="f28 fb gray3">{{ supplierItem.supplier.name }}</text>
                  </view>
                </view>

                <view v-for="(item, productIndex) in supplierItem.productList" :key="item.cart_id || productIndex" class="item">
                  <checkbox-group @change="checkItem(item, supplierIndex, productIndex)">
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
                          <image v-if="item.total_num > 1" lazy-load class="reduce_icon" mode="" src="/static/icon/reduce.png" />
                          <image v-else lazy-load class="reduce_icon" mode="" src="/static/icon/reduce-gray.png" />
                        </view>
                        <view class="text-wrap">{{ item.total_num }}</view>
                        <view v-if="item.product_sku && item.total_num < item.product_sku.stock_num" class="d-c-c" @tap.stop="addFunc(item)">
                          <image lazy-load class="add_icon" mode="" src="/static/icon/add.png" />
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
          <image lazy-load class="cart_none_img" mode="widthFix" :src="config.pic_url + '/static/list-null.png'" />
          <view class="f26 gray9 pt10">购物车为空</view>
          <view class="f26 gray9 pt10">赶紧去逛逛，购买心仪的商品吧</view>
          <button class="theme-btn mt30 none_btn" @tap="gotoShop">去逛逛</button>
        </view>

        <view v-if="totalNum > 0" class="bottom-btns f28">
          <checkbox-group @change="onCheckedAll">
            <label class="d-c-c mr20 w-nr">
              <checkbox class="checkbox" color="red" :checked="checkedAll" value="cb" />全选
            </label>
          </checkbox-group>
          <view v-if="!isEdit" class="d-e-c pr20">
            <view class="total d-s-c flex-1 mr20">
              <text class="f28 gray3 w-nr">合计：</text>
              <view class="price fb f26">¥<text class="num f40">{{ totalPrice }}</text></view>
            </view>
            <button class="buy-btn theme-btn" type="primary" @tap="Submit">去结算</button>
          </view>
          <view v-else class="pr20">
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
      this._get('order.cart/lists', {}, (res) => {
        this.isloadding = false
        this.tableData = res.data.productList || []
        this.store_open = res.data.store_open
        this.totalNum = res.data.totalNum
        this.tableData.forEach((supplier) => {
          supplier.checked = false
        })
        this.loadding = false
        this._initGoodsChecked()
      }, () => {
        this.getData()
      })
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
    Submit() {
      const ids = this.getCheckedIds()
      if (ids.length === 0) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return false
      }
      this.gotoPage('/pages/order/confirm-order?order_type=cart&cart_ids=' + ids)
    },
    addFunc(item) {
      uni.showLoading({ title: '加载中' })
      this._post('order.cart/add', {
        product_id: item.product_id,
        spec_sku_id: item.spec_sku_id,
        total_num: 1
      }, () => {
        uni.hideLoading()
        this.loadding = false
        this.getData()
      }, () => {
        this.loadding = false
      })
    },
    reduceFunc(item) {
      if (item.total_num <= 1) return
      uni.showLoading({ title: '加载中' })
      this._post('order.cart/sub', {
        product_id: item.product_id,
        spec_sku_id: item.spec_sku_id
      }, () => {
        this.loadding = false
        uni.hideLoading()
        this.getData()
      }, () => {
        this.loadding = false
      })
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
            this._post('order.cart/delete', { cart_id: ids.join() }, () => {
              this.getData()
              this.onDeleteEvent(ids)
            })
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
.cart-page { min-height: 100vh; background: #f2f2f2; }
.card { padding-bottom: 50px; }
.pb100 { padding-bottom: 100rpx; }
.checkbox { transform: scale(.7); }
.address-bar { height: 92rpx; padding: 0 45rpx; background: #fff; }
.section { padding: 20rpx; background: #f2f2f2; }
.supplier_list { margin-bottom: 30rpx; border-radius: 15rpx; background: #fff; overflow: hidden; }
.supplier_list_tit { display: flex; align-items: center; height: 90rpx; margin: 0 23rpx; border-bottom: 1px solid #eee; }
.icon-stores { color: #333; font-size: 34rpx; margin: 0 17rpx; }
.item { display: flex; align-items: center; margin: 0 26rpx; padding-top: 29rpx; padding-bottom: 29rpx; }
.cover-box { overflow: hidden; }
.cover { width: 102rpx; height: 102rpx; border-radius: 25rpx; }
.info { flex: 1; min-width: 0; overflow: hidden; padding-left: 30rpx; box-sizing: border-box; }
.title { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; width: 100%; font-size: 26rpx; }
.describe { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 3; -webkit-box-orient: vertical; margin-top: 20rpx; color: #999; font-size: 24rpx; }
.level-box { display: flex; align-items: center; justify-content: space-between; margin-top: 20rpx; }
.price { color: #e2231a; font-size: 30rpx; }
.price .num { font-size: 38rpx; }
.num-wrap { display: flex; align-items: center; justify-content: flex-end; }
.text-wrap { width: 66rpx; height: 46rpx; margin: 0 10rpx; border-radius: 10rpx; background: #f4f4f4; line-height: 46rpx; text-align: center; font-size: 24rpx; }
.bottom-btns { position: fixed; left: 0; bottom: calc(50px + env(safe-area-inset-bottom)); z-index: 1000; display: flex; align-items: center; justify-content: space-between; width: 100%; height: 90rpx; padding: 0 0 0 20rpx; background: #fff; box-shadow: 0 -2rpx 8rpx rgba(0,0,0,.1); box-sizing: border-box; white-space: nowrap; }
.bottom-btns .w-nr { white-space: nowrap; }
.buy-btn, .delete-btn { width: 222rpx; height: 68rpx; margin: 0; border-radius: 68rpx; line-height: 68rpx; font-size: 28rpx; }
.buy-btn { display: flex; align-items: center; justify-content: center; text-align: center; }
.cart_none .cart_none_img { width: 348rpx; height: 222rpx; }
.none_btn { width: 342rpx; height: 88rpx; border-radius: 44rpx; line-height: 88rpx; font-size: 30rpx; }
.add_icon, .reduce_icon { width: 18rpx; height: 18rpx; }
</style>
