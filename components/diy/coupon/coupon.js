var t = require("../../../common/vendor.js"),
  e = require("../../../common/assets.js"),
  a = {
    data: function() {
      return {
        indicatorDots: !1,
        autoplay: !0,
        interval: 5e3,
        duration: 1e3,
        listData: []
      }
    },
    props: ["itemData"],
    created: function() {
      this.listData = this.itemData.data
    },
    methods: {
      scroll: function(t) {},
      receiveCoupon: function(e) {
        var a = this.listData[e];
        if (0 == a.state.value) return !1;
        this._post("user.coupon/receive", {
          coupon_id: a.coupon_id
        }, (function(e) {
          t.index.showToast({
            title: "领取成功",
            icon: "success",
            mask: !0,
            duration: 2e3
          }), a.state.value = 0, a.state.text = "已领取"
        }))
      }
    }
  },
  o = t._export_sfc(a, [
    ["render", function(a, o, i, s, l, n) {
      return t.e({
        a: l.listData && l.listData.length > 0
      }, l.listData && l.listData.length > 0 ? t.e({
        b: 2 == i.itemData.style.bgtype
      }, 2 == i.itemData.style.bgtype ? {
        c: i.itemData.style.bgimage,
        d: 2 * i.itemData.style.topRadio + "rpx",
        e: 2 * i.itemData.style.topRadio + "rpx",
        f: 2 * i.itemData.style.bottomRadio + "rpx",
        g: 2 * i.itemData.style.bottomRadio + "rpx"
      } : {}, {
        h: t.f(l.listData, (function(e, a, o) {
          return t.e({
            a: 10 == e.coupon_type.value
          }, 10 == e.coupon_type.value ? {
            b: t.t(1 * e.reduce_price)
          } : {}, {
            c: 20 == e.coupon_type.value
          }, 20 == e.coupon_type.value ? {
            d: t.t(e.discount)
          } : {}, {
            e: t.t(e.min_price > 0 ? "满" + 1 * e.min_price + "元可用" : "无门槛"),
            f: 10 == e.apply_range
          }, (e.apply_range, {}), {
            g: 20 == e.apply_range
          }, (e.apply_range, {}), {
            h: 30 == e.apply_range
          }, (e.apply_range, {}), {
            i: 1 == e.state.value
          }, 1 == e.state.value ? {
            j: t.t(i.itemData.params.btntext),
            k: t.o((function(t) {
              return n.receiveCoupon(a)
            }), a),
            l: i.itemData.style.btnTxtcolor,
            m: i.itemData.style.btnRadio + "px",
            n: i.itemData.style.btncolor
          } : {
            o: t.t(e.state.text),
            p: i.itemData.style.btnTxtcolor,
            q: i.itemData.style.btnRadio + "px",
            r: i.itemData.style.btncolor
          }, {
            s: a
          })
        })),
        i: e._imports_0$20,
        j: i.itemData.style.pricecolor,
        k: i.itemData.style.cillcolor,
        l: i.itemData.style.descolor,
        m: i.itemData.style.btncolor,
        n: 1 == i.itemData.style.bgtype ? i.itemData.style.background : "none",
        o: 2 * i.itemData.style.topRadio + "rpx",
        p: 2 * i.itemData.style.topRadio + "rpx",
        q: 2 * i.itemData.style.bottomRadio + "rpx",
        r: 2 * i.itemData.style.bottomRadio + "rpx",
        s: i.itemData.style.bgcolor,
        t: 2 * i.itemData.style.paddingLeft + "rpx",
        v: 2 * i.itemData.style.paddingLeft + "rpx",
        w: 2 * i.itemData.style.paddingTop + "rpx",
        x: 2 * i.itemData.style.paddingBottom + "rpx"
      }) : {})
    }]
  ]);
wx.createComponent(o);