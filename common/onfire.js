var e = function() {
  function e() {
    this.es = {}, this.emit = this.fire
  }
  return e.prototype.on = function(e, t, i) {
    void 0 === i && (i = !1), this.es[e] || (this.es[e] = []), this.es[e].push({
      cb: t,
      once: i
    })
  }, e.prototype.once = function(e, t) {
    this.on(e, t, !0)
  }, e.prototype.fire = function(e) {
    for (var t = [], i = 1; i < arguments.length; i++) t[i - 1] = arguments[i];
    for (var s = this.es[e] || [], o = 0; o < s.length; o++) {
      var n = s[o],
        r = n.cb,
        h = n.once;
      r.apply(this, t), h && (s.splice(o, 1), o--)
    }
  }, e.prototype.off = function(e, t) {
    if (void 0 === e) this.es = {};
    else if (void 0 === t) delete this.es[e];
    else
      for (var i = this.es[e] || [], s = 0; s < i.length; s++) i[s].cb === t && (i.splice(s, 1), s--)
  }, e.ver = "2.0.0", e
}();
exports.OnFire = e;