var t = require("../../common/vendor.js"),
  e = {
    data: function() {
      return {
        type: "",
        content: ""
      }
    },
    onLoad: function(e) {
      this.type = e.type;
      var n;
      n = "service" == this.type ? "用户协议" : "隐私协议", t.index.setNavigationBarTitle({
        title: n
      }), this.getData()
    },
    methods: {
      getData: function() {
        var t = this;
        t._get("user.userapple/policy", {}, (function(e) {
          "service" == t.type ? t.content = e.data.service : t.content = e.data.privacy
        }))
      }
    }
  },
  n = t._export_sfc(e, [
    ["render", function(t, e, n, a, r, i) {
      return {
        a: r.content
      }
    }]
  ]);
wx.createPage(n);