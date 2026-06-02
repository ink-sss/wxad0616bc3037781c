"use strict";
const common_vendor = require("../../common/vendor.js");
const UNSUPPORTED_CODE = "WEIXIN_API_UNSUPPORTED";
function getGlobalUni() {
  return typeof common_vendor.index !== "undefined" ? common_vendor.index : null;
}
function getGlobalWx() {
  return typeof common_vendor.wx$1 !== "undefined" ? common_vendor.wx$1 : null;
}
function getWeixinApi(methodName, options = {}) {
  const { preferUni = false } = options;
  const uniApi = getGlobalUni();
  const wxApi = getGlobalWx();
  if (preferUni && uniApi && (!methodName || typeof uniApi[methodName] === "function")) {
    return uniApi;
  }
  if (wxApi && (!methodName || typeof wxApi[methodName] === "function")) {
    return wxApi;
  }
  if (uniApi && (!methodName || typeof uniApi[methodName] === "function")) {
    return uniApi;
  }
  return null;
}
function hasWeixinApi(methodName, options = {}) {
  return !!getWeixinApi(methodName, options);
}
function unsupportedError(apiName) {
  const error = new Error(`${apiName} is only available in mp-weixin runtime`);
  error.code = UNSUPPORTED_CODE;
  error.apiName = apiName;
  return error;
}
function canIUse(schema) {
  const api = getWeixinApi("canIUse");
  if (!api || typeof api.canIUse !== "function") {
    return false;
  }
  try {
    return !!api.canIUse(schema);
  } catch (error) {
    return false;
  }
}
function promisifyApi(apiName, params = {}, options = {}) {
  const api = options.api || getWeixinApi(apiName, options);
  if (!api || typeof api[apiName] !== "function") {
    return Promise.reject(unsupportedError(apiName));
  }
  return new Promise((resolve, reject) => {
    const request = {
      ...params,
      success(result) {
        if (typeof params.success === "function") {
          params.success(result);
        }
        resolve(result);
      },
      fail(error) {
        if (typeof params.fail === "function") {
          params.fail(error);
        }
        reject(error);
      },
      complete(result) {
        if (typeof params.complete === "function") {
          params.complete(result);
        }
      }
    };
    try {
      api[apiName](request);
    } catch (error) {
      reject(error);
    }
  });
}
exports.canIUse = canIUse;
exports.getGlobalUni = getGlobalUni;
exports.getWeixinApi = getWeixinApi;
exports.hasWeixinApi = hasWeixinApi;
exports.promisifyApi = promisifyApi;
exports.unsupportedError = unsupportedError;
