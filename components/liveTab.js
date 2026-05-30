var e = require("../common/vendor.js"),
  i = {
    __name: "liveTab",
    setup: function(i) {
      var l = e.ref(null);
      e.onMounted((function() {
        e.index.getStorageSync("is_liveGo") && (l.value = e.index.getStorageSync("is_liveGo"))
      }));
      var v = function() {
        e.index.removeStorageSync("is_liveGo"), "vertical" == l.value.liveType ? e.index.navigateTo({
          url: "/pages/live/live-vertical?live_id=" + l.value.liveId
        }) : "horizontal" == l.value.liveType && e.index.navigateTo({
          url: "/pages/live/live-horizontal?live_id=" + l.value.liveId
        })
      };
      return function(i, a) {
        return e.e({
          a: null != l.value
        }, null != l.value ? e.e({
          b: i.config.pic_url + "/20251127111915b056e6357.png",
          c: l.value.liveAvatar
        }, l.value.liveAvatar ? {
          d: l.value.liveAvatar
        } : {}, {
          e: e.o(v, "50")
        }) : {})
      }
    }
  },
  l = e._export_sfc(i, [
    ["__scopeId", "data-v-5c9165fa"]
  ]);
wx.createComponent(l);