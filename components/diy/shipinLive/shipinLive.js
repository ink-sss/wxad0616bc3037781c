var e = require("../../../common/vendor.js"),
  n = {
    data: function() {
      return {
        nowTime: "",
        liveList: [],
        isLive: ""
      }
    },
    props: ["itemData"],
    mounted: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var n = this,
          i = this.$props.itemData && this.$props.itemData.params.finderUserName;
        e.wx$1.getChannelsLiveInfo({
          finderUserName: i,
          success: function(e) {
            "getChannelsLiveInfo:ok" === e.errMsg && (console.log("getChannelsLiveInfo成功", e), n.isLive = e.status)
          },
          fail: function(e) {
            console.log("getChannelsLiveInfo失败", e)
          }
        })
      },
      gotoShiPinLive: function(n) {
        var i = this;
        n && e.wx$1.getChannelsLiveInfo({
          finderUserName: n,
          success: function(e) {
            "getChannelsLiveInfo:ok" === e.errMsg && (console.log("getChannelsLiveInfo成功", e), 2 != e.status && 3 != e.status || (e.finderUserName = n, i.zhibo(e)))
          },
          fail: function(e) {
            console.log("getChannelsLiveInfo失败", e)
          }
        })
      },
      zhibo: function(n) {
        e.wx$1.openChannelsLive({
          finderUserName: n.finderUserName,
          feedId: n.feedId,
          nonceId: n.nonceId,
          success: function(e) {
            console.log("openChannelsLive成功", e)
          },
          fail: function(e) {
            console.log("openChannelsLive失败", e)
          }
        })
      }
    }
  },
  i = e._export_sfc(n, [
    ["render", function(n, i, t, s, o, a) {
      return e.e({
        a: 2 == o.isLive || 3 == o.isLive
      }, 2 == o.isLive || 3 == o.isLive ? {
        b: t.itemData.params.image,
        c: e.t(2 == o.isLive ? "直播中" : 3 == o.isLive ? "已结束" : "未开始"),
        d: e.o((function(e) {
          return a.gotoShiPinLive(t.itemData.params.finderUserName)
        }), "8f"),
        e: t.itemData.style.right + "%",
        f: t.itemData.style.bottom + "%",
        g: t.itemData.style.opacity / 100
      } : {})
    }],
    ["__scopeId", "data-v-e494dc70"]
  ]);
wx.createComponent(i);