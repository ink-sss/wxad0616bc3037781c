var t = require("../common/vendor.js"),
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
    props: ["isShow"],
    methods: {
      getData: function() {
        var e = this;
        t.index.getStorage({
          key: "search_list",
          success: function(t) {
            null != t && null != t.data && (e.arr = t.data)
          }
        })
      },
      stopTouchMove: function() {
        return !0
      },
      search: function(e) {
        var r = null;
        if (null != e) r = e;
        else {
          r = this.form.keyWord;
          var o = this.arr;
          if (void 0 === r || null == r || "" == r) return t.index.showToast({
            title: "请输入搜索的关键字",
            icon: "none",
            duration: 2e3
          }), !1;
          o.push(r), t.index.setStorage({
            key: "search_list",
            data: o,
            success: function() {
              console.log("success")
            }
          })
        }
        this.gotoPage("/pages/product/list/list?search=" + r + "&category_id=0&sortType=all")
      },
      clearStorage: function() {
        var e = this;
        t.index.removeStorage({
          key: "search_list",
          success: function(t) {
            e.arr = []
          }
        })
      },
      closeSearch: function() {
        this.$emit("close")
      }
    }
  },
  r = t._export_sfc(e, [
    ["render", function(e, r, o, n, a, i) {
      return t.e({
        a: o.isShow
      }, o.isShow ? {
        b: t.s("height:" + e.topBarTop() + "px;"),
        c: t.o((function() {
          return i.closeSearch && i.closeSearch.apply(i, arguments)
        }), "8b"),
        d: t.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;"),
        e: t.o((function(t) {
          return i.search()
        }), "cc"),
        f: a.form.keyWord,
        g: t.o((function(t) {
          return a.form.keyWord = t.detail.value
        }), "ff"),
        h: t.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;"),
        i: t.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;padding-right: 200rpx"),
        j: t.o((function() {
          return i.clearStorage && i.clearStorage.apply(i, arguments)
        }), "c2"),
        k: t.f(a.arr, (function(e, r, o) {
          return {
            a: t.t(a.arr[r]),
            b: r,
            c: t.o((function(t) {
              return i.search(a.arr[r])
            }), r)
          }
        })),
        l: t.o((function() {
          return i.stopTouchMove && i.stopTouchMove.apply(i, arguments)
        }), "de")
      } : {})
    }]
  ]);
wx.createComponent(r);