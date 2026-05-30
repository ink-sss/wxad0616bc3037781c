"use strict";
const common_vendor = require("./vendor.js");
const common_jump = require("./jump.js");
const platform_weixin_navigation = require("../platform/weixin/navigation.js");
const defaultTabBarPages = [
  "/pages/index/index",
  "/pages/product/category",
  "/pages/shop/shop_list",
  "/pages/cart/cart",
  "/pages/user/index/index"
];
function normalizePageUrl(url) {
  return url.substr(0, 1) === "/" ? url : `/${url}`;
}
function pathOnly(url) {
  const queryIndex = url.indexOf("?");
  return queryIndex === -1 ? url : url.substr(0, queryIndex);
}
function isRuntimeTabPage(path) {
  const tabBar = common_vendor.index.getStorageSync("TabBar");
  const list = tabBar && Array.isArray(tabBar.list) ? tabBar.list : [];
  return list.some((item) => item && item.link_url === path);
}
function gotopage(url, navType) {
  if (!url || url.length === 0)
    return false;
  if (!common_jump.jump.checkAndNavigate(url))
    return false;
  if (url.startsWith("#小程序")) {
    platform_weixin_navigation.navigateToMiniProgram({
      shortLink: url,
      fail() {
        common_vendor.index.showToast({
          title: "打开链接失败",
          icon: "none"
        });
      }
    });
    return true;
  }
  if (url.indexOf("https://") === 0) {
    common_vendor.index.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
    });
    return true;
  }
  const pageUrl = normalizePageUrl(url);
  const pagePath = pathOnly(pageUrl);
  if (isRuntimeTabPage(pagePath) || defaultTabBarPages.indexOf(pagePath) > -1) {
    common_vendor.index.reLaunch({ url: pageUrl });
    return true;
  }
  if (navType === "redirect") {
    common_vendor.index.redirectTo({ url: pageUrl });
    return true;
  }
  if (navType === "reLaunch") {
    common_vendor.index.reLaunch({ url: pageUrl });
    return true;
  }
  common_vendor.index.navigateTo({ url: pageUrl });
  return true;
}
exports.gotopage = gotopage;
