var t = require("../../common/vendor.js"),
  e = {
    components: {
      application: function() {
        return "./application_status2.js"
      }
    },
    data: function() {
      return {
        supplierStatus: -1,
        loading: !0
      }
    },
    onLoad: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var e = this;
        t.index.showLoading({
          title: "加载中..."
        }), e.loading = !0, e._get("user.index/detail", {}, (function(i) {
          if (e.loading = !1, e.supplierStatus = i.data.supplierStatus, 2 == e.supplierStatus) e.gotoPage("pages/user/my_shop/my_shop", "redirect");
          else if (3 == e.supplierStatus) t.index.hideLoading(), t.index.showModal({
            content: "商户异常,请联系客服处理"
          });
          else {
            var a;
            a = 0 == e.supplierStatus ? "申请入驻" : "申请审核中", t.index.setNavigationBarTitle({
              title: a
            }), t.index.hideLoading()
          }
        }))
      }
    }
  };
Array || t.resolveComponent("application")();
var i = t._export_sfc(e, [
  ["render", function(e, i, a, n, s, o) {
    return t.e({
      a: !s.loading && 2 != s.supplierStatus
    }, s.loading || 2 == s.supplierStatus ? {} : t.e({
      b: 1 == s.supplierStatus
    }, (s.supplierStatus, {})))
  }]
]);
wx.createPage(i);