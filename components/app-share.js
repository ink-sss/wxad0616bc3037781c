var e = require("../common/vendor.js"),
  i = require("../env/config.js"),
  t = {
    data: function() {
      return {
        Visible: !1,
        shareConfig: {},
        logo: ""
      }
    },
    created: function() {
      this.getData()
    },
    props: ["isAppShare", "appParams"],
    watch: {
      isAppShare: function(e, i) {
        e != i && (this.Visible = e)
      }
    },
    methods: {
      getData: function() {
        var e = this;
        e._get("settings/appShare", {}, (function(i) {
          e.shareConfig = i.data.appshare, e.logo = i.data.logo
        }))
      },
      closePopup: function(e) {
        this.$emit("close")
      },
      share: function(t, s) {
        var a = {
          provider: "weixin",
          scene: s,
          type: t,
          success: function(e) {
            console.log("success:" + JSON.stringify(e))
          },
          fail: function(e) {
            console.log("fail:" + JSON.stringify(e))
          }
        };
        2 != this.shareConfig.type ? (a.summary = this.appParams.summary, a.imageUrl = this.logo, a.title = this.appParams.title, 1 == this.shareConfig.type ? a.href = this.shareConfig.open_site + this.appParams.path : 3 == this.shareConfig.type && (1 == this.shareConfig.bind_type ? a.href = this.shareConfig.down_url : a.href = i.config.app_url + "/index.php/api/user.useropen/invite?app_id=" + i.config.app_id + "&referee_id=" + e.index.getStorageSync("user_id"))) : (a.scene = "WXSceneSession", a.type = 5, a.imageUrl = this.appParams.image ? this.appParams.image : this.logo, a.title = this.appParams.title, a.miniProgram = {
          id: this.shareConfig.gh_id,
          path: this.appParams.path,
          webUrl: this.shareConfig.web_url,
          type: 0
        }), e.index.share(a)
      }
    }
  },
  s = e._export_sfc(t, [
    ["render", function(i, t, s, a, n, o) {
      return {
        a: e.o((function(e) {
          return o.share(0, "WXSceneSession")
        }), "73"),
        b: e.o((function(e) {
          return o.share(0, "WXSenceTimeline")
        }), "19"),
        c: e.o((function(e) {
          return o.closePopup(1)
        }), "fb"),
        d: e.o((function() {}), "d2"),
        e: e.n(n.Visible ? "bottom-panel open" : "bottom-panel close"),
        f: e.o((function() {
          return o.closePopup && o.closePopup.apply(o, arguments)
        }), "fa")
      }
    }],
    ["__scopeId", "data-v-05f137af"]
  ]);
wx.createComponent(s);