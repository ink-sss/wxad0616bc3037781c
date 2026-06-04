"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("../../common/vendor.js");
const services_localCart = require("../../services/local-cart.js");
const _sfc_main = {
  props: {
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: false,
      is_auto: 0,
      platFormType: ""
    };
  },
  methods: {
    open() {
      const tabBar = common_vendor.index.getStorageSync("TabBar");
      if (tabBar)
        this.is_auto = tabBar.is_auto;
      this.platFormType = common_vendor.index.getSystemInfoSync().uniPlatform;
      if (this.dataList && this.dataList.length > 0)
        this.show = !this.show;
    },
    closeMask() {
      this.show = false;
    },
    addFunc(item) {
      services_localCart.incrementLocalCartItem(item);
      this.$emit("get-shopping-num");
    },
    reduceFunc(item) {
      if (item.total_num <= 1)
        return;
      services_localCart.decrementLocalCartItem(item);
      this.$emit("get-shopping-num");
    },
    clickDel(item) {
      common_vendor.index.showModal({
        title: "提示",
        content: "您确定要移除该商品吗?",
        success: (modal) => {
          if (modal.confirm) {
            services_localCart.removeLocalCartItems([item.local_cart_id || item.cart_id]);
            this.$emit("get-shopping-num");
          }
        }
      });
    },
    getCheckedIds() {
      const ids = [];
      if (this.dataList) {
        this.dataList.forEach((item) => {
          ids.push(item.local_cart_id || item.cart_id);
        });
      }
      return ids;
    },
    onDelete() {
      const ids = this.getCheckedIds();
      if (!ids.length) {
        this.showError("您还没有选择商品");
        return false;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "您确定要清空购物车吗?",
        success: (modal) => {
          if (modal.confirm) {
            services_localCart.clearLocalCartItems();
            this.$emit("get-shopping-num");
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.show
  }, $data.show ? {
    b: common_vendor.o((...args) => $options.closeMask && $options.closeMask(...args), "65"),
    c: common_vendor.o((...args) => $options.onDelete && $options.onDelete(...args), "cc"),
    d: common_vendor.f($props.dataList, (item, k0, i0) => {
      return common_vendor.e({
        a: item.product_image,
        b: common_vendor.t(item.product_name),
        c: item.product_attr
      }, item.product_attr ? {
        d: common_vendor.t(item.product_attr)
      } : {}, {
        e: common_vendor.t(item.product_price),
        f: common_vendor.o(($event) => $options.reduceFunc(item), item.local_cart_id || item.cart_id),
        g: common_vendor.t(item.total_num),
        h: common_vendor.o(($event) => $options.addFunc(item), item.local_cart_id || item.cart_id),
        i: common_vendor.o(($event) => $options.clickDel(item), item.local_cart_id || item.cart_id),
        j: item.local_cart_id || item.cart_id
      });
    }),
    e: common_vendor.o((...args) => $options.closeMask && $options.closeMask(...args), "91")
  } : {});
}
const categoryMask = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f253aae3"]]);
exports.default = categoryMask;
