var t = require("../../common/vendor.js"),
  e = {
    data: function() {
      return {
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        isPayPopup: !1,
        order_no: 0,
        detail: {
          order_status: [],
          address: {
            region: []
          },
          product: [],
          pay_type: [],
          delivery_type: [],
          pay_status: []
        },
        extractStore: {},
        eventChannel: null
      }
    },
    components: {},
    onLoad: function(t) {
      this.order_no = t.order_no
    },
    mounted: function() {
      this.getData(), this.eventChannel = this.getOpenerEventChannel()
    },
    methods: {
      getData: function() {
        var e = this;
        t.index.showLoading({
          title: "加载中"
        }), e._StorePost("store.order/detail", {
          order_no: e.order_no
        }, (function(r) {
          e.detail = r.data.order, e.extractStore = r.data.order.extractStore, t.index.hideLoading()
        }))
      },
      onSubmitExtract: function(e) {
        var r = this;
        t.wx$1.showModal({
          title: "提示",
          content: "您确定要核销吗?",
          success: function(a) {
            a.confirm && r._StorePost("store.order/extract", {
              order_id: e
            }, (function(e) {
              t.index.showToast({
                title: e.msg,
                duration: 2e3,
                icon: "success"
              }), r.eventChannel.emit("extractSuccess"), setTimeout((function() {
                r.getData()
              }), 2e3)
            }))
          }
        })
      }
    }
  },
  r = t._export_sfc(e, [
    ["render", function(e, r, a, o, i, n) {
      return t.e({
        a: t.t(i.detail.state_text),
        b: 20 == i.detail.delivery_type.value
      }, 20 == i.detail.delivery_type.value ? {
        c: t.t(i.extractStore.store_name),
        d: t.t(i.extractStore.phone),
        e: t.t(i.extractStore.region.province),
        f: t.t(i.extractStore.region.city),
        g: t.t(i.extractStore.region.region),
        h: t.t(i.extractStore.address)
      } : {}, {
        i: t.f(i.detail.product, (function(e, r, a) {
          return {
            a: e.image.file_path,
            b: t.t(e.product_name),
            c: t.t(e.product_price),
            d: t.t(e.total_num),
            e: r
          }
        })),
        j: t.t(i.detail.order_no),
        k: t.t(i.detail.create_time),
        l: t.t(i.detail.pay_type.text),
        m: t.t(i.detail.delivery_type.text),
        n: t.t(i.detail.order_price),
        o: t.t(i.detail.express_price),
        p: t.t(i.detail.order_price),
        q: 20 != i.detail.order_status.value
      }, 20 != i.detail.order_status.value ? t.e({
        r: 20 == i.detail.pay_status.value && 20 == i.detail.delivery_type.value && 10 == i.detail.delivery_status.value
      }, 20 == i.detail.pay_status.value && 20 == i.detail.delivery_type.value && 10 == i.detail.delivery_status.value ? {
        s: t.o((function(t) {
          return n.onSubmitExtract(i.detail.order_id)
        }), "60")
      } : {}) : {})
    }],
    ["__scopeId", "data-v-17c11fac"]
  ]);
wx.createPage(r);