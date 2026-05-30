var e = require("../../../common/vendor.js"),
  t = {
    components: {},
    data: function() {
      return {
        itemWidth: 0
      }
    },
    props: ["itemData"],
    created: function() {
      var t = e.index.getSystemInfoSync();
      this.itemWidth = (t.windowWidth - e.index.upx2px(120)) / 2
    },
    methods: {
      scroll: function(e) {},
      convertStatus: function(e) {
        var t = "";
        switch (e) {
          case 101:
            t = "直播中";
            break;
          case 102:
            t = "未开始";
            break;
          case 103:
            t = "已结束";
            break;
          case 104:
            t = "暂停";
            break;
          case 107:
            t = "已过期";
            break;
          case 108:
            t = "回放中";
            break;
          case 109:
            t = "待回放"
        }
        return t
      },
      convertStatus1: function(e) {
        var t = "";
        switch (e) {
          case 101:
            t = "直播中";
            break;
          case 102:
            t = "未开始";
            break;
          case 103:
            t = "已结束";
            break;
          case 104:
            t = "禁播";
            break;
          case 105:
            t = "暂停";
            break;
          case 106:
            t = "异常";
            break;
          case 107:
            t = "已过期"
        }
        return t
      },
      gotoList: function() {
        this.gotoPage("/pagesPlus/live/wx/list")
      },
      gotoDetail: function(e) {
        103 == e.live_status ? "" != e.record_url ? this.gotoPage("/pagesLive/live/playback?room_id=" + e.room_id) : this.showError("暂无回放") : this.gotoPage("/pagesLive/live/live?room_id=" + e.room_id + "&sence=join")
      },
      gotoDetail1: function(t) {
        0 == t.screen_type ? e.index.navigateTo({
          url: "/pages/live/live-vertical?live_id=" + t.room_id
        }) : e.index.navigateTo({
          url: "/pages/live/live-horizontal?live_id=" + t.room_id
        })
      }
    }
  },
  a = e._export_sfc(t, [
    ["render", function(t, a, i, o, s, r) {
      return e.e({
        a: i.itemData.data.length > 0
      }, i.itemData.data.length > 0 ? {
        b: e.s("background-image: url(" + i.itemData.style.background_image + ");"),
        c: e.f(i.itemData.data, (function(t, a, i) {
          return e.e({
            a: 101 == t.live_status || 102 == t.live_status || 108 == t.live_status
          }, 101 == t.live_status || 102 == t.live_status || 108 == t.live_status ? {
            b: e.t(r.convertStatus(t.live_status)),
            c: 101 == t.live_status ? 1 : "",
            d: 102 == t.live_status ? 1 : "",
            e: 108 == t.live_status ? 1 : ""
          } : {}, {
            f: t.cover
          }, t.cover ? {
            g: s.itemWidth + "px",
            h: t.cover.file_path
          } : {
            i: s.itemWidth + "px"
          }, {
            j: e.t(t.anchor_name),
            k: e.t(t.name),
            l: a,
            m: e.o((function(e) {
              return r.gotoDetail1(t)
            }), a)
          })
        })),
        d: s.itemWidth + "px",
        e: i.itemData.style.background
      } : {})
    }],
    ["__scopeId", "data-v-f63641a4"]
  ]);
wx.createComponent(a);