var e = require("../../../common/vendor.js");
Math || n();
var n = function() {
    return "../../../components/uni-icon/uni-icon.js"
  },
  u = {
    __name: "question",
    props: {
      swiperHeight: {
        type: [Number, String],
        default: 0
      }
    },
    setup: function(n) {
      var u = e.ref(0),
        t = e.ref([]),
        i = e.inject("video_questions"),
        a = e.inject("video_question_log"),
        o = e.inject("roomId"),
        l = e.inject("look_finish_submit_question"),
        r = e.computed((function() {
          return i.value[u.value]
        })),
        v = e.computed((function() {
          return a.value[r.value.id] && (t.value = a.value[r.value.id].answer), a.value[r.value.id]
        })),
        s = e.getCurrentInstance();
      getApp(), e.watch((function() {
        return a
      }), (function(e) {
        for (var n = 0; n < i.value.length; n++)
          if (!e.value[i.value[n].id]) {
            u.value = n;
            break
          }
      }), {
        immediate: !0
      });
      var c = function(e) {
          return ["A", "B", "C", "D"][e]
        },
        d = function() {
          u.value > 0 ? (u.value--, t.value = []) : e.index.showToast({
            title: "已经是第一道题了",
            icon: "success"
          })
        },
        f = function() {
          u.value < i.value.length - 1 ? (u.value++, t.value = []) : e.index.showToast({
            title: "已完成所有题目",
            icon: "success"
          })
        },
        p = function() {
          0 !== t.value.length ? !l.value || e.index.getStorageSync("look_finish_" + o.value) ? s.proxy._post("live.question/submit", {
            question_id: r.value.id,
            select_answer: t.value,
            room_id: o.value
          }, (function(n) {
            1 == n.code && (e.index.showToast({
              title: n.msg,
              icon: "success"
            }), u.value < i.value.length - 1 ? (u.value++, t.value = []) : e.index.showToast({
              title: "已完成所有题目",
              icon: "success"
            }))
          })) : e.index.showToast({
            title: "观看结束后才能开始答题",
            icon: "none"
          }) : e.index.showToast({
            title: "请先选择答案",
            icon: "none"
          })
        };
      return function(o, l) {
        var s, h;
        return e.e({
          a: e.t(u.value + 1),
          b: e.t(e.unref(i).length),
          c: v.value && e.unref(a)[r.value.id].reward > 0
        }, v.value && e.unref(a)[r.value.id].reward > 0 ? e.e({
          d: 10 == e.unref(a)[r.value.id].reward_type
        }, (e.unref(a)[r.value.id].reward_type, {}), {
          e: e.t(e.unref(a)[r.value.id].reward)
        }) : {}, {
          f: e.t(null == (s = r.value) ? void 0 : s.title),
          g: e.f(null == (h = r.value) ? void 0 : h.options, (function(n, u, i) {
            return e.e({
              a: e.t(c(u)),
              b: e.t(n.content),
              c: t.value.includes(u)
            }, (t.value.includes(u), {}), {
              d: u,
              e: e.n({
                selected: t.value.includes(u)
              }),
              f: e.o((function(e) {
                return function(e) {
                  if (!a.value[r.value.id]) {
                    var n = t.value.indexOf(e);
                    n > -1 ? t.value.splice(n, 1) : t.value.push(e)
                  }
                }(u)
              }), u)
            })
          })),
          h: !v.value
        }, v.value ? {
          k: e.o(d, "b6"),
          l: e.o(f, "b0")
        } : {
          i: e.p({
            type: "paperplane",
            size: "24",
            color: "#fff"
          }),
          j: e.o(p, "72")
        }, {
          m: "calc(100% - " + n.swiperHeight + "px)",
          n: n.swiperHeight + "px"
        })
      }
    }
  },
  t = e._export_sfc(u, [
    ["__scopeId", "data-v-62f983ee"]
  ]);
wx.createComponent(t);