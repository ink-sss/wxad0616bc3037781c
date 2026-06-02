import { buildBroadcastEntryUrl, normalizeLiveRouteOptions } from "@/utils/live-route";
import { saveLiveRoomContext } from "@/utils/live-room-context";

const AUTH_CONTEXT_KEY = "mp_h5_auth_context_v1";
const AUTH_CONTEXT_TTL_MS = 30 * 60 * 1000;
const BIND_ID_KEY = "currentBindId";
const BIND_EXPIRE_KEY = "bindExpireTime";
const BIND_TTL_MS = 2 * 365 * 24 * 60 * 60 * 1000;

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
  "xToken",
];
const CUSTOMER_KEYS = ["h5_user_info", "h5Customer", "customer", "userInfo", "user_info"];
const LOGIN_ROUTES = ["pages/login/login", "pages/login/weblogin", "pages/login/openlogin"];
const QUERY_SOURCE_KEYS = ["redirect", "url", "href", "path", "scene", "query", "queryString", "rawQuery"];

// Mini Program has no H5 DTE/cross-domain iframe equivalent. We keep bindId as
// local storage context and send it to backend auth APIs; cross-domain binding
// remains a backend responsibility for the mp-weixin adapter.
function readStorage(key, fallback = "") {
  try {
    const value = uni.getStorageSync(key);
    return value === undefined || value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    uni.setStorageSync(key, value);
  } catch (error) {}
}

function removeStorage(key) {
  try {
    uni.removeStorageSync(key);
  } catch (error) {}
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
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");
}

function splitUrl(url = "") {
  const [path = "", query = ""] = String(url || "").split("?");
  const params = {};
  if (query) {
    query.split("&").forEach((part) => {
      if (!part) return;
      const index = part.indexOf("=");
      const key = index >= 0 ? part.slice(0, index) : part;
      const rawValue = index >= 0 ? part.slice(index + 1) : "";
      if (!key || params[key] !== undefined) return;
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
  if (queryIndex < 0) return raw;

  const path = base.slice(0, queryIndex);
  const query = base.slice(queryIndex + 1);
  const kept = [];
  query.split("&").forEach((part) => {
    if (!part) return;
    const index = part.indexOf("=");
    const key = index >= 0 ? part.slice(0, index) : part;
    let decodedKey = key;
    try {
      decodedKey = decodeURIComponent(key);
    } catch (error) {}
    if (!isTokenParamKey(decodedKey)) kept.push(part);
  });

  return `${path}${kept.length ? `?${kept.join("&")}` : ""}${hash}`;
}

function appendQuery(url = "", params = {}) {
  const [path = "", query = ""] = String(url || "").split("?");
  const existing = splitUrl(url).params;
  const additions = {};
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null || params[key] === "") return;
    if (existing[key] !== undefined) return;
    additions[key] = params[key];
  });
  const extra = encodeQuery(additions);
  if (!extra) return url;
  return `${path}${query ? `?${query}&${extra}` : `?${extra}`}`;
}

function normalizeCustomer(customer = {}) {
  if (!customer || typeof customer !== "object") return null;
  const name =
    customer.nickName ||
    customer.nickname ||
    customer.userName ||
    customer.username ||
    customer.name ||
    customer.mobile ||
    customer.phone ||
    "";
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
    mobile: customer.mobile || customer.phone || "",
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readField(source = {}, keys = []) {
  if (!isPlainObject(source)) return "";
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
  }
  const lowerKeyMap = Object.keys(source).reduce((map, key) => {
    map[key.toLowerCase()] = key;
    return map;
  }, {});
  for (const key of keys) {
    const sourceKey = lowerKeyMap[key.toLowerCase()];
    if (sourceKey && source[sourceKey] !== undefined && source[sourceKey] !== null && source[sourceKey] !== "") {
      return source[sourceKey];
    }
  }
  return "";
}

function normalizeTokenValue(value = "") {
  const raw = Array.isArray(value) ? value[0] : value;
  if (isPlainObject(raw)) return normalizeTokenValue(readField(raw, TOKEN_PARAM_KEYS));
  const token = String(raw || "").trim().replace(/^bearer\s+/i, "");
  if (!token || token === "undefined" || token === "null") return "";
  return token;
}

function parseQueryLike(value = "") {
  const params = {};
  if (typeof value !== "string" || !value) return params;
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
      if (!part) return;
      const index = part.indexOf("=");
      const key = index >= 0 ? part.slice(0, index) : part;
      const rawValue = index >= 0 ? part.slice(index + 1) : "";
      if (!key || params[key] !== undefined) return;
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
    if (isPlainObject(value)) sources.push(value);
  };
  const pushString = (value) => {
    const params = parseQueryLike(value);
    if (Object.keys(params).length) sources.push(params);
  };
  const pushQueryStrings = (value) => {
    if (!isPlainObject(value)) return;
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
      if (value !== undefined && value !== null && value !== "" && (context[key] === undefined || context[key] === "")) {
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
    if (token) return token;
  }
  return "";
}

