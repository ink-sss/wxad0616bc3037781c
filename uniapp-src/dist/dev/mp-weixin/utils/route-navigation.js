"use strict";
const common_vendor = require("../common/vendor.js");
function safeDecodeRoute(value = "") {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}
function normalizePlainRoute(route = "") {
  const value = String(route || "").trim();
  if (!value)
    return "";
  return value.startsWith("/") ? value : `/${value}`;
}
function extractMiniProgramRoute(route = "") {
  const raw = String(route || "").trim();
  if (!raw)
    return "";
  const candidates = [raw];
  const decoded = safeDecodeRoute(raw);
  if (decoded !== raw)
    candidates.push(decoded);
  for (const value of candidates) {
    const hashIndex = value.indexOf("#/");
    if (hashIndex >= 0) {
      return normalizePlainRoute(value.slice(hashIndex + 1));
    }
    if (value.startsWith("/pages/") || value.startsWith("pages/")) {
      return normalizePlainRoute(value);
    }
    if (/^https?:\/\//i.test(value)) {
      const pagesIndex = value.indexOf("/pages/");
      if (pagesIndex >= 0) {
        return normalizePlainRoute(value.slice(pagesIndex));
      }
    }
  }
  return "";
}
function normalizeAppRoute(route = "") {
  const value = String(route || "").trim();
  if (!value)
    return "/pages/prize-record/index";
  const extracted = extractMiniProgramRoute(value);
  if (extracted)
    return extracted;
  if (/^https?:\/\//i.test(value))
    return value;
  if (value.startsWith("/"))
    return value;
  if (value.startsWith("#/"))
    return value.slice(1);
  return `/${value}`;
}
function navigateWithH5Fallback(route = "") {
  const url = normalizeAppRoute(route);
  if (/^https?:\/\//i.test(url)) {
    common_vendor.index.showToast({ title: "请在中奖记录查看详情", icon: "none" });
    return;
  }
  common_vendor.index.navigateTo({
    url,
    fail: () => common_vendor.index.redirectTo({ url })
  });
}
function navigateToPrizeRecord(route = "/pages/prize-record/index") {
  navigateWithH5Fallback(route || "/pages/prize-record/index");
}
exports.navigateToPrizeRecord = navigateToPrizeRecord;
exports.navigateWithH5Fallback = navigateWithH5Fallback;
exports.normalizeAppRoute = normalizeAppRoute;
