function e(e, t, r, n) {
  for (var s = !1, i = "", l = 0; l < r.length; l++) l != e ? null != r[l] ? i += r[l] + "_" : i += "[0-9]*_" : i += t + "_";
  i = i.substr(0, i.length - 1);
  for (var a = new RegExp(i, "g"), g = 0; g < n.length; g++) {
    var o = n[g].join("_");
    if (s = a.test(o)) break
  }
  return !s
}
exports.judgeSelect = function(t, r, n, s) {
  for (var i = 0, l = t.length; i < l; i++)
    for (var a = 0; a < t[i].spec_items.length; a++) {
      var g = t[i].spec_items[a];
      i != r && (g.disabled = e(i, g.item_id, n, s))
    }
};