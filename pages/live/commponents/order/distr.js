var e = require("../../../../common/vendor.js"),
  t = {
    data: function() {
      return {
        Visible: !1,
        checked_id: 10,
        choose_store_id: 0
      }
    },
    components: {
      Storeinfo: function() {
        return "./store-info.js"
      }
    },
    props: ["isDist", "extract_store", "last_extract", "deliverySetting", "chooseSotr", "choose_delivery"],
    watch: {
      isDist: function(e) {
        this.Visible = e, e && (this.checked_id = this.choose_delivery)
      }
    },
    methods: {
      closePopup: function(t) {
        if (t)
          if (20 == this.checked_id && null == this.$props.extract_store.store_id) e.index.showToast({
            icon: "none",
            title: "请选择自提点"
          });
          else {
            var o = {
              checked_id: this.checked_id,
              show_extract: this.$props.extract_store.show_extract
            };
            this.$emit("close", o)
          }
        else this.$emit("close", !1)
      },
      radioChange: function(e) {
        var t = this;
        t.checked_id = e.detail.value, t.$fire.fire("checkedfir", t.checked_id)
      },
      hasType: function(e) {
        return -1 != this.deliverySetting.indexOf(e)
      }
    }
  };
Array || e.resolveComponent("Storeinfo")();
var o = e._export_sfc(t, [
  ["render", function(t, o, i, r, s, c) {
    return e.e({
      a: e.o((function(e) {
        return c.closePopup(!1)
      }), "7d"),
      b: c.hasType("10")
    }, c.hasType("10") ? {
      c: t.getThemeColor(),
      d: 10 == s.checked_id
    } : {}, {
      e: c.hasType("20")
    }, c.hasType("20") ? {
      f: t.getThemeColor(),
      g: 20 == s.checked_id,
      h: e.sr("getShopinfoData", "64c0bff6-0"),
      i: e.p({
        extract_store: i.extract_store,
        chooseSotr: i.chooseSotr,
        last_extract: i.last_extract
      })
    } : {}, {
      j: e.o((function() {
        return c.radioChange && c.radioChange.apply(c, arguments)
      }), "13"),
      k: e.o((function() {
        return c.closePopup && c.closePopup.apply(c, arguments)
      }), "b1"),
      l: e.o((function() {}), "ca"),
      m: e.n(s.Visible ? "usable-distr open" : "usable-distr close")
    })
  }],
  ["__scopeId", "data-v-64c0bff6"]
]);
wx.createComponent(o);