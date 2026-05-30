var e = require("../../../common/vendor.js");
Array || e.resolveComponent("uni-popup")(), Math;
var n = {
    __name: "share-live",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      }
    },
    setup: function(n, t) {
      var o = t.expose,
        i = n,
        a = e.inject("self_group"),
        r = e.getCurrentInstance();
      getApp(), e.onMounted((function() {
        1 == a.value && (c(), e.wx$1.hideShareMenu({
          menus: ["shareAppMessage", "shareTimeline"]
        })), d("normal"), s()
      }));
      var u = e.ref(null),
        c = function() {
          return new Promise((function(n, t) {
            r.proxy._get("live.qrcode/updateShare", {
              liveId: i.liveId
            }, (function(o) {
              var i;
              1 === o.code ? (u.value = (null == (i = o.data) ? void 0 : i.activity_id) || o.data || o, d("private"), n(u.value)) : (e.index.showToast({
                title: "获取专属分享配置失败",
                icon: "none"
              }), t(o.msg))
            }), (function(n) {
              e.index.showToast({
                title: "网络错误，获取配置失败",
                icon: "none"
              }), t(n)
            }))
          }))
        },
        l = e.ref(null);
      e.ref(!1);
      var s = function() {
        l.value.open("bottom")
      };
      e.ref("normal"), e.ref(null);
      var d = function(e) {
          f(e)
        },
        f = function(n) {
          "private" === n ? (u.value || c(), e.wx$1.updateShareMenu({
            withShareTicket: !0,
            isPrivateMessage: !0,
            activityId: u.value,
            success: function() {},
            fail: function(e) {
              return console.error("私密分享配置失败：", e)
            }
          })) : e.wx$1.updateShareMenu({
            withShareTicket: !1,
            isPrivateMessage: !1,
            activityId: "",
            success: function() {},
            fail: function(e) {
              return console.error("普通分享配置失败：", e)
            }
          })
        },
        v = e.ref(null),
        p = function() {
          v.value.close()
        },
        h = e.ref([]),
        g = e.ref(0),
        x = e.ref(""),
        m = e.ref(!0),
        w = e.ref(!1),
        _ = function() {
          m.value = !0
        },
        y = function() {
          e.index.showLoading({
            title: "加载中"
          });
          var n = r.proxy.getPlatform();
          r.proxy._get("live.qrcode/list", {
            source: n
          }, (function(n) {
            e.index.hideLoading(), h.value = n.data.list, 0 == h.value.length ? e.index.showModal({
              title: "提示",
              content: "请联系管理员添加海报",
              showCancel: !1
            }) : null == v || v.value.open("center")
          }))
        },
        T = function() {
          e.index.showLoading({
            title: "加载中"
          });
          var n = h.value[g.value].poster_id,
            t = r.proxy.getPlatform();
          r.proxy._get("live.qrcode/poster", {
            source: t,
            poster_id: n,
            room_id: i.liveId
          }, (function(n) {
            e.index.hideLoading(), x.value = n.data.qrcode, m.value = !1
          }))
        },
        b = function(e) {
          g.value = e.detail.current
        },
        M = function() {
          var n = x.value.split(",")[1],
            t = x.value.match(/:(.*?);/)[1];
          e.index.showLoading({
            title: "正在处理图片...",
            mask: !0
          });
          var o = e.wx$1.getFileSystemManager(),
            i = "".concat(e.wx$1.env.USER_DATA_PATH, "/temp_poster.").concat(t.split("/")[1]);
          o.writeFile({
            filePath: i,
            data: n,
            encoding: "base64",
            success: function() {
              S(i)
            },
            fail: function(n) {
              e.index.hideLoading(), e.index.showToast({
                title: n || "保存失败",
                icon: "none",
                duration: 2e3
              }), console.error("操作失败:", n)
            }
          })
        },
        S = function(n) {
          e.index.saveImageToPhotosAlbum({
            filePath: n,
            success: function() {
              e.index.hideLoading(), e.index.showToast({
                title: "保存成功",
                icon: "success"
              }), w.value = !1, p(), m.value = !0
            },
            fail: function(n) {
              e.index.hideLoading(), n.errMsg.includes("auth deny") && k()
            }
          })
        },
        k = function() {
          e.index.showToast({
            title: "请允许访问相册后重试",
            icon: "none",
            duration: 1500
          }), setTimeout((function() {
            return e.index.openSetting()
          }), 1500)
        };
      return o({
          showShare: s
        }),
        function(n, t) {
          return e.e({
            a: n.config.pic_url + "/static/live/wechat.png",
            b: e.o((function(e) {
              return d("normal")
            }), "8c"),
            c: e.o((function(e) {
              return d("normal")
            }), "30"),
            d: 1 == e.unref(a)
          }, 1 == e.unref(a) ? {
            e: n.config.pic_url + "/static/live/wechat.png",
            f: e.o((function(e) {
              return d("private")
            }), "f0"),
            g: e.o((function(e) {
              return d("private")
            }), "8e")
          } : {}, {
            h: n.config.pic_url + "/static/live/share-pic.png",
            i: e.o((function(e) {
              y()
            }), "d7"),
            j: n.config.pic_url + "/static/live/link-pic.png",
            k: e.o((function(n) {
              r.proxy._post("live.qrcode/shareLink", {
                room_id: i.liveId
              }, (function(n) {
                1 == n.code && e.index.setClipboardData({
                  data: n.msg,
                  success: function() {
                    e.index.showToast({
                      title: "复制成功",
                      icon: "success",
                      duration: 1e3
                    })
                  },
                  fail: function() {
                    e.index.showToast({
                      title: "复制失败，请重试",
                      icon: "none",
                      duration: 1e3
                    })
                  }
                })
              }))
            }), "8e"),
            l: e.sr(l, "3d519e47-0", {
              k: "shareLive"
            }),
            m: e.p({
              type: "bottom",
              "background-color": "#fff",
              "border-radius": "30px 30px 0 0"
            }),
            n: m.value
          }, m.value ? {
            o: e.f(h.value, (function(e, n, t) {
              return {
                a: e.image,
                b: n === g.value ? 1 : "",
                c: n
              }
            })),
            p: e.o(b, "51"),
            q: g.value,
            r: e.o(T, "dd"),
            s: e.o(p, "77")
          } : {
            t: x.value,
            v: e.o(M, "3d"),
            w: e.o(_, "e4")
          }, {
            x: n.theme(),
            y: e.n(n.theme()),
            z: e.sr(v, "3d519e47-1", {
              k: "sharePoster"
            }),
            A: e.p({
              type: "center",
              "background-color": "#fff",
              "border-radius": "30px"
            })
          })
        }
    }
  },
  t = e._export_sfc(n, [
    ["__scopeId", "data-v-3d519e47"]
  ]);
wx.createComponent(t);