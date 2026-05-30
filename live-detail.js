var e = require("./common/vendor.js"),
  a = require("./common/assets.js");
Array || e.resolveComponent("uni-popup")(), Math;
var t = {
    __name: "live-detail",
    props: {
      roomID: {
        type: [Boolean, String, Number],
        default: !1
      }
    },
    setup: function(t) {
      var l = e.getCurrentInstance();
      getApp();
      var r = e.ref({}),
        u = e.ref({}),
        o = e.ref({}),
        v = e.ref(1);
      e.onLoad((function(e) {
        console.log(e), v.value = e.live_page
      }));
      var i = e.ref(""),
        n = e.ref(""),
        s = e.ref(""),
        _ = e.ref(""),
        c = e.ref(""),
        f = t;
      e.onMounted((function() {
        d()
      }));
      var d = function() {
          var e = {
            room_id: f.roomID
          };
          l.proxy._post("live.roomNew/detail", e, (function(e) {
            r.value = e.data.room_detail, u.value = e.data.statistic, o.value = e.data.user || {
              cover: {}
            }
          }))
        },
        m = function(e) {
          if (e) {
            var a = (new Date).getTime();
            e *= 1e3;
            var t = Math.abs(a - e);
            return t <= 0 ? "0时0分" : (t /= 1e3, Math.floor(t / 3600) + "时" + Math.floor(t % 3600 / 60) + "分")
          }
          return "0时0分"
        },
        p = e.ref(!1),
        g = e.ref(!1),
        k = e.ref(!1);
      return function(t, l) {
        return e.e({
          a: r.value.cover
        }, r.value.cover ? {
          b: r.value.cover.file_path
        } : {
          c: t.config.pic_url + "/20260103163516c17940234.png"
        }, {
          d: e.t(o.value.user_id),
          e: e.t(r.value.name),
          f: 103 == r.value.live_status
        }, (r.value.live_status, {}), {
          g: 101 == r.value.live_status
        }, (r.value.live_status, {}), {
          h: 102 == r.value.live_status
        }, (r.value.live_status, {}), {
          i: o.value.avatarUrl,
          j: e.t(o.value.nickName),
          k: 103 != r.value.live_status
        }, 103 != r.value.live_status ? {
          l: e.t(m(r.value.real_start_time))
        } : {}, {
          m: 103 == r.value.live_status
        }, 103 == r.value.live_status ? {
          n: e.t((f = r.value.real_end_time - r.value.real_start_time, f ? Math.floor(f / 3600) + "时" + Math.floor(f % 3600 / 60) + "分" : "0时0分"))
        } : {}, {
          o: "" != r.value.real_start_time_text
        }, "" != r.value.real_start_time_text ? {
          p: e.t(r.value.real_start_time_text)
        } : {}, {
          q: 103 == r.value.live_status
        }, 103 == r.value.live_status ? {
          r: e.t(r.value.real_end_time_text)
        } : {}, {
          s: t.config.pic_url + "/static/live/watchNum.png",
          t: e.t(u.value.view_num || 0),
          v: t.config.pic_url + "/static/live/like.png",
          w: e.t(u.value.total_like || 0),
          x: e.t(u.value.deal_member || 0),
          y: e.t(u.value.order_count || 0),
          z: e.t(u.value.view_pay_percent || 0),
          A: e.t(u.value.order_total_price || 0),
          B: e.t(u.value.refund_money || 0),
          C: e.t(u.value.average_remain_time || 0),
          D: a._imports_0$6,
          E: e.o((function(e) {
            p.value.close()
          }), "19"),
          F: i.value,
          G: e.o((function(e) {
            return i.value = e.detail.value
          }), "af"),
          H: n.value,
          I: e.o((function(e) {
            return n.value = e.detail.value
          }), "9e"),
          J: e.sr(p, "2339d44c-0", {
            k: "rating"
          }),
          K: e.p({
            type: "dialog",
            "background-color": "#fff"
          }),
          L: a._imports_0$6,
          M: e.o((function(e) {
            g.value.close()
          }), "ee"),
          N: s.value,
          O: e.o((function(e) {
            return s.value = e.detail.value
          }), "c1"),
          P: _.value,
          Q: e.o((function(e) {
            return _.value = e.detail.value
          }), "ff"),
          R: e.sr(g, "2339d44c-1", {
            k: "like"
          }),
          S: e.p({
            type: "dialog",
            "background-color": "#fff"
          }),
          T: a._imports_0$6,
          U: e.o((function(e) {
            k.value.close()
          }), "80"),
          V: c.value,
          W: e.o((function(e) {
            return c.value = e.detail.value
          }), "6c"),
          X: e.sr(k, "2339d44c-2", {
            k: "leavemessage"
          }),
          Y: e.p({
            type: "dialog",
            "background-color": "#fff"
          }),
          Z: 2 == v.value
        });
        var f
      }
    }
  },
  l = e._export_sfc(t, [
    ["__scopeId", "data-v-2339d44c"]
  ]);
t.__runtimeHooks = 6, exports.MiniProgramPage = l;