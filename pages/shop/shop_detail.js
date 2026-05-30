var o = require("../../common/vendor.js");
require("../../env/config.js");
var t = require("../../common/assets.js"),
  s = {
    data: function() {
      return {
        invitation_id: 0,
        day_task: [],
        grow_task: [],
        back_image: "",
        shop_supplier_id: "",
        shopData: {},
        isfollow: "",
        showModal: !1
      }
    },
    onLoad: function(o) {
      this.shop_supplier_id = o.shop_supplier_id
    },
    onShow: function() {
      this.getData()
    },
    methods: {
      opencat: function() {
        o.index.showToast({
          title: "尚未设置客服",
          icon: "none",
          duration: 1e3
        })
      },
      openClick: function() {
        this.showModal = !0
      },
      cancelAction: function() {
        this.showModal = !1
      },
      guanzhu: function() {
        var o = this;
        o._post("user.Favorite/add", {
          pid: o.shop_supplier_id,
          type: 10
        }, (function(t) {
          0 == o.isfollow ? o.isfollow = 1 : 1 == o.isfollow && (o.isfollow = 0)
        }))
      },
      clickFunc: function(o) {
        var t;
        (t = "/pages/shop/shop?shop_supplier_id=" + this.shop_supplier_id) && this.gotoPage(t)
      },
      getScore: function(o, t) {
        if ((o *= 1) <= 0 || !o) return 0;
        var s = o % 1;
        return 1 == t ? o - s : 2 == t ? 0 == s ? 0 : 1 : void 0
      },
      getData: function() {
        var o = this;
        o._get("supplier.Index/detail", {
          shop_supplier_id: o.shop_supplier_id
        }, (function(t) {
          o.shopData = t.data.detail, o.isfollow = t.data.detail.isfollow
        }))
      }
    }
  },
  e = o._export_sfc(s, [
    ["render", function(s, e, a, i, n, r) {
      return o.e({
        a: n.shopData.logos || s.config.pic_url + "/static/shop-default.png",
        b: o.t(n.shopData.store_name),
        c: o.f(r.getScore(n.shopData.server_score, 1), (function(o, t, s) {
          return {
            a: t
          }
        })),
        d: t._imports_0$5,
        e: r.getScore(n.shopData.server_score, 2)
      }, r.getScore(n.shopData.server_score, 2) ? {
        f: t._imports_1$4
      } : {}, {
        g: o.f(5, (function(o, t, s) {
          return {
            a: t
          }
        })),
        h: t._imports_2$2,
        i: o.t(n.shopData.server_score),
        j: o.t(n.shopData.fav_count),
        k: o.t(n.isfollow ? "已关注" : "+关注"),
        l: o.o((function(o) {
          return r.guanzhu()
        }), "de")
      }, {}, {
        n: o.t(n.shopData.description || ""),
        o: o.o((function(o) {
          return r.openClick()
        }), "79"),
        p: o.t(n.shopData.address),
        q: o.t(n.shopData.create_time),
        r: o.o((function(o) {
          return s.yulan(n.shopData.business_image, 1)
        }), "ef"),
        s: 0 == n.shopData.status
      }, (n.shopData.status, {}), {
        t: 0 != n.shopData.status
      }, (n.shopData.status, {}), {
        v: n.showModal
      }, n.showModal ? {
        w: o.o((function() {
          return r.cancelAction && r.cancelAction.apply(r, arguments)
        }), "9d"),
        x: o.t(n.shopData.description || "暂无内容")
      } : {}, {
        y: o.o((function(o) {
          return r.clickFunc()
        }), "72"),
        z: s.theme(),
        A: o.n(s.theme() || "")
      })
    }]
  ]);
wx.createPage(e);