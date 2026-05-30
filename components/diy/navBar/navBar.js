var t = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        item_width: "25%",
        qrcode: "",
        qrText: ""
      }
    },
    props: ["itemData"],
    created: function() {
      this.item_width = 100 / Math.abs(this.itemData.style.rowsNum) + "%"
    },
    methods: {
      gotoDetail: function(e) {
        "提货码" == e.text ? (this.qrText = "提货码", this.getExtractGoods()) : "时长码" == e.text ? (this.qrText = "时长码", this.getTimeCode()) : "兑换码" == e.text ? (this.qrText = "兑换码", this.getCouponCode()) : "积分码" == e.text ? (this.qrText = "积分码", this.getPointCode()) : "红包码" == e.text ? (this.qrText = "红包码", this.getMoneyCode()) : "门店管理" == e.text ? t.index.getStorageSync("branchToken") ? this.gotoPage("/pages/branch/index") : this.gotoPage("/pages/branch/login") : this.gotoPage(e.linkUrl)
      },
      getExtractGoods: function() {
        var t = this;
        t._get("user.qrCode/getExtractGoodsCode", {
          url: "/pages/branch/scanWrittenCode"
        }, (function(e) {
          console.log(e), 1 == e.code && (t.qrcode = e.data.content, t.$refs.qrCodeRef.open())
        }))
      },
      getTimeCode: function() {
        var t = this;
        t._get("user.qrCode/getWatchTimeCode", {
          url: "/pages/branch/scanWrittenCode"
        }, (function(e) {
          console.log(e), 1 == e.code && (t.qrcode = e.data.content, t.$refs.qrCodeRef.open())
        }))
      },
      getCouponCode: function() {
        var t = this;
        t._get("user.qrCode/getRoomStoreCouponCode", {
          url: "/pages/branch/welfareVoucher"
        }, (function(e) {
          console.log(e), 1 == e.code && (t.qrcode = e.data.content, t.$refs.qrCodeRef.open())
        }))
      },
      getPointCode: function() {
        var t = this;
        t._get("user.qrCode/getPointCode", {
          url: "/pages/branch/pointDetail"
        }, (function(e) {
          console.log(e), 1 == e.code && (t.qrcode = e.data.content, t.$refs.qrCodeRef.open())
        }))
      },
      getMoneyCode: function() {
        var t = this;
        t._get("user.qrCode/getRedPackCode", {
          url: "/pages/branch/moneyDetail"
        }, (function(e) {
          console.log(e), 1 == e.code && (t.qrcode = e.data.content, t.$refs.qrCodeRef.open())
        }))
      }
    }
  };
Array || t.resolveComponent("uni-popup")(), Math;
var o = t._export_sfc(e, [
  ["render", function(e, o, r, n, a, i) {
    return {
      a: t.f(r.itemData.data, (function(e, o, r) {
        return {
          a: e.imgUrl,
          b: t.t(e.text),
          c: e.color,
          d: o,
          e: t.o((function(t) {
            return i.gotoDetail(e)
          }), o)
        }
      })),
      b: t.s("width:" + a.item_width + ";"),
      c: r.itemData.style.background,
      d: 2 * r.itemData.style.topRadio + "rpx " + 2 * r.itemData.style.topRadio + "rpx " + 2 * r.itemData.style.bottomRadio + "rpx " + 2 * r.itemData.style.bottomRadio + "rpx",
      e: r.itemData.style.bgcolor,
      f: 2 * r.itemData.style.paddingTop + "rpx " + 2 * r.itemData.style.paddingLeft + "rpx " + 2 * r.itemData.style.paddingBottom + "rpx " + 2 * r.itemData.style.paddingLeft + "rpx",
      g: a.qrcode,
      h: t.t(a.qrText),
      i: t.sr("qrCodeRef", "5b3f16bd-0"),
      j: t.p({
        type: "center",
        "background-color": "#fff",
        "border-radius": "20px 20px 20px 20px"
      })
    }
  }]
]);
wx.createComponent(o);