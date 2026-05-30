var t = require("../../common/vendor.js"),
  o = {
    data: function() {
      return {
        status: 0,
        day: "0",
        hour: "0",
        minute: "0",
        second: "0",
        timer: null,
        totalSeconds: 0,
        title: "活动剩余："
      }
    },
    props: {
      config: {
        type: Object,
        default: function() {
          return {
            type: "all"
          }
        }
      },
      back_color: {
        type: String,
        default: function() {
          return ""
        }
      },
      cut_color: {
        type: String,
        default: function() {
          return ""
        }
      },
      color: {
        type: String,
        default: function() {
          return ""
        }
      },
      start_name: {
        type: String,
        default: function() {
          return "距开始"
        }
      },
      end_name: {
        type: String,
        default: function() {
          return "距结束"
        }
      },
      activeName: {
        type: String,
        default: function() {
          return ""
        }
      }
    },
    created: function() {},
    watch: {
      config: {
        deep: !0,
        handler: function(t, o) {
          t != o && 0 != t.endstamp && (t.title && t.title, this.setTime())
        },
        immediate: !0
      }
    },
    methods: {
      setTime: function() {
        var t = this;
        t.timer = setInterval((function() {
          t.init()
        }), 1e3)
      },
      init: function() {
        var t = Date.now() / 1e3;
        t < this.config.startstamp ? (this.status = 1, this.totalSeconds = parseInt(this.config.startstamp - t), this.countDown(), this.title = this.start_name) : t > this.config.endstamp ? (this.status = 2, this.title = this.end_name) : (this.totalSeconds = parseInt(this.config.endstamp - t), this.status = 0, this.countDown(), this.title = this.end_name), this.$emit("returnVal", this.status)
      },
      countDown: function() {
        var t = this.totalSeconds,
          o = Math.floor(t / 86400),
          e = t % 86400,
          r = Math.floor(e / 3600);
        e %= 3600;
        var n = Math.floor(e / 60),
          c = e % 60;
        this.day = o, this.hour = this.convertTwo(r), this.minute = this.convertTwo(n), this.second = this.convertTwo(c), this.totalSeconds--
      },
      convertTwo: function(t) {
        return t < 10 ? "0" + t : t
      },
      getLocalTime: function(t) {
        return new Date(1e3 * parseInt(t)).toLocaleString().replace(/:\d{1,2}$/, " ")
      },
      clear: function() {
        console.log(1), clearInterval(this.timer), this.timer = null
      }
    },
    destroyed: function() {
      clearInterval(this.timer)
    }
  },
  e = t._export_sfc(o, [
    ["render", function(o, e, r, n, c, i) {
      return t.e({
        a: null == r.config.type
      }, null == r.config.type ? {
        b: t.t(c.title),
        c: t.t(c.day),
        d: t.s("background-color: " + r.back_color + ";color:" + r.cut_color),
        e: t.t(c.hour),
        f: t.t(c.minute),
        g: t.t(c.second)
      } : {}, {
        h: "preview-list" == r.config.type
      }, "preview-list" == r.config.type ? {
        i: t.t(c.day),
        j: t.t(c.hour),
        k: t.t(c.minute),
        l: t.t(c.second)
      } : {}, {
        m: "hours" == r.config.type
      }, "hours" == r.config.type ? {
        n: t.t(c.title),
        o: t.t(parseInt(24 * c.day) + parseInt(c.hour)),
        p: t.s("background: " + r.back_color + ";color:" + r.cut_color + ";border-radius: 6rpx;padding: 4rpx;line-height: 1;font-size:24rpx;"),
        q: t.s("color:" + r.color),
        r: t.t(c.minute),
        s: t.s("background: " + r.back_color + ";color:" + r.cut_color + ";border-radius: 6rpx;padding: 4rpx;line-height: 1;font-size:24rpx;"),
        t: t.s("color:" + r.color),
        v: t.t(c.second),
        w: t.s("background: " + r.back_color + ";color:" + r.cut_color + ";border-radius: 6rpx;padding: 4rpx;line-height: 1;font-size:24rpx;"),
        x: t.s("color:" + r.color)
      } : {}, {
        y: "text" === r.config.type
      }, "text" === r.config.type ? {
        z: t.t(parseInt(24 * c.day) + parseInt(c.hour)),
        A: t.t(c.minute),
        B: t.t(c.second)
      } : {}, {
        C: "preview" === r.config.type
      }, "preview" === r.config.type ? {
        D: t.t(c.title),
        E: t.t(c.day),
        F: t.s("background-color: " + r.back_color + ";color:" + r.cut_color),
        G: t.t(c.hour),
        H: t.s("background-color: " + r.back_color + ";color:" + r.cut_color),
        I: t.s("color:" + r.color),
        J: t.t(c.minute),
        K: t.s("background-color: " + r.back_color + ";color:" + r.cut_color),
        L: t.s("color:" + r.color),
        M: t.t(c.second),
        N: t.s("background-color: " + r.back_color + ";color:" + r.cut_color),
        O: t.s("color:" + r.color)
      } : {}, {
        P: t.s("color:" + r.color),
        Q: t.n(r.activeName)
      })
    }]
  ]);
wx.createComponent(e);