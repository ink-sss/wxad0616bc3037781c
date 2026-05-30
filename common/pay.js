var a = require("./vendor.js");

function e(e, t, r) {
  r ? r(e) : function(e) {
    a.index.reLaunch({
      url: "/pages/order/pay-success/pay-success?order_id=" + e.data.order_id
    })
  }(e)
}
exports.pay = function(t, r, n, d) {
  if (-10 === t.code) return r.showError(t.msg), !1;
  20 == t.data.pay_type && a.index.requestPayment({
    provider: "wxpay",
    timeStamp: t.data.payment.timeStamp,
    nonceStr: t.data.payment.nonceStr,
    package: t.data.payment.package,
    signType: t.data.payment.signType,
    paySign: t.data.payment.paySign,
    success: function(a) {
      e(t, 0, n)
    },
    fail: function(e) {
      r.showError("订单未支付成功", (function() {
        ! function(e, t) {
          t ? t(e) : a.index.redirectTo({
            url: "/pages/order/order-detail?order_id=" + e.data.order_id
          })
        }(t, d)
      }))
    }
  }), 10 == t.data.pay_type && e(t, 0, n), t.data.pay_type, 40 == t.data.pay_type && e(t, 0, n)
};