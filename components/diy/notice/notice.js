var t = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        textData: "",
        n: 0,
        textW: 0,
        start: 0,
        times: null
      }
    },
    props: ["itemData"],
    created: function() {
      var t = this;
      this.textData = this.itemData.params.text, this.horseRaceLamp(), this.$nextTick((function() {
        t.init()
      }))
    },
    beforeDestroy: function() {
      clearTimeout(this.times)
    },
    methods: {
      init: function() {
        var e = this;
        t.index.getSystemInfo({
          success: function(a) {
            t.index.createSelectorQuery().in(e).select(".transtext").boundingClientRect((function(t) {
              var a = t.width;
              e.textW = 0, e.start = 2 * a
            })).exec()
          }
        })
      },
      horseRaceLamp: function() {
        var t = this;
        t.times = setTimeout((function() {
          t.textW--, -1 * t.textW >= t.start && (t.textW = 710), t.horseRaceLamp()
        }), 10)
      },
      gotoPages: function(t) {
        this.gotoPage(t.linkUrl)
      }
    }
  },
  a = t._export_sfc(e, [
    ["render", function(e, a, i, o, n, r) {
      return {
        a: i.itemData.params.icon,
        b: t.t(n.textData),
        c: t.s("color:" + i.itemData.style.textColor + ";left:" + n.textW + "rpx"),
        d: i.itemData.style.background,
        e: 2 * i.itemData.style.topRadio + "rpx",
        f: 2 * i.itemData.style.topRadio + "rpx",
        g: 2 * i.itemData.style.bottomRadio + "rpx",
        h: 2 * i.itemData.style.bottomRadio + "rpx",
        i: "0 " + i.itemData.style.padding + "rpx",
        j: t.o((function(t) {
          return r.gotoPages(e.item)
        }), "0c"),
        k: i.itemData.style.bgcolor,
        l: 2 * i.itemData.style.paddingLeft + "rpx",
        m: 2 * i.itemData.style.paddingLeft + "rpx",
        n: 2 * i.itemData.style.paddingTop + "rpx",
        o: 2 * i.itemData.style.paddingBottom + "rpx"
      }
    }]
  ]);
wx.createComponent(a);