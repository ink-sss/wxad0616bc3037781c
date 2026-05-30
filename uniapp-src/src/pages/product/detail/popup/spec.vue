<template>
  <view :class="Visible ? 'product-popup open' : 'product-popup close'" @tap="closePopup">
    <view class="popup-bg"></view>
    <view class="main" @tap.stop>
      <view class="header">
        <image class="avt" mode="aspectFill" :src="form.show_sku.sku_image" @tap="yulan(form.show_sku.sku_image, 0)" />
        <view class="price">
          ¥<text class="num">{{ form.show_sku.product_price }}</text>
          <text v-if="Number(form.show_sku.line_price) > 0" class="old-price">¥{{ form.show_sku.line_price }}</text>
        </view>
        <view class="stock">库存：{{ form.show_sku.stock_num }}</view>
        <view class="select_spec">{{ selectSpec }}</view>
        <view v-if="isAll && form.show_sku.product_weight > 0" class="stock">重量: {{ form.show_sku.product_weight }}kg</view>
        <view class="close-btn" @tap="closePopup">
          <text class="icon iconfont icon-guanbi"></text>
        </view>
      </view>

      <view class="body">
        <scroll-view v-if="form.specData != null" class="specs mt20" scroll-y style="max-height:600rpx">
          <view v-for="(attr, attrIndex) in form.specData.spec_attr" :key="attrIndex" class="specs mt20">
            <view class="specs-hd p-20-0"><text class="f26 gray3">{{ attr.group_name }}</text></view>
            <view class="specs-list">
              <button
                v-for="(item, itemIndex) in attr.spec_items"
                :key="item.item_id || itemIndex"
                :class="item.checked ? 'btn-checked' : 'btn-checke'"
                @tap="selectAttr(attrIndex, itemIndex)"
              >
                {{ item.spec_value }}
              </button>
            </view>
          </view>
        </scroll-view>

        <view class="level-box count_choose">
          <view class="d-s-c">
            <text class="key">数量</text>
            <text v-if="form.detail.single_num > 0" class="theme-price">({{ form.detail.single_num }}个{{ form.plus_name === 'seckill' ? '限购' : '起售' }})</text>
          </view>
          <view class="d-s-c">
            <view class="icon-box minus d-c-c" :class="{ 'num-wrap': issub }" @tap="sub">
              <text class="icon iconfont icon-jian_sekuai"></text>
            </view>
            <view class="text-wrap">
              <input v-model="form.show_sku.sum" type="text" />
            </view>
            <view class="icon-box plus d-c-c" :class="{ 'num-wrap': isadd }" @tap="add">
              <text class="icon iconfont icon-zengjia"></text>
            </view>
          </view>
        </view>
      </view>

      <view class="btns">
        <button v-if="specDisabled" class="confirm-btn">暂未开始售卖</button>
        <button v-else-if="!clock" class="confirm-btn" @tap="confirmFunc">确认</button>
        <button v-else class="confirm-btn">暂无库存</button>
      </view>
    </view>
  </view>
</template>

<script>
function cloneFallbackModel() {
  return {
    detail: { image: [{ file_path: '' }], product_stock: 0, product_price: 0, line_price: 0 },
    show_sku: { sku_image: '', sum: 1, stock_num: 0 },
    specData: null,
    productSpecArr: [],
    type: '',
    plus_sku: null,
    plus_name: ''
  }
}

