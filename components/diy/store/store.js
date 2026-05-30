var o = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {}
    },
    props: ["itemData", "storeInfo"],
    methods: {
      goCall: function() {
        o.index.makePhoneCall({
          phoneNumber: this.storeInfo.phone
        })
      }
    }
  },
  r = o._export_sfc(e, [
    ["render", function(e, r, n, t, p, s) {
      return {
        a: o.t(n.storeInfo.store_name),
        b: o.t(n.storeInfo.region.province),
        c: o.t(n.storeInfo.region.city),
        d: o.t(n.storeInfo.region.region),
        e: o.t(n.storeInfo.address),
        f: o.t(n.storeInfo.phone),
        g: o.o((function() {
          return s.goCall && s.goCall.apply(s, arguments)
        }), "45"),
        h: n.itemData.style.background,
        i: "16rpx",
        j: "16rpx",
        k: "16rpx",
        l: "16rpx",
        m: "20rpx",
        n: "20rpx",
        o: "20rpx",
        p: "0rpx"
      }
    }]
  ]);
wx.createComponent(r);