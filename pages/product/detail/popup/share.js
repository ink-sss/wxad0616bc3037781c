var e = require("../../../../common/vendor.js");
require("../../../../env/config.js");
var o = {
    data: function() {
      return {
        Visible: !1,
        poster_img: "",
        wechat_share: !1
      }
    },
    props: ["isbottmpanel", "product_id"],
    watch: {
      isbottmpanel: function(e, o) {
        e != o && (this.wechat_share = !1, this.Visible = e)
      }
    },
    methods: {
      closePopup: function(e) {
        this.$emit("close", {
          type: e,
          poster_img: this.poster_img
        })
      },
      share: function() {},
      genePoster: function() {
        var o = this;
        e.index.showLoading({
          title: "加载中"
        }), o._get("product.product/poster", {
          product_id: o.product_id,
          source: "wx"
        }, (function(e) {
          o.poster_img = e.data.qrcode, o.closePopup(2)
        }), null, (function() {
          e.index.hideLoading()
        }))
      }
    }
  },
  t = e._export_sfc(o, [
    ["render", function(o, t, n, r, i, s) {
      return e.e({
        a: i.wechat_share
      }, i.wechat_share ? {
        b: o.config.pic_url + "/static/share.png"
      } : {}, {
        c: e.o((function() {
          return s.share && s.share.apply(s, arguments)
        }), "0e"),
        d: e.o((function() {
          return s.genePoster && s.genePoster.apply(s, arguments)
        }), "26"),
        e: e.o((function(e) {
          return s.closePopup(1)
        }), "33"),
        f: e.o((function() {}), "79"),
        g: e.n(i.Visible ? "bottom-panel open" : "bottom-panel close"),
        h: e.o((function() {
          return s.closePopup && s.closePopup.apply(s, arguments)
        }), "64")
      })
    }],
    ["__scopeId", "data-v-e06b5b58"]
  ]);
wx.createComponent(t);