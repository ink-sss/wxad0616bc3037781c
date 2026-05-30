var e = require("../@babel/runtime/helpers/typeof"),
  t = require("../common/vendor.js");
exports.requestFun = function(o) {
  o.config.globalProperties._get = function(o, n, a, i, r) {
    var s = this;
    (n = n || {}).token = this.config.token, n.app_id = this.getAppId(), n.appid = this.config.appid;
    var c = this.websiteUrl;
    n.source_client = "wx", "user.user/getSession" === o && delete n.appid, t.index.request({
      url: c + "/index.php/api/" + o,
      data: n,
      dataType: "json",
      method: "GET",
      success: function(o) {
        if (200 !== o.statusCode || "object" != e(o.data)) return !1;
        if (-2 === o.data.code) s.showError(o.data.msg, (function() {
          t.index.removeStorageSync("token")
        }));
        else if (-1 === o.data.code) console.log("登录态失效, 重新登录"), s.doLogin();
        else {
          if (0 === o.data.code) return s.showError(o.data.msg, (function() {
            i && i(o)
          })), !1;
          a && a(o.data)
        }
      },
      fail: function(e) {
        i && i(e)
      },
      complete: function(e) {
        r && r(e)
      }
    })
  }, o.config.globalProperties._post = function(o, n, a, i, r) {
    var s = this;
    (n = n || {}).token = this.config.token, n.app_id = this.getAppId(), n.appid = this.config.appid;
    var c = this.websiteUrl;
    n.source_client = "wx", "user.user/getSession" === o && delete n.appid, t.index.request({
      url: c + "/index.php/api/" + o,
      data: n,
      dataType: "json",
      method: "POST",
      header: {
        "content-type": "application/json;charset=UTF-8"
      },
      success: function(t) {
        if (200 !== t.statusCode || "object" != e(t.data)) return !1;
        if (-1 === t.data.code) console.log("登录态失效, 重新登录"), s.doLogin();
        else {
          if (0 === t.data.code) return s.showError(t.data.msg, (function() {
            i && i(t)
          })), !1;
          a && a(t.data)
        }
      },
      fail: function(e) {
        i && i(e)
      },
      complete: function(e) {
        r && r(e)
      }
    })
  }, o.config.globalProperties._StoreGet = function(o, n, a, i, r) {
    var s = this;
    (n = n || {}).token = this.config.token, n.app_id = this.getAppId(), n.appid = this.config.appid;
    var c = this.websiteUrl;
    t.index.request({
      url: c + "/index.php/api/" + o,
      data: n,
      dataType: "json",
      method: "GET",
      success: function(o) {
        if (200 !== o.statusCode || "object" != e(o.data)) return !1;
        if (-2 === o.data.code) s.showError(o.data.msg, (function() {
          t.index.removeStorageSync("token")
        }));
        else if (-1 === o.data.code) console.log("登录态失效, 重新登录"), s.gotoPage("/pages/branch/login");
        else {
          if (0 === o.data.code) return s.showError(o.data.msg, (function() {
            i && i(o)
          })), !1;
          a && a(o.data)
        }
      },
      fail: function(e) {
        i && i(e)
      },
      complete: function(e) {
        r && r(e)
      }
    })
  }, o.config.globalProperties._StorePost = function(o, n, a, i, r) {
    var s = this;
    (n = n || {}).token = this.config.token, n.app_id = this.getAppId(), n.appid = this.config.appid;
    var c = this.websiteUrl;
    t.index.request({
      url: c + "/index.php/api/" + o,
      data: n,
      dataType: "json",
      method: "POST",
      header: {
        "content-type": "application/json;charset=UTF-8"
      },
      success: function(t) {
        if (200 !== t.statusCode || "object" != e(t.data)) return !1;
        if (-1 === t.data.code) console.log("登录态失效, 重新登录"), s.gotoPage("/pages/branch/login");
        else {
          if (0 === t.data.code) return s.showError(t.data.msg, (function() {
            i && i(t)
          })), !1;
          a && a(t.data)
        }
      },
      fail: function(e) {
        i && i(e)
      },
      complete: function(e) {
        r && r(e)
      }
    })
  }, o.config.globalProperties._SupplierGet = function(o, n, a, i, r) {
    var s = this;
    (n = n || {}).token = this.config.token, n.app_id = this.getAppId(), n.appid = this.config.appid;
    var c = this.websiteUrl;
    t.index.request({
      url: c + "/index.php/api/" + o,
      data: n,
      dataType: "json",
      method: "GET",
      success: function(o) {
        if (200 !== o.statusCode || "object" != e(o.data)) return !1;
        if (-2 === o.data.code) s.showError(o.data.msg, (function() {
          t.index.removeStorageSync("token")
        }));
        else if (-1 === o.data.code) console.log("登录态失效, 重新登录"), s.gotoPage("/pages/live-management/login");
        else {
          if (0 === o.data.code) return s.showError(o.data.msg, (function() {
            i && i(o)
          })), !1;
          a && a(o.data)
        }
      },
      fail: function(e) {
        i && i(e)
      },
      complete: function(e) {
        r && r(e)
      }
    })
  }, o.config.globalProperties._SupplierPost = function(o, n, a, i, r) {
    var s = this;
    (n = n || {}).token = this.config.token, n.app_id = this.getAppId(), n.appid = this.config.appid;
    var c = this.websiteUrl;
    t.index.request({
      url: c + "/index.php/api/" + o,
      data: n,
      dataType: "json",
      method: "POST",
      header: {
        "content-type": "application/json;charset=UTF-8"
      },
      success: function(t) {
        if (200 !== t.statusCode || "object" != e(t.data)) return !1;
        if (-1 === t.data.code) console.log("登录态失效, 重新登录"), s.gotoPage("/pages/live-management/login", "reLaunch");
        else {
          if (0 === t.data.code) return s.showError(t.data.msg, (function() {
            i && i(t)
          })), !1;
          a && a(t.data)
        }
      },
      fail: function(e) {
        i && i(e)
      },
      complete: function(e) {
        r && r(e)
      }
    })
  }, o.config.globalProperties.doLogin = function() {
    var e = getCurrentPages();
    if (e.length) {
      var o = e[e.length - 1];
      "pages/login/login" != o.route && "pages/login/weblogin" != o.route && "pages/login/openlogin" != o.route && (t.index.setStorageSync("currentPage", o.route), t.index.setStorageSync("currentPageOptions", o.$page.options))
    }
    console.log("app_ID=" + this.getAppId()), t.index.getStorageSync("me") ? this.gotoPage("/pages/login/anchorlogin") : this.gotoPage("/pages/login/login")
  }
};
