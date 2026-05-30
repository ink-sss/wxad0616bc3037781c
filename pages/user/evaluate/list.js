var t = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        loading: !1,
        state_active: 0,
        list: [],
        last_page: 0,
        no_more: !1,
        page: 1
      }
    },
    onLoad: function(t) {},
    onShow: function() {
      this.page = 1, this.list = [], t.index.showLoading({
        title: "加载中"
      }), this.getData()
    },
    methods: {
      getData: function() {
        var e = this;
        e.loading = !0, e._post("product.comment/userLists", {
          page: e.page,
          list_rows: 10
        }, (function(a) {
          if (t.index.hideLoading(), a.data.list.data && a.data.list.data.length > 0 && a.data.list.data.forEach((function(t) {
              t.year = t.create_time.substr(0, 4), t.mouth = t.create_time.substr(5, 2), t.data = t.create_time.substr(8, 2)
            })), e.list = e.list.concat(a.data.list.data), e.last_page = a.data.lastPage, e.loading = !1, e.last_page <= 1) return e.no_more = !0, !1
        }))
      },
      del: function(e, a) {
        var o = this;
        t.wx$1.showModal({
          title: "提示",
          content: "您确定删除该评论吗?",
          success: function(n) {
            n.confirm && o._post("product.comment/delete", {
              comment_id: e.comment_id
            }, (function(e) {
              t.index.showToast({
                title: "删除成功",
                duration: 1e3,
                icon: "none"
              }), o.list.splice(a, 1)
            }))
          }
        })
      },
      onReachBottom: function() {
        var t = this;
        t.no_more || (t.page++, t.page <= t.last_page ? t.getData() : t.no_more = !0)
      }
    }
  },
  a = t._export_sfc(e, [
    ["render", function(e, a, o, n, i, r) {
      return t.e({
        a: t.f(i.list, (function(e, a, o) {
          return t.e({
            a: t.t(e.data),
            b: t.t(e.mouth),
            c: t.t(e.year),
            d: t.o((function(t) {
              return r.del(e, a)
            }), a),
            e: t.t(e.content),
            f: t.f(e.image, (function(t, e, a) {
              return {
                a: t.file_path,
                b: e
              }
            })),
            g: e.OrderProduct
          }, e.OrderProduct ? t.e({
            h: e.OrderProduct.image
          }, e.OrderProduct.image ? {
            i: e.OrderProduct.image.file_path
          } : {}, {
            j: t.t(e.OrderProduct.product_name),
            k: t.t(e.OrderProduct.product_attr)
          }) : {}, {
            l: a
          })
        })),
        b: 0 == i.list.length && !i.loading
      }, (0 != i.list.length || i.loading, {}), {
        c: e.theme(),
        d: t.n(e.theme() || "")
      })
    }]
  ]);
wx.createPage(a);