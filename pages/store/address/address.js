var t = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        listData: [],
        isLoading: !0,
        storeList: [],
        longitude: "",
        latitude: "",
        selectedId: -1
      }
    },
    onLoad: function(t) {
      this.selectedId = t.store_id, this.getData()
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
            i.longitude = t.longitude, i.latitude = t.latitude, i.getData()
          },
          fail: function() {
            t.index.showToast({
              title: "获取定位失败，请点击右下角按钮打开定位权限",
              duration: 2e3
            }), i.isAuthor = !1
          }
        })
      },
      getData: function() {
        var t = this;
        t.isLoading = !0, t._get("store.store/lists", {
          longitude: t.longitude,
          latitude: t.latitude
        }, (function(e) {
          t.isLoading = !1, t.storeList = e.data.list
        }))
      },
      onSelectedStore: function(e) {
        if (this.selectedId = e, getCurrentPages().length < 2) return !1;
        this.$fire.fire("selectStoreId", e), t.index.navigateBack()
      }
    }
  },
  i = t._export_sfc(e, [
    ["render", function(e, i, n, o, s, r) {
      return t.e({
        a: t.f(s.storeList, (function(e, i, n) {
          return t.e({
            a: t.t(e.store_name),
            b: t.t(e.phone),
            c: t.t(e.region.province),
            d: t.t(e.region.city),
            e: t.t(e.region.region),
            f: t.t(e.address),
            g: t.t(e.distance_unit),
            h: e.store_id == s.selectedId
          }, (e.store_id, s.selectedId, {}), {
            i: t.o((function(t) {
              return r.onSelectedStore(e)
            }), i),
            j: i
          })
        })),
        b: !s.isLoading && !s.storeList.length
      }, (s.isLoading || s.storeList.length, {}))
    }],
    ["__scopeId", "data-v-d4f7f200"]
  ]);
wx.createPage(i);