function extractCustomerFromHints(source = {}) {
  const direct = readField(source, ["customer", "customerInfo", "userInfo", "user", "profile"]);
  if (isPlainObject(direct)) return direct;
  if (typeof direct === "string" && direct.trim().startsWith("{")) {
    try {
      return JSON.parse(direct);
    } catch (error) {}
  }
  const userId = readField(source, ["customerId", "customer_id", "userId", "user_id", "id"]);
  const name = readField(source, ["nickName", "nickname", "customerName", "userName", "username", "name"]);
  const avatar = readField(source, ["avatarUrl", "avatar", "headimgurl", "headImg", "head"]);
  const mobile = readField(source, ["mobile", "phone"]);
  if (!userId && !name && !avatar && !mobile) return null;
  return {
    user_id: userId,
    userId,
    nickName: name,
    nickname: name,
    userName: name,
    avatarUrl: avatar,
    avatar,
    mobile,
  };
}

function extractAuthCustomer(payload = {}) {
  const sources = collectAuthSources(payload);
  for (const source of sources) {
    const customer = normalizeCustomer(extractCustomerFromHints(source));
    if (customer) return customer;
  }
  return null;
}

function mergeContext(previous = {}, next = {}) {
  const merged = { ...previous };
  Object.keys(next).forEach((key) => {
    const value = next[key];
    if (value !== undefined && value !== null && value !== "") {
      merged[key] = value;
    } else if (merged[key] === undefined) {
      merged[key] = "";
    }
  });
  return merged;
}

function extractAuthPayload(payload = {}) {
  if (!payload || typeof payload !== "object") return {};
  const data = payload.data && typeof payload.data === "object" ? payload.data : null;
  if (data && (extractAuthToken(data) || data.customer || data.customerInfo || data.userInfo || data.user)) return data;
  return payload;
}

export function getH5Token() {
  for (const key of TOKEN_KEYS) {
    const token = readStorage(key, "");
    if (token) return token;
  }
  return "";
}

export function hasH5Token() {
  return !!getH5Token();
}

export function readCachedH5Customer() {
  for (const key of CUSTOMER_KEYS) {
    const value = readStorage(key, null);
    if (!value) continue;
    if (typeof value === "object") return value.customer || value.userInfo || value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (parsed) return parsed.customer || parsed.userInfo || parsed;
      } catch (error) {}
    }
  }
  return null;
}

export function syncH5AuthSession(payload = {}) {
  const data = extractAuthPayload(payload);
  const token = extractAuthToken(data) || extractAuthToken(payload);
  const customer = extractAuthCustomer(data) || extractAuthCustomer(payload);

  if (token) {
    TOKEN_KEYS.forEach((key) => writeStorage(key, token));
  }
  if (customer) {
    CUSTOMER_KEYS.forEach((key) => writeStorage(key, customer));
  }

  try {
    const app = getApp();
    if (app && app.globalData) app.globalData.is_login = !!token || app.globalData.is_login;
  } catch (error) {}

  return { token, customer };
}

export function clearH5AuthSession() {
  TOKEN_KEYS.forEach(removeStorage);
  CUSTOMER_KEYS.forEach(removeStorage);
}

export function normalizeRedirectUrl(rawUrl = "", fallback = "/pages/center/index") {
  if (!rawUrl) return fallback;

  let value = decodeRepeatedly(rawUrl);
  if (!value) return fallback;
  if (value.startsWith("?")) return fallback ? stripTokenParams(`${fallback}${value}`) : "";

  const hashIndex = value.indexOf("#/");
  if (hashIndex >= 0) {
    value = value.slice(hashIndex + 1);
  } else {
    const pagesIndex = value.indexOf("/pages/");
    if (pagesIndex >= 0) value = value.slice(pagesIndex);
  }

  if (value.startsWith("pages/")) value = `/${value}`;
  if (!value.startsWith("/pages/")) return fallback;
  if (/^\/?pages\/login\/login/.test(value)) return fallback;
  return stripTokenParams(value) || fallback;
}

export function readBindId() {
  const bindId = readStorage(BIND_ID_KEY, "");
  const expiresAt = Number(readStorage(BIND_EXPIRE_KEY, 0) || 0);
  if (!bindId) return "";
  if (expiresAt && Date.now() > expiresAt) {
    removeStorage(BIND_ID_KEY);
    removeStorage(BIND_EXPIRE_KEY);
    return "";
  }
  return bindId;
}

export function persistBindId(bindId = "") {
  if (!bindId) return "";
  writeStorage(BIND_ID_KEY, bindId);
  writeStorage(BIND_EXPIRE_KEY, String(Date.now() + BIND_TTL_MS));
  return bindId;
}

