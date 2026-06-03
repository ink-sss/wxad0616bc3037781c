"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const composables_useVirtualProductList = require("../composables/useVirtualProductList.js");
const utils_imageUrl = require("../utils/image-url.js");
const DEFAULT_ITEM_HEIGHT_RPX = 229;
const POPUP_ITEM_HEIGHT_RPX = 256;
const _sfc_main = {
  __name: "product-list",
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    finished: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      default: "default"
    }
  },
  emits: ["buy", "detail", "loadmore"],
  setup(__props, { emit: __emit }) {
    const DEFAULT_THUMB_SIZE = {};
    const POPUP_THUMB_SIZE = {};
    const props = __props;
    const emit = __emit;
    const productItemHeightRpx = common_vendor.computed(
      () => props.variant === "popup" ? POPUP_ITEM_HEIGHT_RPX : DEFAULT_ITEM_HEIGHT_RPX
    );
    const productViewportItemCount = common_vendor.computed(() => props.variant === "popup" ? 5 : 4);
    const {
      visibleItems,
      topSpacerHeight,
      bottomSpacerHeight,
      onScroll
    } = composables_useVirtualProductList.useVirtualProductList({
      list: common_vendor.computed(() => props.list),
      itemHeightRpx: productItemHeightRpx,
      viewportItemCount: productViewportItemCount,
      overscan: 3
    });
    function onBuy(item, idx) {
      if (item == null ? void 0 : item.soldOut)
        return;
      emit("buy", { item, index: idx });
    }
    function onDetail(item, idx) {
      if (item == null ? void 0 : item.soldOut)
        return;
      emit("detail", { item, index: idx });
    }
    function onLoadMore() {
      if (!props.loading && !props.finished) {
        emit("loadmore");
      }
    }
    function displayIndex(item, idx) {
      return idx + 1;
    }
    function productImage(item) {
      return utils_imageUrl.toSizedImageUrl(
        (item == null ? void 0 : item.image) || "",
        props.variant === "popup" ? POPUP_THUMB_SIZE : DEFAULT_THUMB_SIZE
      );
    }
    function spacerStyle(height) {
      const value = Math.max(Number(height || 0), 0);
      return { height: `${value}rpx` };
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.s(spacerStyle(common_vendor.unref(topSpacerHeight))),
        b: common_vendor.f(common_vendor.unref(visibleItems), ({
          item,
          index
        }, k0, i0) => {
          return common_vendor.e({
            a: productImage(item),
            b: item.soldOut
          }, item.soldOut ? {} : item.stock <= 0 ? {} : {}, {
            c: item.stock <= 0,
            d: item.isCurrent
          }, item.isCurrent ? {
            e: common_assets._imports_0$22
          } : {}, __props.variant === "popup" ? {
            f: common_vendor.t(displayIndex(item, index))
          } : item.isTop ? {} : {}, {
            g: item.isTop,
            h: common_vendor.t(item.title),
            i: common_vendor.n(item.soldOut ? "title-soldout" : ""),
            j: !item.soldOut && item.stock > 0
          }, !item.soldOut && item.stock > 0 ? {
            k: common_vendor.t(item.stock)
          } : {}, {
            l: common_vendor.n(item.soldOut ? "price-soldout" : ""),
            m: common_vendor.t(item.price),
            n: common_vendor.n(item.soldOut ? "price-soldout" : ""),
            o: item.isMultiSpec
          }, item.isMultiSpec ? {
            p: common_vendor.n(item.soldOut ? "price-soldout" : "")
          } : {}, {
            q: item.originPrice
          }, item.originPrice ? {
            r: common_vendor.t(item.originPrice)
          } : {}, {
            s: common_vendor.t(item.soldOut ? "立即购买" : "立即购买"),
            t: common_vendor.n(item.soldOut ? "buy-btn-disabled seckill-end" : ""),
            v: common_vendor.o(($event) => !item.soldOut && onBuy(item, index), item.id || index),
            w: item.id || index,
            x: common_vendor.n(item.isCurrent ? "goods-content-explain" : ""),
            y: common_vendor.n(item.soldOut ? "product-item-soldout sellout" : ""),
            z: common_vendor.o(($event) => onDetail(item, index), item.id || index)
          });
        }),
        c: __props.variant === "popup",
        d: common_vendor.n(__props.variant === "popup" ? "goods-content-li" : ""),
        e: common_vendor.n(__props.variant === "popup" ? "goods-shopping-li" : ""),
        f: common_vendor.s(spacerStyle(common_vendor.unref(bottomSpacerHeight))),
        g: __props.list.length > 0
      }, __props.list.length > 0 ? common_vendor.e({
        h: __props.loading
      }, __props.loading ? {} : __props.finished ? {} : {
        j: common_vendor.o(onLoadMore, "0e")
      }, {
        i: __props.finished
      }) : {}, {
        k: __props.list.length === 0
      }, __props.list.length === 0 ? {} : {}, {
        l: common_vendor.o((...args) => common_vendor.unref(onScroll) && common_vendor.unref(onScroll)(...args), "a4"),
        m: common_vendor.o(onLoadMore, "33"),
        n: common_vendor.n(__props.variant === "popup" ? "goods-content" : ""),
        o: common_vendor.n(`product-list--${__props.variant}`)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a32550f"]]);
wx.createComponent(Component);
