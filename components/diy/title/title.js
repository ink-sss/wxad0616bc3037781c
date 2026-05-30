var t = require("../../../common/vendor.js"),
  e = t._export_sfc({
    data: function() {
      return {}
    },
    props: ["itemData"],
    created: function() {},
    methods: {
      gotoPages: function(t) {
        this.gotoPage(t.linkUrl)
      }
    }
  }, [
    ["render", function(e, a, i, s, l, y) {
      return t.e({
        a: 5 == i.itemData.style.type
      }, 5 == i.itemData.style.type ? {
        b: t.t(i.itemData.params.subtitle),
        c: i.itemData.style.subtextColor,
        d: 2 * i.itemData.style.subtextSize + "rpx"
      } : {}, {
        e: 8 == i.itemData.style.type && i.itemData.style.isLine
      }, 8 == i.itemData.style.type && i.itemData.style.isLine ? {
        f: i.itemData.style.lineColor || "",
        g: 2 * i.itemData.style.textSize + "rpx"
      } : {}, {
        h: 6 == i.itemData.style.type
      }, 6 == i.itemData.style.type ? {
        i: t.t(i.itemData.params.subtitle),
        j: i.itemData.style.subtextColor,
        k: 2 * i.itemData.style.subtextSize + "rpx"
      } : {}, {
        l: 4 == i.itemData.style.type
      }, 4 == i.itemData.style.type ? {
        m: i.itemData.style.textColor,
        n: i.itemData.style.textColor
      } : {}, {
        o: 1 == i.itemData.style.type
      }, 1 == i.itemData.style.type ? {
        p: i.itemData.style.lineColor || "",
        q: i.itemData.style.lineColor || ""
      } : {}, {
        r: t.t(i.itemData.params.title),
        s: 6 == i.itemData.style.type ? 1 : "",
        t: i.itemData.style.textColor,
        v: i.itemData.style.background,
        w: 2 * i.itemData.style.textSize + "rpx",
        x: i.itemData.style.weight || 400,
        y: 4 == i.itemData.style.type
      }, 4 == i.itemData.style.type ? {
        z: i.itemData.style.textColor,
        A: i.itemData.style.textColor
      } : {}, {
        B: 1 == i.itemData.style.type
      }, 1 == i.itemData.style.type ? {
        C: i.itemData.style.lineColor || "",
        D: i.itemData.style.lineColor || ""
      } : {}, {
        E: 2 == i.itemData.style.type
      }, 2 == i.itemData.style.type ? {
        F: i.itemData.style.lineColor || ""
      } : {}, {
        G: 3 == i.itemData.style.type
      }, (i.itemData.style.type, {}), {
        H: 8 == i.itemData.style.type
      }, 8 == i.itemData.style.type ? t.e({
        I: 8 == i.itemData.style.type && i.itemData.style.isSub
      }, 8 == i.itemData.style.type && i.itemData.style.isSub ? {
        J: t.t(i.itemData.params.subtitle),
        K: i.itemData.style.subtextColor,
        L: 2 * i.itemData.style.subtextSize + "rpx",
        M: i.itemData.style.subbackground
      } : {}) : {}, {
        N: 8 == i.itemData.style.type && i.itemData.style.isMore
      }, 8 == i.itemData.style.type && i.itemData.style.isMore ? {
        O: t.t(i.itemData.params.moretitle),
        P: t.o((function(t) {
          return e.gotoPage(i.itemData.params.morelinkUrl)
        }), "2f"),
        Q: i.itemData.style.moretextColor
      } : {}, {
        R: 7 == i.itemData.style.type
      }, 7 == i.itemData.style.type ? {
        S: t.t(i.itemData.params.subtitle),
        T: i.itemData.style.subtextColor,
        U: 2 * i.itemData.style.subtextSize + "rpx",
        V: i.itemData.style.subbackground
      } : {}, {
        W: 5 == i.itemData.style.type
      }, (i.itemData.style.type, {}), {
        X: 6 == i.itemData.style.type
      }, (i.itemData.style.type, {}), {
        Y: 4 == i.itemData.style.type
      }, 4 == i.itemData.style.type ? {
        Z: t.t(i.itemData.params.subtitle),
        aa: i.itemData.style.subtextColor,
        ab: 2 * i.itemData.style.subtextSize + "rpx"
      } : {}, {
        ac: t.n("diy-title-" + i.itemData.style.type),
        ad: i.itemData.style.background,
        ae: 2 * i.itemData.style.topRadio + "rpx " + 2 * i.itemData.style.topRadio + "rpx " + 2 * i.itemData.style.bottomRadio + "rpx " + 2 * i.itemData.style.bottomRadio + "rpx ",
        af: t.o((function(t) {
          return e.gotoPage(i.itemData.params.sublinkUrl)
        }), "11"),
        ag: 2 * i.itemData.style.paddingTop + "rpx " + 2 * i.itemData.style.paddingLeft + "rpx " + 2 * i.itemData.style.paddingBottom + "rpx " + 2 * i.itemData.style.paddingLeft + "rpx",
        ah: i.itemData.style.bgcolor
      })
    }]
  ]);
wx.createComponent(e);