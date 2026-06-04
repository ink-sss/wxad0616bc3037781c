"use strict";
const services_miniprogramProducts = require("../../services/miniprogram-products.js");
const common_vendor = require("../../common/vendor.js");
const DiyArticle = () => "./article/article.js";
const DiyAssembleProduct = () => "./assembleProduct/assembleProduct.js";
const DiyBanner = () => "./banner/banner.js";
const DiyBargainProduct = () => "./bargainProduct/bargainProduct.js";
const DiyBase = () => "./base/base.js";
const DiyBlank = () => "./blank/blank.js";
const DiyCoupon = () => "./coupon/coupon.js";
const DiyGuide = () => "./guide/guide.js";
const DiyImagesingle = () => "./imagesingle/imagesingle.js";
const DiyLive = () => "./live/live.js";
const DiyNavBar = () => "./navBar/navBar.js";
const DiyNotice = () => "./notice/notice.js";
const DiyOption = () => "./option/option.js";
const DiyOrder = () => "./order/order.js";
const DiyPreviewProduct = () => "./previewProduct/previewProduct.js";
const DiyProduct = () => "./product/product.js";
const DiyRichText = () => "./richText/richText.js";
const DiySearch = () => "./search/search.js";
const DiySeckillProduct = () => "./seckillProduct/seckillProduct.js";
const DiyService = () => "./service/service.js";
const DiyShipinLive = () => "./shipinLive/shipinLive.js";
const DiySpecial = () => "./special/special.js";
const DiyStore = () => "./store/store.js";
const DiySurface = () => "./surface/surface.js";
const DiyTitle = () => "./title/title.js";
const DiyTopMerge = () => "./topMerge/topMerge.js";
const DiyVideos = () => "./videos/videos.js";
const DiyWindow = () => "./window/window.js";
const _sfc_main = {
  name: "Diy",
  components: { DiyArticle, DiyAssembleProduct, DiyBanner, DiyBargainProduct, DiyBase, DiyBlank, DiyCoupon, DiyGuide, DiyImagesingle, DiyLive, DiyNavBar, DiyNotice, DiyOption, DiyOrder, DiyPreviewProduct, DiyProduct, DiyRichText, DiySearch, DiySeckillProduct, DiyService, DiyShipinLive, DiySpecial, DiyStore, DiySurface, DiyTitle, DiyTopMerge, DiyVideos, DiyWindow },
  props: ["diyItems", "userInfo", "serviceUserId", "diytop", "storeInfo"],
  emits: ["scanQrcode", "stopPush", "getData", "bg", "openSearch"],
  data() {
    return { thisindex: 0, category_id: "", listData: [], page: 1, last_page: 0, no_more: false, loading: true, defaultProductsLoaded: false };
  },
  computed: { loadingType() {
    return this.loading ? 1 : this.listData.length && this.no_more ? 2 : 0;
  }, scrolltop() {
    const value = 80 - 2 * (this.diytop || 0);
    return value <= 0 ? 0 : value;
  } },
  watch: {
    diyItems: {
      handler() {
        this.loadDefaultProducts();
      },
      immediate: true
    }
  },
  methods: {
    scanQrcode() {
      this.$emit("scanQrcode");
    },
    loadinData() {
      this.$nextTick(() => {
        const ref = Array.isArray(this.$refs.shipinLiveRef) ? this.$refs.shipinLiveRef[0] : this.$refs.shipinLiveRef;
        if (ref == null ? void 0 : ref.getData)
          ref.getData();
      });
    },
    parentFunc(payload) {
      if (payload == null ? void 0 : payload.name)
        this.$emit(payload.name, payload.value);
    },
    setIndex(index, categoryId) {
      this.thisindex = index;
      const next = categoryId || 0;
      if (this.category_id !== next) {
        this.category_id = next;
        this.initProduct();
      }
    },
    shouldLoadDefaultProducts() {
      return !this.defaultProductsLoaded && this.thisindex === 0 && Array.isArray(this.diyItems) && this.diyItems.some((item) => item && item.type === "product" && Array.isArray(item.data) && item.data.length === 0);
    },
    loadDefaultProducts() {
      if (!this.shouldLoadDefaultProducts())
        return;
      this.defaultProductsLoaded = true;
      this.thisindex = 1;
      this.initProduct();
    },
    getProduct() {
      this.loading = true;
      services_miniprogramProducts.fetchProducts({ page: this.page || 1, categoryId: this.category_id || "", search: "", sortType: "all", sortPrice: 0, pageSize: 20 }).then((data) => {
        const list = services_miniprogramProducts.normalizeProductList(data || {}, 20);
        this.listData = this.listData.concat(list.data || []);
        this.last_page = list.last_page || 0;
        if (this.last_page <= 1 || this.page >= 9 || this.page >= this.last_page)
          this.no_more = true;
      }).catch(() => {
        this.no_more = true;
      }).finally(() => {
        this.loading = false;
        this.$emit("stopPush");
      });
    },
    pullDown() {
      if (this.thisindex !== 0)
        this.initProduct();
      else
        this.$emit("getData");
    },
    initProduct() {
      if (this.thisindex === 0)
        return;
      this.listData = [];
      this.page = 1;
      this.no_more = false;
      this.getProduct();
    },
    scrolltolowerFunc() {
      if (this.thisindex === 0 || this.no_more)
        return;
      if (this.page < this.last_page) {
        this.page += 1;
        this.getProduct();
        return;
      }
      this.no_more = true;
    },
    bg(value) {
      this.$emit("bg", value);
    },
    gotoProduct(productId) {
      if (typeof this.gotoPage === "function")
        this.gotoPage("pages/product/detail/detail?product_id=" + productId);
    }
  }
};
if (!Array) {
  const _component_diy_option = common_vendor.resolveComponent("diy-option");
  const _component_diy_top_merge = common_vendor.resolveComponent("diy-top-merge");
  const _component_diy_search = common_vendor.resolveComponent("diy-search");
  const _component_diy_surface = common_vendor.resolveComponent("diy-surface");
  const _component_diy_banner = common_vendor.resolveComponent("diy-banner");
  const _component_diy_imagesingle = common_vendor.resolveComponent("diy-imagesingle");
  const _component_diy_window = common_vendor.resolveComponent("diy-window");
  const _component_diy_videos = common_vendor.resolveComponent("diy-videos");
  const _component_diy_article = common_vendor.resolveComponent("diy-article");
  const _component_diy_special = common_vendor.resolveComponent("diy-special");
  const _component_diy_notice = common_vendor.resolveComponent("diy-notice");
  const _component_diy_title = common_vendor.resolveComponent("diy-title");
  const _component_diy_nav_bar = common_vendor.resolveComponent("diy-nav-bar");
  const _component_diy_product = common_vendor.resolveComponent("diy-product");
  const _component_diy_coupon = common_vendor.resolveComponent("diy-coupon");
  const _component_diy_service = common_vendor.resolveComponent("diy-service");
  const _component_diy_shipin_live = common_vendor.resolveComponent("diy-shipin-live");
  const _component_diy_rich_text = common_vendor.resolveComponent("diy-rich-text");
  const _component_diy_blank = common_vendor.resolveComponent("diy-blank");
  const _component_diy_guide = common_vendor.resolveComponent("diy-guide");
  const _component_diy_seckill_product = common_vendor.resolveComponent("diy-seckill-product");
  const _component_diy_preview_product = common_vendor.resolveComponent("diy-preview-product");
  const _component_diy_assemble_product = common_vendor.resolveComponent("diy-assemble-product");
  const _component_diy_bargain_product = common_vendor.resolveComponent("diy-bargain-product");
  const _component_diy_live = common_vendor.resolveComponent("diy-live");
  const _component_diy_base = common_vendor.resolveComponent("diy-base");
  const _component_diy_store = common_vendor.resolveComponent("diy-store");
  const _component_diy_order = common_vendor.resolveComponent("diy-order");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_component_diy_option + _component_diy_top_merge + _component_diy_search + _component_diy_surface + _component_diy_banner + _component_diy_imagesingle + _component_diy_window + _component_diy_videos + _component_diy_article + _component_diy_special + _component_diy_notice + _component_diy_title + _component_diy_nav_bar + _component_diy_product + _component_diy_coupon + _component_diy_service + _component_diy_shipin_live + _component_diy_rich_text + _component_diy_blank + _component_diy_guide + _component_diy_seckill_product + _component_diy_preview_product + _component_diy_assemble_product + _component_diy_bargain_product + _component_diy_live + _component_diy_base + _component_diy_store + _component_diy_order + _easycom_uni_load_more2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($props.diyItems, (item, index, i0) => {
      return common_vendor.e({
        a: item.type === "option"
      }, item.type === "option" ? {
        b: common_vendor.o($options.setIndex, item.id || item.type || index),
        c: "e2d5549e-0-" + i0,
        d: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "topMerge" ? {
        f: common_vendor.o($options.parentFunc, item.id || item.type || index),
        g: common_vendor.o($options.setIndex, item.id || item.type || index),
        h: "e2d5549e-1-" + i0,
        i: common_vendor.p({
          ["item-data"]: item,
          diytop: $props.diytop
        })
      } : item.type === "search" ? {
        k: "e2d5549e-2-" + i0,
        l: common_vendor.p({
          ["item-data"]: item,
          diytop: $props.diytop
        })
      } : item.type === "surface" ? {
        n: "e2d5549e-3-" + i0,
        o: common_vendor.p({
          ["item-data"]: item,
          diytop: $props.diytop
        })
      } : {}, {
        e: item.type === "topMerge",
        j: item.type === "search",
        m: item.type === "surface",
        p: item.id || item.type || index
      });
    }),
    b: $data.thisindex === 0
  }, $data.thisindex === 0 ? {
    c: common_vendor.f($props.diyItems, (item, index, i0) => {
      return common_vendor.e({
        a: item.type === "banner" && item.data
      }, item.type === "banner" && item.data ? {
        b: "e2d5549e-4-" + i0,
        c: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "imageSingle" && item.data ? {
        e: "e2d5549e-5-" + i0,
        f: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "window" && item.data ? {
        h: "e2d5549e-6-" + i0,
        i: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "video" ? {
        k: "e2d5549e-7-" + i0,
        l: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "article" && item.data ? {
        n: "e2d5549e-8-" + i0,
        o: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "special" && item.data ? {
        q: "e2d5549e-9-" + i0,
        r: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "notice" && item.data ? {
        t: "e2d5549e-10-" + i0,
        v: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "title" && item.data ? {
        x: "e2d5549e-11-" + i0,
        y: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "navBar" && item.data ? {
        A: "e2d5549e-12-" + i0,
        B: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "product" && item.data ? {
        D: "e2d5549e-13-" + i0,
        E: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "coupon" && item.data ? {
        G: "e2d5549e-14-" + i0,
        H: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "service" && item.data ? {
        J: "e2d5549e-15-" + i0,
        K: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "videoLive" || item.type === "shipinLive" ? {
        M: common_vendor.sr("shipinLiveRef", "e2d5549e-16-" + i0, {
          "f": 1
        }),
        N: "e2d5549e-16-" + i0,
        O: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "richText" ? {
        Q: "e2d5549e-17-" + i0,
        R: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "blank" ? {
        T: "e2d5549e-18-" + i0,
        U: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "guide" ? {
        W: "e2d5549e-19-" + i0,
        X: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "seckillProduct" ? {
        Z: "e2d5549e-20-" + i0,
        aa: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "previewProduct" ? {
        ac: "e2d5549e-21-" + i0,
        ad: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "assembleProduct" ? {
        af: "e2d5549e-22-" + i0,
        ag: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "bargainProduct" ? {
        ai: "e2d5549e-23-" + i0,
        aj: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "live" ? {
        al: "e2d5549e-24-" + i0,
        am: common_vendor.p({
          ["item-data"]: item
        })
      } : item.type === "base" || item.type === "userBase" ? common_vendor.e({
        ao: common_vendor.o($options.scanQrcode, "body-" + (item.id || item.type || index)),
        ap: common_vendor.o($options.bg, "body-" + (item.id || item.type || index)),
        aq: "e2d5549e-25-" + i0,
        ar: common_vendor.p({
          ["item-data"]: item,
          ["user-info"]: $props.userInfo
        }),
        as: item.type === "base" && $props.storeInfo
      }, item.type === "base" && $props.storeInfo ? {
        at: "e2d5549e-26-" + i0,
        av: common_vendor.p({
          ["item-data"]: item,
          ["store-info"]: $props.storeInfo
        })
      } : {}) : item.type === "store" && $props.storeInfo ? {
        ax: "e2d5549e-27-" + i0,
        ay: common_vendor.p({
          ["item-data"]: item,
          ["store-info"]: $props.storeInfo
        })
      } : item.type === "order" ? {
        aA: "e2d5549e-28-" + i0,
        aB: common_vendor.p({
          ["item-data"]: item,
          ["user-info"]: $props.userInfo
        })
      } : item.type ? {} : {}, {
        d: item.type === "imageSingle" && item.data,
        g: item.type === "window" && item.data,
        j: item.type === "video",
        m: item.type === "article" && item.data,
        p: item.type === "special" && item.data,
        s: item.type === "notice" && item.data,
        w: item.type === "title" && item.data,
        z: item.type === "navBar" && item.data,
        C: item.type === "product" && item.data,
        F: item.type === "coupon" && item.data,
        I: item.type === "service" && item.data,
        L: item.type === "videoLive" || item.type === "shipinLive",
        P: item.type === "richText",
        S: item.type === "blank",
        V: item.type === "guide",
        Y: item.type === "seckillProduct",
        ab: item.type === "previewProduct",
        ae: item.type === "assembleProduct",
        ah: item.type === "bargainProduct",
        ak: item.type === "live",
        an: item.type === "base" || item.type === "userBase",
        aw: item.type === "store" && $props.storeInfo,
        az: item.type === "order",
        aC: item.type,
        aD: "body-" + (item.id || item.type || index)
      });
    })
  } : common_vendor.e({
    d: common_vendor.f($data.listData, (product, index, i0) => {
      return common_vendor.e({
        a: product.product_image,
        b: common_vendor.t(product.product_name),
        c: common_vendor.t(product.product_sku && product.product_sku.product_price),
        d: product.product_sku && Number(product.product_sku.line_price || 0) > 0
      }, product.product_sku && Number(product.product_sku.line_price || 0) > 0 ? {
        e: common_vendor.t(product.product_sku.line_price)
      } : {}, {
        f: product.product_id,
        g: common_vendor.n(index % 2 === 1 && "product_item_right"),
        h: common_vendor.o(($event) => $options.gotoProduct(product.product_id), product.product_id)
      });
    }),
    e: !$data.listData.length && $data.no_more
  }, !$data.listData.length && $data.no_more ? {} : {
    f: common_vendor.p({
      status: $options.loadingType === 1 ? "loading" : $options.loadingType === 2 ? "noMore" : "more"
    })
  }));
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e2d5549e"]]);
wx.createComponent(Component);
