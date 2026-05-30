var t = require("../../common/vendor.js"),
  e = {
    data: function() {
      return {
        status: -1,
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
        default: ""
      },
      back_color: {
        type: String,
        default: ""
      },
      cut_color: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: ""
      }
    },
    created: function() {},
    watch: {
      config: {
        deep: !0,
        handler: function(t, e) {
          t != e && 0 != t.endstamp && (t.title && void 0 !== t.title && (this.title = t.title), this.init(), this.setTime())
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
        t < this.config.startstamp ? (this.status = 3, this.totalSeconds = parseInt(this.config.startstamp - t), this.countDown()) : t > this.config.endstamp ? this.status = 1 : (this.totalSeconds = parseInt(this.config.endstamp - t), this.status = 2, this.countDown()), this.$emit("returnVal", this.status)
      },
      countDown: function() {
        var t = this.totalSeconds,
          e = Math.floor(t / 3600),
          o = t % 3600,
          n = Math.floor(o / 60),
          s = o % 60;
        this.hour = this.convertTwo(e), this.minute = this.convertTwo(n), this.second = this.convertTwo(s), this.totalSeconds--
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
  o = t._export_sfc(e, [
    ["render", function(e, o, n, s, i, r) {
      return t.e({
        a: 1 == i.status
      }, (i.status, {}), {
        b: 3 == i.status
      }, (i.status, {}), {
        c: 2 == i.status
      }, 2 == i.status ? {
        d: t.t(i.hour),
        e: t.s("color:" + n.color),
        f: t.t(i.minute),
        g: t.s("color:" + n.color),
        h: t.t(i.second),
        i: t.s("color:" + n.color)
      } : {})
    }],
    ["__scopeId", "data-v-8fb67228"]
  ]);
wx.createComponent(o);