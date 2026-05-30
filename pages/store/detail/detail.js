var t = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        loading: !0,
        store_id: null,
        storeDetail: {},
        covers: []
      }
    },
    onLoad: function(t) {
      this.store_id = t.store_id
    },
    mounted: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var e = this;
        t.index.showLoading({
          title: "加载中"
        }), e._get("store.store/detail", {
          store_id: e.store_id
        }, (function(o) {
          e.storeDetail = o.data.detail;
          var i = {
            latitude: o.data.detail.latitude,
            longitude: o.data.detail.longitude
          };
          e.covers.push(i), e.loading = !1, t.index.hideLoading()
        }))
      },
      callPhone: function(e) {
        t.index.makePhoneCall({
          phoneNumber: e
        })
      }
    }
  },
  o = t._export_sfc(e, [
    ["render", function(e, o, i, a, r, n) {
      return t.e({
        a: !r.loading
      }, r.loading ? {} : {
        b: r.storeDetail.logo.file_path,
        c: t.t(r.storeDetail.store_name),
        d: t.t(r.storeDetail.shop_hours),
        e: t.t(r.storeDetail.phone),
        f: t.o((function(t) {
          return n.callPhone(r.storeDetail.phone)
        }), "4e"),
        g: t.t(r.storeDetail.linkman),
        h: t.t(r.storeDetail.status.text),
        i: t.t(r.storeDetail.is_check.text),
        j: t.t(r.storeDetail.region.province),
        k: t.t(r.storeDetail.region.city),
        l: t.t(r.storeDetail.region.region),
        m: t.t(r.storeDetail.address),
        n: t.t(r.storeDetail.summary),
        o: r.storeDetail.latitude,
        p: r.storeDetail.longitude,
        q: r.covers
      })
    }]
  ]);
wx.createPage(o);