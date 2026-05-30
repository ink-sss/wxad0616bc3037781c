var e = require("../../../common/vendor.js"),
  t = e._export_sfc({
    data: function() {
      return {}
    },
    props: ["itemData", "userInfo"],
    created: function() {
      var e = "#ffffff";
      switch (this.itemData.style.type) {
        case 1:
          e = "#ff5704";
          break;
        case 2:
          e = "#19ad57";
          break;
        case 3:
          e = "#ffcc00";
          break;
        case 4:
          e = "#33a7ff";
          break;
        case 5:
          e = "#e4e4e4";
          break;
        case 6:
          e = "#c8ba97";
          break;
        case 7:
          e = "#623ceb"
      }
      this.$emit("bg", e)
    },
    methods: {
      gotoDetail: function(e) {
        this.gotoPage(e.linkUrl)
      },
      scanQrcode: function() {
        this.$emit("scanQrcode")
      }
    }
  }, [
    ["render", function(t, o, a, n, r, s) {
      return e.e({
        a: a.userInfo.detail
      }, a.userInfo.detail ? {
        b: a.userInfo.detail && a.userInfo.detail.avatarUrl || "/static/login-default.png",
        c: e.o((function(e) {
          return t.gotoPage("/pages/user/set/set")
        }), "40")
      } : {
        d: a.userInfo.detail && a.userInfo.detail.avatarUrl || "/static/login-default.png",
        e: e.o((function(e) {
          return t.doLogin()
        }), "f4")
      }, {
        f: a.userInfo.detail
      }, a.userInfo.detail ? e.e({
        g: e.t(a.userInfo.detail.nickName),
        h: a.userInfo.detail.grade_id > 0
      }, a.userInfo.detail.grade_id > 0 ? {
        i: e.t(a.userInfo.detail.grade.name)
      } : {}) : {
        j: e.o((function(e) {
          return t.doLogin()
        }), "6b")
      }, {
        k: a.userInfo.detail
      }, a.userInfo.detail ? {
        l: e.t(a.userInfo.detail.user_id)
      } : {}, {
        m: e.n("bg-base-" + a.itemData.style.type),
        n: e.t(a.userInfo.detail ? a.userInfo.detail.balance : 0),
        o: e.o((function(e) {
          return t.gotoPage("/pages/user/my-wallet/my-wallet")
        }), "42"),
        p: e.t(a.userInfo.detail ? a.userInfo.detail.points : 0),
        q: e.t(t.points_name()),
        r: e.o((function(e) {
          return t.gotoPage("/pages/user/points/points")
        }), "63"),
        s: e.t(a.userInfo.coupon),
        t: e.o((function(e) {
          return t.gotoPage("/pages/user/my-coupon/my-coupon")
        }), "43"),
        v: e.t(a.userInfo.storeCouponCount ? a.userInfo.storeCouponCount : 0),
        w: e.o((function(e) {
          return t.gotoPage("/pages/user/myStoreCoupon/myStoreCoupon")
        }), "5f"),
        x: a.itemData.style.background,
        y: a.itemData.style.bgcolor,
        z: a.itemData.style.paddingTop + "px " + a.itemData.style.paddingLeft + "px " + a.itemData.style.paddingBottom + "px " + a.itemData.style.paddingLeft + "px"
      })
    }],
    ["__scopeId", "data-v-8e6606ec"]
  ]);
wx.createComponent(t);