require("../env/config.js");
var e = require("../common/vendor.js"),
  o = e._export_sfc({
    data: function() {
      return {
        Visible: !1,
        poster_img: "",
        wechat_share: !1
      }
    },
    props: ["isMpShare"],
    watch: {
      isMpShare: function(e, o) {
        e != o && (this.Visible = e)
      }
    },
    methods: {
      closePopup: function() {
        this.$emit("close")
      }
    }
  }, [
    ["render", function(o, t, n, i, r, s) {
      return {
        a: o.config.pic_url + "/static/share.png",
        b: e.n(r.Visible ? "bottom-panel open" : "bottom-panel close"),
        c: e.o((function() {
          return s.closePopup && s.closePopup.apply(s, arguments)
        }), "64")
      }
    }]
  ]);
wx.createComponent(o);