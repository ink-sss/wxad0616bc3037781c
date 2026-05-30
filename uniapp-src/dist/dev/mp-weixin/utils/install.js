"use strict";
const common_vendor = require("../common/vendor.js");
const env_config = require("../env/config.js");
const common_gotopage = require("../common/gotopage.js");
const common_onfire = require("../common/onfire.js");
const utils_request = require("./request.js");
const utils_validator = require("./validator.js");
function installSharedRuntime(app, options = {}) {
  app.config.globalProperties.$fire = options.eventBus || new common_onfire.OnFire();
  app.config.globalProperties.config = options.config || env_config.config;
  app.config.globalProperties.websiteUrl = app.config.globalProperties.config.app_url;
  app.config.globalProperties.app_id = app.config.globalProperties.config.app_id;
  app.config.globalProperties.gotoPage = options.gotoPage || common_gotopage.gotopage;
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
    common_vendor.index.request({
      url: `${this.config.app_url}/index.php/api/index/nav`,
      data: {
        app_id: this.config.app_id,
        appid: this.config.appid
      },
      success: (response) => {
        const data = response.data.data.vars.data;
        const nextTheme = response.data.data.theme.theme;
        if (this.$store)
          this.$store.commit("changeTheme", nextTheme);
        common_vendor.index.setStorageSync("theme", nextTheme);
        common_vendor.index.setStorageSync("TabBar", data);
        common_vendor.index.setStorageSync("tabInited", data.is_auto);
        this.setTabBarLinks(data, nextTheme);
      }
    });
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
