var e = require("../../../common/vendor.js");
Array || e.resolveComponent("uni-popup")(), Math;
var t = {
    __name: "invite-record",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      }
    },
    setup: function(t, a) {
      var n = a.expose,
        o = t,
        r = e.getCurrentInstance();
      getApp(), e.onMounted((function() {
        l()
      }));
      var u = e.ref(null),
        l = function() {
          var e;
          null == (e = u.value) || e.open("bottom"), f.value = 1, v.value = [], s.value = !1, d()
        },
        i = e.ref(""),
        c = function() {
          f.value = 1, v.value = [], s.value = !1, d()
        },
        v = e.ref([]),
        f = e.ref(1),
        s = e.ref(!1),
        d = function() {
          s.value ? e.index.showToast({
            title: "已经到底了！",
            icon: "none"
          }) : r.proxy._post("live.liveMember/lists", {
            page: f.value,
            list_rows: 10,
            room_id: o.liveId,
            search: i.value
          }, (function(t) {
            f.value++, t.data.list.data.length > 0 ? v.value = v.value.concat(t.data.list.data) : (s.value = !0, e.index.showToast({
              title: "已经到底了！",
              icon: "none"
            }))
          }))
        },
        p = function() {
          i.value = "", c()
        };
      return n({
          showRecordList: l
        }),
        function(t, a) {
          return e.e({
            a: t.config.pic_url + "/20260127174008a0a015532.png",
            b: e.o(p, "9c"),
            c: e.o((function(e) {
              return c()
            }), "ba"),
            d: i.value,
            e: e.o((function(e) {
              return i.value = e.detail.value
            }), "16"),
            f: v.value.length > 0
          }, v.value.length > 0 ? {
            g: e.f(v.value, (function(a, n, o) {
              return e.e({
                a: a.avatarUrl
              }, a.avatarUrl ? {
                b: a.avatarUrl
              } : {
                c: t.config.pic_url + "/202512051130591424e2127.png"
              }, {
                d: e.t(a.nickName),
                e: e.t(a.remain_sum_time),
                f: e.t(a.create_time),
                g: a.room_id
              })
            }))
          } : {}, {
            h: 0 == v.value.length
          }, (v.value.length, {}), {
            i: e.o(d, "7c"),
            j: e.sr(u, "dfe9cc39-0", {
              k: "inviteRecord"
            }),
            k: e.p({
              type: "bottom",
              "background-color": "#fcfcfe",
              "border-radius": "20px 20px 0 0"
            })
          })
        }
    }
  },
  a = e._export_sfc(t, [
    ["__scopeId", "data-v-dfe9cc39"]
  ]);
wx.createComponent(a);