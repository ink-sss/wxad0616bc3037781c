var t = require("../../../../common/vendor.js");
Array || t.resolveComponent("Adress")();
var e = t._export_sfc({
  data: function() {
    return {
      isAddress: !1,
      store_id: 0
    }
  },
  components: {
    Adress: function() {
      return "./address/store-address.js"
    }
  },
  props: ["extract_store", "last_extract", "chooseSotr"],
  onLoad: function() {},
  mounted: function() {},
  methods: {
    addAddress: function() {
      var t = -1;
      this.extract_store.store_id && (t = this.extract_store.store_id), this.store_id = t, this.isAddress = !0
    },
    closeAdress: function() {
      this.isAddress = !1
    }
  }
}, [
  ["render", function(e, r, s, o, d, n) {
    return t.e({
      a: !s.extract_store.store_id
    }, s.extract_store.store_id ? {
      c: t.t(s.extract_store.region.province),
      d: t.t(s.extract_store.region.city),
      e: t.t(s.extract_store.region.region),
      f: t.t(s.extract_store.store_name),
      g: t.t(s.extract_store.address),
      h: t.t(s.extract_store.phone),
      i: t.o((function(t) {
        return n.addAddress()
      }), "c1")
    } : {
      b: t.o((function(t) {
        return n.addAddress()
      }), "af")
    }, {
      j: t.o(n.closeAdress, "c5"),
      k: t.p({
        isAddress: d.isAddress,
        chooseSotr: s.chooseSotr,
        store_id: d.store_id
      })
    })
  }],
  ["__scopeId", "data-v-68d5928e"]
]);
wx.createComponent(e);