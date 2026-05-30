var t = require("../../../common/vendor.js"),
  a = {
    data: function() {
      return {}
    },
    props: ["itemData", "diytop"],
    watch: {
      diytop: function(t, a) {
        console.log(t)
      }
    },
    methods: {
      toLink: function() {
        var a = this;
        2 == a.itemData.params.type ? a.gotoPage(a.itemData.params.link.linkUrl) : t.index.pageScrollTo({
          scrollTop: 0,
          duration: 300
        })
      }
    }
  },
  o = t._export_sfc(a, [
    ["render", function(a, o, e, i, n, r) {
      return {
        a: e.itemData.params.image,
        b: t.o((function() {
          return r.toLink && r.toLink.apply(r, arguments)
        }), "72"),
        c: 2 == e.itemData.params.showType && e.diytop < 50 ? 1 : "",
        d: e.itemData.style.right + "%",
        e: e.itemData.style.bottom + "%",
        f: e.itemData.style.opacity / 100
      }
    }],
    ["__scopeId", "data-v-9cf97f3c"]
  ]);
wx.createComponent(o);