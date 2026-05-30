var e = require("./vendor.js"),
  t = {
    checkAndNavigate: function(t) {
      var a, r, o = function(e) {
        if (e) {
          for (var t, a = /([^=,]+)=([^,]*)(?:,|$)/g, r = {}; null !== (t = a.exec(e));) {
            var o = t[1],
              n = t[2];
            switch (o) {
              case "targetAppId":
                r.targetAppId = n;
                break;
              case "targetGhId":
                r.targetGhId = n;
                break;
              case "path":
                r.path = n
            }
          }
          return r
        }
      }(t);
      if (o.targetGhId || o.targetAppId) {
        var n;
        return n = o.targetAppId, console.log(n), n ? (a = n, r = o.path, console.log(r), e.index.navigateToMiniProgram({
          appId: a,
          path: r || "",
          success: function() {
            console.log("小程序跳转成功")
          },
          fail: function(e) {
            console.log(e)
          }
        })) : n || e.index.showModal({
          title: "无法跳转到该小程序",
          showCancel: !1
        }), !1
      }
      return !0
    }
  };
exports.jump = t;