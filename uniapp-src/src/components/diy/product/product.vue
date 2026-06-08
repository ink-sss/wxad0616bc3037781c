<template>
  <view class="drag optional" :style="wrapperStyle">
    <view class="diy-product" :style="borderStyle">
      <view :class="['product-list-box', `column__${column}`]">
        <view v-for="col in columnCount" :key="col" :class="['product-list', `column__${column}`]">
          <view
            v-for="(product, index) in dataList"
            v-show="shouldShowInColumn(index, col - 1)"
            :key="product.product_id || index"
            class="product-item"
            :style="productStyle"
            @tap="gotoDetail(product.product_id)"
          >
            <image class="product-cover" mode="aspectFill" :src="product.image || product.product_image || product.imgUrl" :style="productRadiusStyle"></image>
            <view class="product-info">
              <view v-if="params.productName" class="product-name text-ellipsis-2" :style="`color:${styleConfig.product_name_color || ''};`">
                <text :class="styleConfig.nameWeight ? 'fb' : ''">{{ product.product_name }}</text>
              </view>
              <view class="price d-s-c">
                <view v-if="params.productPrice" :style="`color:${styleConfig.product_price_color || ''};`">
                  <text class="f22">¥</text><text class="f32 fb">{{ product.product_price }}</text>
                </view>
                <view v-if="params.linePrice && Number(product.line_price || 0) > 0" class="f22 ml10 gray9 text-d-line" :style="`color:${styleConfig.line_price_color || ''};`">
                  <text>¥</text><text>{{ product.line_price }}</text>
                </view>
              </view>
              <view class="d-s-c">
                <view v-if="params.productSales" class="product-sale">
                  <text :style="`color:${styleConfig.product_sales_color || ''};`">已售{{ product.product_sales }}件</text>
                </view>
                <view v-if="params.comment && product.goodRate" class="product-comment">
                  <text :style="`color:${styleConfig.product_comment_color || ''};`">好评率{{ product.goodRate }}</text>
                </view>
              </view>
              <view v-if="Number(params.showCart) === 1">
                <view v-if="Number(params.cartType) === 0" class="cart-btn" :style="cartStyle">
                  <text class="cart-text">{{ params.cartText || '购买' }}</text>
                </view>
                <view v-if="Number(params.cartType) === 1" class="cart-btn icon" :style="cartStyle">
                  <text class="icon iconfont icon-icozhuanhuan" :style="`color:${styleConfig.cart_text_color || ''};`"></text>
                </view>
                <view v-if="Number(params.cartType) === 2" class="cart-btn icon" :style="cartStyle">
                  <text class="icon iconfont icon-jia" :style="`color:${styleConfig.cart_text_color || ''};`"></text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiyProduct',
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    dataList() { return Array.isArray(this.itemData.data) ? this.itemData.data : [] },
    styleConfig() { return this.itemData.style || {} },
    params() { return this.itemData.params || {} },
    column() { return Number(this.params.column || 2) },
    columnCount() { return [2, 4].includes(this.column) ? 2 : 1 },
    wrapperStyle() {
      const s = this.styleConfig
      return `padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};margin-top:${this.toRpx(s.marginTop)};background:${s.background || ''};`
    },
    borderStyle() {
      if (![3, 4, 6].includes(this.column)) return ''
      const top = Number(this.styleConfig.topRadio || 0)
      const bottom = Number(this.styleConfig.bottomRadio || 0)
      return `border-top-left-radius:${top}px;border-top-right-radius:${top}px;border-bottom-left-radius:${bottom}px;border-bottom-right-radius:${bottom}px;background-image:linear-gradient(to right, ${this.styleConfig.bgcolor_color1 || '#fff'}, ${this.styleConfig.bgcolor_color2 || '#fff'});`
    },
    productStyle() {
      if ([3, 4, 6].includes(this.column)) return ''
      const top = Number(this.styleConfig.topRadio || 0)
      const bottom = Number(this.styleConfig.bottomRadio || 0)
      return `border-top-left-radius:${top}px;border-top-right-radius:${top}px;border-bottom-left-radius:${bottom}px;border-bottom-right-radius:${bottom}px;background-image:linear-gradient(to right, ${this.styleConfig.bgcolor_color1 || '#fff'}, ${this.styleConfig.bgcolor_color2 || '#fff'});`
    },
    productRadiusStyle() {
      const top = 2 * Number(this.styleConfig.productTopRadio || 0)
      const bottom = 2 * Number(this.styleConfig.productBottomRadio || 0)
      return `border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`
    },
    cartStyle() {
      return `color:${this.styleConfig.cart_text_color || ''};background-image:linear-gradient(to right, ${this.styleConfig.cart_color1 || '#fff'}, ${this.styleConfig.cart_color2 || '#fff'});`
    }
  },
  methods: {
    toRpx(value) { return `${2 * Number(value || 0)}rpx` },
    shouldShowInColumn(index, columnIndex) { return ![2, 4].includes(this.column) || index % 2 === columnIndex },
    gotoDetail(productId) { if (productId && typeof this.gotoPage === 'function') this.gotoPage(`/pages/product/detail/detail?product_id=${productId}`) }
  }
}
</script>
<style scoped>
.product-list-box.column__2,
.product-list-box.column__4 {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
}

