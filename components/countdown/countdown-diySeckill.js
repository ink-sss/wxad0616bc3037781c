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
      },
      back_color: {
        type: String,
        default: function() {
          return ""
        }
      },
      back_colorR: {
        type: String,
        default: function() {
          return ""
        }
      },
      number_color: {
        type: String,
        default: function() {
          return ""
        }
      },
      titleF: {
        type: String,
        default: function() {
          return ""
        }
      },
      titleS: {
        type: String,
        default: function() {
          return ""
        }
      },
      start_name: {
        type: String,
        default: function() {
          return ""
        }
      },
      end_name: {
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
        handler: function(t, e) {
          t != e && 0 != t.endstamp && (t.title && t.title, this.setTime())
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
        t < this.config.startstamp ? (this.status = 3, this.totalSeconds = parseInt(this.config.startstamp - t), this.countDown(), this.title = this.start_name) : t > this.config.endstamp ? (this.status = 1, this.title = this.end_name) : (this.totalSeconds = parseInt(this.config.endstamp - t), this.status = 2, this.countDown(), this.title = this.end_name), this.$emit("returnVal", this.status)
      },
      countDown: function() {
        var t = this.totalSeconds,
          e = Math.floor(t / 3600),
          n = t % 3600,
          i = Math.floor(n / 60),
          r = n % 60;
        this.hour = this.convertTwo(e), this.minute = this.convertTwo(i), this.second = this.convertTwo(r), this.totalSeconds--
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
    ["render", function(e, n, i, r, o, s) {
      return {
        a: t.t(o.hour),
        b: t.s("background:linear-gradient(to right, " + (i.titleF || "#fff") + ", " + (i.titleS || "#fff") + ");color:" + i.number_color + ";"),
        c: t.s("color:" + i.titleF),
        d: t.t(o.minute),
        e: t.s("background:linear-gradient(to right, " + (i.titleF || "#fff") + ", " + (i.titleS || "#fff") + ");color:" + i.number_color + ";"),
        f: t.s("color:" + i.titleF),
        g: t.t(o.second),
        h: t.s("background:linear-gradient(to right, " + (i.titleF || "#fff") + ", " + (i.titleS || "#fff") + ");color:" + i.number_color + ";")
      }
    }]
  ]);
wx.createComponent(n);