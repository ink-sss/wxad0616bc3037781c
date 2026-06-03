"use strict";
const common_vendor = require("../common/vendor.js");
const utils_liveRoute = require("../utils/live-route.js");
const utils_liveRoomContext = require("../utils/live-room-context.js");
const stores_user = require("../stores/user.js");
const AUTH_CONTEXT_KEY = "mp_h5_auth_context_v1";
const AUTH_CONTEXT_TTL_MS = 30 * 60 * 1e3;
const BIND_ID_KEY = "currentBindId";
const BIND_EXPIRE_KEY = "bindExpireTime";
const BIND_TTL_MS = 2 * 365 * 24 * 60 * 60 * 1e3;
const TOKEN_KEYS = ["h5_token", "token"];
const TOKEN_PARAM_KEYS = [
  "wx_token",
  "wxToken",
  "h5_token",
  "h5Token",
  "token",
  "accessToken",
  "access_token",
  "h5AccessToken",
  "h5_access_token",
  "wxAccessToken",
  "authToken",
  "jwt",
  "jwtToken",
  "authorization",
  "Authorization",
  "X-Token",
  "x-token",
  "xToken"
];
const CUSTOMER_KEYS = ["h5_user_info", "h5Customer", "customer", "userInfo", "user_info"];
const LOGIN_ROUTES = ["pages/login/login", "pages/login/weblogin", "pages/login/openlogin"];
const QUERY_SOURCE_KEYS = ["redirect", "url", "href", "path", "scene", "query", "queryString", "rawQuery"];
function readStorage(key, fallback = "") {
  try {
    const value = common_vendor.index.getStorageSync(key);
    return value === void 0 || value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}
function writeStorage(key, value) {
  try {
    common_vendor.index.setStorageSync(key, value);
  } catch (error) {
  }
}
function removeStorage(key) {
  try {
    common_vendor.index.removeStorageSync(key);
  } catch (error) {
  }
}
function decodeRepeatedly(value = "") {
  let next = String(value || "").trim();
  let prev = "";
  let count = 0;
  while (next && next !== prev && count < 5) {
    prev = next;
    count += 1;
    try {
      next = decodeURIComponent(next);
    } catch (error) {
      return prev;
    }
  }
  return next;
}
function encodeQuery(params = {}) {
  return Object.keys(params).filter((key) => params[key] !== void 0 && params[key] !== null && params[key] !== "").map((key) => `${key}=${encodeURIComponent(params[key])}`).join("&");
}
function splitUrl(url = "") {
  const [path = "", query = ""] = String(url || "").split("?");
  const params = {};
  if (query) {
    query.split("&").forEach((part) => {
      if (!part)
        return;
      const index = part.indexOf("=");
      const key = index >= 0 ? part.slice(0, index) : part;
      const rawValue = index >= 0 ? part.slice(index + 1) : "";
      if (!key || params[key] !== void 0)
        return;
      try {
        params[key] = decodeURIComponent(rawValue);
      } catch (error) {
        params[key] = rawValue;
      }
    });
  }
  return { path, params };
}
function isTokenParamKey(key = "") {
  const normalized = String(key || "").toLowerCase();
  return TOKEN_PARAM_KEYS.some((item) => item.toLowerCase() === normalized);
}
function stripTokenParams(url = "") {
  const raw = String(url || "");
  const hashIndex = raw.indexOf("#");
  const base = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  const hash = hashIndex >= 0 ? raw.slice(hashIndex) : "";
  const queryIndex = base.indexOf("?");
  if (queryIndex < 0)
    return raw;
  const path = base.slice(0, queryIndex);
  const query = base.slice(queryIndex + 1);
  const kept = [];
  query.split("&").forEach((part) => {
    if (!part)
      return;
    const index = part.indexOf("=");
    const key = index >= 0 ? part.slice(0, index) : part;
    let decodedKey = key;
    try {
      decodedKey = decodeURIComponent(key);
    } catch (error) {
    }
    if (!isTokenParamKey(decodedKey))
      kept.push(part);
  });
  return `${path}${kept.length ? `?${kept.join("&")}` : ""}${hash}`;
}
function appendQuery(url = "", params = {}) {
  const [path = "", query = ""] = String(url || "").split("?");
  const existing = splitUrl(url).params;
  const additions = {};
  Object.keys(params).forEach((key) => {
    if (params[key] === void 0 || params[key] === null || params[key] === "")
      return;
    if (existing[key] !== void 0)
      return;
    additions[key] = params[key];
  });
  const extra = encodeQuery(additions);
  if (!extra)
    return url;
  return `${path}${query ? `?${query}&${extra}` : `?${extra}`}`;
}
function normalizeCustomer(customer = {}) {
  if (!customer || typeof customer !== "object")
    return null;
  const name = customer.nickName || customer.nickname || customer.userName || customer.username || customer.name || customer.mobile || customer.phone || "";
  const avatar = customer.avatarUrl || customer.avatar || customer.headimgurl || customer.headImg || customer.head || "";
  const userId = customer.user_id || customer.userId || customer.customerId || customer.customer_id || customer.id || "";
  return {
    ...customer,
    nickName: customer.nickName || name,
    nickname: customer.nickname || name,
    userName: customer.userName || customer.username || name,
    avatarUrl: customer.avatarUrl || avatar,
    avatar,
    user_id: customer.user_id || userId,
    userId,
    mobile: customer.mobile || customer.phone || ""
  };
}
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function readField(source = {}, keys = []) {
  if (!isPlainObject(source))
    return "";
  for (const key of keys) {
    if (source[key] !== void 0 && source[key] !== null && source[key] !== "")
      return source[key];
  }
  const lowerKeyMap = Object.keys(source).reduce((map, key) => {
    map[key.toLowerCase()] = key;
    return map;
  }, {});
  for (const key of keys) {
    const sourceKey = lowerKeyMap[key.toLowerCase()];
    if (sourceKey && source[sourceKey] !== void 0 && source[sourceKey] !== null && source[sourceKey] !== "") {
      return source[sourceKey];
    }
  }
  return "";
}
function normalizeTokenValue(value = "") {
  const raw = Array.isArray(value) ? value[0] : value;
  if (isPlainObject(raw))
    return normalizeTokenValue(readField(raw, TOKEN_PARAM_KEYS));
  const token = String(raw || "").trim().replace(/^bearer\s+/i, "");
  if (!token || token === "undefined" || token === "null")
    return "";
  return token;
}
function parseQueryLike(value = "") {
  const params = {};
  if (typeof value !== "string" || !value)
    return params;
  const decoded = decodeRepeatedly(value);
  const candidates = [];
  decoded.split("#").forEach((segment) => {
    const queryIndex = segment.indexOf("?");
    if (queryIndex >= 0) {
      candidates.push(segment.slice(queryIndex + 1));
    } else if (segment.includes("=")) {
      candidates.push(segment.replace(/^\?/, ""));
    }
  });
  candidates.forEach((query) => {
    query.split("&").forEach((part) => {
      if (!part)
        return;
      const index = part.indexOf("=");
      const key = index >= 0 ? part.slice(0, index) : part;
      const rawValue = index >= 0 ? part.slice(index + 1) : "";
      if (!key || params[key] !== void 0)
        return;
      try {
        params[key] = decodeURIComponent(rawValue);
      } catch (error) {
        params[key] = rawValue;
      }
    });
  });
  return params;
}
function collectAuthSources(payload = {}) {
  const sources = [];
  const pushObject = (value) => {
    if (isPlainObject(value))
      sources.push(value);
  };
  const pushString = (value) => {
    const params = parseQueryLike(value);
    if (Object.keys(params).length)
      sources.push(params);
  };
  const pushQueryStrings = (value) => {
    if (!isPlainObject(value))
      return;
    QUERY_SOURCE_KEYS.forEach((key) => pushString(value[key]));
  };
  const pushSource = (value) => {
    pushObject(value);
    pushString(value);
    pushQueryStrings(value);
  };
  pushSource(payload);
  if (isPlainObject(payload)) {
    pushSource(payload.data);
    pushSource(payload.query);
    pushSource(payload.options);
    pushSource(payload.params);
  }
  return sources;
}
function collectRouteContext(payload = {}) {
  const context = {};
  collectAuthSources(payload).forEach((source) => {
    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (value !== void 0 && value !== null && value !== "" && (context[key] === void 0 || context[key] === "")) {
        context[key] = value;
      }
    });
  });
  return context;
}
function normalizeAuthContextInput(input = {}) {
  return mergeContext(collectRouteContext(input), isPlainObject(input) ? input : {});
}
function extractAuthToken(payload = {}) {
  const sources = collectAuthSources(payload);
  for (const source of sources) {
    const token = normalizeTokenValue(readField(source, TOKEN_PARAM_KEYS));
    if (token)
      return token;
  }
  return "";
}
function extractCustomerFromHints(source = {}) {
  const direct = readField(source, ["customer", "customerInfo", "userInfo", "user", "profile"]);
  if (isPlainObject(direct))
    return direct;
  if (typeof direct === "string" && direct.trim().startsWith("{")) {
    try {
      return JSON.parse(direct);
    } catch (error) {
    }
  }
  const userId = readField(source, ["customerId", "customer_id", "userId", "user_id", "id"]);
  const name = readField(source, ["nickName", "nickname", "customerName", "userName", "username", "name"]);
  const avatar = readField(source, ["avatarUrl", "avatar", "headimgurl", "headImg", "head"]);
  const mobile = readField(source, ["mobile", "phone"]);
  if (!userId && !name && !avatar && !mobile)
    return null;
  return {
    user_id: userId,
    userId,
    nickName: name,
    nickname: name,
    userName: name,
    avatarUrl: avatar,
    avatar,
    mobile
  };
}
function extractAuthCustomer(payload = {}) {
  const sources = collectAuthSources(payload);
  for (const source of sources) {
    const customer = normalizeCustomer(extractCustomerFromHints(source));
    if (customer)
      return customer;
  }
  return null;
}
function mergeContext(previous = {}, next = {}) {
  const merged = { ...previous };
  Object.keys(next).forEach((key) => {
    const value = next[key];
    if (value !== void 0 && value !== null && value !== "") {
      merged[key] = value;
    } else if (merged[key] === void 0) {
      merged[key] = "";
    }
  });
  return merged;
}
function extractAuthPayload(payload = {}) {
  if (!payload || typeof payload !== "object")
    return {};
  const data = payload.data && typeof payload.data === "object" ? payload.data : null;
  if (data && (extractAuthToken(data) || data.customer || data.customerInfo || data.userInfo || data.user))
    return data;
  return payload;
}
function syncRuntimeUserStore({ token = "", customer = null } = {}) {
  try {
    const userStore = stores_user.useUserStore();
    if (token)
      userStore.setToken(token);
    if (customer)
      userStore.setUserInfo(customer);
  } catch (error) {
  }
}
function getH5Token() {
  for (const key of TOKEN_KEYS) {
    const token = readStorage(key, "");
    if (token)
      return token;
  }
  return "";
}
function hasH5Token() {
  return !!getH5Token();
}
function readCachedH5Customer() {
  for (const key of CUSTOMER_KEYS) {
    const value = readStorage(key, null);
    if (!value)
      continue;
    if (typeof value === "object")
      return value.customer || value.userInfo || value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (parsed)
          return parsed.customer || parsed.userInfo || parsed;
      } catch (error) {
      }
    }
  }
  return null;
}
function syncH5AuthSession(payload = {}) {
  const data = extractAuthPayload(payload);
  const token = extractAuthToken(data) || extractAuthToken(payload);
  const customer = extractAuthCustomer(data) || extractAuthCustomer(payload);
  if (token) {
    TOKEN_KEYS.forEach((key) => writeStorage(key, token));
  }
  if (customer) {
    CUSTOMER_KEYS.forEach((key) => writeStorage(key, customer));
  }
  syncRuntimeUserStore({ token, customer });
  try {
    const app = getApp();
    if (app && app.globalData)
      app.globalData.is_login = !!token || app.globalData.is_login;
  } catch (error) {
  }
  return { token, customer };
}
function clearH5AuthSession() {
  TOKEN_KEYS.forEach(removeStorage);
  CUSTOMER_KEYS.forEach(removeStorage);
  try {
    stores_user.useUserStore().clearAuth();
  } catch (error) {
  }
}
function normalizeRedirectUrl(rawUrl = "", fallback = "/pages/center/index") {
  if (!rawUrl)
    return fallback;
  let value = decodeRepeatedly(rawUrl);
  if (!value)
    return fallback;
  if (value.startsWith("?"))
    return fallback ? stripTokenParams(`${fallback}${value}`) : "";
  const hashIndex = value.indexOf("#/");
  if (hashIndex >= 0) {
    value = value.slice(hashIndex + 1);
  } else {
    const pagesIndex = value.indexOf("/pages/");
    if (pagesIndex >= 0)
      value = value.slice(pagesIndex);
  }
  if (value.startsWith("pages/"))
    value = `/${value}`;
  if (!value.startsWith("/pages/"))
    return fallback;
  if (/^\/?pages\/login\/login/.test(value))
    return fallback;
  return stripTokenParams(value) || fallback;
}
function readBindId() {
  const bindId = readStorage(BIND_ID_KEY, "");
  const expiresAt = Number(readStorage(BIND_EXPIRE_KEY, 0) || 0);
  if (!bindId)
    return "";
  if (expiresAt && Date.now() > expiresAt) {
    removeStorage(BIND_ID_KEY);
    removeStorage(BIND_EXPIRE_KEY);
    return "";
  }
  return bindId;
}
function persistBindId(bindId = "") {
  if (!bindId)
    return "";
  writeStorage(BIND_ID_KEY, bindId);
  writeStorage(BIND_EXPIRE_KEY, String(Date.now() + BIND_TTL_MS));
  return bindId;
}
function buildH5AuthContext(input = {}) {
  const normalizedInput = normalizeAuthContextInput(input);
  const sceneContext = utils_liveRoute.normalizeLiveRouteOptions(normalizedInput);
  const redirect = normalizedInput.redirect ? normalizeRedirectUrl(normalizedInput.redirect, "") : "";
  const bindId = normalizedInput.bindId || normalizedInput.bind_id || readBindId() || "";
  const customerId = normalizedInput.customerId || normalizedInput.customer_id || normalizedInput.userId || normalizedInput.user_id || "";
  const context = {
    redirect,
    roomCode: sceneContext.roomCode || "",
    roomId: sceneContext.roomId || "",
    liveId: sceneContext.liveId || "",
    tenantId: normalizedInput.tenantId || normalizedInput.tenant_id || "",
    bindId,
    customerId,
    liveType: normalizedInput.liveType || normalizedInput.live_type || "",
    termId: sceneContext.termId || "",
    videoId: sceneContext.videoId || "",
    mode: sceneContext.mode || "",
    replay: sceneContext.replay || "",
    orientation: sceneContext.orientation || "",
    fromPath: normalizedInput.fromPath || "",
    orderId: normalizedInput.orderId || normalizedInput.order_id || normalizedInput.id || "",
    refundId: normalizedInput.refundId || normalizedInput.refund_id || "",
    status: normalizedInput.status || ""
  };
  Object.keys(context).forEach((key) => {
    if (context[key] === void 0 || context[key] === null)
      context[key] = "";
  });
  return context;
}
function loadH5AuthContext() {
  const stored = readStorage(AUTH_CONTEXT_KEY, null);
  if (!stored || typeof stored !== "object")
    return {};
  if (!stored.ts || Date.now() - stored.ts > AUTH_CONTEXT_TTL_MS) {
    removeStorage(AUTH_CONTEXT_KEY);
    return {};
  }
  const { ts, ...context } = stored;
  return context;
}
function saveH5AuthContext(input = {}) {
  const previous = loadH5AuthContext();
  const context = { ...mergeContext(previous, buildH5AuthContext(input)), ts: Date.now() };
  writeStorage(AUTH_CONTEXT_KEY, context);
  if (context.bindId)
    persistBindId(context.bindId);
  if (context.roomCode || context.roomId || context.liveId)
    utils_liveRoomContext.saveLiveRoomContext(context);
  return context;
}
function clearH5AuthContext() {
  removeStorage(AUTH_CONTEXT_KEY);
}
function getCurrentPageUrl(fallback = "/pages/center/index") {
  try {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (!currentPage || !currentPage.route || LOGIN_ROUTES.includes(currentPage.route))
      return fallback;
    const options = currentPage.$page && currentPage.$page.options || currentPage.options || {};
    const query = encodeQuery(options);
    return `/${currentPage.route}${query ? `?${query}` : ""}`;
  } catch (error) {
    return fallback;
  }
}
function buildRedirectFromH5AuthContext(input = {}) {
  const context = mergeContext(loadH5AuthContext(), buildH5AuthContext(input));
  let target = context.redirect ? normalizeRedirectUrl(context.redirect) : "";
  if (!target && (context.roomCode || context.roomId || context.liveId)) {
    target = utils_liveRoute.buildBroadcastEntryUrl(context);
  }
  if (!target)
    target = "/pages/center/index";
  target = appendQuery(target, {
    roomCode: context.roomCode,
    roomId: context.roomId,
    liveId: context.liveId,
    tenantId: context.tenantId,
    bindId: context.bindId,
    liveType: context.liveType,
    termId: context.termId,
    videoId: context.videoId
  });
  return normalizeRedirectUrl(target);
}
function buildH5LoginUrl(input = {}) {
  const context = saveH5AuthContext(input);
  const redirect = buildRedirectFromH5AuthContext(context);
  const params = {
    redirect,
    roomCode: context.roomCode,
    roomId: context.roomId,
    liveId: context.liveId,
    tenantId: context.tenantId,
    bindId: context.bindId,
    liveType: context.liveType,
    termId: context.termId,
    videoId: context.videoId
  };
  const query = encodeQuery(params);
  return `/pages/login/login${query ? `?${query}` : ""}`;
}
function redirectToH5Login(input = {}) {
  const url = buildH5LoginUrl({
    ...input,
    redirect: input.redirect || getCurrentPageUrl("/pages/center/index")
  });
  common_vendor.index.navigateTo({
    url,
    fail() {
      common_vendor.index.redirectTo({
        url,
        fail() {
          common_vendor.index.reLaunch({ url });
        }
      });
    }
  });
  return false;
}
function redirectAfterH5Login(input = {}) {
  const url = buildRedirectFromH5AuthContext(input);
  clearH5AuthContext();
  if (url.startsWith("/pages/user/index/index")) {
    common_vendor.index.switchTab({
      url: "/pages/user/index/index",
      fail() {
        common_vendor.index.reLaunch({ url });
      }
    });
    return;
  }
  common_vendor.index.reLaunch({
    url,
    fail() {
      common_vendor.index.redirectTo({
        url,
        fail() {
          common_vendor.index.navigateTo({ url });
        }
      });
    }
  });
}
function redirectAfterH5LoginSkipped(input = {}) {
  const context = mergeContext(loadH5AuthContext(), buildH5AuthContext(input));
  const target = buildRedirectFromH5AuthContext(context);
  clearH5AuthContext();
  if (/^\/pages\/broadcast\/(entry|replay)\b/.test(target)) {
    common_vendor.index.reLaunch({
      url: appendQuery(target, { loginSkipped: 1 }),
      fail() {
        common_vendor.index.redirectTo({ url: appendQuery(target, { loginSkipped: 1 }) });
      }
    });
    return;
  }
  common_vendor.index.reLaunch({
    url: "/pages/index/index?loginSkipped=1",
    fail() {
      common_vendor.index.switchTab({
        url: "/pages/user/index/index",
        fail() {
          common_vendor.index.reLaunch({ url: "/pages/index/index" });
        }
      });
    }
  });
}
function ensureH5Authenticated(input = {}) {
  syncH5AuthSession(input);
  if (hasH5Token()) {
    saveH5AuthContext(input);
    return true;
  }
  return redirectToH5Login(input);
}
function ensureH5PageAuth(query = {}, fallbackRedirect = "") {
  return ensureH5Authenticated({
    ...query,
    redirect: fallbackRedirect || getCurrentPageUrl("/pages/center/index")
  });
}
function isH5UnauthorizedError(error = {}) {
  var _a, _b, _c;
  const statusCode = Number(error.statusCode || error.status || error.code || 0);
  const bodyCode = Number(((_a = error.data) == null ? void 0 : _a.code) || ((_b = error.response) == null ? void 0 : _b.code) || 0);
  const message = String(error.msg || error.message || error.errMsg || ((_c = error.data) == null ? void 0 : _c.msg) || "").toLowerCase();
  return statusCode === 401 || statusCode === 403 || bodyCode === 401 || bodyCode === 403 || statusCode === -1 || message.includes("unauthorized") || message.includes("未登录") || message.includes("登录态") || message.includes("token");
}
function handleH5Unauthorized(error = {}, input = {}) {
  if (!isH5UnauthorizedError(error))
    return false;
  clearH5AuthSession();
  redirectToH5Login(input);
  return true;
}
exports.buildH5AuthContext = buildH5AuthContext;
exports.ensureH5PageAuth = ensureH5PageAuth;
exports.getCurrentPageUrl = getCurrentPageUrl;
exports.getH5Token = getH5Token;
exports.handleH5Unauthorized = handleH5Unauthorized;
exports.hasH5Token = hasH5Token;
exports.persistBindId = persistBindId;
exports.readBindId = readBindId;
exports.readCachedH5Customer = readCachedH5Customer;
exports.redirectAfterH5Login = redirectAfterH5Login;
exports.redirectAfterH5LoginSkipped = redirectAfterH5LoginSkipped;
exports.redirectToH5Login = redirectToH5Login;
exports.saveH5AuthContext = saveH5AuthContext;
exports.syncH5AuthSession = syncH5AuthSession;
