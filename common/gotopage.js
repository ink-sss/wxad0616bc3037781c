var e = require("./vendor.js");
require("../env/config.js");
var i = require("./jump.js"),
  n = ["/pages/index/index", "/pages/product/category", "/pages/shop/shop_list", "/pages/cart/cart", "/pages/user/index/index"];
exports.gotopage = function(r, t) {
  if (!r || 0 == r.length) return !1;
  if (i.jump.checkAndNavigate(r))
    if (r.startsWith("#小程序")) e.wx$1.navigateToMiniProgram({
      shortLink: r,
      fail: function() {
        e.index.showToast({
          title: "打开链接失败",
          icon: "none"
        })
      }
    });
    else {
      if (console.log("outwxmp:" + r), 0 === r.indexOf("https://")) return e.index.getDeviceInfo().platform, void e.index.navigateTo({
        url: "/pages/webview/webview?url=" + encodeURIComponent(r)
      });
      "/" !== r.substr(0, 1) && (r = "/" + r);
      var o = r; - 1 != r.indexOf("?") && (o = r.substr(0, r.indexOf("?")));
      var a = e.index.getStorageSync("TabBar").list,
        s = !1;
      if (null != a && (s = a.some((function(e) {
          if (e.link_url == o) return !0
        }))), s) e.index.reLaunch({
        url: r
      });
      else if (n.indexOf(o) > -1) e.index.reLaunch({
        url: r
      });
      else {
        if ("redirect" == t) return void e.index.redirectTo({
          url: r
        });
        if ("reLaunch" == t) return void e.index.reLaunch({
          url: r
        });
        e.index.navigateTo({
          url: r
        })
      }
    }
};