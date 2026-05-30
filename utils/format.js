exports.formatTime = function(r) {
  if (r <= 0) return "";
  var e = Math.floor(r / 3600),
    a = Math.floor(r % 3600 / 60);
  return (e > 0 ? e + "小时 " : "") + (a > 0 ? a + "分钟 " : "") + r % 60 + "秒"
}, exports.numToWeek = function(r) {
  var e = "";
  switch (r && (r = parseInt(r)), r) {
    case 1:
      e = "周一";
      break;
    case 2:
      e = "周二";
      break;
    case 3:
      e = "周三";
      break;
    case 4:
      e = "周四";
      break;
    case 5:
      e = "周五";
      break;
    case 6:
      e = "周六";
      break;
    case 7:
      e = "周日"
  }
  return e
}, exports.sToTime = function(r) {
  if (r <= 0) return "";
  var e = Math.floor(r / 3600),
    a = Math.floor(r % 3600 / 60);
  return (e > 0 ? (e < 9 ? "0" : "") + e + ":" : "") + (a < 9 ? "0" : "") + a
};