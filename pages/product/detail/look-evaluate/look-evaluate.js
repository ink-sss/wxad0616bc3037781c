var t = require("../../../../@babel/runtime/helpers/defineProperty"),
  e = require("../../../../common/vendor.js"),
  a = {
    components: {
      uniLoadMore: function() {
        return "../../../../components/uni-load-more.js"
      }
    },
    data: function() {
      var e;
      return {
        phoneHeight: 0,
        scrollviewHigh: 0,
        state_active: -1,
        product_id: 0,
        tableData: [],
        Total: (e = {
          all: 0,
          negative: 0,
          praise: 0
        }, t(e, "negative", 0), t(e, "review", 0), e),
        page: 1,
        list_rows: 15,
        no_more: !1,
        loading: !0,
        last_page: 0,
        popImg: "",
        isopenimg: !1
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.tableData.length && this.no_more ? 2 : 0
      }
    },
    onLoad: function(t) {
      this.product_id = t.product_id
    },
    mounted: function() {
      this.init(), this.getData()
    },
    methods: {
      preview: function(t, e) {
        this.openImg(t, e)
      },
      openImg: function(t, a) {
        var n = [];
        t.forEach((function(t, e) {
          n.push(t.file_path)
        })), e.index.previewImage({
          urls: n,
          current: a,
          fail: function(t) {
            this.showError(t), console.log(t)
          }
        })
      },
      init: function() {
        var t = this;
        e.index.getSystemInfo({
          success: function(a) {
            t.phoneHeight = a.windowHeight, e.index.createSelectorQuery().select(".top-tabbar").boundingClientRect((function(e) {
              var a = t.phoneHeight - e.height;
              t.scrollviewHigh = a
            })).exec()
          }
        })
      },
      getData: function() {
        var t = this,
          e = t.product_id;
        t._get("product.comment/lists", {
          product_id: e,
          scoreType: t.state_active,
          page: t.page,
          list_rows: t.list_rows
        }, (function(e) {
          t.loading = !1, t.Total = e.data.total, t.tableData = t.tableData.concat(e.data.list.data), t.last_page = e.data.list.last_page, e.data.list.last_page <= 1 && (t.no_more = !0)
        }))
      },
      scrolltolowerFunc: function() {
        var t = this;
        if (t.bottomRefresh = !0, t.page++, t.loading = !0, t.page > t.last_page) return t.loading = !1, void(t.no_more = !0);
        t.getData()
      },
      stateFunc: function(t) {
        var e = this;
        e.state_active != t && (e.tableData = [], e.no_more = !1, e.loading = !0, e.state_active = t, e.page = 1, e.getData())
      }
    }
  };
Array || e.resolveComponent("uni-load-more")();
var n = e._export_sfc(a, [
  ["render", function(t, a, n, i, o, r) {
    return e.e({
      a: e.t(o.Total.all),
      b: e.n(-1 == o.state_active ? "tab-item active" : "tab-item"),
      c: e.o((function(t) {
        return r.stateFunc(0)
      }), "b5"),
      d: e.t(o.Total.praise),
      e: e.n(10 == o.state_active ? "tab-item active" : "tab-item"),
      f: e.o((function(t) {
        return r.stateFunc(10)
      }), "8f"),
      g: e.t(o.Total.review),
      h: e.n(20 == o.state_active ? "tab-item active" : "tab-item"),
      i: e.o((function(t) {
        return r.stateFunc(20)
      }), "20"),
      j: e.t(o.Total.negative),
      k: e.n(30 == o.state_active ? "tab-item active" : "tab-item"),
      l: e.o((function(t) {
        return r.stateFunc(30)
      }), "f3"),
      m: e.f(o.tableData, (function(t, a, n) {
        return e.e({
          a: t.users.avatarUrl,
          b: e.t(t.users.nickName),
          c: 10 == t.score
        }, (t.score, {}), {
          d: 20 == t.score
        }, (t.score, {}), {
          e: 30 == t.score
        }, (t.score, {}), {
          f: e.t(t.create_time),
          g: e.t(t.content),
          h: e.f(t.image, (function(a, n, i) {
            return {
              a: e.o((function(e) {
                return r.preview(t.image, a.file_path)
              }), n),
              b: a.file_path,
              c: n
            }
          })),
          i: a
        })
      })),
      n: 0 == o.tableData.length && !o.loading
    }, 0 != o.tableData.length || o.loading ? {
      p: e.p({
        loadingType: r.loadingType
      })
    } : {
      o: t.config.pic_url + "/static/live/none.png"
    }, {
      q: e.s("height:" + o.scrollviewHigh + "px;"),
      r: e.o((function() {
        return r.scrolltolowerFunc && r.scrolltolowerFunc.apply(r, arguments)
      }), "c6"),
      s: o.isopenimg
    }, o.isopenimg ? {
      t: o.popImg,
      v: e.o((function(t) {
        return o.isopenimg = !1
      }), "d3")
    } : {})
  }]
]);
wx.createPage(n);