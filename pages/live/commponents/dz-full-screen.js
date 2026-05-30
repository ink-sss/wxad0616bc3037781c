var e = require("../../../common/vendor.js"),
  i = 0,
  t = {
    data: function() {
      return {
        likeList: [],
        likeIcons: ["https://weilive.yukelive.com/static/dainzan_1.png", "https://weilive.yukelive.com/static/dainzan_2.png", "https://weilive.yukelive.com/static/dainzan_3.png", "https://weilive.yukelive.com/static/dainzan_4.png", "https://weilive.yukelive.com/static/dainzan_5.png", "https://weilive.yukelive.com/static/dainzan_6.png"]
      }
    },
    methods: {
      handleTouch: function(t) {
        var n = this;
        this.$emit("clikeLike");
        var c = t.touches[0];
        e.index.createSelectorQuery().in(this).select(".live-container").boundingClientRect((function(e) {
          var t = c.clientX - e.left - 20,
            o = c.clientY - e.top - 20,
            l = Math.floor(Math.random() * n.likeIcons.length),
            a = n.likeIcons[l];
          n.likeList.unshift({
            id: i++,
            left: t,
            top: o,
            icon: a
          }), n.likeList.length > 15 && n.likeList.pop()
        })).exec()
      },
      removeLike: function(e) {
        this.likeList = this.likeList.filter((function(i) {
          return i.id !== e
        }))
      }
    }
  },
  n = e._export_sfc(t, [
    ["render", function(i, t, n, c, o, l) {
      return {
        a: e.f(o.likeList, (function(i, t, n) {
          return {
            a: i.icon,
            b: i.id,
            c: i.left + "px",
            d: i.top + "px",
            e: .05 * t + "s",
            f: e.o((function(e) {
              return l.removeLike(i.id)
            }), i.id)
          }
        })),
        b: e.o((function() {
          return l.handleTouch && l.handleTouch.apply(l, arguments)
        }), "84")
      }
    }],
    ["__scopeId", "data-v-fcadd67b"]
  ]);
wx.createComponent(n);