export function buildH5AuthContext(input = {}) {
  const normalizedInput = normalizeAuthContextInput(input);
  const sceneContext = normalizeLiveRouteOptions(normalizedInput);
  const redirect = normalizedInput.redirect ? normalizeRedirectUrl(normalizedInput.redirect, "") : "";
  const bindId = normalizedInput.bindId || normalizedInput.bind_id || readBindId() || "";
  const customerId =
    normalizedInput.customerId || normalizedInput.customer_id || normalizedInput.userId || normalizedInput.user_id || "";
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
    status: normalizedInput.status || "",
  };

  Object.keys(context).forEach((key) => {
    if (context[key] === undefined || context[key] === null) context[key] = "";
  });
  return context;
}

export function loadH5AuthContext() {
  const stored = readStorage(AUTH_CONTEXT_KEY, null);
  if (!stored || typeof stored !== "object") return {};
  if (!stored.ts || Date.now() - stored.ts > AUTH_CONTEXT_TTL_MS) {
    removeStorage(AUTH_CONTEXT_KEY);
    return {};
  }
  const { ts, ...context } = stored;
  return context;
}

export function saveH5AuthContext(input = {}) {
  const previous = loadH5AuthContext();
  const context = { ...mergeContext(previous, buildH5AuthContext(input)), ts: Date.now() };
  writeStorage(AUTH_CONTEXT_KEY, context);
  if (context.bindId) persistBindId(context.bindId);
  if (context.roomCode || context.roomId || context.liveId) saveLiveRoomContext(context);
  return context;
}

export function clearH5AuthContext() {
  removeStorage(AUTH_CONTEXT_KEY);
}

export function getCurrentPageUrl(fallback = "/pages/center/index") {
  try {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (!currentPage || !currentPage.route || LOGIN_ROUTES.includes(currentPage.route)) return fallback;
    const options = (currentPage.$page && currentPage.$page.options) || currentPage.options || {};
    const query = encodeQuery(options);
    return `/${currentPage.route}${query ? `?${query}` : ""}`;
  } catch (error) {
    return fallback;
  }
}

export function buildRedirectFromH5AuthContext(input = {}) {
  const context = mergeContext(loadH5AuthContext(), buildH5AuthContext(input));
  let target = context.redirect ? normalizeRedirectUrl(context.redirect) : "";

  if (!target && (context.roomCode || context.roomId || context.liveId)) {
    target = buildBroadcastEntryUrl(context);
  }
  if (!target) target = "/pages/center/index";

  target = appendQuery(target, {
    roomCode: context.roomCode,
    roomId: context.roomId,
    liveId: context.liveId,
    tenantId: context.tenantId,
    bindId: context.bindId,
    liveType: context.liveType,
    termId: context.termId,
    videoId: context.videoId,
  });
  return normalizeRedirectUrl(target);
}

export function buildH5LoginUrl(input = {}) {
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
    videoId: context.videoId,
  };
  const query = encodeQuery(params);
  return `/pages/login/login${query ? `?${query}` : ""}`;
}

export function redirectToH5Login(input = {}) {
  const url = buildH5LoginUrl({
    ...input,
    redirect: input.redirect || getCurrentPageUrl("/pages/center/index"),
  });
  uni.navigateTo({
    url,
    fail() {
      uni.redirectTo({
        url,
        fail() {
          uni.reLaunch({ url });
        },
      });
    },
  });
  return false;
}

export function redirectAfterH5Login(input = {}) {
  const url = buildRedirectFromH5AuthContext(input);
  clearH5AuthContext();
  if (url.startsWith("/pages/user/index/index")) {
    uni.switchTab({
      url: "/pages/user/index/index",
      fail() {
        uni.reLaunch({ url });
      },
    });
    return;
  }
  uni.reLaunch({
    url,
    fail() {
      uni.redirectTo({
        url,
        fail() {
          uni.navigateTo({ url });
        },
      });
    },
  });
}

export function ensureH5Authenticated(input = {}) {
  syncH5AuthSession(input);
  if (hasH5Token()) {
    saveH5AuthContext(input);
    return true;
  }
  return redirectToH5Login(input);
}

export function ensureH5PageAuth(query = {}, fallbackRedirect = "") {
  return ensureH5Authenticated({
    ...query,
    redirect: fallbackRedirect || getCurrentPageUrl("/pages/center/index"),
  });
}

export function isH5UnauthorizedError(error = {}) {
  const statusCode = Number(error.statusCode || error.status || error.code || 0);
  const bodyCode = Number(error.data?.code || error.response?.code || 0);
  const message = String(error.msg || error.message || error.errMsg || error.data?.msg || "").toLowerCase();
  return (
    statusCode === 401 ||
    statusCode === 403 ||
    bodyCode === 401 ||
    bodyCode === 403 ||
    statusCode === -1 ||
    message.includes("unauthorized") ||
    message.includes("未登录") ||
    message.includes("登录态") ||
    message.includes("token")
  );
}

export function handleH5Unauthorized(error = {}, input = {}) {
  if (!isH5UnauthorizedError(error)) return false;
  clearH5AuthSession();
  redirectToH5Login(input);
  return true;
}
