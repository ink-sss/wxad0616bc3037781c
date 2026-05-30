var t = require("../../common/vendor.js"),
  e = {
    data: function() {
      return {
        status: 0,
        day: "0",
        hour: "0",
        minute: "0",
        second: "0",
        timer: null,
        totalSeconds: 0,
        title: "还剩"
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
      color: {
        type: String,
        default: function() {
          return "#ffffff"
        }
      },
      timeSize: {
        type: String,
        default: function() {
          return "28rpx"
        }
      }
    },
    created: function() {},
    watch: {
      config: {
        deep: !0,
        handler: function(t, e) {
          t != e && 0 != t.endstamp && (t.title && void 0 !== t.title && (this.title = t.title), this.setTime())
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
        t < this.config.startstamp ? (this.status = 1, this.title = "距开始还剩") : t > this.config.endstamp ? this.status = 2 : (this.totalSeconds = parseInt(this.config.endstamp - t), this.status = 0, this.title = "距截止还剩", this.countDown()), this.$emit("returnVal", this.status)
      },
      countDown: function() {
        var t = this.totalSeconds,
          e = Math.floor(t / 86400),
          n = t % 86400,
          i = Math.floor(n / 3600);
        n %= 3600;
        var o = Math.floor(n / 60),
          s = n % 60;
        this.day = this.convertTwo(e), this.hour = this.convertTwo(i), this.minute = this.convertTwo(o), this.second = this.convertTwo(s), this.totalSeconds--
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
  n = t._export_sfc(e, [
    ["render", function(e, n, i, o, s, r) {
      return t.e({
        a: 2 == s.status
      }, 2 == s.status ? {} : {
        b: t.t(s.title),
        c: t.t(parseInt(s.day) + "天"),
        d: t.t(parseInt(s.hour)),
        e: t.t(s.minute),
        f: t.t(s.second),
        g: t.s("font-size:" + i.timeSize + ";")
      }, {
        h: t.s("color:" + i.color)
      })
    }]
  ]);
wx.createComponent(n);