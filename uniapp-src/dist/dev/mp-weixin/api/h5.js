"use strict";
const common_vendor = require("../common/vendor.js");
const env_config = require("../env/config.js");
const services_h5AuthContext = require("../services/h5-auth-context.js");
function getStorageToken() {
  try {
    return common_vendor.index.getStorageSync("h5_token") || common_vendor.index.getStorageSync("token") || "";
  } catch (error) {
    return "";
  }
}
function getStorageH5ApiBaseUrl() {
  try {
    return common_vendor.index.getStorageSync("h5_api_base_url") || common_vendor.index.getStorageSync("h5ApiBaseUrl") || common_vendor.index.getStorageSync("mp_h5_api_base_url") || "";
  } catch (error) {
    return "";
  }
}
function isMissingControllerResponse(body) {
  if (!body || typeof body !== "object")
    return false;
  const message = String(body.msg || body.message || "");
  return !body.data && /controller\s+not\s+exists/i.test(message);
}
function getH5ApiBaseUrl() {
  const explicit = getStorageH5ApiBaseUrl() || env_config.config.h5_api_url || env_config.config.h5_url;
  const base = explicit || `${env_config.config.app_url}/api`;
  return String(base).replace(/\/$/, "");
}
function normalizeUrl(url = "") {
  if (/^https?:\/\//i.test(url))
    return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${getH5ApiBaseUrl()}${path}`;
}
function h5Request(options = {}) {
  const { url, method = "GET", data = {}, header = {}, timeout = 3e4, authRedirect = true } = options;
  if (!url)
    return Promise.reject(new Error("h5Request: url is required"));
  const token = getStorageToken();
  const finalHeader = { ...header };
  if (token) {
    finalHeader.Authorization = `Bearer ${token}`;
    finalHeader["X-Token"] = token;
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: normalizeUrl(url),
      method,
      data,
      timeout,
      header: finalHeader,
      success(response) {
        const body = response.data;
        if (response.statusCode < 200 || response.statusCode >= 300) {
          if (authRedirect && services_h5AuthContext.handleH5Unauthorized({ ...body, statusCode: response.statusCode })) {
            reject(body || response);
            return;
          }
          reject(body || response);
          return;
        }
        if (body && typeof body === "object" && "code" in body) {
          if (isMissingControllerResponse(body)) {
            reject(body);
            return;
          }
          if (Number(body.code) === 0 || Number(body.code) === 200 || body.success === true) {
            resolve(body.data !== void 0 ? body.data : body);
            return;
          }
          if (authRedirect && services_h5AuthContext.handleH5Unauthorized(body)) {
            reject(body);
            return;
          }
          reject(body);
          return;
        }
        resolve(body);
      },
      fail(error) {
        if (authRedirect && services_h5AuthContext.handleH5Unauthorized(error)) {
          reject(error);
          return;
        }
        reject(error);
      }
    });
  });
}
function h5Get(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: "GET" });
}
function h5Post(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: "POST" });
}
function h5Put(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: "PUT" });
}
function h5Delete(url, data, options = {}) {
  return h5Request({ ...options, url, data, method: "DELETE" });
}
function normalizeH5AssetUrl(url = "") {
  if (!url)
    return "";
  if (/^https?:\/\//i.test(url))
    return url;
  const base = getH5ApiBaseUrl().replace(/\/api$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}
exports.getH5ApiBaseUrl = getH5ApiBaseUrl;
exports.h5Delete = h5Delete;
exports.h5Get = h5Get;
exports.h5Post = h5Post;
exports.h5Put = h5Put;
exports.normalizeH5AssetUrl = normalizeH5AssetUrl;
