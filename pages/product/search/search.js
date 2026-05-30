var r = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        form: {},
        arr: []
      }
    },
    mounted: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var e = this;
        r.index.getStorage({
          key: "search_list",
          success: function(r) {
            null != r && null != r.data && (e.arr = r.data)
          }
        })
      },
      search: function(e) {
        var t = null;
        if (null != e) t = e;
        else {
          t = this.form.keyWord;
          var o = this.arr;
          if (void 0 === t || null == t || "" == t) return r.index.showToast({
            title: "请输入搜索的关键字",
            icon: "none",
            duration: 2e3
          }), !1;
          o.push(t), r.index.setStorage({
            key: "search_list",
            data: o,
            success: function() {
              console.log("success")
            }
          })
        }
        this.gotoPage("/pages/product/list/list?search=" + t + "&category_id=0&sortType=all")
      },
      clearStorage: function() {
        var e = this;
        r.index.removeStorage({
          key: "search_list",
          success: function(r) {
            e.arr = []
          }
        })
      }
    }
  },
  t = r._export_sfc(e, [
    ["render", function(e, t, o, n, a, c) {
      return {
        a: r.o((function(r) {
          return c.search()
        }), "29"),
        b: a.form.keyWord,
        c: r.o((function(r) {
          return a.form.keyWord = r.detail.value
        }), "b2"),
        d: r.o((function() {
          return e.gotoSearch && e.gotoSearch.apply(e, arguments)
        }), "b3"),
        e: r.o((function() {
          return c.clearStorage && c.clearStorage.apply(c, arguments)
        }), "5f"),
        f: r.f(a.arr, (function(e, t, o) {
          return {
            a: r.t(a.arr[t]),
            b: t,
            c: r.o((function(r) {
              return c.search(a.arr[t])
            }), t)
          }
        }))
      }
    }]
  ]);
wx.createPage(t);