var d = require("../../../../common/vendor.js"),
  e = d._export_sfc({
    data: function() {
      return {}
    },
    props: ["Address", "exist_address", "dis", "is_order"],
    onLoad: function() {},
    mounted: function() {},
    methods: {
      addAddress: function() {
        if (!this.dis)
          if (this.is_order) this.exist_address ? this.$emit("goAddressPage", "edit") : this.$emit("goAddressPage", "add");
          else {
            var d = "/pages/user/address/address?source=order";
            this.exist_address || (d = "/pages/user/address/add/add?delta=1"), this.gotoPage(d)
          }
      }
    }
  }, [
    ["render", function(e, s, r, t, i, o) {
      return d.e({
        a: null == r.Address
      }, null == r.Address ? {
        b: d.o((function(d) {
          return o.addAddress()
        }), "15")
      } : {
        c: d.t(r.Address.name),
        d: d.t(r.Address.phone),
        e: d.t(r.Address.region.province),
        f: d.t(r.Address.region.city),
        g: d.t(r.Address.region.region),
        h: d.t(r.Address.detail),
        i: d.o((function(d) {
          return o.addAddress()
        }), "ed")
      })
    }],
    ["__scopeId", "data-v-bbc0fd51"]
  ]);
wx.createComponent(e);