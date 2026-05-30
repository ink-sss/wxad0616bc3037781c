var n = require("../../../common/vendor.js"),
  o = require("../../../env/config.js");
Array || n.resolveComponent("uni-popup")(), Math || (e + function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var e = function() {
    return "../../../components/uni-icon/uni-icon.js"
  },
  u = {
    __name: "add-teaching",
    setup: function(e, u) {
      var r = u.expose,
        t = n.ref(null);
      n.onMounted((function() {
        c()
      }));
      var c = function() {
          var n;
          null == (n = t.value) || n.open("bottom")
        },
        p = function() {
          var n;
          null == (n = t.value) || n.close()
        };
      return r({
          showTeachingBox: c
        }),
        function(e, u) {
          return {
            a: n.o(p, "e2"),
            b: n.p({
              type: "closeempty",
              size: "30",
              color: "#000"
            }),
            c: n.unref(o.config).pic_url + "/static/jt.jpg",
            d: n.sr(t, "d86586fc-0", {
              k: "addTeaching"
            }),
            e: n.p({
              type: "bottom",
              "background-color": "#fff4dc",
              "border-radius": "20px 20px 0 0"
            })
          }
        }
    }
  },
  r = n._export_sfc(u, [
    ["__scopeId", "data-v-d86586fc"]
  ]);
wx.createComponent(r);