.product-list .product-item {
  overflow: hidden;
}

.product-list.column__1 .product-item,
.product-list.column__4 .product-item {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.product-list.column__2 .product-item,
.product-list.column__3 .product-item,
.product-list.column__5 .product-item,
.product-list.column__6 .product-item {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-list.column__1 .product-item:last-child {
  margin-bottom: 0;
}

.product-list.column__1 .product-item {
  box-sizing: border-box;
  margin-bottom: 22rpx;
  padding: 20rpx 20rpx 30rpx;
  width: 100%;
}

.product-list.column__1 .product-cover {
  display: block;
  flex-shrink: 0;
  height: 220rpx;
  margin-right: 20rpx;
  width: 220rpx;
}

.product-list.column__1 .product-info {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 220rpx;
  position: relative;
}

.product-list.column__1 .product-name {
  flex: 1;
  font-size: 28rpx;
  margin-bottom: 32rpx;
}

.product-list.column__1 .price {
  margin-bottom: 10rpx;
}

.product-list.column__1 .product-sale {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.product-list.column__1 .product-comment {
  font-size: 24rpx;
}

.product-list.column__1 .cart-btn {
  bottom: 0;
  position: absolute;
  right: 0;
}

.product-list.column__2:first-child {
  margin-right: 18rpx;
}

.product-list.column__2 {
  flex: 1;
}

.product-list.column__2 .product-item:last-child {
  margin-bottom: 0;
}

.product-list.column__2 .product-item {
  margin-bottom: 22rpx;
  width: 100%;
}

.product-list.column__2 .product-cover {
  display: block;
  flex-shrink: 0;
  height: 342rpx;
  margin-bottom: 14rpx;
  width: 100%;
}

.product-list.column__2 .product-info {
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 18rpx 20rpx;
  position: relative;
  width: 100%;
}

.product-list.column__2 .product-name {
  flex: 1;
  font-size: 24rpx;
}

.product-list.column__2 .price {
  margin-bottom: 10rpx;
}

.product-list.column__2 .product-sale {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.product-list.column__2 .cart-btn {
  bottom: 20rpx;
  position: absolute;
  right: 20rpx;
}

.product-list.column__3 {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 20rpx 20rpx 0;
}

.product-list.column__3 .product-item:nth-child(3n) {
  margin-right: 0;
}

.product-list.column__3 .product-item {
  margin-bottom: 22rpx;
  margin-right: 20rpx;
  width: 31.3%;
}

.product-list.column__3 .product-cover {
  display: block;
  flex-shrink: 0;
  height: 210rpx;
  margin-bottom: 14rpx;
  width: 100%;
}

.product-list.column__3 .product-info {
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 18rpx;
  position: relative;
  width: 100%;
}

.product-list.column__3 .product-name {
  font-size: 24rpx;
  height: 72rpx;
  line-height: 36rpx;
}

.product-list.column__3 .price {
  margin-bottom: 0;
}

.product-list.column__3 .cart-btn {
  bottom: 0;
  position: absolute;
  right: 0;
}

.product-list.column__4 {
  flex: 1;
}

.product-list.column__4 .product-item:last-child {
  margin-bottom: 0;
}

.product-list.column__4 .product-item {
  box-sizing: border-box;
  margin-bottom: 22rpx;
  padding: 20rpx 20rpx 30rpx;
  width: 100%;
}

.product-list.column__4 .product-cover {
  display: block;
  flex-shrink: 0;
  height: 142rpx;
  margin-right: 14rpx;
  width: 142rpx;
}

.product-list.column__4 .product-info {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-height: 142rpx;
  position: relative;
}

.product-list.column__4 .product-name {
  flex: 1;
  font-size: 24rpx;
}

.product-list.column__4 .price {
  margin-bottom: 10rpx;
}

.product-list.column__5 {
  display: block;
}

.product-list.column__5 .product-item:last-child {
  margin-bottom: 0;
}

.product-list.column__5 .product-item {
  margin-bottom: 22rpx;
}

.product-list.column__5 .product-cover {
  display: block;
  flex-shrink: 0;
  height: 402rpx;
  width: 100%;
}

.product-list.column__5 .product-info {
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 220rpx;
  padding: 18rpx 20rpx 30rpx;
  position: relative;
  width: 100%;
}

.product-list.column__5 .product-name {
  font-size: 28rpx;
  margin-bottom: 32rpx;
}

.product-list.column__5 .price {
  margin-bottom: 10rpx;
}

.product-list.column__5 .product-sale {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.product-list.column__5 .product-comment {
  font-size: 24rpx;
}

.product-list.column__5 .cart-btn {
  bottom: 30rpx;
  position: absolute;
  right: 20rpx;
}

.product-list.column__6 {
  align-items: flex-start;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow-x: auto;
  padding: 20rpx 20rpx 0;
}

.product-list.column__6 .product-item {
  flex-shrink: 0;
  margin-right: 22rpx;
  padding-bottom: 22rpx;
  width: 192rpx;
}

.product-list.column__6 .product-cover {
  display: block;
  flex-shrink: 0;
  height: 192rpx;
  margin-bottom: 16rpx;
  width: 192rpx;
}

.product-list.column__6 .product-info {
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.product-list.column__6 .product-name {
  font-size: 24rpx;
  height: 72rpx;
  line-height: 36rpx;
}

.product-list.column__6 .price {
  margin-bottom: 0;
  min-height: 48rpx;
}

.product-list.column__6 .cart-btn {
  bottom: 0;
  position: absolute;
  right: 0;
}

.f22 {
  font-size: 22rpx;
}

.f32 {
  font-size: 32rpx;
}

.fb {
  font-weight: 700;
}

.gray9 {
  color: #999;
}

.text-d-line {
  text-decoration: line-through;
}

.ml10 {
  margin-left: 10rpx;
}

.cart-btn {
  align-items: center;
  background: #409eff;
  border-radius: 200rpx;
  box-sizing: border-box;
  color: #fff;
  display: flex;
  font-size: 24rpx;
  height: 46rpx;
  justify-content: center;
  line-height: 1;
  min-width: 106rpx;
  padding: 0 20rpx;
}

.cart-btn .cart-text {
  font-size: 24rpx;
}

.cart-btn.icon {
  border-radius: 50%;
  height: 46rpx;
  line-height: 46rpx;
  min-width: 46rpx;
  padding: 0;
  width: 46rpx;
}

.cart-btn.icon .iconfont {
  font-size: 24rpx;
  line-height: 1;
}
</style>
