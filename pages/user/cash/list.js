var t = require("../../../common/vendor.js"),
  a = {
    components: {
      uniLoadMore: function() {
        return "../../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        phoneHeight: 0,
        scrollviewHigh: 0,
        state_active: -1,
        tableData: [],
        no_more: !1,
        loading: !0,
        last_page: 0,
        page: 1,
        list_rows: 20,
        tableList: [],
        urldata: "",
        configData: {
          appid: "",
          mchid: ""
        }
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.tableData.length && this.no_more ? 2 : 0
      }
    },
    mounted: function() {
      this.init(), this.getData(), "mp" == this.getPlatform() && (this.urldata = window.location.href)
    },
    methods: {
      receiptWx: function(a) {
        var e = this,
          n = a.id,
          o = e.configData.mchid,
          i = e.configData.appid,
          s = a.package_info;
        t.wx$1.canIUse("requestMerchantTransfer") ? t.wx$1.requestMerchantTransfer({
          mchId: o,
          appId: i,
          package: s,
          success: function(t) {
            console.log("success:", t), e._post("user.cash/receipt", {
              id: n
            }, (function(t) {
              e.tableData = [], e.getData()
            }))
          },
          fail: function(t) {
            console.log("fail:", t)
          }
        }) : (e.loading = !1, t.wx$1.showModal({
          content: "你的微信版本过低，请更新至最新版本。",
          showCancel: !1
        }))
      },
      receiptMp: function(t) {
        t.id, this.configData.mchid, this.configData.appid, t.package_info
      },
      getWxSignPackage: function(t, a) {
        this._post("index/getSignPackage", {
          url: this.urldata,
          paySource: this.getPlatform()
        }, (function(t) {
          a(t.data.signPackage)
        }))
      },
      init: function() {
        var a = this;
        t.index.getSystemInfo({
          success: function(t) {
            a.phoneHeight = t.windowHeight, a.scrollviewHigh = t.windowHeight
          }
        })
      },
      getData: function() {
        var t = this,
          a = t.page;
        t.loading = !0;
        var e = t.list_rows;
        t._get("user.cash/lists", {
          status: -1,
          page: a || 1,
          list_rows: e,
          source: t.getPlatform()
        }, (function(a) {
          t.loading = !1, t.configData = a.data.config, t.tableData = t.tableData.concat(a.data.list.data), t.last_page = a.data.list.last_page, a.data.list.last_page <= 1 && (t.no_more = !0)
        }))
      },
      stateFunc: function(t) {
        var a = this;
        t != a.state_active && (a.tableData = [], a.page = 1, a.state_active = t, a.getData())
      },
      scrolltoupperFunc: function() {
        console.log("滚动视图区域到顶")
      },
      scrolltolowerFunc: function() {
        var t = this;
        t.page < t.last_page && (t.page++, t.getData()), t.no_more = !0
      }
    }
  };
Array || t.resolveComponent("uni-load-more")();
var e = t._export_sfc(a, [
  ["render", function(a, e, n, o, i, s) {
    return t.e({
      a: t.f(i.tableData, (function(a, e, n) {
        return t.e({
          a: t.t(a.create_time),
          b: t.t(a.money),
          c: t.t(a.apply_status.text),
          d: t.n("审核通过" == a.apply_status.text ? "green" : "gray9"),
          e: 50 === a.apply_status.value
        }, 50 === a.apply_status.value ? {
          f: t.o((function(t) {
            return s.receiptWx(a)
          }), e)
        } : {}, {
          g: e
        })
      })),
      b: 0 == i.tableData.length && !i.loading
    }, 0 != i.tableData.length || i.loading ? {
      c: t.p({
        loadingType: s.loadingType
      })
    } : {}, {
      d: t.s("height:" + i.scrollviewHigh + "px;"),
      e: t.o((function() {
        return s.scrolltoupperFunc && s.scrolltoupperFunc.apply(s, arguments)
      }), "87"),
      f: t.o((function() {
        return s.scrolltolowerFunc && s.scrolltolowerFunc.apply(s, arguments)
      }), "d9"),
      g: a.theme(),
      h: t.n(a.theme() || "")
    })
  }]
]);
wx.createPage(e);