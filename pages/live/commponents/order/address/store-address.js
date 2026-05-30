var t = require("../../../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        listData: [],
        isLoading: !0,
        storeList: [],
        longitude: "",
        latitude: "",
        selectedId: -1,
        Visible: !1,
        url: ""
      }
    },
    props: ["isAddress", "store_id", "chooseSotr"],
    watch: {
      isAddress: function(t) {
        this.Visible = t, t && (this.selectedId = this.$props.store_id, console.log(this.selectedId), this.getData(!0), this.getLocation())
      }
    },
    methods: {
      onAuthorize: function() {
        var e = this;
        t.index.openSetting({
          success: function(t) {
            t.authSetting["scope.userLocation"] && (console.log("授权成功"), e.isAuthor = !0, setTimeout((function() {
              e.getLocation((function(t) {}))
            }), 1e3))
          }
        })
      },
      getLocation: function(e) {
        var i = this;
        t.index.getLocation({
          type: "wgs84",
          success: function(t) {
            i.longitude = t.longitude, i.latitude = t.latitude, i.getData(!1)
          },
          fail: function() {
            t.index.showToast({
              title: "获取定位失败，请点击右下角按钮打开定位权限",
              duration: 2e3,
              icon: "none"
            }), i.isAuthor = !1
          }
        })
      },
      getWxLocation: function(t, e) {
        var i = this;
        jweixin.config(JSON.parse(t)), jweixin.ready((function(t) {
          jweixin.getLocation({
            type: "wgs84",
            success: function(t) {
              i.longitude = t.longitude, i.latitude = t.latitude, i.getData(!1)
            }
          })
        })), jweixin.error((function(t) {
          console.log(t)
        }))
      },
      getData: function(t) {
        var e = this;
        e.isLoading = !0, e._get("store.store/lists", {
          longitude: e.longitude,
          latitude: e.latitude,
          shop_supplier_id: e.$props.chooseSotr,
          url: e.url
        }, (function(t) {
          e.isLoading = !1, e.storeList = t.data.list
        }))
      },
      closeFunc: function() {
        this.$emit("close", null)
      },
      onSelectedStore: function(t) {
        this.selectedId = t, this.$fire.fire("selectStoreId", t), this.$emit("close", t)
      }
    }
  },
  i = t._export_sfc(e, [
    ["render", function(e, i, o, n, s, c) {
      return t.e({
        a: s.Visible
      }, s.Visible ? {
        b: t.o((function() {
          return c.closeFunc && c.closeFunc.apply(c, arguments)
        }), "61")
      } : {}, {
        c: t.f(s.storeList, (function(e, i, o) {
          return {
            a: t.t(e.store_name),
            b: t.t(e.phone),
            c: t.t(e.region.province),
            d: t.t(e.region.city),
            e: t.t(e.region.region),
            f: t.t(e.address),
            g: t.t(e.distance_unit),
            h: t.o((function(t) {
              return c.onSelectedStore(e)
            }), i),
            i: t.n(e.store_id == s.selectedId ? "active" : ""),
            j: i
          }
        })),
        d: !s.isLoading && !s.storeList.length
      }, (s.isLoading || s.storeList.length, {}), {
        e: t.n(s.Visible ? "address-distr_open" : "address-distr_close"),
        f: t.n(e.theme() || ""),
        g: e.theme()
      })
    }],
    ["__scopeId", "data-v-08f1f2cd"]
  ]);
wx.createComponent(i);