var t = require("../../common/vendor.js");
require("../../env/config.js");
var e = {
    components: {
      uniLoadMore: function() {
        return "../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        triggered: !0,
        phoneHeight: 0,
        scrollviewHigh: 0,
        state_active: -1,
        no_more: !1,
        loading: !1,
        last_page: 0,
        page: 1,
        list_rows: 10,
        topRefresh: !1,
        type_active: "all",
        price_top: !1,
        shopData: [],
        searchtxt: "",
        keyWord: "",
        stateTab: !1,
        isDomHeight: !0,
        osName: "",
        footerHeight: ""
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.shopData.length && this.no_more ? 2 : 0
      }
    },
    onReady: function() {
      t.index.hideTabBar()
    },
    mounted: function() {
      var e = "";
      t.index.getSystemInfo({
        success: function(t) {
          e = t.osName
        }
      }), this.osName = e, this.init(), this._freshing = !1, this.restoreData(), this.getData()
    },
    methods: {
      getScore: function(t, e) {
        if ((t *= 1) <= 0 || !t) return 0;
        var o = t % 1;
        return 1 == e ? t - o : 2 == e ? 0 == o ? 0 : 1 : void 0
      },
      init: function() {
        var e = this;
        t.index.getSystemInfo({
          success: function(o) {
            e.phoneHeight = o.windowHeight, t.index.createSelectorQuery().in(e).select(".top-box").boundingClientRect((function(o) {
              var i = e.phoneHeight - o.height;
              e.scrollviewHigh = i;
              var n = t.index.createSelectorQuery().select("#footBottom");
              n && n.boundingClientRect((function(t) {
                t && t.height && (e.footerHeight = t.height, e.footerHeight && (e.scrollviewHigh = e.scrollviewHigh - e.footerHeight), e.isDomHeight = !1)
              })).exec()
            })).exec()
          }
        })
      },
      restoreData: function() {
        this.shopData = [], this.page = 1, this.no_more = !1, this.category_id = 0, this.searchtxt = "", this.sortType = "", this.sortPrice = 0
      },
      tabTypeFunc: function(t) {
        var e = this;
        e.shopData = [], e.page = 1, e.no_more = !1, e.loading || (e.type_active = t, e.getData())
      },
      getData: function() {
        var t = this,
          e = t.page,
          o = t.list_rows;
        t.loading || (t.loading = !0, t._post("supplier.index/list", {
          page: e || 1,
          list_rows: o,
          sortType: t.type_active,
          name: t.keyWord
        }, (function(e) {
          t.loading = !1, t.last_page = e.data.list.last_page, t.shopData = t.shopData.concat(e.data.list.data), e.data.list.last_page <= 1 ? t.no_more = !0 : t.no_more = !1
        })))
      },
      onRefresh: function() {
        var t = this;
        this._freshing || (this._freshing = !0, this.restoreData(), this.getData(), setTimeout((function() {
          t.triggered = !1, t._freshing = !1
        }), 2e3))
      },
      onRestore: function() {
        this.triggered = "restore"
      },
      search: function() {
        var t = this;
        t.keyWord = t.searchtxt, t.restoreData(), t.getData()
      },
      scrolltolowerFunc: function() {
        var t = this;
        t.no_more || (t.page++, t.page <= t.last_page ? t.getData() : t.no_more = !0)
      }
    }
  },
  o = t._export_sfc(e, [
    ["render", function(e, o, i, n, a, r) {
      return {
        a: e.theme(),
        b: t.n(e.theme() || "")
      }
    }]
  ]);
wx.createPage(o);