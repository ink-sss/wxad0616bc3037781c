var e = require("../../common/vendor.js"),
  o = {
    components: {
      diy: function() {
        return "../../components/diy/diy.js"
      },
      Homepush: function() {
        return "./home-push/home-push.js"
      },
      searchProduct: function() {
        return "../../components/searchProduct.js"
      },
      liveTab: function() {
        return "../../components/liveTab.js"
      }
    },
    data: function() {
      return {
        loading: !0,
        loadding: !0,
        phoneHeight: 0,
        scrollviewHigh: 0,
        items: [],
        is_collection: !1,
        is_follow: "0",
        is_homepush: !1,
        homepush_data: {},
        target: 0,
        thisindex: 0,
        homeShare: {},
        share_img: "",
        url: "",
        jweixin: null,
        diytop: 0,
        showSearch: !1,
        searchIconTxt: "",
        rightSearch: "",
        liveData: null
      }
    },
    onReady: function() {
      e.index.hideTabBar()
    },
    onShareAppMessage: function() {
      var e = this;
      return {
        title: e.homeShare.share_title,
        path: "/pages/index/index?" + e.getShareUrlParams(),
        imageUrl: e.homeShare.share_img
      }
    },
    onShareTimeline: function() {
      var e = this;
      return {
        title: e.homeShare.share_title,
        query: "/pages/index/index?" + e.getShareUrlParams(),
        imageUrl: e.homeShare.share_img
      }
    },
    onTabItemTap: function() {},
    onLoad: function(o) {
      e.index.removeStorageSync("me"), o.invitation_id && e.index.setStorageSync("invitation_id", o.invitation_id), o.referee_id && e.index.setStorageSync("referee_id", o.referee_id), e.index.getStorageSync("is_liveGo") && (this.liveData = e.index.getStorageSync("is_liveGo")), this.getData()
    },
    onPullDownRefresh: function() {
      console.log("onPullDownRefresh"), this.toggleInit()
    },
    onReachBottom: function() {
      this.$refs.diy.scrolltolowerFunc(), console.log("到底了")
    },
    onPageScroll: function(e) {
      this.diytop = e.scrollTop
    },
    mounted: function() {},
    methods: {
      stopPush: function() {
        e.index.stopPullDownRefresh()
      },
      openSearch: function(e) {
        e && (this.showSearch = !0)
      },
      getData: function() {
        var o = this;
        e.index.showLoading({
          title: "加载中"
        }), o._get("index/index", {
          url: o.url
        }, (function(t) {
          o.items = t.data.items, o.homeShare = t.data.page.params, o.setPage(t.data.page), "" == e.index.getStorageSync("isFirst") && "1" == t.data.setting.collection.status && (o.is_collection = !0, e.index.setStorageSync("isFirst", 1)), o.is_follow = t.data.setting.officia.status;
          var i = e.index.getStorageSync("homepush_name");
          t.data.setting.homepush.is_open && i != t.data.setting.homepush.name && (o.homepush_data = t.data.setting.homepush, o.is_homepush = !0, o.is_homepush = !0), e.index.hideLoading(), o.loadding = !1, console.log("stopPullDownRefresh"), e.index.stopPullDownRefresh()
        }))
      },
      setPage: function(o) {
        e.index.setNavigationBarTitle({
          title: o.params.name
        }), e.index.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: "#ffffff"
        })
      },
      toggleInit: function() {
        this.$refs.diy.pullDown()
      },
      stopTouchMove: function() {
        return !0
      },
      scanQrcode: function() {
        var o = this;
        e.index.scanCode({
          onlyFromCamera: !0,
          success: function(t) {
            "scanCode:ok" == t.errMsg ? o.gotoPage("/pages/store/clerkorder?order_no=" + t.result) : e.index.showToast({
              title: "扫码失败，请重试"
            })
          }
        })
      },
      closeSearch: function() {
        this.showSearch = !1
      },
      goLive: function(o) {
        var t;
        switch (o) {
          case 0:
            t = "/pages/live-push/live-list";
            break;
          case 1:
            t = "/pages/live-push/live-push-new";
            break;
          case 2:
            t = "/pages/live/live-vertical-new?scene=live_id:7171&app_id=10001"
        }
        e.index.navigateTo({
          url: t
        })
      }
    }
  };
Array || (e.resolveComponent("diy") + e.resolveComponent("Homepush") + e.resolveComponent("searchProduct") + e.resolveComponent("liveTab") + e.resolveComponent("tabBar"))(), Math;
var t = e._export_sfc(o, [
  ["render", function(o, t, i, n, s, a) {
    return e.e({
      a: e.sr("diy", "2cf857b8-0"),
      b: e.o(a.openSearch, "25"),
      c: e.o(a.stopPush, "dd"),
      d: e.o(a.getData, "b5"),
      e: e.p({
        diyItems: s.items,
        diytop: s.diytop
      }),
      f: s.is_collection
    }, s.is_collection ? {
      g: e.o((function(e) {
        return s.is_collection = !1
      }), "1c"),
      h: e.s("top:" + (o.topBarTop() + o.topBarHeight() + 10) + "px;")
    } : {}, {
      i: "1" == s.is_follow
    }, "1" == s.is_follow ? {
      j: e.o((function(e) {
        return s.is_follow = 0
      }), "9c")
    } : {}, {
      k: s.is_homepush
    }, s.is_homepush ? {
      l: e.p({
        homepush_data: s.homepush_data
      })
    } : {}, {
      m: e.o(a.closeSearch, "96"),
      n: e.p({
        isShow: s.showSearch
      }),
      o: o.theme(),
      p: e.n(o.theme() || "")
    })
  }]
]);
o.__runtimeHooks = 7, wx.createPage(t);