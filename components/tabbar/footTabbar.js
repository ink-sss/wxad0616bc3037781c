var t = require("../../common/vendor.js"),
  e = {
    components: {
      bindMobile: function() {
        return "../../pages/login/bindmobile-pop.js"
      }
    },
    data: function() {
      return {
        activeTabber: "首页",
        open_liveMenu: !1,
        detail: {
          list: []
        },
        hasTab: !1,
        wx_phone_compulsory: !1
      }
    },
    props: {
      isScroll: {
        default: !1
      }
    },
    created: function() {
      var t = getCurrentPages();
      t.length && "pages/index/index" == t[t.length - 1].route && this.$store.commit("changefootTab", "首页"), this.getData()
    },
    mounted: function() {
      this.wxPhone()
    },
    methods: {
      wxPhone: function() {
        var e = this,
          o = t.index.getStorageSync("get_phone") || !1;
        this.wx_phone_compulsory = t.index.getStorageSync("wx_phone_compulsory") || !1, o && (t.index.removeStorageSync("get_phone"), this.$nextTick((function() {
          e.$refs.bindmobile && e.$refs.bindmobile.showUserLoginPop && e.$refs.bindmobile.showUserLoginPop()
        })))
      },
      getNav: function() {
        var e = this.$store.state.theme,
          o = {
            backgroundColor: "#FFFFFF",
            is_auto: "0",
            textColor: "#000000",
            textHoverColor: this.getThemeColor(),
            type: "0",
            list: [{
              iconPath: "/static/tabbar/home.png",
              link_url: "/pages/index/index",
              selectedIconPath: "/static/tabbar/home_".concat(e, ".png"),
              text: "首页"
            }, {
              iconPath: "/static/tabbar/category.png",
              link_url: "/pages/product/category",
              selectedIconPath: "/static/tabbar/category_".concat(e, ".png"),
              text: "分类"
            }, {
              iconPath: "/static/tabbar/shop.png",
              is_show: !0,
              link_url: "/pages/shop/shop_list",
              selectedIconPath: "/static/tabbar/shop_".concat(e, ".png"),
              text: "商户"
            }, {
              iconPath: "/static/tabbar/cart.png",
              is_show: !0,
              link_url: "/pages/cart/cart",
              selectedIconPath: "/static/tabbar/cart_".concat(e, ".png"),
              text: "购物车"
            }, {
              iconPath: "/static/tabbar/user.png",
              is_show: !0,
              link_url: "/pages/user/index/index",
              selectedIconPath: "/static/tabbar/user_".concat(e, ".png"),
              text: "我的"
            }]
          };
        this.detail = o, t.index.setStorageSync("TabBar", o)
      },
      getRoute: function() {
        var t = getCurrentPages(),
          e = "/" + t[t.length - 1].route;
        return "/pages/diy-page/diy-page" != e && "/pages/article/detail/detail" != e || t[t.length - 1].$page && (e = t[t.length - 1].$page.fullPath), e
      },
      tabBarFunc: function(t) {
        this.footTabberData.active != t.text && (this.$store.commit("changefootTab", t.text), this.gotoPage(t.link_url))
      },
      getData: function() {
        var e = this;
        e._get("index/nav", {}, (function(o) {
          e.detail = o.data.vars.data, e.detail && "0" != e.detail.is_auto ? (console.log("is_auto:1"), t.index.setStorageSync("TabBar", e.detail)) : e.getNav()
        }))
      }
    }
  };
Array || t.resolveComponent("bind-mobile")();
var o = t._export_sfc(e, [
  ["render", function(e, o, a, n, i, r) {
    return t.e({
      a: !a.isScroll
    }, (a.isScroll, {}), {
      b: t.f(i.detail.list, (function(e, o, a) {
        return t.e({
          a: "商户" == e.text && e.is_show || "商户" != e.text && !0
        }, "商户" == e.text && e.is_show || "商户" != e.text ? t.e({
          b: t.t(r.getRoute()),
          c: 2 != i.detail.type
        }, 2 != i.detail.type ? {
          d: e.link_url == r.getRoute() ? e.selectedIconPath : e.iconPath
        } : {}, {
          e: 1 != i.detail.type
        }, 1 != i.detail.type ? {
          f: t.t(e.text),
          g: t.s(e.link_url == r.getRoute() ? "color:" + i.detail.textHoverColor + ";" : "color:" + i.detail.textColor + ";")
        } : {}, {
          h: e.link_url == r.getRoute() ? 1 : "",
          i: t.o((function(t) {
            return r.tabBarFunc(e)
          }), o)
        }) : {}, {
          j: o
        })
      })),
      c: t.s("background:" + i.detail.backgroundColor || ";"),
      d: t.sr("bindmobile", "155a5a46-0"),
      e: t.p({
        "wx-phone-compulsory": i.wx_phone_compulsory
      }),
      f: t.o((function() {}), "7c")
    })
  }]
]);
wx.createComponent(o);