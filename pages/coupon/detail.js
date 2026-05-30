var t = require("../../common/vendor.js"),
  e = {
    data: function() {
      return {
        loading: !0,
        opacity: 0,
        coupon_id: 0,
        listData: [],
        detail: {
          state: {
            value: 0,
            text: ""
          }
        }
      }
    },
    onPageScroll: function(t) {
      t.scrollTop < 100 ? this.opacity = t.scrollTop / 100 : this.opacity = 1
    },
    onLoad: function(t) {
      this.coupon_id = t.coupon_id, this.apply_range = t.apply_range
    },
    onShow: function() {
      this.page = 1, this.listData = [], this.getData()
    },
    methods: {
      getData: function() {
        var e = this;
        e.loading = !0, t.index.showLoading({
          title: "加载中"
        }), e.data_type, e._get("coupon.coupon/detail", {
          coupon_id: e.coupon_id
        }, (function(i) {
          t.index.hideLoading(), e.loading = !1, e.detail = i.data.model, 20 == e.apply_range ? e.listData = i.data.model.product : 30 == e.apply_range && (e.listData = e.listData.concat(i.data.product_list.data), e.last_page = i.data.product_list.last_page, i.data.product_list.last_page <= 1 && (e.no_more = !0))
        }))
      },
      receiveCoupon: function() {
        var e = this;
        if (1 == e.detail.is_get) return !1;
        e._post("user.coupon/receive", {
          coupon_id: e.detail.coupon_id
        }, (function(i) {
          t.index.showToast({
            title: "领取成功",
            icon: "success",
            mask: !0,
            duration: 2e3
          }), e.detail.is_get = 1, e.detail.state.text = "已领取"
        }), (function(e) {
          t.index.navigateBack()
        }))
      },
      goback: function() {
        t.index.navigateBack()
      }
    }
  };
Array || t.resolveComponent("uni-load-more")();
var i = t._export_sfc(e, [
  ["render", function(e, i, a, o, n, d) {
    return t.e({
      a: !n.loading
    }, n.loading ? {} : t.e({
      b: t.t(n.detail.supplier ? n.detail.supplier.name : "平台通用"),
      c: t.t(n.detail.name),
      d: 10 == n.detail.expire_type
    }, 10 == n.detail.expire_type ? {
      e: t.t(n.detail.expire_day)
    } : {}, {
      f: 20 == n.detail.expire_type
    }, 20 == n.detail.expire_type ? {
      g: t.t(n.detail.start_time.text),
      h: t.t(n.detail.end_time.text)
    } : {}, {
      i: 10 == n.detail.coupon_type.value
    }, 10 == n.detail.coupon_type.value ? {
      j: t.t(1 * n.detail.reduce_price)
    } : {}, {
      k: 20 == n.detail.coupon_type.value
    }, 20 == n.detail.coupon_type.value ? {
      l: t.t(n.detail.discount)
    } : {}, {
      m: t.t(n.detail.min_price > 0 ? "满" + 1 * n.detail.min_price + "元可用" : "无门槛"),
      n: 0 == n.detail.is_get
    }, 0 == n.detail.is_get ? {
      o: t.o((function(t) {
        return d.receiveCoupon()
      }), "49")
    } : {
      p: t.o((function(t) {
        return d.receiveCoupon()
      }), "9d")
    }, {
      q: t.n("coupon-item coupon-item-" + n.detail.color.text),
      r: 10 != e.apply_range
    }, 10 != e.apply_range ? t.e({
      s: t.f(n.listData, (function(i, a, o) {
        return t.e({
          a: i.product_image || e.config.pic_url + "/static/live/default_logo.jpeg",
          b: t.t(i.product_name),
          c: t.t(i.product_sales),
          d: t.t(i.product_price),
          e: i.line_price
        }, i.line_price ? {
          f: t.t(i.line_price)
        } : {}, {
          g: a,
          h: t.o((function(t) {
            return e.gotoPage("/pages/product/detail/detail?product_id=" + i.product_id)
          }), a)
        })
      })),
      t: 0 == n.listData.length && !n.loading
    }, 0 != n.listData.length || n.loading ? {
      v: t.p({
        loadingType: e.loadingType
      })
    } : {}) : {}, {
      w: e.theme(),
      x: t.n(e.theme() || "")
    }))
  }],
  ["__scopeId", "data-v-0f36766f"]
]);
e.__runtimeHooks = 1, wx.createPage(i);