"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Array) {
  const _easycom_wd_overlay2 = common_vendor.resolveComponent("wd-overlay");
  const _easycom_wd_transition2 = common_vendor.resolveComponent("wd-transition");
  (_easycom_wd_overlay2 + _easycom_wd_transition2)();
}
const _easycom_wd_overlay = () => "../../../node-modules/wot-design-uni/components/wd-overlay/wd-overlay.js";
const _easycom_wd_transition = () => "../../../node-modules/wot-design-uni/components/wd-transition/wd-transition.js";
if (!Math) {
  (ProductCard + _easycom_wd_overlay + ProductList + _easycom_wd_transition)();
}
const ProductCard = () => "../../../components/product-card.js";
const ProductList = () => "../../../components/product-list.js";
const _sfc_main = {
  __name: "LiveProductShelf",
  props: {
    mode: {
      type: String,
      required: true
    },
    showProduct: {
      type: Boolean,
      default: false
    },
    showProductList: {
      type: Boolean,
      default: false
    },
    currentProduct: {
      type: Object,
      default: null
    },
    productCardItems: {
      type: Array,
      default: () => []
    },
    productCardActiveIndex: {
      type: Number,
      default: 0
    },
    productList: {
      type: Array,
      default: () => []
    },
    productTotal: {
      type: Number,
      default: 0
    },
    productLoading: {
      type: Boolean,
      default: false
    },
    productFinished: {
      type: Boolean,
      default: false
    },
    showHotSale: {
      type: Boolean,
      default: true
    },
    successNotice: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    "update:showProduct",
    "update:showProductList",
    "product-card-change",
    "buy",
    "detail",
    "loadmore"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const displayProductTotal = common_vendor.computed(() => props.productTotal || props.productList.length);
    const successNoticeTitle = common_vendor.computed(() => {
      var _a, _b;
      const count = Number(((_a = props.successNotice) == null ? void 0 : _a.count) || 0);
      if (count > 0)
        return `${count}人购买了`;
      return `${((_b = props.successNotice) == null ? void 0 : _b.nick) || "观众"}购买成功`;
    });
    const successNoticeProductLabel = common_vendor.computed(() => {
      var _a;
      const sort = successNoticeSort.value;
      const name = String(((_a = props.successNotice) == null ? void 0 : _a.productName) || "").trim();
      return sort ? `${sort}号 ${name}` : name;
    });
    const successNoticeProduct = common_vendor.computed(() => {
      var _a, _b, _c;
      const id = Number(((_a = props.successNotice) == null ? void 0 : _a.productId) || 0);
      if (!id)
        return null;
      const product = props.productList.find((item) => Number(item.id || item.productId || 0) === id);
      if (product)
        return product;
      return {
        id,
        image: ((_b = props.successNotice) == null ? void 0 : _b.productImage) || "",
        title: ((_c = props.successNotice) == null ? void 0 : _c.productName) || ""
      };
    });
    const successNoticeSort = common_vendor.computed(() => {
      var _a;
      const rawSort = String(((_a = props.successNotice) == null ? void 0 : _a.sort) || "").trim();
      if (rawSort)
        return rawSort;
      const idx = props.productList.findIndex(
        (item) => {
          var _a2;
          return Number(item.id || item.productId || 0) === Number(((_a2 = props.successNotice) == null ? void 0 : _a2.productId) || 0);
        }
      );
      return idx >= 0 ? String(idx + 1) : "";
    });
    function openSuccessNoticeProduct() {
      if (!successNoticeProduct.value)
        return;
      emit("buy", { item: successNoticeProduct.value });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: __props.mode === "portrait"
      }, __props.mode === "portrait" ? common_vendor.e({
        b: common_vendor.o(($event) => emit("update:showProduct", false), "a1"),
        c: common_vendor.o(($event) => emit("product-card-change", $event), "b4"),
        d: common_vendor.o((p) => emit("buy", {
          item: p
        }), "03"),
        e: common_vendor.p({
          visible: __props.showProduct && !__props.showProductList,
          product: __props.currentProduct,
          products: __props.productCardItems,
          ["active-index"]: __props.productCardActiveIndex,
          ["show-hot-sale"]: __props.showHotSale
        }),
        f: common_vendor.o(($event) => emit("update:showProductList", false), "b2"),
        g: common_vendor.p({
          show: __props.showProductList,
          ["custom-style"]: "z-index:60;background:rgba(0,0,0,0.5);"
        }),
        h: (_a = __props.successNotice) == null ? void 0 : _a.visible
      }, ((_b = __props.successNotice) == null ? void 0 : _b.visible) ? common_vendor.e({
        i: __props.successNotice.productImage
      }, __props.successNotice.productImage ? common_vendor.e({
        j: successNoticeSort.value
      }, successNoticeSort.value ? {
        k: common_vendor.t(successNoticeSort.value)
      } : {}, {
        l: __props.successNotice.productImage
      }) : {}, {
        m: common_vendor.t(successNoticeTitle.value),
        n: __props.successNotice.productName
      }, __props.successNotice.productName ? {
        o: common_vendor.t(successNoticeProductLabel.value)
      } : {}, {
        p: common_vendor.o(openSuccessNoticeProduct, "14"),
        q: common_vendor.n(__props.successNotice.phase || "entering"),
        r: __props.successNotice.key,
        s: common_vendor.o(() => {
        }, "35")
      }) : {}, {
        t: common_vendor.t(displayProductTotal.value),
        v: common_vendor.o(($event) => emit("buy", $event), "46"),
        w: common_vendor.o(($event) => emit("buy", $event), "88"),
        x: common_vendor.o(($event) => emit("loadmore"), "6b"),
        y: common_vendor.p({
          variant: "popup",
          list: __props.productList,
          loading: __props.productLoading,
          finished: __props.productFinished
        }),
        z: common_vendor.o(() => {
        }, "3a"),
        A: common_vendor.o(($event) => emit("update:showProductList", false), "35"),
        B: common_vendor.p({
          show: __props.showProductList,
          duration: 500,
          ["enter-class"]: "plist-popup-enter",
          ["enter-active-class"]: "plist-popup-enter-active",
          ["enter-to-class"]: "plist-popup-enter-to",
          ["leave-class"]: "plist-popup-leave",
          ["leave-active-class"]: "plist-popup-leave-active",
          ["leave-to-class"]: "plist-popup-leave-to",
          ["custom-style"]: "position:fixed;left:0;top:0;right:0;bottom:0;z-index:61;"
        })
      }) : __props.mode === "landscape-list" ? {
        D: common_vendor.o(($event) => emit("buy", $event), "91"),
        E: common_vendor.o(($event) => emit("detail", $event), "29"),
        F: common_vendor.o(($event) => emit("loadmore"), "69"),
        G: common_vendor.p({
          list: __props.productList,
          loading: __props.productLoading,
          finished: __props.productFinished
        })
      } : __props.mode === "landscape-anchor" && __props.showProduct ? {
        I: common_vendor.o(($event) => emit("update:showProduct", false), "fa"),
        J: common_vendor.o(($event) => emit("product-card-change", $event), "e1"),
        K: common_vendor.o((p) => emit("buy", {
          item: p
        }), "1a"),
        L: common_vendor.p({
          visible: true,
          product: __props.currentProduct,
          products: __props.productCardItems,
          ["active-index"]: __props.productCardActiveIndex,
          ["show-hot-sale"]: __props.showHotSale
        }),
        M: common_vendor.o(() => {
        }, "9a"),
        N: common_vendor.o(($event) => emit("update:showProduct", false), "0c")
      } : {}, {
        C: __props.mode === "landscape-list",
        H: __props.mode === "landscape-anchor" && __props.showProduct
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4b3ce6ac"]]);
wx.createComponent(Component);
