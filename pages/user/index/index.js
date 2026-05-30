var e = require("../../../common/vendor.js"),
  o = {
    components: {
      diy: function() {
        return "../../../components/diy/diy.js"
      },
      liveTab: function() {
        return "../../../components/liveTab.js"
      }
    },
    data: function() {
      return {
        items: [],
        isloadding: !0,
        loadding: !0,
        detail: {
          balance: 0,
          points: 0,
          grade: {
            name: ""
          }
        },
        storeInfo: {},
        orderCount: {},
        coupon: 0,
        storeCouponCount: 0,
        user_type: "",
        msgcount: 0,
        sessionKey: "",
        wxBinding: !1,
        getPhone: !1,
        urls: "",
        jweixin: null,
        bgColor: "",
        liveData: null,
        version: ""
      }
    },
    onReady: function() {
      e.index.hideTabBar()
    },
    onPullDownRefresh: function() {
      this.getData()
    },
    onShow: function() {
      this.getData()
    },
    onLoad: function(o) {
      var n = this;
      n.wxBinding = e.index.getStorageSync("wxBinding"), o && o.referee_id && e.index.setStorageSync("referee_id", o.referee_id), e.wx$1.login({
        success: function(e) {
          n._post("user.user/getSession", {
            code: e.code
          }, (function(e) {
            n.sessionKey = e.data.session_key
          }))
        }
      }), e.index.setNavigationBarColor({
        frontColor: "#ffffff",
        backgroundColor: "#ffffff"
      })
    },
    methods: {
      scanQrcode: function() {
        var o = this;
        e.index.scanCode({
          onlyFromCamera: !0,
          success: function(n) {
            "scanCode:ok" == n.errMsg ? o.gotoPage("/pages/store/clerkorder?order_no=" + n.result) : e.index.showToast({
              title: "扫码失败，请重试"
            })
          }
        })
      },
      getData: function() {
        var o = this;
        o.isloadding = !0, e.index.showLoading({
          title: "加载中"
        }), o._get("user.index/center", {
          url: o.urls,
          source: o.getPlatform()
        }, (function(n) {
          o.detail = n.data.userInfo, o.storeInfo = n.data.storeInfo, o.coupon = n.data.coupon, o.storeCouponCount = n.data.storeCouponCount, o.orderCount = n.data.orderCount, o.msgcount = n.data.msgcount, o.getPhone = n.data.getPhone, o.loadding = !1, o.items = n.data.page.items, o.setPage(n.data.page.page), o.loadding = !1, e.index.stopPullDownRefresh(), e.index.hideLoading(), o.isloadding = !1
        }))
      },
      setPage: function(o) {
        e.index.setNavigationBarTitle({
          title: o.params.name
        })
      },
      bindMobile: function() {
        this.gotoPage("/pages/user/modify-phone/modify-phone")
      },
      getPhoneNumber: function(o) {
        var n = this;
        if ("getPhoneNumber:ok" !== o.detail.errMsg) return !1;
        e.index.showLoading({
          title: "加载中"
        }), e.index.login({
          success: function(t) {
            n._post("user.user/bindMobile", {
              session_key: n.sessionKey,
              encrypted_data: o.detail.encryptedData,
              iv: o.detail.iv
            }, (function(o) {
              e.index.showToast({
                title: "绑定成功"
              }), n.detail.mobile = o.data.mobile
            }), !1, (function() {
              e.index.hideLoading()
            }))
          }
        })
      },
      bg: function(e) {
        this.bgColor = e
      }
    }
  };
Array || (e.resolveComponent("diy") + e.resolveComponent("request-loading") + e.resolveComponent("liveTab") + e.resolveComponent("tabBar"))(), Math;
var n = e._export_sfc(o, [
  ["render", function(o, n, t, i, r, a) {
    return e.e({
      a: r.bgColor,
      b: r.getPhone
    }, r.getPhone ? e.e({
      c: r.wxBinding
    }, r.wxBinding ? {
      d: e.o((function() {
        return a.getPhoneNumber && a.getPhoneNumber.apply(a, arguments)
      }), "fe")
    } : {
      e: e.o((function() {
        return a.bindMobile && a.bindMobile.apply(a, arguments)
      }), "44")
    }) : {}, {
      f: e.o(a.scanQrcode, "8a"),
      g: e.o(a.bg, "1c"),
      h: e.p({
        diyItems: r.items,
        storeInfo: r.storeInfo,
        userInfo: {
          detail: r.detail,
          coupon: r.coupon,
          storeCouponCount: r.storeCouponCount,
          orderCount: r.orderCount,
          msgcount: r.msgcount
        }
      }),
      i: e.p({
        loadding: r.isloadding
      }),
      j: o.theme(),
      k: e.n(o.theme() || "")
    })
  }]
]);
wx.createPage(n);