var e = require("../common/vendor.js"),
  n = require("../common/utils.js"),
  t = require("../env/config.js");
exports.validator = function(i) {
  i.config.globalProperties.getAppId = function() {
    return e.index.getStorageSync("me") ? e.index.getStorageSync("me") || t.config.app_id || 10001 : t.config.app_id || e.index.getStorageSync("app_id") || 10001
  }, i.config.globalProperties.compareVersion = function(e, n) {
    e = e.split("."), n = n.split(".");
    for (var t = Math.max(e.length, n.length); e.length < t;) e.push("0");
    for (; n.length < t;) n.push("0");
    for (var i = 0; i < t; i++) {
      var o = parseInt(e[i]),
        r = parseInt(n[i]);
      if (o > r) return 1;
      if (o < r) return -1
    }
    return 0
  }, i.config.globalProperties.getVisitcode = function() {
    var n = e.index.getStorageSync("visitcode");
    return n || (n = (n = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (function(e) {
      var n = 16 * Math.random() | 0;
      return ("x" == e ? n : 3 & n | 8).toString(16)
    }))).replace(/-/g, ""), e.index.setStorageSync("visitcode", n)), n
  }, i.config.globalProperties.subMessage = function(n, t) {
    var i = e.wx$1.getSystemInfoSync().SDKVersion;
    n && 0 != n.length && this.compareVersion(i, "2.8.2") >= 0 ? (e.index.hideLoading(), e.wx$1.requestSubscribeMessage({
      tmplIds: n,
      success: function(e) {},
      fail: function(e) {},
      complete: function(e) {
        t()
      }
    })) : t()
  }, i.config.globalProperties.showError = function(n, t) {
    n ? e.index.showModal({
      title: "友情提示",
      content: n,
      showCancel: !1,
      success: function(e) {
        t && t()
      }
    }) : t && t()
  }, i.config.globalProperties.showSuccess = function(n, t) {
    e.index.showModal({
      title: "友情提示",
      content: n,
      showCancel: !1,
      success: function(e) {
        t && t()
      }
    })
  }, i.config.globalProperties.getShareUrlParams = function(e) {
    return n.utils.urlEncode(Object.assign({
      referee_id: this.getUserId(),
      app_id: this.getAppId()
    }, e))
  }, i.config.globalProperties.getUserId = function() {
    return e.index.getStorageSync("user_id")
  }, i.config.globalProperties.ios = function() {
    var e = navigator.userAgent.toLowerCase();
    return !(e.indexOf("like mac os x") < 0 || "micromessenger" != e.match(/MicroMessenger/i))
  }, i.config.globalProperties.isWeixin = function() {
    return !1
  }, i.config.globalProperties.getPlatform = function(e) {
    return "wx"
  }, i.config.globalProperties.topBarTop = function() {
    return e.index.getMenuButtonBoundingClientRect().top
  }, i.config.globalProperties.topBarHeight = function() {
    return e.index.getMenuButtonBoundingClientRect().height
  }, i.config.globalProperties.topBarRight = function() {
    return e.index.getMenuButtonBoundingClientRect().right, 2 * (e.index.getMenuButtonBoundingClientRect().width + 10) + "rpx"
  }, i.config.globalProperties.subPrice = function(e, n) {
    var t = String(e);
    if (1 == n) return t.substring(0, t.indexOf("."));
    if (2 == n) {
      var i = t.indexOf(".");
      return t.slice(i + 1, i + 3)
    }
  }, i.config.globalProperties.convertTwo = function(e) {
    return e < 10 ? "0" + e : e
  }, i.config.globalProperties.yulan = function(n, t) {
    console.log(n);
    var i = [];
    Array.isArray(n) ? n[0].file_path ? n.forEach((function(e, n) {
      i.push(e.file_path)
    })) : i = n : i = [n];
    var o = 1 * t;
    console.log(i), e.index.previewImage({
      urls: i,
      current: o,
      indicator: "default"
    })
  }, i.config.globalProperties.mpMessage = function(e) {}, i.config.globalProperties.getNavHeight = function() {
    var n, t = e.index.getWindowInfo().statusBarHeight,
      i = e.wx$1.getMenuButtonBoundingClientRect();
    n = i.height + 2 * (i.top - t) + t;
    var o = e.wx$1.getWindowInfo().screenWidth;
    return {
      navHeight: n,
      statusBarHeight: t,
      navWidth: o - (i.width + (o - i.right)),
      jnWidth: i.width + (o - i.right)
    }
  }
};