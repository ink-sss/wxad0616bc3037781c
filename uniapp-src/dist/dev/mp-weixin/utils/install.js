"use strict";
const common_vendor = require("../common/vendor.js");
const env_config = require("../env/config.js");
const common_gotopage = require("../common/gotopage.js");
const common_onfire = require("../common/onfire.js");
const utils_request = require("./request.js");
const utils_validator = require("./validator.js");
function defaultTabBar(theme = 2) {
  return {
    backgroundColor: "#FFFFFF",
    is_auto: "0",
    textColor: "#000000",
    textHoverColor: "#ffcc00",
    type: "0",
    list: [
      { iconPath: "https://man.lqjy.cc/static/tabbar/home.png", link_url: "/pages/index/index", selectedIconPath: `https://man.lqjy.cc/static/tabbar/home_${theme}.png`, text: "首页" },
      { iconPath: "https://man.lqjy.cc/static/tabbar/category.png", link_url: "/pages/product/category", selectedIconPath: `https://man.lqjy.cc/static/tabbar/category_${theme}.png`, text: "分类" },
      { iconPath: "https://man.lqjy.cc/static/tabbar/shop.png", is_show: false, link_url: "/pages/shop/shop_list", selectedIconPath: `https://man.lqjy.cc/static/tabbar/shop_${theme}.png`, text: "商户" },
      { iconPath: "https://man.lqjy.cc/static/tabbar/cart.png", is_show: true, link_url: "/pages/cart/cart", selectedIconPath: `https://man.lqjy.cc/static/tabbar/cart_${theme}.png`, text: "购物车" },
      { iconPath: "https://man.lqjy.cc/static/tabbar/user.png", is_show: true, link_url: "/pages/user/index/index", selectedIconPath: `https://man.lqjy.cc/static/tabbar/user_${theme}.png`, text: "我的" }
    ]
  };
}
function installSharedRuntime(app, options = {}) {
  app.config.globalProperties.$fire = options.eventBus || new common_onfire.OnFire();
  app.config.globalProperties.config = options.config || env_config.config;
  app.config.globalProperties.websiteUrl = app.config.globalProperties.config.app_url;
  app.config.globalProperties.app_id = app.config.globalProperties.config.app_id;
  app.config.globalProperties.gotoPage = options.gotoPage || common_gotopage.gotopage;
  app.config.globalProperties.static_url = app.config.globalProperties.config.static_url;
  app.config.globalProperties.font_url = app.config.globalProperties.config.font_url;
  if (options.store) {
    app.config.globalProperties.$store = options.store;
    app.config.globalProperties.footTabberData = options.footTabberData || { active: "home" };
    app.config.globalProperties.points_name = function pointsName(text) {
      if (text) {
        return text.replace(new RegExp("积分", "g"), options.store.state.points_name);
      }
      return options.store.state.points_name;
    };
    app.config.globalProperties.theme = function theme() {
      return `theme${this.$store.state.theme}` || "";
    };
    app.config.globalProperties.getThemeColor = function getThemeColor() {
      return ["#ff5704", "#19ad57", "#ffcc00", "#33a7ff", "#e4e4e4", "#c8ba97", "#623ceb"][this.$store.state.theme];
    };
  }
  utils_request.requestFun(app);
  utils_validator.validator(app);
  app.config.globalProperties.getTabBarLinks = function getTabBarLinks() {
    const tabBar = common_vendor.index.getStorageSync("TabBar");
    const tabInited = common_vendor.index.getStorageSync("tabInited");
    const theme = common_vendor.index.getStorageSync("theme");
    if (tabBar != null && tabBar !== "" && tabInited !== void 0 && tabInited !== "undefined") {
      this.setTabBarLinks(tabBar, theme);
      return;
    }
    const nextTheme = 2;
    const data = defaultTabBar(nextTheme);
    if (this.$store)
      this.$store.commit("changeTheme", nextTheme);
    common_vendor.index.setStorageSync("theme", nextTheme);
    common_vendor.index.setStorageSync("TabBar", data);
    common_vendor.index.setStorageSync("tabInited", data.is_auto);
    this.setTabBarLinks(data, nextTheme);
  };
  app.config.globalProperties.setTabBarLinks = function setTabBarLinks(tabBar) {
    tabBar.list = [];
  };
  app.config.globalProperties.tabInited = function tabInited() {
    return common_vendor.index.getStorageSync("tabInited");
  };
  app.config.globalProperties.navBack = function navBack() {
    try {
      common_vendor.index.navigateBack({
        fail() {
          common_vendor.index.switchTab({
            url: "/pages/index/index"
          });
        }
      });
    } catch (error) {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    }
  };
}
exports.installSharedRuntime = installSharedRuntime;
