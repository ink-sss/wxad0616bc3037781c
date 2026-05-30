require("../../../../@babel/runtime/helpers/Arrayincludes");
var t = require("../../../../@babel/runtime/helpers/objectSpread2"),
  e = require("../../../../@babel/runtime/helpers/classCallCheck"),
  n = require("../../../../@babel/runtime/helpers/createClass"),
  i = require("../../../../common/vendor.js"),
  a = function() {
    function a(n, r) {
      e(this, a), this.options = n, this.animation = i.index.createAnimation(t({}, n)), this.currentStepAnimates = {}, this.next = 0, this.$ = r
    }
    return n(a, [{
      key: "_nvuePushAnimates",
      value: function(t, e) {
        var n = {};
        if (n = this.currentStepAnimates[this.next] || {
            styles: {},
            config: {}
          }, r.includes(t)) {
          n.styles.transform || (n.styles.transform = "");
          var i = "";
          "rotate" === t && (i = "deg"), n.styles.transform += "".concat(t, "(").concat(e + i, ") ")
        } else n.styles[t] = "".concat(e);
        this.currentStepAnimates[this.next] = n
      }
    }, {
      key: "_animateRun",
      value: function() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
          n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          i = this.$.$refs.ani.ref;
        if (i) return new Promise((function(a, r) {
          nvueAnimation.transition(i, t({
            styles: e
          }, n), (function(t) {
            a()
          }))
        }))
      }
    }, {
      key: "_nvueNextAnimate",
      value: function(t) {
        var e = this,
          n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
          i = arguments.length > 2 ? arguments[2] : void 0,
          a = t[n];
        if (a) {
          var r = a.styles,
            s = a.config;
          this._animateRun(r, s).then((function() {
            n += 1, e._nvueNextAnimate(t, n, i)
          }))
        } else this.currentStepAnimates = {}, "function" == typeof i && i(), this.isEnd = !0
      }
    }, {
      key: "step",
      value: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        return this.animation.step(t), this
      }
    }, {
      key: "run",
      value: function(t) {
        this.$.animationData = this.animation.export(), this.$.timer = setTimeout((function() {
          "function" == typeof t && t()
        }), this.$.durationTime)
      }
    }]), a
  }(),
  r = ["matrix", "matrix3d", "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "skew", "skewX", "skewY", "translate", "translate3d", "translateX", "translateY", "translateZ"];
r.concat(["opacity", "backgroundColor"], ["width", "height", "left", "right", "top", "bottom"]).forEach((function(t) {
  a.prototype[t] = function() {
    var e;
    return (e = this.animation)[t].apply(e, arguments), this
  }
})), exports.createAnimation = function(t, e) {
  if (e) return clearTimeout(e.timer), new a(t, e)
};