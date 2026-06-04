"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FootTabbar",
  props: { isScroll: { type: Boolean, default: false } },
  data() {
    return { detail: { list: [] }, wx_phone_compulsory: false };
  },
  computed: {
    visibleTabs() {
      return (this.detail.list || []).filter((item) => item.text !== "商户" || this.isMerchantVisible(item));
    },
    currentRoute() {
      const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
      const current = pages[pages.length - 1];
      return current ? "/" + current.route : "";
    }
  },
  created() {
    this.getData();
  },
  mounted() {
    this.wxPhone();
  },
  methods: {
    wxPhone() {
      this.wx_phone_compulsory = !!common_vendor.index.getStorageSync("wx_phone_compulsory");
      if (common_vendor.index.getStorageSync("get_phone"))
        common_vendor.index.removeStorageSync("get_phone");
    },
    defaultNav() {
      const theme = 2;
      return { backgroundColor: "#FFFFFF", is_auto: "0", textColor: "#000000", textHoverColor: "#ffcc00", type: "0", list: [{ iconPath: "https://man.lqjy.cc/static/tabbar/home.png", link_url: "/pages/index/index", selectedIconPath: "https://man.lqjy.cc/static/tabbar/home_" + theme + ".png", text: "首页" }, { iconPath: "https://man.lqjy.cc/static/tabbar/category.png", link_url: "/pages/product/category", selectedIconPath: "https://man.lqjy.cc/static/tabbar/category_" + theme + ".png", text: "分类" }, { iconPath: "https://man.lqjy.cc/static/tabbar/shop.png", is_show: false, link_url: "/pages/shop/shop_list", selectedIconPath: "https://man.lqjy.cc/static/tabbar/shop_" + theme + ".png", text: "商户" }, { iconPath: "https://man.lqjy.cc/static/tabbar/cart.png", is_show: true, link_url: "/pages/cart/cart", selectedIconPath: "https://man.lqjy.cc/static/tabbar/cart_" + theme + ".png", text: "购物车" }, { iconPath: "https://man.lqjy.cc/static/tabbar/user.png", is_show: true, link_url: "/pages/user/index/index", selectedIconPath: "https://man.lqjy.cc/static/tabbar/user_" + theme + ".png", text: "我的" }] };
    },
    isMerchantVisible(item) {
      return item.is_show === true || item.is_show === 1 || item.is_show === "1";
    },
    shouldUseRemoteNav(remote) {
      return remote && String(remote.is_auto) !== "0";
    },
    getData() {
      this.detail = this.defaultNav();
      common_vendor.index.setStorageSync("TabBar", this.detail);
    },
    isActive(item) {
      return item.link_url === this.currentRoute;
    },
    tabBarFunc(item) {
      var _a;
      if ((_a = this.$store) == null ? void 0 : _a.commit)
        this.$store.commit("changefootTab", item.text);
      if (typeof this.gotoPage === "function")
        this.gotoPage(item.link_url);
      else
        common_vendor.index.switchTab({ url: item.link_url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$props.isScroll
  }, !$props.isScroll ? {} : {}, {
    b: common_vendor.f($options.visibleTabs, (item, index, i0) => {
      return common_vendor.e($data.detail.type !== "2" ? {
        a: $options.isActive(item) ? item.selectedIconPath : item.iconPath
      } : {}, $data.detail.type !== "1" ? {
        b: common_vendor.t(item.text),
        c: $options.isActive(item) ? $data.detail.textHoverColor : $data.detail.textColor
      } : {}, {
        d: item.text || index,
        e: common_vendor.n($options.isActive(item) ? "active" : ""),
        f: common_vendor.o(($event) => $options.tabBarFunc(item), item.text || index)
      });
    }),
    c: $data.detail.type !== "2",
    d: $data.detail.type !== "1",
    e: $data.detail.backgroundColor || "#fff",
    f: common_vendor.o(() => {
    }, "70")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d4f05185"]]);
wx.createComponent(Component);
