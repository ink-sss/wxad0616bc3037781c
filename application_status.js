var t = require("./common/vendor.js"),
  a = t._export_sfc({
    data: function() {
      return {
        detail: {}
      }
    },
    mounted: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var t = this;
        t._post("supplier.apply/detail", {}, (function(a) {
          t.detail = a.data.detail
        }))
      },
      gotoReg: function() {
        this.gotoPage("/pages/shop/register")
      }
    }
  }, [
    ["render", function(a, s, e, i, u, d) {
      return t.e({
        a: 0 == u.detail.status
      }, (u.detail.status, {}), {
        b: 1 == u.detail.status
      }, (u.detail.status, {}), {
        c: 2 == u.detail.status
      }, (u.detail.status, {}), {
        d: 0 == u.detail.status
      }, (u.detail.status, {}), {
        e: 1 == u.detail.status
      }, (u.detail.status, {}), {
        f: 2 == u.detail.status
      }, (u.detail.status, {}), {
        g: 0 == u.detail.status
      }, (u.detail.status, {}), {
        h: 1 == u.detail.status
      }, (u.detail.status, {}), {
        i: 2 == u.detail.status
      }, (u.detail.status, {}), {
        j: 0 == u.detail.status
      }, (u.detail.status, {}), {
        k: 1 == u.detail.status
      }, (u.detail.status, {}), {
        l: 2 == u.detail.status
      }, (u.detail.status, {}), {
        m: 0 == u.detail.status
      }, (u.detail.status, {}), {
        n: 1 == u.detail.status
      }, (u.detail.status, {}), {
        o: 2 == u.detail.status
      }, (u.detail.status, {}), {
        p: 1 == u.detail.status
      }, (u.detail.status, {}), {
        q: 2 == u.detail.status
      }, (u.detail.status, {}), {
        r: 2 == u.detail.status
      }, 2 == u.detail.status ? {
        s: t.t(u.detail.content)
      } : {}, {
        t: 2 == u.detail.status
      }, 2 == u.detail.status ? {
        v: t.o((function(t) {
          return d.gotoReg()
        }), "d2")
      } : {}, {
        w: a.theme(),
        x: t.n(a.theme() || "")
      })
    }]
  ]);
exports.MiniProgramPage = a;