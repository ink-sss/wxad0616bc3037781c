var t = {
  scene_decode: function(t) {
    if (void 0 === t) return {};
    var e = decodeURIComponent(t).split(","),
      r = {};
    for (var n in e) {
      var i = e[n].split(":");
      i.length > 0 && i[0] && (r[i[0]] = i[1] || null)
    }
    return r
  },
  format_date: function(t) {
    return t.replace(/\-/g, "/")
  },
  format_content: function(t) {
    return (t = t.replace(/\<img/gi, '<img style="display:block; margin:0 auto; max-width:100%;"')).replace(/\<video/gi, '<video style="display:block; margin:0 auto; max-width:100%;"')
  },
  urlEncode: function(t) {
    var e = [];
    for (var r in t) {
      var n = t[r];
      n.constructor == Array ? n.forEach((function(t) {
        e.push(r + "=" + t)
      })) : e.push(r + "=" + n)
    }
    return e.join("&")
  },
  objForEach: function(t, e) {
    Object.keys(t).forEach((function(r) {
      e(t[r], r)
    }))
  },
  inArray: function(t, e) {
    for (var r in e)
      if (e[r] == t) return !0;
    return !1
  },
  isPositiveInteger: function(t) {
    return /(^[0-9]\d*$)/.test(t)
  },
  getSceneData: function(t) {
    return t.scene ? this.scene_decode(t.scene) : t
  },
  isVail: function(t) {
    if (!/^\d{17}(\d|x)$/i.test(t)) return !1;
    var e = new Date,
      r = Number(t.substr(6, 4)),
      n = Number(t.substr(10, 2)) + 1,
      i = Number(t.substr(12, 2)),
      a = !1;
    if (r <= Number(e.getFullYear()) && r > 0 && n <= 12 && n > 0 && i <= new Date(r, n - 1, 0).getDate() && i > 0 && (a = !0), !a) return !1;
    var u = 0;
    t = t.replace(/x$/i, "a");
    for (var o = 17; o >= 0; o--) u += Math.pow(2, o) % 11 * parseInt(t.charAt(17 - o), 11);
    return u % 11 == 1
  },
  isPoneAvailable: function(t) {
    return !!/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(t)
  },
  isTelAvailable: function(t) {
    var e = !1;
    return /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(t) && (e = !0), /^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(t) && (e = !0), !!e
  },
  isMail: function(t) {
    return !!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(t)
  },
  isNum: function(t) {
    return !!/^[0-9]*$/.test(t)
  }
};
exports.utils = t;