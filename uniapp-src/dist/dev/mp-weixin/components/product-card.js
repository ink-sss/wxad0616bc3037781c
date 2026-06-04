"use strict";
const common_vendor = require("../common/vendor.js");
const utils_imageUrl = require("../utils/image-url.js");
const SWIPER_WINDOW_RADIUS = 2;
const _sfc_main = {
  __name: "product-card",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: () => ({
        image: "https://man.lqjy.cc/static/remote-icons/figma-product-placeholder.png",
        title: "女神节激光节女神节激光节节激光...",
        price: "888"
      })
    },
    salesCount: {
      type: Number,
      default: 0
    },
    currentIndex: {
      type: Number,
      default: 1
    },
    totalCount: {
      type: Number,
      default: 3
    },
    products: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: 0
    },
    showHotSale: {
      type: Boolean,
      default: true
    }
  },
  emits: ["close", "detail", "change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const productItems = common_vendor.computed(() => {
      if (Array.isArray(props.products) && props.products.length > 0) {
        return props.products;
      }
      return [props.product];
    });
    const safeActiveIndex = common_vendor.computed(() => {
      const max = productItems.value.length - 1;
      if (max < 0)
        return 0;
      return Math.min(Math.max(props.activeIndex || 0, 0), max);
    });
    const activeItem = common_vendor.computed(() => {
      return productItems.value[safeActiveIndex.value] || {};
    });
    const visibleWindowStart = common_vendor.computed(() => {
      const total = productItems.value.length;
      if (total <= SWIPER_WINDOW_RADIUS * 2 + 1)
        return 0;
      const maxStart = Math.max(total - (SWIPER_WINDOW_RADIUS * 2 + 1), 0);
      return Math.min(Math.max(safeActiveIndex.value - SWIPER_WINDOW_RADIUS, 0), maxStart);
    });
    const visibleProductItems = common_vendor.computed(() => {
      const start = visibleWindowStart.value;
      const end = Math.min(start + SWIPER_WINDOW_RADIUS * 2 + 1, productItems.value.length);
      return productItems.value.slice(start, end).map((item, offset) => ({
        item,
        index: start + offset
      }));
    });
    const visibleActiveIndex = common_vendor.computed(() => safeActiveIndex.value - visibleWindowStart.value);
    function close() {
      emit("close");
    }
    function onDetail(item) {
      if (item == null ? void 0 : item.soldOut)
        return;
      emit("detail", item);
    }
    function onSwiperChange(e) {
      var _a;
      emit("change", visibleWindowStart.value + Number(((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.current) || 0));
    }
    function productImage(item) {
      return utils_imageUrl.toSizedImageUrl((item == null ? void 0 : item.image) || "");
    }
    function splitPrice(price) {
      const [main, decimal = "00"] = String(price ?? "0.00").split(".");
      return [main || "0", decimal.padEnd(2, "0").slice(0, 2)];
    }
    function priceMain(price) {
      return splitPrice(price)[0];
    }
    function priceDecimal(price) {
      return splitPrice(price)[1];
    }
    function displayHotSales(item) {
      const value = Number((item == null ? void 0 : item.hotSales) ?? (item == null ? void 0 : item.salesCount) ?? props.salesCount ?? 0);
      if (!Number.isFinite(value) || value <= 0)
        return 0;
      return Math.floor(value);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? common_vendor.e({
        b: __props.showHotSale && displayHotSales(activeItem.value) > 0
      }, __props.showHotSale && displayHotSales(activeItem.value) > 0 ? {
        c: common_vendor.t(displayHotSales(activeItem.value))
      } : {}, {
        d: common_vendor.f(visibleProductItems.value, (entry, k0, i0) => {
          return {
            a: productImage(entry.item),
            b: common_vendor.t(entry.index + 1),
            c: common_vendor.t(entry.item.title),
            d: common_vendor.t(priceMain(entry.item.price)),
            e: common_vendor.t(priceDecimal(entry.item.price)),
            f: common_vendor.o(($event) => onDetail(entry.item), entry.item.id || entry.index),
            g: entry.item.soldOut ? 1 : "",
            h: common_vendor.o(($event) => onDetail(entry.item), entry.item.id || entry.index),
            i: entry.item.id || entry.index
          };
        }),
        e: common_vendor.t(productItems.value.length),
        f: visibleActiveIndex.value,
        g: common_vendor.o(onSwiperChange, "41"),
        h: common_vendor.o(close, "fb")
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a8e97424"]]);
wx.createComponent(Component);
