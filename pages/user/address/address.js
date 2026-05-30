var e = require("../../../common/vendor.js");
require("../../../env/config.js");
var t = require("../../../common/assets.js"),
  d = {
    data: function() {
      return {
        loadding: !0,
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        listData: [],
        default_id: "0",
        options: {}
      }
    },
    onLoad: function(e) {
      this.options = e
    },
    onShow: function() {
      e.index.showLoading({
        title: "加载中"
      }), this.getData()
    },
    methods: {
      getData: function() {
        var t = this;
        t.dataType, t._get("user.address/lists", {}, (function(d) {
          t.listData = d.data.list, t.default_id = d.data.default_id + "", t.loadding = !1, e.index.hideLoading()
        }))
      },
      addAddress: function() {
        var e = 1;
        "order" === this.options.source && (e = 2), this.gotoPage("/pages/user/address/add/add?delta=" + e)
      },
      radioChange: function(t) {
        var d = this;
        return d.default_id = t, d._post("user.address/setDefault", {
          address_id: t
        }, (function(t) {
          "order" === d.options.source && e.index.navigateBack()
        })), !1
      },
      editAddress: function(e) {
        this.gotoPage("/pages/user/address/edit/edit?address_id=" + e)
      },
      delAddress: function(t) {
        var d = this;
        e.wx$1.showModal({
          title: "提示",
          content: "您确定要移除当前收货地址吗?",
          success: function(i) {
            i.confirm && d._get("user.address/delete", {
              address_id: t
            }, (function(t) {
              1 == t.code && (e.index.showToast({
                title: "删除成功",
                duration: 2e3
              }), d.getData())
            }))
          }
        })
      }
    }
  },
  i = e._export_sfc(d, [
    ["render", function(d, i, a, s, n, o) {
      return e.e({
        a: !n.loadding
      }, n.loadding ? {} : e.e({
        b: n.listData.length > 0
      }, n.listData.length > 0 ? {
        c: e.f(n.listData, (function(t, d, i) {
          return {
            a: e.t(t.name),
            b: e.t(t.phone),
            c: e.t(t.region.province),
            d: e.t(t.region.city),
            e: e.t(t.region.region),
            f: e.t(t.detail),
            g: e.o((function(e) {
              return o.radioChange(t.address_id)
            }), d),
            h: t.address_id + "",
            i: n.default_id == t.address_id + "",
            j: e.o((function(e) {
              return o.radioChange(t.address_id)
            }), d),
            k: e.o((function(e) {
              return o.editAddress(t.address_id)
            }), d),
            l: e.o((function(e) {
              return o.delAddress(t.address_id)
            }), d),
            m: d
          }
        })),
        d: d.getThemeColor(),
        e: t._imports_0$1,
        f: t._imports_1$1
      } : {
        g: d.config.pic_url + "/static/list-null.png"
      }, {
        h: e.o((function(e) {
          return o.addAddress()
        }), "a5"),
        i: d.theme(),
        j: e.n(d.theme() || "")
      }))
    }],
    ["__scopeId", "data-v-d9bcd255"]
  ]);
wx.createPage(i);