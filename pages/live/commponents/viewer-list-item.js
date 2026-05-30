var t = require("../../../common/vendor.js"),
  i = require("../../../utils/format.js"),
  e = {
    data: function() {
      return {
        formatTime: i.formatTime,
        itemData: {}
      }
    },
    props: {
      item: {
        type: Object,
        default: function() {
          return {}
        }
      }
    },
    watch: {
      item: function(t) {
        this.itemData = t
      }
    },
    created: function() {
      this.itemData = this.item
    },
    methods: {
      prohibitionGo: function(i) {
        var e = this;
        this._post("live.roomNew/lh", {
          id: i.id,
          type: "1",
          value: 1 == i.is_prohibition ? 0 : 1
        }, (function(a) {
          t.index.showToast({
            title: a.msg,
            icon: "none"
          }), 1 == a.code && (e.itemData.is_prohibition = 1 == i.is_prohibition ? 0 : 1)
        }))
      },
      blockGo: function() {
        var i = this;
        this._post("live.roomNew/lh", {
          id: this.itemData.id,
          type: "3",
          value: 1 == this.itemData.is_block ? 0 : 1
        }, (function(e) {
          t.index.showToast({
            title: e.msg,
            icon: "none"
          }), 1 == e.code && (i.itemData.is_block = 1 == i.itemData.is_block ? 0 : 1, i.$refs.block.close())
        }))
      },
      setTags: function() {
        this.$emit("setTags", this.itemData)
      },
      showProhibition: function() {
        this.$refs.prohibition.open()
      },
      showBlock: function() {
        this.$refs.block.open()
      },
      prohibitionChange: function(i) {
        var e = this;
        1 == i ? 1 == this.itemData.is_prohibition ? this.itemData.is_prohibition = 0 : this.itemData.is_prohibition = 1 : 1 == this.itemData.is_fake_prohibition ? this.itemData.is_fake_prohibition = 0 : this.itemData.is_fake_prohibition = 1, this._post("live.roomNew/lh", {
          id: this.itemData.id,
          type: 1 == i ? 1 : 4,
          value: 1 == i ? this.itemData.is_prohibition : this.itemData.is_fake_prohibition
        }, (function(i) {
          t.index.showToast({
            title: i.msg,
            icon: "none"
          }), e.$refs.prohibition.close()
        }))
      },
      blockIp: function() {
        var i = this;
        this._post("live.roomNew/lh", {
          id: this.itemData.id,
          ip: this.itemData.ip,
          type: "5",
          value: 1 == this.itemData.is_ip_ban ? 0 : 1
        }, (function(e) {
          t.index.showToast({
            title: e.msg,
            icon: "none"
          }), 1 == e.code && (i.$refs.block.close(), i.$emit("refresh"))
        }))
      },
      blockChange: function(t) {
        1 == t ? this.blockGo() : this.blockIp()
      }
    }
  };
Array || t.resolveComponent("uni-popup")(), Math;
var a = t._export_sfc(e, [
  ["render", function(i, e, a, o, n, s) {
    return t.e({
      a: 1 == n.itemData.userRole
    }, (n.itemData.userRole, {}), {
      b: 2 == n.itemData.userRole
    }, (n.itemData.userRole, {}), {
      c: n.itemData.avatarUrl || i.config.pic_url + "/202512051130591424e2127.png",
      d: t.t(n.itemData.nickName),
      e: n.itemData.grade_name
    }, n.itemData.grade_name ? {
      f: t.t(n.itemData.grade_name)
    } : {}, {
      g: n.itemData.user_tags.length > 0
    }, n.itemData.user_tags.length > 0 ? {
      h: t.f(n.itemData.user_tags, (function(i, e, a) {
        return {
          a: t.t(i),
          b: e
        }
      }))
    } : {}, {
      i: t.t(n.itemData.nation || ""),
      j: t.t(n.itemData.province || ""),
      k: t.t(n.itemData.city || ""),
      l: t.t(n.itemData.ip),
      m: t.t(n.itemData.enter_time_str),
      n: t.t(n.itemData.create_time),
      o: t.t(1 == n.itemData.is_online ? "在线" : "离线"),
      p: t.n(1 == n.itemData.is_online ? "online" : "offline"),
      q: t.t(1 == n.itemData.is_prohibition || 1 == n.itemData.is_fake_prohibition ? "解除禁言" : "禁言"),
      r: t.o((function(t) {
        return s.showProhibition()
      }), "1c"),
      s: t.t(1 == n.itemData.is_block || n.itemData.is_ip_ban ? "解除拉黑" : "拉黑"),
      t: t.o((function(t) {
        return s.showBlock()
      }), "30"),
      v: t.o((function(t) {
        return s.setTags()
      }), "ce"),
      w: t.t(n.formatTime(n.itemData.remain_time)),
      x: t.t(n.formatTime(n.itemData.remain_sum_time)),
      y: n.itemData.is_prohibition,
      z: t.o((function(t) {
        return s.prohibitionChange(1)
      }), "71"),
      A: n.itemData.is_fake_prohibition,
      B: t.o((function(t) {
        return s.prohibitionChange(2)
      }), "87"),
      C: t.sr("prohibition", "ac2ec6de-0"),
      D: t.p({
        title: "禁言"
      }),
      E: n.itemData.is_block,
      F: t.o((function(t) {
        return s.blockChange(1)
      }), "96"),
      G: n.itemData.is_ip_ban,
      H: t.t(n.itemData.ip),
      I: t.o((function(t) {
        return s.blockChange(2)
      }), "5c"),
      J: t.sr("block", "ac2ec6de-1"),
      K: t.p({
        title: "禁言"
      })
    })
  }],
  ["__scopeId", "data-v-ac2ec6de"]
]);
wx.createComponent(a);