export default {
  props: {
    isPopup: Boolean,
    productModel: {
      type: Object,
      default: cloneFallbackModel
    },
    room_id: {
      type: [String, Number],
      default: ''
    },
    specDisabled: Boolean,
    isCategory: Boolean
  },
  data() {
    return {
      Visible: false,
      form: cloneFallbackModel(),
      stock: 0,
      selectSpec: '',
      isOpenSpec: false,
      type: '',
      clock: false,
      isAll: false
    }
  },
  computed: {
    isadd() {
      return this.form.show_sku.sum >= this.stock || this.form.show_sku.sum >= this.form.detail.limit_num
    },
    issub() {
      return this.form.show_sku.sum <= 1
    }
  },
  watch: {
    isPopup(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.Visible = newValue
        if (!this.isOpenSpec || (this.isOpenSpec && this.isCategory)) {
          this.form = this.productModel || cloneFallbackModel()
          this.isOpenSpec = true
          this.initShowSku()
        }
        this.form.type = this.productModel.type
      }
    },
    'form.specData': {
      handler(specData) {
        let unselected = ''
        let selected = ''
        this.isAll = true
        if (specData) {
          for (let index = 0; index < specData.spec_attr.length; index++) {
            if (this.form.productSpecArr[index] == null) {
              this.isAll = false
              unselected += specData.spec_attr[index].group_name + ' '
            } else {
              specData.spec_attr[index].spec_items.forEach((item) => {
                if (this.form.productSpecArr[index] === item.item_id) selected += '"' + item.spec_value + '" '
              })
            }
          }
          this.selectSpec = this.isAll ? '已选: ' + selected : '请选择: ' + unselected
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initShowSku() {
      this.form.show_sku.sku_image = this.form.detail.image[0].file_path
      this.form.show_sku.product_price = this.form.detail.product_price
      if (this.form.detail.spec_type === 20 && this.form.detail.product_price !== this.form.detail.product_max_price) {
        this.form.show_sku.product_price = this.form.detail.product_price + '-' + this.form.detail.product_max_price
      }
      this.form.show_sku.spec_sku_id = 0
      this.form.show_sku.line_price = this.form.detail.line_price
      this.form.show_sku.stock_num = this.form.detail.product_stock
      this.stock = this.form.detail.product_stock
      if (this.form.plus_name === 'advance') {
        this.form.show_sku.product_price = this.form.plus_sku[0].product_price
        this.form.show_sku.line_price = ''
        this.form.show_sku.sku_image = this.form.plus_sku[0].productSku.image ? this.form.plus_sku[0].productSku.image.file_path : this.form.detail.image[0].file_path
        this.form.show_sku.stock_num = this.form.plus_sku[0].advance_stock
        this.stock = this.form.plus_sku[0].advance_stock
      }
      if (this.form.plus_name === 'seckill') {
        this.form.show_sku.product_price = this.form.plus_sku[0].seckill_price
        this.form.show_sku.line_price = this.form.plus_sku[0].product_price
        this.form.show_sku.sku_image = this.form.plus_sku[0].productSku.image ? this.form.plus_sku[0].productSku.image.file_path : this.form.detail.image[0].file_path
        this.form.show_sku.stock_num = this.form.plus_sku[0].seckill_stock
        this.stock = this.form.plus_sku[0].seckill_stock
      }
    },
    selectAttr(attrIndex, itemIndex) {
      const items = this.form.specData.spec_attr[attrIndex].spec_items
      const item = items[itemIndex]
      if (item.checked) {
        item.checked = false
        this.form.productSpecArr[attrIndex] = null
      } else {
        items.forEach((specItem) => {
          specItem.checked = false
        })
        item.checked = true
        this.form.productSpecArr[attrIndex] = item.item_id
      }
      for (let i = 0; i < this.form.productSpecArr.length; i++) {
        if (this.form.productSpecArr[i] == null) {
          this.initShowSku()
          return
        }
      }
      this.updateSpecProduct()
    },
    updateSpecProduct() {
      const specSkuId = this.form.productSpecArr.join('_')
      let specList = this.form.specData.spec_list
      if (this.form.plus_sku != null) specList = this.form.plus_sku
      const spec = specList.find((item) => this.form.plus_name ? item.productSku.spec_sku_id === specSkuId : item.spec_sku_id === specSkuId)
      if (!spec) {
        this.clock = true
        this.initShowSku()
        return
      }
      this.clock = false
      if (this.form.plus_name && !spec.spec_form) spec.spec_form = spec.productSku
      if (typeof spec === 'object') {
        if (this.form.plus_name) {
          this.stock = spec[this.form.plus_name + '_stock']
          if (this.form.show_sku.sum > this.stock) this.form.show_sku.sum = this.stock > 0 ? this.stock : 1
        } else {
          this.stock = spec.spec_form.stock_num
          if (this.form.show_sku.sum > this.stock) this.form.show_sku.sum = this.stock > 0 ? this.stock : 1
        }
        this.form.show_sku.spec_sku_id = specSkuId
        this.form.show_sku.product_price = spec.spec_form.product_price
        this.form.show_sku.line_price = spec.spec_form.line_price
        this.form.show_sku.product_weight = spec.spec_form.product_weight
        this.form.show_sku.sku_image = spec.spec_form.image_id > 0 ? spec.spec_form.image_path : this.form.detail.image[0].file_path
        this.form.show_sku.stock_num = spec.spec_form.stock_num
        if (this.form.plus_name) {
          this.form.show_sku.product_price = spec.product_price
          if (this.form.plus_name === 'seckill') this.form.show_sku.product_price = spec.seckill_price
          this.form.show_sku.stock_num = spec[this.form.plus_name + '_stock']
          this.form.show_sku.line_price = ''
          this.form.show_sku.sku_image = spec.spec_form.image ? spec.spec_form.image.file_path : this.form.detail.image[0].file_path
          this.form.show_sku.advance_product_id = spec.spec_form.image ? spec.spec_form.image.file_path : this.form.detail.image[0].file_path
        }
      }
    },
    closePopup() {
      this.$emit('close', this.form.specData, null)
    },
    confirmFunc() {
      if (this.form.specData != null) {
        for (let index = 0; index < this.form.productSpecArr.length; index++) {
          if (this.form.productSpecArr[index] == null) {
            uni.showToast({ title: '请选择规格', icon: 'none', duration: 2000 })
            return
          }
        }
      }
      if (this.form.type === 'card') this.addCart()
      else this.createdOrder()
    },
    addCart() {
      const productId = this.form.detail.product_id
      const totalNum = this.form.show_sku.sum
      const specSkuId = this.form.show_sku.spec_sku_id
      if (this.form.detail.spec_type === 20 && specSkuId === 0) {
        uni.showToast({ title: '请选择属性', icon: 'none', duration: 2000 })
        return false
      }
      this._post('order.cart/add', {
        product_id: productId,
        total_num: totalNum,
        spec_sku_id: specSkuId
      }, (res) => {
        uni.showToast({ title: res.msg, duration: 2000 })
        this.$emit('close', null, res.data.cart_total_num)
      })
    },
    createdOrder() {
      const productId = this.form.detail.product_id
      const totalNum = this.form.show_sku.sum
      const specSkuId = this.form.show_sku.spec_sku_id
      let room = ''
      if (this.room_id !== 0 && this.room_id !== '') room = '&room_id=' + this.room_id
      let url = `/pages/order/confirm-order?product_id=${productId}&product_num=${totalNum}&product_sku_id=${specSkuId}&order_type=buy${room}`
      if (this.form.type === 'deposit') {
        if (this.form.plus_name === 'advance') {
          const advanceSku = this.form.detail.advance.sku.find((item) => item.productSku.spec_sku_id === specSkuId)
          url = `/pages/order/confirm-order?product_id=${productId}&product_num=${totalNum}&product_sku_id=${specSkuId}&advance_product_sku_id=${advanceSku.advance_product_sku_id}&advance_product_id=${advanceSku.advance_product_id}&order_type=deposit`
        }
        if (this.form.plus_name === 'seckill') {
          const seckillSku = this.form.plus_sku.find((item) => item.productSku.spec_sku_id === specSkuId)
          url = `/pages/order/confirm-order?seckill_product_id=${seckillSku.seckill_product_id}&product_num=${totalNum}&time_id=${this.form.time_id}&product_sku_id=${seckillSku.productSku.spec_sku_id}&seckill_product_sku_id=${seckillSku.seckill_product_sku_id}&order_type=seckill`
        }
      }
      this.gotoPage(url)
    },
    add() {
      if (this.stock <= 0) return
      if (this.form.plus_name === 'seckill' && this.form.detail.single_num > 0 && this.form.show_sku.sum >= this.form.detail.single_num) {
        uni.showToast({ title: '数量超过了限购数量', icon: 'none', duration: 2000 })
        return false
      }
      if (this.form.show_sku.sum >= this.stock) {
        uni.showToast({ title: '数量超过了库存', icon: 'none', duration: 2000 })
        return false
      }
      if (this.form.detail.limit_num > 0 && this.form.show_sku.sum >= this.form.detail.limit_num) {
        uni.showToast({ title: '数量超过了限购数量', icon: 'none', duration: 2000 })
        return false
      }
      this.form.show_sku.sum++
    },
    sub() {
      if (this.stock <= 0) return
      if (this.form.plus_name !== 'seckill' && this.form.detail.single_num > 0 && this.form.show_sku.sum <= this.form.detail.single_num) {
        uni.showToast({ title: `该商品数量${this.form.detail.single_num}起购`, icon: 'none', duration: 2000 })
        return false
      }
      if (this.form.show_sku.sum < 2) {
        uni.showToast({ title: '商品数量至少为1', icon: 'none', duration: 2000 })
        return false
      }
      this.form.show_sku.sum--
    }
  }
}
</script>

<style scoped>
.product-popup { position: fixed; inset: 0; z-index: 90; pointer-events: none; opacity: 0; transition: opacity .2s; }
.product-popup.open { pointer-events: auto; opacity: 1; }
.popup-bg { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.main { position: absolute; left: 0; right: 0; bottom: 0; border-radius: 28rpx 28rpx 0 0; background: #fff; overflow: hidden; }
.header { position: relative; min-height: 180rpx; padding: 30rpx 84rpx 20rpx 190rpx; border-bottom: 1rpx solid #f2f2f2; box-sizing: border-box; }
.avt { position: absolute; left: 30rpx; top: -40rpx; width: 140rpx; height: 140rpx; border-radius: 16rpx; background: #f5f5f5; }
.price { color: #e2231a; font-size: 28rpx; font-weight: 700; }
.price .num { font-size: 42rpx; }
.old-price { margin-left: 16rpx; color: #999; font-size: 24rpx; text-decoration: line-through; }
.stock, .select_spec { margin-top: 8rpx; color: #666; font-size: 24rpx; }
.close-btn { position: absolute; right: 30rpx; top: 30rpx; color: #999; }
.body { padding: 0 30rpx 24rpx; }
.specs-hd { color: #333; }
.specs-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.specs-list button { margin: 0; padding: 0 28rpx; min-width: 120rpx; height: 56rpx; border-radius: 28rpx; font-size: 24rpx; line-height: 56rpx; }
.btn-checke { background: #f5f5f5; color: #333; }
.btn-checked { background: #ff5704; color: #fff; }
.level-box { display: flex; align-items: center; justify-content: space-between; padding-top: 30rpx; }
.key { margin-right: 12rpx; color: #333; font-size: 28rpx; }
.icon-box { width: 52rpx; height: 52rpx; border-radius: 50%; background: #f5f5f5; }
.icon-box.num-wrap { opacity: .45; }
.text-wrap input, .text-wrap { width: 84rpx; height: 52rpx; line-height: 52rpx; text-align: center; background: #f7f7f7; font-size: 26rpx; }
.btns { padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom)); }
.confirm-btn { height: 82rpx; border-radius: 41rpx; background: #ff5704; color: #fff; line-height: 82rpx; font-size: 30rpx; }
</style>
