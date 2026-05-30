var t = require("../../../common/vendor.js"),
  e = require("../../../common/utils.js"),
  a = require("../../../common/assets.js"),
  i = {
    components: {
      AppShare: function() {
        return "../../../components/app-share.js"
      }
    },
    data: function() {
      return {
        loadding: !1,
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        article_id: 0,
        article: {
          image: {}
        },
        urldata: "",
        isAppShare: !1,
        appParams: {
          title: "",
          summary: "",
          path: ""
        }
      }
    },
    onLoad: function(t) {
      this.article_id = t.article_id
    },
    mounted: function() {
      this.getData()
    },
    onShareAppMessage: function() {
      var t = this,
        e = t.getShareUrlParams({
          article_id: t.article_id
        });
      return t.taskFunc(), {
        title: t.article.article_title,
        path: "/pages/article/detail/detail?" + e
      }
    },
    methods: {
      taskFunc: function() {
        this._post("plus.task.Task/dayTask", {
          task_type: "article"
        }, (function(t) {
          console.log("分享成功")
        }))
      },
      copyUrl: function() {
        var e = document.createElement("input"),
          a = window.location.href;
        e.value = a, document.body.appendChild(e), e.select(), e.setSelectionRange(0, e.value.length), document.execCommand("Copy"), document.body.removeChild(e), t.index.showToast({
          title: "复制成功",
          icon: "success",
          mask: !0,
          duration: 2e3
        })
      },
      shareFunc: function() {
        this.taskFunc()
      },
      closeAppShare: function(t) {
        this.isAppShare = !1
      },
      getData: function() {
        var a = this;
        t.index.showLoading({
          title: "加载中"
        }), a.loading = !0;
        var i = a.article_id;
        a._get("plus.article.article/detail", {
          article_id: i,
          url: a.urldata
        }, (function(i) {
          i.data.detail.article_content = e.utils.format_content(i.data.detail.article_content), console.log(i.data.detail.article_content), a.article = i.data.detail, a.loadding = !0, t.index.hideLoading()
        }))
      }
    }
  };
Array || (t.resolveComponent("tabBar") + t.resolveComponent("AppShare"))();
var n = t._export_sfc(i, [
  ["render", function(e, i, n, r, o, c) {
    return t.e({
      a: o.loadding
    }, o.loadding ? {
      b: t.t(o.article.article_title),
      c: t.t(o.article.category.name),
      d: t.t(o.article.create_time),
      e: a._imports_0$3,
      f: t.o((function() {
        return c.shareFunc && c.shareFunc.apply(c, arguments)
      }), "41"),
      g: o.article.article_content,
      h: t.o(c.closeAppShare, "78"),
      i: t.p({
        isAppShare: o.isAppShare,
        appParams: o.appParams
      }),
      j: e.theme(),
      k: t.n(e.theme() || "")
    } : {})
  }]
]);
i.__runtimeHooks = 2, wx.createPage(n);