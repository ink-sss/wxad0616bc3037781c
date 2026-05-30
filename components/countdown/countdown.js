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
        t < this.config.startstamp ? this.status = 1 : t > this.config.endstamp ? this.status = 2 : (this.totalSeconds = parseInt(this.config.endstamp - t), this.status = 0, this.countDown()), this.$emit("returnVal", this.status)
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
    ["render", function(e, n, i, o, s, a) {
      return t.e({
        a: i.config && null == i.config.type
      }, i.config && null == i.config.type ? t.e({
        b: 0 == s.status
      }, 0 == s.status ? {
        c: t.t(s.title)
      } : {}, {
        d: 1 == s.status
      }, (s.status, {}), {
        e: 2 == s.status
      }, (s.status, {}), {
        f: t.t(s.day),
        g: t.t(s.hour),
        h: t.t(s.minute),
        i: t.t(s.second)
      }) : {}, {
        j: i.config && "text" === i.config.type
      }, i.config && "text" === i.config.type ? {
        k: t.t(s.title),
        l: t.t(parseInt(24 * s.day) + parseInt(s.hour)),
        m: t.t(s.minute),
        n: t.t(s.second),
        o: t.n(i.config.isWhite ? "white" : "dominant")
      } : {}, {
        p: e.theme(),
        q: t.n(e.theme() || "")
      })
    }]
  ]);
wx.createComponent(n);