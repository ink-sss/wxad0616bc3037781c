"use strict";
const common_vendor = require("../common/vendor.js");
const common_utils = require("../common/utils.js");
const env_config = require("../env/config.js");
const platform_weixin_runtime = require("../platform/weixin/runtime.js");
const platform_weixin_subscription = require("../platform/weixin/subscription.js");
function safeMenuButtonRect() {
  if (typeof common_vendor.index.getMenuButtonBoundingClientRect === "function") {
    return common_vendor.index.getMenuButtonBoundingClientRect();
  }
  return {
    top: 0,
    height: 0,
    width: 0,
    right: 0
  };
}
function safeWindowInfo() {
  if (typeof common_vendor.index.getWindowInfo === "function") {
    return common_vendor.index.getWindowInfo();
  }
  return common_vendor.index.getSystemInfoSync();
}
function validator(app) {
  app.config.globalProperties.getAppId = function getAppId() {
    return common_vendor.index.getStorageSync("me") ? common_vendor.index.getStorageSync("me") || env_config.config.app_id || 10001 : env_config.config.app_id || common_vendor.index.getStorageSync("app_id") || 10001;
  };
  app.config.globalProperties.compareVersion = function compareVersion(left, right) {
    const leftParts = left.split(".");
    const rightParts = right.split(".");
    const length = Math.max(leftParts.length, rightParts.length);
    while (leftParts.length < length)
      leftParts.push("0");
    while (rightParts.length < length)
      rightParts.push("0");
    for (let index = 0; index < length; index += 1) {
      const leftValue = parseInt(leftParts[index], 10);
      const rightValue = parseInt(rightParts[index], 10);
      if (leftValue > rightValue)
        return 1;
      if (leftValue < rightValue)
        return -1;
    }
    return 0;
  };
  app.config.globalProperties.getVisitcode = function getVisitcode() {
    let visitcode = common_vendor.index.getStorageSync("visitcode");
    if (!visitcode) {
      visitcode = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (item) => {
        const random = 16 * Math.random() | 0;
        return (item === "x" ? random : random & 3 | 8).toString(16);
      }).replace(/-/g, "");
      common_vendor.index.setStorageSync("visitcode", visitcode);
    }
    return visitcode;
  };
  app.config.globalProperties.subMessage = function subMessage(templateIds, callback) {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const done = typeof callback === "function" ? callback : () => {
    };
    if (templateIds && templateIds.length !== 0 && this.compareVersion(systemInfo.SDKVersion || "0.0.0", "2.8.2") >= 0 && platform_weixin_runtime.hasWeixinApi("requestSubscribeMessage")) {
      common_vendor.index.hideLoading();
      platform_weixin_subscription.requestSubscribeMessage(templateIds).finally(done);
      return;
    }
    done();
  };
  app.config.globalProperties.showError = function showError(message, callback) {
    if (!message) {
      if (callback)
        callback();
      return;
    }
    common_vendor.index.showModal({
      title: "友情提示",
      content: message,
      showCancel: false,
      success() {
        if (callback)
          callback();
      }
    });
  };
  app.config.globalProperties.showSuccess = function showSuccess(message, callback) {
    common_vendor.index.showModal({
      title: "友情提示",
      content: message,
      showCancel: false,
      success() {
        if (callback)
          callback();
      }
    });
  };
  app.config.globalProperties.getShareUrlParams = function getShareUrlParams(params) {
    return common_utils.utils.urlEncode(
      Object.assign(
        {
          referee_id: this.getUserId(),
          app_id: this.getAppId()
        },
        params
      )
    );
  };
  app.config.globalProperties.getUserId = function getUserId() {
    return common_vendor.index.getStorageSync("user_id");
  };
  app.config.globalProperties.ios = function ios() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    return systemInfo.platform === "ios";
  };
  app.config.globalProperties.isWeixin = function isWeixin() {
    return false;
  };
  app.config.globalProperties.getPlatform = function getPlatform() {
    return "wx";
  };
  app.config.globalProperties.topBarTop = function topBarTop() {
    return safeMenuButtonRect().top;
  };
  app.config.globalProperties.topBarHeight = function topBarHeight() {
    return safeMenuButtonRect().height;
  };
  app.config.globalProperties.topBarRight = function topBarRight() {
    const rect = safeMenuButtonRect();
    return `${2 * (rect.width + 10)}rpx`;
  };
  app.config.globalProperties.subPrice = function subPrice(price, type) {
    const value = String(price);
    if (type == 1)
      return value.substring(0, value.indexOf("."));
    if (type == 2) {
      const index = value.indexOf(".");
      return value.slice(index + 1, index + 3);
    }
    return "";
  };
  app.config.globalProperties.convertTwo = function convertTwo(value) {
    return value < 10 ? `0${value}` : value;
  };
  app.config.globalProperties.yulan = function yulan(source, current) {
    let urls = [];
    if (Array.isArray(source)) {
      if (source[0] && source[0].file_path) {
        urls = source.map((item) => item.file_path);
      } else {
        urls = source;
      }
    } else {
      urls = [source];
    }
    common_vendor.index.previewImage({
      urls,
      current: Number(current),
      indicator: "default"
    });
  };
  app.config.globalProperties.mpMessage = function mpMessage() {
  };
  app.config.globalProperties.getNavHeight = function getNavHeight() {
    const windowInfo = safeWindowInfo();
    const statusBarHeight = windowInfo.statusBarHeight || 0;
    const menuRect = safeMenuButtonRect();
    const navHeight = menuRect.height + 2 * (menuRect.top - statusBarHeight) + statusBarHeight;
    const screenWidth = windowInfo.screenWidth || 0;
    return {
      navHeight,
      statusBarHeight,
      navWidth: screenWidth - (menuRect.width + (screenWidth - menuRect.right)),
      jnWidth: menuRect.width + (screenWidth - menuRect.right)
    };
  };
}
exports.validator = validator;
