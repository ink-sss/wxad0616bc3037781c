var e = require("../../../common/vendor.js");
Array || e.resolveComponent("uni-popup")(), Math || (function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
} + n)();
var n = function() {
    return "../../../components/upload/upload2.js"
  },
  o = {
    __name: "complaint-face",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      }
    },
    setup: function(n, o) {
      var t = o.expose,
        u = e.getCurrentInstance();
      getApp();
      var a = n;
      e.onMounted((function() {
        l()
      }));
      var i = e.ref(null),
        l = function() {
          var e;
          null == (e = i.value) || e.open("bottom")
        },
        r = e.ref(""),
        c = e.ref(""),
        p = e.ref(!1),
        v = e.ref([]),
        f = function(e) {
          console.log(e), p.value = !1, e.forEach((function(e, n) {
            v.value.push(e)
          }))
        },
        s = function() {
          p.value = !0
        },
        d = function() {
          if ("" != r.value)
            if (v.value.length <= 0) e.index.showToast({
              title: "请上传图片",
              icon: "none"
            });
            else {
              var n = {
                room_id: a.liveId,
                description: r.value,
                image_list: v.value,
                contact_info: c.value
              };
              u.proxy._post("live.complaint/add", n, (function(n) {
                1 == n.code && (e.index.showToast({
                  title: n.msg,
                  icon: "none"
                }), m())
              }))
            }
          else e.index.showToast({
            title: "请填写问题描述",
            icon: "none"
          })
        },
        m = function() {
          i.value.close(), r.value = "", v.value = [], c.value = ""
        };
      return t({
          showComplaint: l
        }),
        function(n, o) {
          return e.e({
            a: r.value,
            b: e.o((function(e) {
              return r.value = e.detail.value
            }), "28"),
            c: v.value.length > 0
          }, v.value.length > 0 ? {
            d: e.f(v.value, (function(n, o, t) {
              return {
                a: e.o((function(e) {
                  return n = o, void v.value.splice(n, 1);
                  var n
                }), o),
                b: n.file_path,
                c: o
              }
            })),
            e: n.config.pic_url + "/static/live/ico-del.png"
          } : {}, {
            f: e.o(s, "e6"),
            g: e.o(d, "90"),
            h: e.sr(i, "afe0db23-0", {
              k: "complaintFace"
            }),
            i: e.p({
              type: "bottom",
              "background-color": "#fff",
              "border-radius": "30px 30px 0 0"
            }),
            j: p.value
          }, p.value ? {
            k: e.o(f, "ed"),
            l: e.p({
              type: "image"
            })
          } : {})
        }
    }
  },
  t = e._export_sfc(o, [
    ["__scopeId", "data-v-afe0db23"]
  ]);
wx.createComponent(t);