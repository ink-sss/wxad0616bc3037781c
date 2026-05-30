"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyProduct",
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    dataList() {
      return Array.isArray(this.itemData.data) ? this.itemData.data : [];
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    params() {
      return this.itemData.params || {};
    },
    column() {
      return Number(this.params.column || 2);
    },
    columnCount() {
      return [2, 4].includes(this.column) ? 2 : 1;
    },
    wrapperStyle() {
      const s = this.styleConfig;
      return `padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};margin-top:${this.toRpx(s.marginTop)};background:${s.background || ""};`;
    },
    borderStyle() {
      if (![3, 4, 6].includes(this.column))
        return "";
      const top = Number(this.styleConfig.topRadio || 0);
      const bottom = Number(this.styleConfig.bottomRadio || 0);
      return `border-top-left-radius:${top}px;border-top-right-radius:${top}px;border-bottom-left-radius:${bottom}px;border-bottom-right-radius:${bottom}px;background-image:linear-gradient(to right, ${this.styleConfig.bgcolor_color1 || "#fff"}, ${this.styleConfig.bgcolor_color2 || "#fff"});`;
    },
    productStyle() {
      if ([3, 4, 6].includes(this.column))
        return "";
      const top = Number(this.styleConfig.topRadio || 0);
      const bottom = Number(this.styleConfig.bottomRadio || 0);
      return `border-top-left-radius:${top}px;border-top-right-radius:${top}px;border-bottom-left-radius:${bottom}px;border-bottom-right-radius:${bottom}px;background-image:linear-gradient(to right, ${this.styleConfig.bgcolor_color1 || "#fff"}, ${this.styleConfig.bgcolor_color2 || "#fff"});`;
    },
    productRadiusStyle() {
      const top = 2 * Number(this.styleConfig.productTopRadio || 0);
      const bottom = 2 * Number(this.styleConfig.productBottomRadio || 0);
      return `border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`;
    },
    cartStyle() {
      return `color:${this.styleConfig.cart_text_color || ""};background-image:linear-gradient(to right, ${this.styleConfig.cart_color1 || "#fff"}, ${this.styleConfig.cart_color2 || "#fff"});`;
    }
  },
  methods: {
    toRpx(value) {
      return `${2 * Number(value || 0)}rpx`;
    },
    shouldShowInColumn(index, columnIndex) {
      return ![2, 4].includes(this.column) || index % 2 === columnIndex;
    },
    gotoDetail(productId) {
      if (productId && typeof this.gotoPage === "function")
        this.gotoPage(`/pages/product/detail/detail?product_id=${productId}`);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($options.columnCount, (col, k0, i0) => {
      return {
        a: common_vendor.f($options.dataList, (product, index, i1) => {
          return common_vendor.e({
            a: product.image || product.product_image || product.imgUrl
          }, $options.params.productName ? {
            b: common_vendor.t(product.product_name),
            c: common_vendor.n($options.styleConfig.nameWeight ? "fb" : ""),
            d: common_vendor.s(`color:${$options.styleConfig.product_name_color || ""};`)
          } : {}, $options.params.productPrice ? {
            e: common_vendor.t(product.product_price),
            f: common_vendor.s(`color:${$options.styleConfig.product_price_color || ""};`)
          } : {}, {
            g: $options.params.linePrice && Number(product.line_price || 0) > 0
          }, $options.params.linePrice && Number(product.line_price || 0) > 0 ? {
            h: common_vendor.t(product.line_price),
            i: common_vendor.s(`color:${$options.styleConfig.line_price_color || ""};`)
          } : {}, $options.params.productSales ? {
            j: common_vendor.t(product.product_sales),
            k: common_vendor.s(`color:${$options.styleConfig.product_sales_color || ""};`)
          } : {}, {
            l: $options.params.comment && product.goodRate
          }, $options.params.comment && product.goodRate ? {
            m: common_vendor.t(product.goodRate),
            n: common_vendor.s(`color:${$options.styleConfig.product_comment_color || ""};`)
          } : {}, Number($options.params.showCart) === 1 ? common_vendor.e({
            o: Number($options.params.cartType) === 0
          }, Number($options.params.cartType) === 0 ? {
            p: common_vendor.t($options.params.cartText || "购买"),
            q: common_vendor.s($options.cartStyle)
          } : {}, {
            r: Number($options.params.cartType) === 1
          }, Number($options.params.cartType) === 1 ? {
            s: common_vendor.s(`color:${$options.styleConfig.cart_text_color || ""};`),
            t: common_vendor.s($options.cartStyle)
          } : {}, {
            v: Number($options.params.cartType) === 2
          }, Number($options.params.cartType) === 2 ? {
            w: common_vendor.s(`color:${$options.styleConfig.cart_text_color || ""};`),
            x: common_vendor.s($options.cartStyle)
          } : {}) : {}, {
            y: $options.shouldShowInColumn(index, col - 1),
            z: product.product_id || index,
            A: common_vendor.o(($event) => $options.gotoDetail(product.product_id), product.product_id || index)
          });
        }),
        b: col
      };
    }),
    b: common_vendor.s($options.productRadiusStyle),
    c: $options.params.productName,
    d: $options.params.productPrice,
    e: $options.params.productSales,
    f: Number($options.params.showCart) === 1,
    g: common_vendor.s($options.productStyle),
    h: common_vendor.n(`column__${$options.column}`),
    i: common_vendor.n(`column__${$options.column}`),
    j: common_vendor.s($options.borderStyle),
    k: common_vendor.s($options.wrapperStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5a352d94"]]);
wx.createComponent(Component);
