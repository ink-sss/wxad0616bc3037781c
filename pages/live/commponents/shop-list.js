var e = require("../../../common/vendor.js");
Array || e.resolveComponent("uni-popup")(), Math;
var n = {
    __name: "shop-list",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      },
      isOrder: {
        type: [Number, String],
        default: 1
      }
    },
    emits: ["openMyOrder", "goShop"],
    setup: function(n, t) {
      var o = t.expose,
        i = t.emit,
        r = n;
      getApp(), e.onMounted((function() {
        l()
      }));
      var a = e.getCurrentInstance().proxy,
        u = e.ref(null),
        l = function() {
          var e;
          null == (e = u.value) || e.open("bottom"), c.value = 1, s.value = [], p.value = !1, d()
        },
        s = e.ref([]),
        c = e.ref(1),
        p = e.ref(!1),
        d = function() {
          p.value ? e.index.showToast({
            title: "已经到底了！",
            icon: "none"
          }) : a._get("live.RoomNewProduct/lists", {
            live_id: r.liveId,
            list_rows: 10,
            page: c.value
          }, (function(n) {
            c.value++, n.data.list.data.length > 0 ? s.value = s.value.concat(n.data.list.data) : (p.value = !0, e.index.showToast({
              title: "已经到底了！",
              icon: "none"
            }))
          }))
        };
      e.ref(!1), e.ref({});
      var f = function() {
          var e;
          null == (e = u.value) || e.close(), v("openMyOrder")
        },
        v = i;
      return o({
          showShowList: l
        }),
        function(t, o) {
          return e.e({
            a: 1 == n.isOrder
          }, 1 == n.isOrder ? {
            b: t.config.pic_url + "/static/live/order.png",
            c: e.o(f, "65")
          } : {}, {
            d: e.f(s.value, (function(n, o, i) {
              return e.e({
                a: n.product_image,
                b: e.t(0 == n.sort ? o + 1 : n.sort),
                c: n.is_explain
              }, n.is_explain ? {
                d: t.config.pic_url + "/static/live/zheng.gif"
              } : {}, {
                e: e.t(n.product_name),
                f: e.t(n.selling_point),
                g: e.t(n.product_price),
                h: e.o((function(t) {
                  return o = n.product_id, i = n.spec_sku_id, r = n, console.log(o), void(o > 0 ? v("goShop", o, i) : 1 == r.link_type ? e.index.navigateTo({
                    url: "/pages/webview/webview?url=" + encodeURIComponent(r.link_url)
                  }) : 2 == r.link_type ? e.index.navigateToMiniProgram({
                    shortLink: r.link_url,
                    success: function(e) {},
                    fail: function() {}
                  }) : e.index.navigateToMiniProgram({
                    appId: r.wechat_app_id,
                    path: r.link_url + r.scene,
                    success: function(e) {},
                    fail: function() {}
                  }));
                  var o, i, r
                }), o),
                i: o
              })
            })),
            e: e.o(d, "00"),
            f: e.sr(u, "5f3e3be0-0", {
              k: "shopList"
            }),
            g: e.p({
              type: "bottom",
              "background-color": "#fcfcfe",
              "border-radius": "20px 20px 0 0"
            })
          })
        }
    }
  },
  t = e._export_sfc(n, [
    ["__scopeId", "data-v-5f3e3be0"]
  ]);
wx.createComponent(t);