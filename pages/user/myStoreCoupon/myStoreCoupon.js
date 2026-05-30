var t = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        activeTab: 0,
        page: 1,
        listRows: 20,
        lastPage: 1,
        hasMore: !0,
        loading: !1,
        loadingMore: !1,
        listData: [],
        recordApi: "live.roomStoreCoupon/storeCouponRecord",
        qrcode: "",
        qrText: "兑换码"
      }
    },
    onLoad: function() {
      this.getList(!0)
    },
    methods: {
      goBack: function() {
        t.index.navigateBack()
      },
      switchTab: function(t) {
        this.activeTab !== t && (this.activeTab = t, this.getList(!0))
      },
      getListApi: function() {
        return 2 === this.activeTab ? this.recordApi : "live.roomStoreCoupon/userList"
      },
      getListParams: function() {
        var t = {
          page: this.page,
          list_rows: this.listRows
        };
        return 0 === this.activeTab && (t.data_type = "not_use"), 1 === this.activeTab && (t.data_type = "is_expire"), 2 === this.activeTab && (t.data_type = "is_use"), t
      },
      getList: function() {
        var t = this,
          e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        if (e && (this.page = 1, this.lastPage = 1, this.hasMore = !0, this.listData = []), this.hasMore || e) {
          var o = this.getListApi();
          if (!o) return this.loading = !1, this.loadingMore = !1, this.listData = [], void(this.hasMore = !1);
          1 === this.page ? this.loading = !0 : this.loadingMore = !0, this._post(o, this.getListParams(), (function(e) {
            if (t.loading = !1, t.loadingMore = !1, 1 === e.code) {
              var o = e.data || {},
                i = Array.isArray(o.data) ? o.data : [];
              t.listData = 1 === t.page ? i : t.listData.concat(i);
              var a = Number(o.current_page || t.page),
                n = Number(o.last_page || 0);
              n > 0 ? (t.lastPage = n, t.hasMore = a < n) : t.hasMore = i.length >= t.listRows, t.page = t.page + 1
            } else t.hasMore = !1
          }), (function() {
            t.loading = !1, t.loadingMore = !1
          }))
        }
      },
      loadMore: function() {
        this.loading || this.loadingMore || !this.hasMore || this.getList()
      },
      handleCouponAction: function(t) {
        this.getCouponCode()
      },
      getCouponCode: function() {
        var t = this;
        this._get("user.qrCode/getRoomStoreCouponCode", {
          url: "/pages/branch/welfareVoucher"
        }, (function(e) {
          1 == e.code && (t.qrcode = e.data.content, t.qrText = "兑换码", t.$refs.qrCodeRef.open())
        }))
      },
      toNumber: function(t) {
        var e = Number(t);
        return Number.isFinite(e) ? e : 0
      },
      getCouponName: function(t) {
        return (null == t ? void 0 : t.name) || (null == t ? void 0 : t.coupon_name) || (null == t ? void 0 : t.title) || "福利券"
      },
      getCouponType: function(t) {
        return (null == t ? void 0 : t.coupon_type_name) || (null == t ? void 0 : t.type_name) || "福利券"
      },
      getCouponRemark: function(t) {
        var e = (null == t ? void 0 : t.remark) || (null == t ? void 0 : t.coupon_remark) || (null == t ? void 0 : t.description) || "";
        return String(e).trim()
      },
      formatDateText: function(t) {
        var e = String(t || "").trim();
        return e ? e.length >= 10 ? e.slice(0, 10) : e : ""
      },
      getDateRange: function(t) {
        var e = this.formatDateText((null == t ? void 0 : t.start_time) || (null == t ? void 0 : t.startTime) || (null == t ? void 0 : t.begin_time)),
          o = this.formatDateText((null == t ? void 0 : t.expire_time) || (null == t ? void 0 : t.end_time) || (null == t ? void 0 : t.invalid_time) || (null == t ? void 0 : t.endTime));
        return e && o ? "".concat(e, " - ").concat(o) : !e && o ? "到期：".concat(o) : e && !o ? "".concat(e, " - 长期有效") : "长期有效"
      },
      getBottomTimeText: function(t) {
        if (2 === this.activeTab) {
          var e = this.formatDateText(null == t ? void 0 : t.create_time);
          return e ? "使用时间：".concat(e) : "使用时间：--"
        }
        return this.getDateRange(t)
      }
    }
  };
Array || t.resolveComponent("uni-popup")(), Math;
var o = t._export_sfc(e, [
  ["render", function(e, o, i, a, n, r) {
    return t.e({
      a: t.s("height:" + e.topBarTop() + "px;"),
      b: t.o((function() {
        return r.goBack && r.goBack.apply(r, arguments)
      }), "7a"),
      c: t.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;"),
      d: t.n(0 === n.activeTab ? "tab-item active" : "tab-item"),
      e: t.o((function(t) {
        return r.switchTab(0)
      }), "35"),
      f: t.n(1 === n.activeTab ? "tab-item active" : "tab-item"),
      g: t.o((function(t) {
        return r.switchTab(1)
      }), "ec"),
      h: t.n(2 === n.activeTab ? "tab-item active" : "tab-item"),
      i: t.o((function(t) {
        return r.switchTab(2)
      }), "23"),
      j: n.listData.length > 0
    }, n.listData.length > 0 ? t.e({
      k: t.f(n.listData, (function(e, o, i) {
        return t.e({
          a: t.t(r.getCouponType(e)),
          b: t.t(r.getCouponName(e)),
          c: r.getCouponRemark(e)
        }, r.getCouponRemark(e) ? {
          d: t.t(r.getCouponRemark(e))
        } : {}, 1 !== n.activeTab ? {
          e: t.t(r.toNumber(e.num))
        } : {}, {
          f: t.t(r.getBottomTimeText(e))
        }, 0 === n.activeTab ? {
          g: t.o((function(t) {
            return r.handleCouponAction(e)
          }), "".concat(e.coupon_id || e.id || "coupon", "-").concat(o))
        } : {}, {
          h: "".concat(e.coupon_id || e.id || "coupon", "-").concat(o)
        })
      })),
      l: 1 !== n.activeTab,
      m: 0 === n.activeTab,
      n: n.loadingMore
    }, (n.loadingMore || n.hasMore, {}), {
      o: !n.hasMore
    }) : (n.loading, {}), {
      p: !n.loading,
      q: n.loading
    }, (n.loading, {}), {
      r: t.o((function() {
        return r.loadMore && r.loadMore.apply(r, arguments)
      }), "f9"),
      s: n.qrcode,
      t: t.t(n.qrText),
      v: t.sr("qrCodeRef", "67760e90-0"),
      w: t.p({
        type: "center",
        "background-color": "#fff",
        "border-radius": "20px 20px 20px 20px"
      }),
      x: e.theme(),
      y: t.n(e.theme() || "")
    })
  }]
]);
wx.createPage(o);