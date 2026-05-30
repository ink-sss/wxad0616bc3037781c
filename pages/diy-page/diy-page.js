var e = require("../../common/vendor.js"),
  a = {
    components: {
      diy: function() {
        return "../../components/diy/diy.js"
      },
      share: function() {
        return "../../components/mp-share.js"
      },
      AppShare: function() {
        return "../../components/app-share.js"
      }
    },
    data: function() {
      return {
        page_id: null,
        items: {},
        page_info: {
          params: {}
        },
        isMpShare: !1,
        isAppShare: !1,
        appParams: {
          title: "",
          summary: "",
          path: ""
        },
        url: ""
      }
    },
    onLoad: function(e) {
      this.page_id = e.page_id, this.getData()
    },
    onShareAppMessage: function() {
      var e = this,
        a = e.getShareUrlParams({
          page_id: e.page_id
        });
      return {
        title: e.page_info.params.name,
        path: "/pages/diy-page/diy-page?" + a
      }
    },
    methods: {
      hasPage: function() {
        return getCurrentPages().length > 1
      },
      goback: function() {
        e.index.navigateBack()
      },
      getData: function(e) {
        var a = this;
        a._get("index/diy", {
          page_id: a.page_id,
          url: a.url
        }, (function(e) {
          a.page_info = e.data.page, a.items = e.data.items, a.setPage(a.page_info)
        }))
      },
      setPage: function(a) {
        e.index.setNavigationBarTitle({
          title: a.params.name
        });
        var t = "#000000";
        "white" == a.style.titleTextColor && (t = "#ffffff"), e.index.setNavigationBarColor({
          frontColor: t,
          backgroundColor: a.style.titleBackgroundColor
        })
      },
      showShare: function() {},
      closeBottmpanel: function(e) {
        this.isMpShare = !1
      },
      closeAppShare: function(e) {
        this.isAppShare = !1
      }
    }
  };
Array || (e.resolveComponent("diy") + e.resolveComponent("share") + e.resolveComponent("AppShare"))(), Math;
var t = e._export_sfc(a, [
  ["render", function(a, t, n, r, i, o) {
    return {
      a: e.p({
        diyItems: i.items
      }),
      b: e.o(o.closeBottmpanel, "6e"),
      c: e.p({
        isMpShare: i.isMpShare
      }),
      d: e.o(o.closeAppShare, "51"),
      e: e.p({
        isAppShare: i.isAppShare,
        appParams: i.appParams
      })
    }
  }]
]);
a.__runtimeHooks = 2, wx.createPage(t);