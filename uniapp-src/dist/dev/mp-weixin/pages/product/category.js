"use strict";
const common_vendor = require("../../common/vendor.js");
const services_localCart = require("../../services/local-cart.js");
const services_miniprogramProducts = require("../../services/miniprogram-products.js");
const TabBar = () => "../../components/tabbar/footTabbar.js";
let throttleTimer = null;
function throttle(fn, wait = 500) {
  if (throttleTimer)
    return;
  throttleTimer = setTimeout(() => {
    throttleTimer = null;
  }, wait);
  if (typeof fn === "function")
    fn();
}
const _sfc_main = {
  components: {
    TabBar,
    spec: () => "./detail/popup/spec.js",
    categoryMaskVue: () => "./categoryMask.js"
  },
  data() {
    return {
      loading: true,
      searchName: "搜索商品",
      show_type: 10,
      style: 4,
      phoneHeight: 0,
      scrollviewHigh: 0,
      listData: [],
      childlist: [],
      select_index: 0,
      catename: "全部商品",
      productlist: [],
      page: 1,
      category_id: 0,
      tableData: [],
      isLogin: true,
      shoppingNum: 0,
      shoppingPrice: null,
      productModel: {},
      isPopup: false,
      specData: null,
      detail: null,
      isDomHeight: true,
      shoppingHeight: 0,
      searchHeight: 0,
      footerHeight: 0,
      productArr: [],
      url: "",
      platFormType: "",
      osName: "",
      openPopCate: false,
      background: "#ffffff",
      no_more: false
    };
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.productlist.length !== 0 && this.no_more ? 2 : 0;
    },
    topSearchStyle() {
      return this.topBarHeight && this.topBarHeight() === 0 ? "" : `height:${this.topBarHeight()}px;padding-top:${this.topBarTop()}px`;
    },
    showCategoryType3() {
      return this.show_type === 20 && (this.style === 1 || this.style === 2 || this.style === 3) || this.show_type === 10 && (this.style === 1 || this.style === 2 || this.style === 4);
    }
  },
  onReady() {
    common_vendor.index.hideTabBar();
  },
  onLoad() {
    const system = common_vendor.index.getSystemInfoSync();
    this.platFormType = system.uniPlatform;
    common_vendor.index.getSystemInfo({
      success: (res) => {
        this.osName = res.osName;
      }
    });
  },
  mounted() {
    this.init();
  },
  onShow() {
    this.productlist = [];
    this.no_more = false;
    this.page = 1;
    this.select_index = 0;
    this.getData();
  },
  onShareAppMessage() {
    return {
      title: "商品分类",
      path: "/pages/product/category?" + this.getShareUrlParams()
    };
  },
  methods: {
    lookProduct() {
      this.$refs.categoryMaskRef.open();
    },
    isBuyFast() {
      if (this.show_type === 10 && this.style === 4 || this.show_type === 20 && this.style === 3) {
        const height = this.phoneHeight - this.searchHeight - this.shoppingHeight;
        this.scrollviewHigh = height - this.footerHeight;
        return true;
      }
      this.scrollviewHigh = this.phoneHeight - this.searchHeight - this.footerHeight;
      return false;
    },
    showTwo() {
      return this.show_type === 20 && (this.style === 2 || this.style === 3) || this.show_type === 10 && this.style === 2;
    },
    init() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight;
          common_vendor.index.createSelectorQuery().select("#searchBox").boundingClientRect((rect) => {
            this.searchHeight = rect && rect.height || 0;
          }).exec();
          common_vendor.index.createSelectorQuery().select("#footBottom").boundingClientRect((rect) => {
            if (rect && rect.height)
              this.footerHeight = rect.height;
          }).exec();
          this.isDomHeight = false;
        }
      });
    },
    hasImages(item) {
      return item.images != null && item.images.file_path != null ? item.images.file_path : "";
    },
    getData() {
      this.loading = true;
      services_miniprogramProducts.fetchCategories().then((data) => {
        const categories = Array.isArray(data) ? data.map(services_miniprogramProducts.normalizeCategory) : [];
        this.show_type = 10;
        this.style = 4;
        this.listData = categories;
        if (this.listData && this.listData.length > 0) {
          if (this.listData[0].child && this.show_type === 20) {
            this.category_id = this.listData[0].child[0] ? this.listData[0].child[0].category_id : this.listData[0].category_id;
            this.childlist = this.listData[0].child;
          } else {
            this.category_id = this.listData[0].category_id;
          }
        } else {
          this.category_id = 0;
          this.childlist = [];
        }
        if (this.style === 2 || (this.show_type === 10 && this.style === 4 || this.show_type === 20 && this.style === 3)) {
          this.getProduct();
          if (this.show_type === 10 && this.style === 4 || this.show_type === 20 && this.style === 3)
            this.getShoppingNum();
        }
        this.background = "#ffffff";
        this.loading = false;
      }).catch(() => {
        this.listData = [];
        this.childlist = [];
        this.category_id = 0;
        this.productlist = [];
        this.no_more = true;
        this.loading = false;
      });
    },
    changeCategory(categoryId) {
      this.category_id = categoryId;
      this.productlist = [];
      this.page = 1;
      this.no_more = false;
      this.openPopCate = false;
      this.getProduct();
    },
    getCheckedIds() {
      const ids = [];
      this.productArr.forEach((item) => {
        ids.push(`${item.cart_id}`);
      });
      return ids;
    },
    Submit() {
      common_vendor.index.showToast({ title: "购物车暂不支持结算", icon: "none" });
    },
    getShoppingNum() {
      const summary = services_localCart.getLocalCartSummary();
      this.isLogin = true;
      this.tableData = summary.productList;
      this.productArr = summary.items;
      this.shoppingNum = summary.totalNum;
      this.shoppingPrice = summary.totalPrice;
    },
    addShopping(item) {
      if (item.spec_type === 20)
        this.getSpecData(item.product_id);
      else
        this.addSingleSpec(item);
    },
    addSingleSpec(item) {
      services_localCart.addLocalCartItem({
        ...item,
        product_price: item.product_min_price || item.product_price,
        stock_num: item.product_stock,
        spec_sku_id: 0
      });
      this.getShoppingNum();
      common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
    },
    scrolltolowerFunc() {
      if (this.no_more)
        return;
      this.page++;
      if (this.page <= this.last_page)
        this.getProduct();
      else
        this.no_more = true;
    },
    getSpecData(productId) {
      services_miniprogramProducts.fetchProductDetail(productId).then((data) => {
        const detailData = services_miniprogramProducts.normalizeProductDetail(data || {});
        if (detailData.specData) {
          this.isPopup = false;
          this.detail = detailData.detail;
          this.specData = detailData.specData;
          this.initSpecData(detailData.specData);
        } else {
          common_vendor.index.showToast({ title: "暂无规格，请于后台添加!", mask: false, duration: 1500, icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "商品规格加载失败", mask: false, duration: 1500, icon: "none" });
      });
    },
    initMaskPopup() {
      this.productModel = {
        specData: this.specData,
        detail: this.detail,
        productSpecArr: this.specData != null ? new Array(this.specData.spec_attr.length) : [],
        show_sku: {
          sku_image: "",
          price: 0,
          product_sku_id: 0,
          line_price: 0,
          stock: 0,
          sum: 1
        },
        plus_sku: null,
        type: "card",
        plus_name: ""
      };
      this.isPopup = true;
    },
    initSpecData(specData) {
      for (const index in specData.spec_attr) {
        for (const itemIndex in specData.spec_attr[index].spec_items) {
          specData.spec_attr[index].spec_items[itemIndex].checked = false;
        }
      }
      this.specData = specData;
      this.initMaskPopup();
    },
    closePopup() {
      this.isPopup = false;
      this.getShoppingNum();
    },
    getProduct() {
      this.loading = true;
      services_miniprogramProducts.fetchProducts({
        page: this.page || 1,
        categoryId: this.category_id || "",
        search: "",
        sortType: "",
        sortPrice: "",
        pageSize: 20
      }).then((data) => {
        const list = services_miniprogramProducts.normalizeProductList(data || {}, 20);
        this.loading = false;
        this.productlist = this.productlist.concat(list.data);
        this.last_page = list.last_page;
        if (list.last_page <= 1 || this.page >= list.last_page)
          this.no_more = true;
      }).catch(() => {
        this.loading = false;
        this.no_more = true;
      });
    },
    selectCategory(index) {
      throttle(() => {
        if (this.show_type === 10) {
          this.select_index = index;
          this.catename = this.listData[this.select_index].name;
          this.changeCategory(this.listData[this.select_index].category_id);
        } else if (this.listData[index].child) {
          this.childlist = this.listData[index].child;
          this.select_index = index;
          this.catename = this.listData[this.select_index].name;
          this.changeCategory(this.childlist[0].category_id);
        } else {
          this.select_index = index;
          this.childlist = [];
          this.catename = this.listData[this.select_index].name;
          this.changeCategory(this.listData[this.select_index].category_id);
        }
      });
    },
    hasSelect() {
    },
    gotoList(categoryId) {
      this.gotoPage("/pages/product/list/list?category_id=" + categoryId + "&sortType=all&search=&sortPrice=0");
    },
    wxGetUserInfo(event) {
      if (!event.detail.iv) {
        common_vendor.index.showToast({ title: "您取消了授权,登录失败", icon: "none" });
        return false;
      }
    },
    gotoSearch() {
      this.gotoPage("/pages/product/search/search");
    }
  }
};
if (!Array) {
  const _component_category_mask_vue = common_vendor.resolveComponent("category-mask-vue");
  const _component_tab_bar = common_vendor.resolveComponent("tab-bar");
  const _component_spec = common_vendor.resolveComponent("spec");
  (_component_category_mask_vue + _component_tab_bar + _component_spec)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.searchName),
    b: common_vendor.o((...args) => $options.gotoSearch && $options.gotoSearch(...args), "e0"),
    c: common_vendor.s($options.topSearchStyle),
    d: $data.show_type === 10 && $data.style === 3
  }, $data.show_type === 10 && $data.style === 3 ? {
    e: common_vendor.f($data.listData, (item, index, i0) => {
      return {
        a: $options.hasImages(item),
        b: common_vendor.t(item.name),
        c: item.category_id || index,
        d: common_vendor.o(($event) => $options.gotoList(item.category_id), item.category_id || index)
      };
    }),
    f: $data.scrollviewHigh + "px"
  } : {}, {
    g: $options.showCategoryType3
  }, $options.showCategoryType3 ? common_vendor.e({
    h: $options.showTwo()
  }, $options.showTwo() ? {
    i: common_vendor.f($data.listData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: item.category_id || index,
        c: common_vendor.n($data.select_index === index ? "item active" : "item"),
        d: common_vendor.o(($event) => $options.selectCategory(index), item.category_id || index)
      };
    }),
    j: $data.scrollviewHigh + "px"
  } : {}, {
    k: $data.style === 1 && $data.show_type === 20 || $data.style === 4 && $data.show_type === 10
  }, $data.style === 1 && $data.show_type === 20 || $data.style === 4 && $data.show_type === 10 ? {
    l: common_vendor.f($data.listData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: item.category_id || index,
        c: common_vendor.n($data.select_index === index ? "item active" : "item"),
        d: common_vendor.o(($event) => $options.selectCategory(index), item.category_id || index)
      };
    }),
    m: $data.scrollviewHigh + "px"
  } : {}, {
    n: $data.style === 1 && $data.show_type === 20
  }, $data.style === 1 && $data.show_type === 20 ? {
    o: common_vendor.f($data.childlist, (item, index, i0) => {
      return {
        a: $options.hasImages(item),
        b: common_vendor.t(item.name),
        c: item.category_id || index,
        d: common_vendor.o(($event) => $options.gotoList(item.category_id), item.category_id || index)
      };
    }),
    p: $data.scrollviewHigh + "px"
  } : {}, {
    q: $data.style === 1 && $data.show_type === 10
  }, $data.style === 1 && $data.show_type === 10 ? {
    r: common_vendor.f($data.listData, (item, index, i0) => {
      return {
        a: $options.hasImages(item),
        b: common_vendor.t(item.name),
        c: item.category_id || index,
        d: common_vendor.o(($event) => $options.gotoList(item.category_id), item.category_id || index)
      };
    }),
    s: $data.scrollviewHigh + "px"
  } : {}, {
    t: $data.style === 2 || $data.style === 3 || $data.style === 4
  }, $data.style === 2 || $data.style === 3 || $data.style === 4 ? common_vendor.e({
    v: $data.show_type === 20 && ($data.style === 2 || $data.style === 3)
  }, $data.show_type === 20 && ($data.style === 2 || $data.style === 3) ? {
    w: common_vendor.f($data.childlist, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: item.category_id || index,
        c: item.category_id === $data.category_id ? 1 : "",
        d: common_vendor.o(($event) => $options.changeCategory(item.category_id), item.category_id || index)
      };
    })
  } : {}, {
    x: common_vendor.f($data.productlist, (item, index, i0) => {
      return common_vendor.e({
        a: item.product_stock <= 0
      }, item.product_stock <= 0 ? {} : {}, {
        b: item.product_image,
        c: common_vendor.t(item.product_name),
        d: common_vendor.t(item.product_min_price),
        e: $data.shoppingPrice && item.isActivity !== 1 && $options.isBuyFast() && item.is_virtual !== 1 && item.custom_form === ""
      }, $data.shoppingPrice && item.isActivity !== 1 && $options.isBuyFast() && item.is_virtual !== 1 && item.custom_form === "" ? {
        f: common_vendor.o(($event) => $options.addShopping(item), item.product_id || index)
      } : {}, {
        g: item.product_id || index,
        h: common_vendor.o(($event) => _ctx.gotoPage("/pages/product/detail/detail?product_id=" + item.product_id), item.product_id || index)
      });
    }),
    y: $data.scrollviewHigh + "px",
    z: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "c3")
  }) : {}) : {}, {
    A: common_vendor.sr("categoryMaskRef", "528fcc3e-0"),
    B: $data.productArr,
    C: common_vendor.o($options.getShoppingNum, "ee"),
    D: $options.isBuyFast()
  }, $options.isBuyFast() ? common_vendor.e({
    E: $data.shoppingNum && $data.shoppingNum !== 0
  }, $data.shoppingNum && $data.shoppingNum !== 0 ? {
    F: common_vendor.t($data.shoppingNum)
  } : {}, {
    G: common_vendor.o((...args) => $options.lookProduct && $options.lookProduct(...args), "45"),
    H: common_vendor.t($data.shoppingPrice)
  }) : {}, {
    I: $data.isDomHeight && $data.osName !== "android"
  }, $data.isDomHeight && $data.osName !== "android" ? {} : {}, {
    J: common_vendor.p({
      ["is-scroll"]: true
    }),
    K: common_vendor.o($options.closePopup, "7d"),
    L: common_vendor.p({
      ["is-popup"]: $data.isPopup,
      ["is-category"]: true,
      ["product-model"]: $data.productModel
    }),
    M: $data.openPopCate
  }, $data.openPopCate ? {
    N: $data.searchHeight + "px",
    O: common_vendor.f($data.childlist, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: item.category_id || index,
        c: item.category_id === $data.category_id ? 1 : "",
        d: common_vendor.o(($event) => $options.changeCategory(item.category_id), item.category_id || index)
      };
    }),
    P: common_vendor.o(($event) => $data.openPopCate = false, "66")
  } : {}, {
    Q: common_vendor.n(_ctx.theme && _ctx.theme()),
    R: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-528fcc3e"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
