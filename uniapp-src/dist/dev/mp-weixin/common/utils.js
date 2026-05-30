"use strict";
function scene_decode(scene) {
  if (scene === void 0)
    return {};
  const pairs = decodeURIComponent(scene).split(",");
  const result = {};
  pairs.forEach((pair) => {
    const item = pair.split(":");
    if (item.length > 0 && item[0]) {
      result[item[0]] = item[1] || null;
    }
  });
  return result;
}
function format_date(value) {
  return String(value).replace(/\-/g, "/");
}
function format_content(value = "") {
  return String(value).replace(/\<img/gi, '<img style="display:block; margin:0 auto; max-width:100%;"').replace(/\<video/gi, '<video style="display:block; margin:0 auto; max-width:100%;"');
}
function urlEncode(params = {}) {
  const segments = [];
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((item) => segments.push(`${key}=${item}`));
    } else {
      segments.push(`${key}=${value}`);
    }
  });
  return segments.join("&");
}
function objForEach(obj = {}, callback) {
  Object.keys(obj).forEach((key) => {
    callback(obj[key], key);
  });
}
function inArray(value, list = []) {
  for (const index in list) {
    if (list[index] == value)
      return true;
  }
  return false;
}
function isPositiveInteger(value) {
  return /(^[0-9]\d*$)/.test(value);
}
function getSceneData(options = {}) {
  return options.scene ? scene_decode(options.scene) : options;
}
function isVail(value) {
  if (!/^\d{17}(\d|x)$/i.test(value))
    return false;
  const now = /* @__PURE__ */ new Date();
  const year = Number(value.substr(6, 4));
  const month = Number(value.substr(10, 2)) + 1;
  const day = Number(value.substr(12, 2));
  let dateIsValid = false;
  if (year <= Number(now.getFullYear()) && year > 0 && month <= 12 && month > 0 && day <= new Date(year, month - 1, 0).getDate() && day > 0) {
    dateIsValid = true;
  }
  if (!dateIsValid)
    return false;
  let total = 0;
  const normalized = value.replace(/x$/i, "a");
  for (let weight = 17; weight >= 0; weight -= 1) {
    total += Math.pow(2, weight) % 11 * parseInt(normalized.charAt(17 - weight), 11);
  }
  return total % 11 == 1;
}
function isPoneAvailable(value) {
  return /^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(value);
}
function isTelAvailable(value) {
  return /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(value) || /^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(value);
}
function isMail(value) {
  return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value);
}
function isNum(value) {
  return /^[0-9]*$/.test(value);
}
const utils = {
  scene_decode,
  format_date,
  format_content,
  urlEncode,
  objForEach,
  inArray,
  isPositiveInteger,
  getSceneData,
  isVail,
  isPoneAvailable,
  isTelAvailable,
  isMail,
  isNum
};
exports.format_content = format_content;
exports.utils = utils;
