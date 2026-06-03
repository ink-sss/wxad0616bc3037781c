"use strict";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
/**
* @vue/shared v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function makeMap(str, expectsLowerCase) {
  const set2 = new Set(str.split(","));
  return (val) => set2.has(val);
}
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isFunction$1 = (val) => typeof val === "function";
const isString$1 = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise$2 = (val) => {
  return (isObject$1(val) || isFunction$1(val)) && isFunction$1(val.then) && isFunction$1(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject$1 = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString$1(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const isBuiltInDirective = /* @__PURE__ */ makeMap(
  "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction((str) => {
  const s2 = str ? `on${capitalize(str)}` : ``;
  return s2;
});
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns$1 = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const looseToNumber = (val) => {
  const n2 = parseFloat(val);
  return isNaN(n2) ? val : n2;
};
function normalizeStyle(value) {
  if (isArray$1(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString$1(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString$1(value) || isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString$1(value)) {
    res = value;
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const toDisplayString = (val) => {
  return isString$1(val) ? val : val == null ? "" : isArray$1(val) || isObject$1(val) && (val.toString === objectToString || !isFunction$1(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject$1(val) && !isArray$1(val) && !isPlainObject$1(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v, i = "") => {
  var _a;
  return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
};
const SLOT_DEFAULT_NAME = "d";
const ON_SHOW = "onShow";
const ON_HIDE = "onHide";
const ON_LAUNCH = "onLaunch";
const ON_ERROR = "onError";
const ON_THEME_CHANGE = "onThemeChange";
const ON_PAGE_NOT_FOUND = "onPageNotFound";
const ON_UNHANDLE_REJECTION = "onUnhandledRejection";
const ON_LAST_PAGE_BACK_PRESS = "onLastPageBackPress";
const ON_EXIT = "onExit";
const ON_LOAD = "onLoad";
const ON_READY = "onReady";
const ON_UNLOAD = "onUnload";
const ON_INIT = "onInit";
const ON_SAVE_EXIT_STATE = "onSaveExitState";
const ON_UPLOAD_DOUYIN_VIDEO = "onUploadDouyinVideo";
const ON_LIVE_MOUNT = "onLiveMount";
const ON_TITLE_CLICK = "onTitleClick";
const ON_RESIZE = "onResize";
const ON_BACK_PRESS = "onBackPress";
const ON_PAGE_SCROLL = "onPageScroll";
const ON_TAB_ITEM_TAP = "onTabItemTap";
const ON_REACH_BOTTOM = "onReachBottom";
const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
const ON_SHARE_TIMELINE = "onShareTimeline";
const ON_SHARE_CHAT = "onShareChat";
const ON_COPY_URL = "onCopyUrl";
const ON_ADD_TO_FAVORITES = "onAddToFavorites";
const ON_SHARE_APP_MESSAGE = "onShareAppMessage";
const ON_NAVIGATION_BAR_BUTTON_TAP = "onNavigationBarButtonTap";
const ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED = "onNavigationBarSearchInputClicked";
const ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED = "onNavigationBarSearchInputChanged";
const ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED = "onNavigationBarSearchInputConfirmed";
const ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED = "onNavigationBarSearchInputFocusChanged";
const VIRTUAL_HOST_STYLE = "virtualHostStyle";
const VIRTUAL_HOST_CLASS = "virtualHostClass";
const VIRTUAL_HOST_HIDDEN = "virtualHostHidden";
const VIRTUAL_HOST_ID = "virtualHostId";
const customizeRE = /:/g;
function customizeEvent(str) {
  return camelize(str.replace(customizeRE, "-"));
}
function hasLeadingSlash(str) {
  return str.indexOf("/") === 0;
}
function addLeadingSlash(str) {
  return hasLeadingSlash(str) ? str : "/" + str;
}
const invokeArrayFns = (fns, arg) => {
  let ret;
  for (let i = 0; i < fns.length; i++) {
    ret = fns[i](arg);
  }
  return ret;
};
function once(fn, ctx = null) {
  let res;
  return (...args) => {
    if (fn) {
      res = fn.apply(ctx, args);
      fn = null;
    }
    return res;
  };
}
function getValueByDataPath(obj, path) {
  if (!isString$1(path)) {
    return;
  }
  path = path.replace(/\[(\d+)\]/g, ".$1");
  const parts = path.split(".");
  let key = parts[0];
  if (!obj) {
    obj = {};
  }
  if (parts.length === 1) {
    return obj[key];
  }
  return getValueByDataPath(obj[key], parts.slice(1).join("."));
}
const encode$1 = encodeURIComponent;
function stringifyQuery(obj, encodeStr = encode$1) {
  const res = obj ? Object.keys(obj).map((key) => {
    let val = obj[key];
    if (typeof val === void 0 || val === null) {
      val = "";
    } else if (isPlainObject$1(val)) {
      val = JSON.stringify(val);
    }
    return encodeStr(key) + "=" + encodeStr(val);
  }).filter((x) => x.length > 0).join("&") : null;
  return res ? `?${res}` : "";
}
const PAGE_HOOKS = [
  ON_INIT,
  ON_LOAD,
  ON_SHOW,
  ON_HIDE,
  ON_UNLOAD,
  ON_RESIZE,
  ON_BACK_PRESS,
  ON_PAGE_SCROLL,
  ON_TAB_ITEM_TAP,
  ON_REACH_BOTTOM,
  ON_PULL_DOWN_REFRESH,
  ON_SHARE_TIMELINE,
  ON_SHARE_APP_MESSAGE,
  ON_SHARE_CHAT,
  ON_COPY_URL,
  ON_UPLOAD_DOUYIN_VIDEO,
  ON_LIVE_MOUNT,
  ON_TITLE_CLICK,
  ON_ADD_TO_FAVORITES,
  ON_SAVE_EXIT_STATE,
  ON_NAVIGATION_BAR_BUTTON_TAP,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED
];
function isRootHook(name) {
  return PAGE_HOOKS.indexOf(name) > -1;
}
const UniLifecycleHooks = [
  ON_SHOW,
  ON_HIDE,
  ON_LAUNCH,
  ON_ERROR,
  ON_THEME_CHANGE,
  ON_PAGE_NOT_FOUND,
  ON_UNHANDLE_REJECTION,
  ON_EXIT,
  ON_INIT,
  ON_LOAD,
  ON_READY,
  ON_UNLOAD,
  ON_RESIZE,
  ON_BACK_PRESS,
  ON_PAGE_SCROLL,
  ON_TAB_ITEM_TAP,
  ON_REACH_BOTTOM,
  ON_PULL_DOWN_REFRESH,
  ON_SHARE_TIMELINE,
  ON_ADD_TO_FAVORITES,
  ON_SHARE_APP_MESSAGE,
  ON_SHARE_CHAT,
  ON_COPY_URL,
  ON_UPLOAD_DOUYIN_VIDEO,
  ON_LIVE_MOUNT,
  ON_TITLE_CLICK,
  ON_SAVE_EXIT_STATE,
  ON_NAVIGATION_BAR_BUTTON_TAP,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CLICKED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CHANGED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_CONFIRMED,
  ON_NAVIGATION_BAR_SEARCH_INPUT_FOCUS_CHANGED,
  ON_LAST_PAGE_BACK_PRESS
];
const MINI_PROGRAM_PAGE_RUNTIME_HOOKS = /* @__PURE__ */ (() => {
  return {
    onPageScroll: 1,
    onShareAppMessage: 1 << 1,
    onShareTimeline: 1 << 2,
    onShareChat: 1 << 3,
    onCopyUrl: 1 << 4,
    onUploadDouyinVideo: 1 << 5,
    onLiveMount: 1 << 6,
    onTitleClick: 1 << 7
  };
})();
function isUniLifecycleHook(name, value, checkType = true) {
  if (checkType && !isFunction$1(value)) {
    return false;
  }
  if (UniLifecycleHooks.indexOf(name) > -1) {
    return true;
  } else if (name.indexOf("on") === 0) {
    return true;
  }
  return false;
}
let vueApp;
const createVueAppHooks = [];
function onCreateVueApp(hook) {
  if (vueApp) {
    return hook(vueApp);
  }
  createVueAppHooks.push(hook);
}
function invokeCreateVueAppHook(app) {
  vueApp = app;
  createVueAppHooks.forEach((hook) => hook(app));
}
const invokeCreateErrorHandler = once((app, createErrorHandler2) => {
  return createErrorHandler2(app);
});
const E = function() {
};
E.prototype = {
  _id: 1,
  on: function(name, callback, ctx) {
    var e2 = this.e || (this.e = {});
    (e2[name] || (e2[name] = [])).push({
      fn: callback,
      ctx,
      _id: this._id
    });
    return this._id++;
  },
  once: function(name, callback, ctx) {
    var self2 = this;
    function listener() {
      self2.off(name, listener);
      callback.apply(ctx, arguments);
    }
    listener._ = callback;
    return this.on(name, listener, ctx);
  },
  emit: function(name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;
    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }
    return this;
  },
  off: function(name, event) {
    var e2 = this.e || (this.e = {});
    var evts = e2[name];
    var liveEvents = [];
    if (evts && event) {
      for (var i = evts.length - 1; i >= 0; i--) {
        if (evts[i].fn === event || evts[i].fn._ === event || evts[i]._id === event) {
          evts.splice(i, 1);
          break;
        }
      }
      liveEvents = evts;
    }
    liveEvents.length ? e2[name] = liveEvents : delete e2[name];
    return this;
  }
};
var E$1 = E;
const LOCALE_ZH_HANS = "zh-Hans";
const LOCALE_ZH_HANT = "zh-Hant";
const LOCALE_EN = "en";
const LOCALE_FR = "fr";
const LOCALE_ES = "es";
function include(str, parts) {
  return !!parts.find((part) => str.indexOf(part) !== -1);
}
function startsWith(str, parts) {
  return parts.find((part) => str.indexOf(part) === 0);
}
function normalizeLocale(locale, messages2) {
  if (!locale) {
    return;
  }
  locale = locale.trim().replace(/_/g, "-");
  locale = locale.toLowerCase();
  if (locale === "chinese") {
    return LOCALE_ZH_HANS;
  }
  if (locale.indexOf("zh") === 0) {
    if (locale.indexOf("-hans") > -1) {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("-hant") > -1) {
      return LOCALE_ZH_HANT;
    }
    if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
      return LOCALE_ZH_HANT;
    }
    return LOCALE_ZH_HANS;
  }
  let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
  const lang2 = startsWith(locale, locales);
  if (lang2) {
    return lang2;
  }
}
function getLocaleLanguage$1() {
  var _a;
  let localeLanguage = "";
  {
    const appBaseInfo = ((_a = wx.getAppBaseInfo) === null || _a === void 0 ? void 0 : _a.call(wx)) || wx.getSystemInfoSync();
    const language = appBaseInfo && appBaseInfo.language ? appBaseInfo.language : LOCALE_EN;
    localeLanguage = normalizeLocale(language) || LOCALE_EN;
  }
  return localeLanguage;
}
function validateProtocolFail(name, msg) {
  console.warn(`${name}: ${msg}`);
}
function validateProtocol(name, data, protocol, onFail) {
  if (!onFail) {
    onFail = validateProtocolFail;
  }
  for (const key in protocol) {
    const errMsg = validateProp$1(key, data[key], protocol[key], !hasOwn(data, key));
    if (isString$1(errMsg)) {
      onFail(name, errMsg);
    }
  }
}
function validateProtocols(name, args, protocol, onFail) {
  if (!protocol) {
    return;
  }
  if (!isArray$1(protocol)) {
    return validateProtocol(name, args[0] || /* @__PURE__ */ Object.create(null), protocol, onFail);
  }
  const len = protocol.length;
  const argsLen = args.length;
  for (let i = 0; i < len; i++) {
    const opts = protocol[i];
    const data = /* @__PURE__ */ Object.create(null);
    if (argsLen > i) {
      data[opts.name] = args[i];
    }
    validateProtocol(name, data, { [opts.name]: opts }, onFail);
  }
}
function validateProp$1(name, value, prop, isAbsent) {
  if (!isPlainObject$1(prop)) {
    prop = { type: prop };
  }
  const { type, required, validator } = prop;
  if (required && isAbsent) {
    return 'Missing required args: "' + name + '"';
  }
  if (value == null && !required) {
    return;
  }
  if (type != null) {
    let isValid2 = false;
    const types = isArray$1(type) ? type : [type];
    const expectedTypes = [];
    for (let i = 0; i < types.length && !isValid2; i++) {
      const { valid, expectedType } = assertType$1(value, types[i]);
      expectedTypes.push(expectedType || "");
      isValid2 = valid;
    }
    if (!isValid2) {
      return getInvalidTypeMessage$1(name, value, expectedTypes);
    }
  }
  if (validator) {
    return validator(value);
  }
}
const isSimpleType$1 = /* @__PURE__ */ makeMap("String,Number,Boolean,Function,Symbol");
function assertType$1(value, type) {
  let valid;
  const expectedType = getType$2(type);
  if (isSimpleType$1(expectedType)) {
    const t2 = typeof value;
    valid = t2 === expectedType.toLowerCase();
    if (!valid && t2 === "object") {
      valid = value instanceof type;
    }
  } else if (expectedType === "Object") {
    valid = isObject$1(value);
  } else if (expectedType === "Array") {
    valid = isArray$1(value);
  } else {
    {
      valid = value instanceof type;
    }
  }
  return {
    valid,
    expectedType
  };
}
function getInvalidTypeMessage$1(name, value, expectedTypes) {
  let message = `Invalid args: type check failed for args "${name}". Expected ${expectedTypes.map(capitalize).join(", ")}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  const expectedValue = styleValue$1(value, expectedType);
  const receivedValue = styleValue$1(value, receivedType);
  if (expectedTypes.length === 1 && isExplicable$1(expectedType) && !isBoolean$1(expectedType, receivedType)) {
    message += ` with value ${expectedValue}`;
  }
  message += `, got ${receivedType} `;
  if (isExplicable$1(receivedType)) {
    message += `with value ${receivedValue}.`;
  }
  return message;
}
function getType$2(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : "";
}
function styleValue$1(value, type) {
  if (type === "String") {
    return `"${value}"`;
  } else if (type === "Number") {
    return `${Number(value)}`;
  } else {
    return `${value}`;
  }
}
function isExplicable$1(type) {
  const explicitTypes = ["string", "number", "boolean"];
  return explicitTypes.some((elem) => type.toLowerCase() === elem);
}
function isBoolean$1(...args) {
  return args.some((elem) => elem.toLowerCase() === "boolean");
}
function tryCatch(fn) {
  return function() {
    try {
      return fn.apply(fn, arguments);
    } catch (e2) {
      console.error(e2);
    }
  };
}
let invokeCallbackId = 1;
const invokeCallbacks = {};
function addInvokeCallback(id, name, callback, keepAlive = false) {
  invokeCallbacks[id] = {
    name,
    keepAlive,
    callback
  };
  return id;
}
function invokeCallback(id, res, extras) {
  if (typeof id === "number") {
    const opts = invokeCallbacks[id];
    if (opts) {
      if (!opts.keepAlive) {
        delete invokeCallbacks[id];
      }
      return opts.callback(res, extras);
    }
  }
  return res;
}
const API_SUCCESS = "success";
const API_FAIL = "fail";
const API_COMPLETE = "complete";
function getApiCallbacks(args) {
  const apiCallbacks = {};
  for (const name in args) {
    const fn = args[name];
    if (isFunction$1(fn)) {
      apiCallbacks[name] = tryCatch(fn);
      delete args[name];
    }
  }
  return apiCallbacks;
}
function normalizeErrMsg(errMsg, name) {
  if (!errMsg || errMsg.indexOf(":fail") === -1) {
    return name + ":ok";
  }
  return name + errMsg.substring(errMsg.indexOf(":fail"));
}
function createAsyncApiCallback(name, args = {}, { beforeAll, beforeSuccess } = {}) {
  if (!isPlainObject$1(args)) {
    args = {};
  }
  const { success, fail, complete } = getApiCallbacks(args);
  const hasSuccess = isFunction$1(success);
  const hasFail = isFunction$1(fail);
  const hasComplete = isFunction$1(complete);
  const callbackId = invokeCallbackId++;
  addInvokeCallback(callbackId, name, (res) => {
    res = res || {};
    res.errMsg = normalizeErrMsg(res.errMsg, name);
    isFunction$1(beforeAll) && beforeAll(res);
    if (res.errMsg === name + ":ok") {
      isFunction$1(beforeSuccess) && beforeSuccess(res, args);
      hasSuccess && success(res);
    } else {
      hasFail && fail(res);
    }
    hasComplete && complete(res);
  });
  return callbackId;
}
const HOOK_SUCCESS = "success";
const HOOK_FAIL = "fail";
const HOOK_COMPLETE = "complete";
const globalInterceptors = {};
const scopedInterceptors = {};
function wrapperHook(hook, params) {
  return function(data) {
    return hook(data, params) || data;
  };
}
function queue$1(hooks, data, params) {
  let promise = false;
  for (let i = 0; i < hooks.length; i++) {
    const hook = hooks[i];
    if (promise) {
      promise = Promise.resolve(wrapperHook(hook, params));
    } else {
      const res = hook(data, params);
      if (isPromise$2(res)) {
        promise = Promise.resolve(res);
      }
      if (res === false) {
        return {
          then() {
          },
          catch() {
          }
        };
      }
    }
  }
  return promise || {
    then(callback) {
      return callback(data);
    },
    catch() {
    }
  };
}
function wrapperOptions(interceptors2, options = {}) {
  [HOOK_SUCCESS, HOOK_FAIL, HOOK_COMPLETE].forEach((name) => {
    const hooks = interceptors2[name];
    if (!isArray$1(hooks)) {
      return;
    }
    const oldCallback = options[name];
    options[name] = function callbackInterceptor(res) {
      queue$1(hooks, res, options).then((res2) => {
        return isFunction$1(oldCallback) && oldCallback(res2) || res2;
      });
    };
  });
  return options;
}
function wrapperReturnValue(method, returnValue) {
  const returnValueHooks = [];
  if (isArray$1(globalInterceptors.returnValue)) {
    returnValueHooks.push(...globalInterceptors.returnValue);
  }
  const interceptor = scopedInterceptors[method];
  if (interceptor && isArray$1(interceptor.returnValue)) {
    returnValueHooks.push(...interceptor.returnValue);
  }
  returnValueHooks.forEach((hook) => {
    returnValue = hook(returnValue) || returnValue;
  });
  return returnValue;
}
function getApiInterceptorHooks(method) {
  const interceptor = /* @__PURE__ */ Object.create(null);
  Object.keys(globalInterceptors).forEach((hook) => {
    if (hook !== "returnValue") {
      interceptor[hook] = globalInterceptors[hook].slice();
    }
  });
  const scopedInterceptor = scopedInterceptors[method];
  if (scopedInterceptor) {
    Object.keys(scopedInterceptor).forEach((hook) => {
      if (hook !== "returnValue") {
        interceptor[hook] = (interceptor[hook] || []).concat(scopedInterceptor[hook]);
      }
    });
  }
  return interceptor;
}
function invokeApi(method, api, options, params) {
  const interceptor = getApiInterceptorHooks(method);
  if (interceptor && Object.keys(interceptor).length) {
    if (isArray$1(interceptor.invoke)) {
      const res = queue$1(interceptor.invoke, options);
      return res.then((options2) => {
        return api(wrapperOptions(getApiInterceptorHooks(method), options2), ...params);
      });
    } else {
      return api(wrapperOptions(interceptor, options), ...params);
    }
  }
  return api(options, ...params);
}
function hasCallback(args) {
  if (isPlainObject$1(args) && [API_SUCCESS, API_FAIL, API_COMPLETE].find((cb) => isFunction$1(args[cb]))) {
    return true;
  }
  return false;
}
function handlePromise(promise) {
  return promise;
}
function promisify$1(name, fn) {
  return (args = {}, ...rest) => {
    if (hasCallback(args)) {
      return wrapperReturnValue(name, invokeApi(name, fn, extend({}, args), rest));
    }
    return wrapperReturnValue(name, handlePromise(new Promise((resolve2, reject) => {
      invokeApi(name, fn, extend({}, args, { success: resolve2, fail: reject }), rest);
    })));
  };
}
function formatApiArgs(args, options) {
  args[0];
  {
    return;
  }
}
function invokeSuccess(id, name, res) {
  const result = {
    errMsg: name + ":ok"
  };
  return invokeCallback(id, extend(res || {}, result));
}
function invokeFail(id, name, errMsg, errRes = {}) {
  const errMsgPrefix = name + ":fail";
  let apiErrMsg = "";
  if (!errMsg) {
    apiErrMsg = errMsgPrefix;
  } else if (errMsg.indexOf(errMsgPrefix) === 0) {
    apiErrMsg = errMsg;
  } else {
    apiErrMsg = errMsgPrefix + " " + errMsg;
  }
  {
    delete errRes.errCode;
  }
  let res = extend({ errMsg: apiErrMsg }, errRes);
  return invokeCallback(id, res);
}
function beforeInvokeApi(name, args, protocol, options) {
  {
    validateProtocols(name, args, protocol);
  }
  const errMsg = formatApiArgs(args);
  if (errMsg) {
    return errMsg;
  }
}
function parseErrMsg(errMsg) {
  if (!errMsg || isString$1(errMsg)) {
    return errMsg;
  }
  if (errMsg.stack) {
    if (typeof globalThis === "undefined" || !globalThis.harmonyChannel) {
      console.error(errMsg.message + "\n" + errMsg.stack);
    }
    return errMsg.message;
  }
  return errMsg;
}
function wrapperTaskApi(name, fn, protocol, options) {
  return (args) => {
    const id = createAsyncApiCallback(name, args, options);
    const errMsg = beforeInvokeApi(name, [args], protocol);
    if (errMsg) {
      return invokeFail(id, name, errMsg);
    }
    return fn(args, {
      resolve: (res) => invokeSuccess(id, name, res),
      reject: (errMsg2, errRes) => invokeFail(id, name, parseErrMsg(errMsg2), errRes)
    });
  };
}
function wrapperSyncApi(name, fn, protocol, options) {
  return (...args) => {
    const errMsg = beforeInvokeApi(name, args, protocol);
    if (errMsg) {
      throw new Error(errMsg);
    }
    return fn.apply(null, args);
  };
}
function wrapperAsyncApi(name, fn, protocol, options) {
  return wrapperTaskApi(name, fn, protocol, options);
}
function defineSyncApi(name, fn, protocol, options) {
  return wrapperSyncApi(name, fn, protocol);
}
function defineAsyncApi(name, fn, protocol, options) {
  return promisify$1(name, wrapperAsyncApi(name, fn, protocol, options));
}
const API_UPX2PX = "upx2px";
const Upx2pxProtocol = [
  {
    name: "upx",
    type: [Number, String],
    required: true
  }
];
const EPS = 1e-4;
const BASE_DEVICE_WIDTH = 750;
let isIOS = false;
let deviceWidth = 0;
let deviceDPR = 0;
function checkDeviceWidth() {
  var _a, _b;
  let windowWidth, pixelRatio, platform;
  {
    const windowInfo = ((_a = wx.getWindowInfo) === null || _a === void 0 ? void 0 : _a.call(wx)) || wx.getSystemInfoSync();
    const deviceInfo = ((_b = wx.getDeviceInfo) === null || _b === void 0 ? void 0 : _b.call(wx)) || wx.getSystemInfoSync();
    windowWidth = windowInfo.windowWidth;
    pixelRatio = windowInfo.pixelRatio;
    platform = deviceInfo.platform;
  }
  deviceWidth = windowWidth;
  deviceDPR = pixelRatio;
  isIOS = platform === "ios";
}
const upx2px = defineSyncApi(API_UPX2PX, (number, newDeviceWidth) => {
  if (deviceWidth === 0) {
    checkDeviceWidth();
  }
  number = Number(number);
  if (number === 0) {
    return 0;
  }
  let width = newDeviceWidth || deviceWidth;
  let result = number / BASE_DEVICE_WIDTH * width;
  if (result < 0) {
    result = -result;
  }
  result = Math.floor(result + EPS);
  if (result === 0) {
    if (deviceDPR === 1 || !isIOS) {
      result = 1;
    } else {
      result = 0.5;
    }
  }
  return number < 0 ? -result : result;
}, Upx2pxProtocol);
function __f__(type, filename, ...args) {
  if (filename) {
    args.push(filename);
  }
  console[type].apply(console, args);
}
const API_ADD_INTERCEPTOR = "addInterceptor";
const API_REMOVE_INTERCEPTOR = "removeInterceptor";
const AddInterceptorProtocol = [
  {
    name: "method",
    type: [String, Object],
    required: true
  }
];
const RemoveInterceptorProtocol = AddInterceptorProtocol;
function mergeInterceptorHook(interceptors2, interceptor) {
  Object.keys(interceptor).forEach((hook) => {
    if (isFunction$1(interceptor[hook])) {
      interceptors2[hook] = mergeHook(interceptors2[hook], interceptor[hook]);
    }
  });
}
function removeInterceptorHook(interceptors2, interceptor) {
  if (!interceptors2 || !interceptor) {
    return;
  }
  Object.keys(interceptor).forEach((name) => {
    const hooks = interceptors2[name];
    const hook = interceptor[name];
    if (isArray$1(hooks) && isFunction$1(hook)) {
      remove(hooks, hook);
    }
  });
}
function mergeHook(parentVal, childVal) {
  const res = childVal ? parentVal ? parentVal.concat(childVal) : isArray$1(childVal) ? childVal : [childVal] : parentVal;
  return res ? dedupeHooks(res) : res;
}
function dedupeHooks(hooks) {
  const res = [];
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res;
}
const addInterceptor = defineSyncApi(API_ADD_INTERCEPTOR, (method, interceptor) => {
  if (isString$1(method) && isPlainObject$1(interceptor)) {
    mergeInterceptorHook(scopedInterceptors[method] || (scopedInterceptors[method] = {}), interceptor);
  } else if (isPlainObject$1(method)) {
    mergeInterceptorHook(globalInterceptors, method);
  }
}, AddInterceptorProtocol);
const removeInterceptor = defineSyncApi(API_REMOVE_INTERCEPTOR, (method, interceptor) => {
  if (isString$1(method)) {
    if (isPlainObject$1(interceptor)) {
      removeInterceptorHook(scopedInterceptors[method], interceptor);
    } else {
      delete scopedInterceptors[method];
    }
  } else if (isPlainObject$1(method)) {
    removeInterceptorHook(globalInterceptors, method);
  }
}, RemoveInterceptorProtocol);
const interceptors = {};
const API_ON = "$on";
const OnProtocol = [
  {
    name: "event",
    type: String,
    required: true
  },
  {
    name: "callback",
    type: Function,
    required: true
  }
];
const API_ONCE = "$once";
const OnceProtocol = OnProtocol;
const API_OFF = "$off";
const OffProtocol = [
  {
    name: "event",
    type: [String, Array]
  },
  {
    name: "callback",
    type: [Function, Number]
  }
];
const API_EMIT = "$emit";
const EmitProtocol = [
  {
    name: "event",
    type: String,
    required: true
  }
];
class EventBus {
  constructor() {
    this.$emitter = new E$1();
  }
  on(name, callback) {
    return this.$emitter.on(name, callback);
  }
  once(name, callback) {
    return this.$emitter.once(name, callback);
  }
  off(name, callback) {
    if (!name) {
      this.$emitter.e = {};
      return;
    }
    this.$emitter.off(name, callback);
  }
  emit(name, ...args) {
    this.$emitter.emit(name, ...args);
  }
}
const eventBus = new EventBus();
const $on = defineSyncApi(API_ON, (name, callback) => {
  eventBus.on(name, callback);
  return () => eventBus.off(name, callback);
}, OnProtocol);
const $once = defineSyncApi(API_ONCE, (name, callback) => {
  eventBus.once(name, callback);
  return () => eventBus.off(name, callback);
}, OnceProtocol);
const $off = defineSyncApi(API_OFF, (name, callback) => {
  if (!isArray$1(name))
    name = name ? [name] : [];
  name.forEach((n2) => {
    eventBus.off(n2, callback);
  });
}, OffProtocol);
const $emit = defineSyncApi(API_EMIT, (name, ...args) => {
  eventBus.emit(name, ...args);
}, EmitProtocol);
let cid;
let cidErrMsg;
let enabled;
function normalizePushMessage(message) {
  try {
    return JSON.parse(message);
  } catch (e2) {
  }
  return message;
}
function invokePushCallback(args) {
  if (args.type === "enabled") {
    enabled = true;
  } else if (args.type === "clientId") {
    cid = args.cid;
    cidErrMsg = args.errMsg;
    invokeGetPushCidCallbacks(cid, args.errMsg);
  } else if (args.type === "pushMsg") {
    const message = {
      type: "receive",
      data: normalizePushMessage(args.message)
    };
    for (let i = 0; i < onPushMessageCallbacks.length; i++) {
      const callback = onPushMessageCallbacks[i];
      callback(message);
      if (message.stopped) {
        break;
      }
    }
  } else if (args.type === "click") {
    onPushMessageCallbacks.forEach((callback) => {
      callback({
        type: "click",
        data: normalizePushMessage(args.message)
      });
    });
  }
}
const getPushCidCallbacks = [];
function invokeGetPushCidCallbacks(cid2, errMsg) {
  getPushCidCallbacks.forEach((callback) => {
    callback(cid2, errMsg);
  });
  getPushCidCallbacks.length = 0;
}
const API_GET_PUSH_CLIENT_ID = "getPushClientId";
const getPushClientId = defineAsyncApi(API_GET_PUSH_CLIENT_ID, (_, { resolve: resolve2, reject }) => {
  Promise.resolve().then(() => {
    if (typeof enabled === "undefined") {
      enabled = false;
      cid = "";
      cidErrMsg = "uniPush is not enabled";
    }
    getPushCidCallbacks.push((cid2, errMsg) => {
      if (cid2) {
        resolve2({ cid: cid2 });
      } else {
        reject(errMsg);
      }
    });
    if (typeof cid !== "undefined") {
      invokeGetPushCidCallbacks(cid, cidErrMsg);
    }
  });
});
const onPushMessageCallbacks = [];
const onPushMessage = (fn) => {
  if (onPushMessageCallbacks.indexOf(fn) === -1) {
    onPushMessageCallbacks.push(fn);
  }
};
const offPushMessage = (fn) => {
  if (!fn) {
    onPushMessageCallbacks.length = 0;
  } else {
    const index2 = onPushMessageCallbacks.indexOf(fn);
    if (index2 > -1) {
      onPushMessageCallbacks.splice(index2, 1);
    }
  }
};
const SYNC_API_RE = /^\$|__f__|getLocale|setLocale|sendNativeEvent|restoreGlobal|requireGlobal|getCurrentSubNVue|getMenuButtonBoundingClientRect|^report|interceptors|Interceptor$|getSubNVueById|requireNativePlugin|upx2px|rpx2px|hideKeyboard|canIUse|^create|Sync$|Manager$|base64ToArrayBuffer|arrayBufferToBase64|getDeviceInfo|getAppBaseInfo|getWindowInfo|getSystemSetting|getAppAuthorizeSetting/;
const CONTEXT_API_RE = /^create|Manager$/;
const CONTEXT_API_RE_EXC = ["createBLEConnection"];
const TASK_APIS = ["request", "downloadFile", "uploadFile", "connectSocket"];
const ASYNC_API = ["createBLEConnection"];
const CALLBACK_API_RE = /^on|^off/;
function isContextApi(name) {
  return CONTEXT_API_RE.test(name) && CONTEXT_API_RE_EXC.indexOf(name) === -1;
}
function isSyncApi(name) {
  return SYNC_API_RE.test(name) && ASYNC_API.indexOf(name) === -1;
}
function isCallbackApi(name) {
  return CALLBACK_API_RE.test(name) && name !== "onPush";
}
function isTaskApi(name) {
  return TASK_APIS.indexOf(name) !== -1;
}
function shouldPromise(name) {
  if (isContextApi(name) || isSyncApi(name) || isCallbackApi(name)) {
    return false;
  }
  return true;
}
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function(onfinally) {
    const promise = this.constructor;
    return this.then((value) => promise.resolve(onfinally && onfinally()).then(() => value), (reason) => promise.resolve(onfinally && onfinally()).then(() => {
      throw reason;
    }));
  };
}
function promisify(name, api) {
  if (!shouldPromise(name)) {
    return api;
  }
  if (!isFunction$1(api)) {
    return api;
  }
  return function promiseApi(options = {}, ...rest) {
    if (isFunction$1(options.success) || isFunction$1(options.fail) || isFunction$1(options.complete)) {
      return wrapperReturnValue(name, invokeApi(name, api, extend({}, options), rest));
    }
    return wrapperReturnValue(name, handlePromise(new Promise((resolve2, reject) => {
      invokeApi(name, api, extend({}, options, {
        success: resolve2,
        fail: reject
      }), rest);
    })));
  };
}
const CALLBACKS = ["success", "fail", "cancel", "complete"];
function initWrapper(protocols2) {
  function processCallback(methodName, method, returnValue) {
    return function(res) {
      return method(processReturnValue(methodName, res, returnValue));
    };
  }
  function processArgs(methodName, fromArgs, argsOption = {}, returnValue = {}, keepFromArgs = false) {
    if (isPlainObject$1(fromArgs)) {
      const toArgs = keepFromArgs === true ? fromArgs : {};
      if (isFunction$1(argsOption)) {
        argsOption = argsOption(fromArgs, toArgs) || {};
      }
      for (const key in fromArgs) {
        if (hasOwn(argsOption, key)) {
          let keyOption = argsOption[key];
          if (isFunction$1(keyOption)) {
            keyOption = keyOption(fromArgs[key], fromArgs, toArgs);
          }
          if (!keyOption) {
            console.warn(`微信小程序 ${methodName} 暂不支持 ${key}`);
          } else if (isString$1(keyOption)) {
            toArgs[keyOption] = fromArgs[key];
          } else if (isPlainObject$1(keyOption)) {
            toArgs[keyOption.name ? keyOption.name : key] = keyOption.value;
          }
        } else if (CALLBACKS.indexOf(key) !== -1) {
          const callback = fromArgs[key];
          if (isFunction$1(callback)) {
            toArgs[key] = processCallback(methodName, callback, returnValue);
          }
        } else {
          if (!keepFromArgs && !hasOwn(toArgs, key)) {
            toArgs[key] = fromArgs[key];
          }
        }
      }
      return toArgs;
    } else if (isFunction$1(fromArgs)) {
      if (isFunction$1(argsOption)) {
        argsOption(fromArgs, {});
      }
      fromArgs = processCallback(methodName, fromArgs, returnValue);
    }
    return fromArgs;
  }
  function processReturnValue(methodName, res, returnValue, keepReturnValue = false) {
    if (isFunction$1(protocols2.returnValue)) {
      res = protocols2.returnValue(methodName, res);
    }
    const realKeepReturnValue = keepReturnValue || false;
    return processArgs(methodName, res, returnValue, {}, realKeepReturnValue);
  }
  return function wrapper3(methodName, method) {
    const hasProtocol = hasOwn(protocols2, methodName);
    if (!hasProtocol && typeof wx[methodName] !== "function") {
      return method;
    }
    const needWrapper = hasProtocol || isFunction$1(protocols2.returnValue) || isContextApi(methodName) || isTaskApi(methodName);
    const hasMethod = hasProtocol || isFunction$1(method);
    if (!hasProtocol && !method) {
      return function() {
        console.error(`微信小程序 暂不支持${methodName}`);
      };
    }
    if (!needWrapper || !hasMethod) {
      return method;
    }
    const protocol = protocols2[methodName];
    return function(arg1, arg2) {
      let options = protocol || {};
      if (isFunction$1(protocol)) {
        options = protocol(arg1);
      }
      arg1 = processArgs(methodName, arg1, options.args, options.returnValue);
      const args = [arg1];
      if (typeof arg2 !== "undefined") {
        args.push(arg2);
      }
      const returnValue = wx[options.name || methodName].apply(wx, args);
      if (isContextApi(methodName) || isTaskApi(methodName)) {
        if (returnValue && !returnValue.__v_skip) {
          returnValue.__v_skip = true;
        }
      }
      if (isSyncApi(methodName)) {
        return processReturnValue(methodName, returnValue, options.returnValue, isContextApi(methodName));
      }
      return returnValue;
    };
  };
}
const getLocale = () => {
  const app = isFunction$1(getApp) && getApp({ allowDefault: true });
  if (app && app.$vm) {
    return app.$vm.$locale;
  }
  return getLocaleLanguage$1();
};
const setLocale = (locale) => {
  const app = isFunction$1(getApp) && getApp();
  if (!app) {
    return false;
  }
  const oldLocale = app.$vm.$locale;
  if (oldLocale !== locale) {
    app.$vm.$locale = locale;
    onLocaleChangeCallbacks.forEach((fn) => fn({ locale }));
    return true;
  }
  return false;
};
const onLocaleChangeCallbacks = [];
const onLocaleChange = (fn) => {
  if (onLocaleChangeCallbacks.indexOf(fn) === -1) {
    onLocaleChangeCallbacks.push(fn);
  }
};
if (typeof global !== "undefined") {
  global.getLocale = getLocale;
}
const UUID_KEY = "__DC_STAT_UUID";
let deviceId;
function useDeviceId(global2 = wx) {
  return function addDeviceId(_, toRes) {
    deviceId = deviceId || global2.getStorageSync(UUID_KEY);
    if (!deviceId) {
      deviceId = Date.now() + "" + Math.floor(Math.random() * 1e7);
      wx.setStorage({
        key: UUID_KEY,
        data: deviceId
      });
    }
    toRes.deviceId = deviceId;
  };
}
function addSafeAreaInsets(fromRes, toRes) {
  if (fromRes.safeArea) {
    const safeArea = fromRes.safeArea;
    toRes.safeAreaInsets = {
      top: safeArea.top,
      left: safeArea.left,
      right: fromRes.windowWidth - safeArea.right,
      bottom: fromRes.screenHeight - safeArea.bottom
    };
  }
}
function getOSInfo(system, platform) {
  let osName = "";
  let osVersion = "";
  if (platform && false) {
    osName = platform;
    osVersion = system;
    system = `${osName} ${osVersion}`;
  } else {
    {
      osName = platform;
    }
    osVersion = system.split(" ")[1] || "";
  }
  osName = osName.toLowerCase();
  switch (osName) {
    case "harmony":
    case "ohos":
    case "openharmonyos":
    case "openharmony":
      osName = "harmonyos";
      break;
    case "iphone os":
      osName = "ios";
      break;
    case "mac":
    case "darwin":
      osName = "macos";
      break;
    case "windows_nt":
      osName = "windows";
      break;
  }
  return {
    osName,
    osVersion,
    system
  };
}
function getPlatform(platform) {
  platform = platform.toLowerCase();
  {
    if (platform === "ohos") {
      platform = "harmonyos";
    }
  }
  return platform;
}
function populateParameters(fromRes, toRes) {
  const { brand = "", model = "", system = "", language = "", theme, version: version2, platform, fontSizeSetting, SDKVersion, pixelRatio, deviceOrientation } = fromRes;
  const { osName, osVersion, system: updatedSystem } = getOSInfo(system, platform);
  let hostVersion = version2;
  let deviceType = getGetDeviceType(fromRes, model);
  let deviceBrand = getDeviceBrand(brand);
  let _hostName = getHostName(fromRes);
  let _deviceOrientation = deviceOrientation;
  let _devicePixelRatio = pixelRatio;
  let _SDKVersion = SDKVersion;
  const hostLanguage = (language || "").replace(/_/g, "-");
  const parameters = {
    appId: "__UNI__WXAD0616",
    appName: "wxad0616bc3037781c",
    appVersion: "0.1.0",
    appVersionCode: "100",
    appLanguage: getAppLanguage(hostLanguage),
    uniCompileVersion: "5.11",
    uniCompilerVersion: "5.11",
    uniRuntimeVersion: "5.11",
    uniPlatform: "mp-weixin",
    deviceBrand,
    deviceModel: model,
    deviceType,
    devicePixelRatio: _devicePixelRatio,
    deviceOrientation: _deviceOrientation,
    osName,
    osVersion,
    hostTheme: theme,
    hostVersion,
    hostLanguage,
    hostName: _hostName,
    hostSDKVersion: _SDKVersion,
    hostFontSizeSetting: fontSizeSetting,
    windowTop: 0,
    windowBottom: 0,
    platform: getPlatform(platform),
    system: updatedSystem,
    // TODO
    osLanguage: void 0,
    osTheme: void 0,
    ua: void 0,
    hostPackageName: void 0,
    browserName: void 0,
    browserVersion: void 0,
    isUniAppX: false
  };
  extend(toRes, parameters);
}
function getGetDeviceType(fromRes, model) {
  const platform = fromRes.platform || "";
  let deviceType = fromRes.deviceType || "phone";
  {
    const deviceTypeMaps = {
      ipad: "pad",
      windows: "pc",
      mac: "pc",
      linux: "pc",
      pc: "pc"
    };
    const deviceTypeMapsKeys = Object.keys(deviceTypeMaps);
    const _model = model.toLowerCase();
    for (let index2 = 0; index2 < deviceTypeMapsKeys.length; index2++) {
      const _m = deviceTypeMapsKeys[index2];
      if (_model.indexOf(_m) !== -1) {
        deviceType = deviceTypeMaps[_m];
        break;
      }
    }
  }
  {
    if (platform === "ohos_pc") {
      deviceType = "pc";
    }
  }
  return deviceType;
}
function getDeviceBrand(brand) {
  let deviceBrand = brand;
  if (deviceBrand) {
    deviceBrand = deviceBrand.toLowerCase();
  }
  return deviceBrand;
}
function getAppLanguage(defaultLanguage) {
  return getLocale ? getLocale() : defaultLanguage;
}
function getHostName(fromRes) {
  const _platform = "WeChat";
  let _hostName = fromRes.hostName || _platform;
  {
    if (fromRes.environment) {
      _hostName = fromRes.environment;
    } else if (fromRes.host && fromRes.host.env) {
      _hostName = fromRes.host.env;
    }
  }
  return _hostName;
}
const getSystemInfo$1 = {
  returnValue: (fromRes, toRes) => {
    addSafeAreaInsets(fromRes, toRes);
    useDeviceId()(fromRes, toRes);
    populateParameters(fromRes, toRes);
  }
};
const getSystemInfoSync = getSystemInfo$1;
const redirectTo = {};
const previewImage = {
  args(fromArgs, toArgs) {
    let currentIndex = parseInt(fromArgs.current);
    if (isNaN(currentIndex)) {
      return;
    }
    const urls = fromArgs.urls;
    if (!isArray$1(urls)) {
      return;
    }
    const len = urls.length;
    if (!len) {
      return;
    }
    if (currentIndex < 0) {
      currentIndex = 0;
    } else if (currentIndex >= len) {
      currentIndex = len - 1;
    }
    if (currentIndex > 0) {
      toArgs.current = urls[currentIndex];
      toArgs.urls = urls.filter((item, index2) => index2 < currentIndex ? item !== urls[currentIndex] : true);
    } else {
      toArgs.current = urls[0];
    }
    return {
      indicator: false,
      loop: false
    };
  }
};
const showActionSheet = {
  args(fromArgs, toArgs) {
    toArgs.alertText = fromArgs.title;
  }
};
const getDeviceInfo = {
  returnValue: (fromRes, toRes) => {
    const { brand, model, system = "", platform = "" } = fromRes;
    let deviceType = getGetDeviceType(fromRes, model);
    let deviceBrand = getDeviceBrand(brand);
    useDeviceId()(fromRes, toRes);
    const { osName, osVersion } = getOSInfo(system, platform);
    toRes = extend(toRes, {
      deviceType,
      deviceBrand,
      deviceModel: model,
      osName,
      osVersion,
      platform: getPlatform(platform)
    });
  }
};
const getAppBaseInfo = {
  returnValue: (fromRes, toRes) => {
    const { version: version2, language, SDKVersion, theme } = fromRes;
    let _hostName = getHostName(fromRes);
    let hostLanguage = (language || "").replace(/_/g, "-");
    const parameters = {
      appId: "__UNI__WXAD0616",
      appName: "wxad0616bc3037781c",
      appVersion: "0.1.0",
      appVersionCode: "100",
      appLanguage: getAppLanguage(hostLanguage),
      hostVersion: version2,
      hostLanguage,
      hostName: _hostName,
      hostSDKVersion: SDKVersion,
      hostTheme: theme,
      isUniAppX: false,
      uniPlatform: "mp-weixin",
      uniCompileVersion: "5.11",
      uniCompilerVersion: "5.11",
      uniRuntimeVersion: "5.11"
    };
    extend(toRes, parameters);
  }
};
const getWindowInfo = {
  returnValue: (fromRes, toRes) => {
    addSafeAreaInsets(fromRes, toRes);
    toRes = extend(toRes, {
      windowTop: 0,
      windowBottom: 0
    });
  }
};
const getAppAuthorizeSetting = {
  returnValue: function(fromRes, toRes) {
    const { locationReducedAccuracy } = fromRes;
    toRes.locationAccuracy = "unsupported";
    if (locationReducedAccuracy === true) {
      toRes.locationAccuracy = "reduced";
    } else if (locationReducedAccuracy === false) {
      toRes.locationAccuracy = "full";
    }
  }
};
const onError = {
  args(fromArgs) {
    const app = getApp({ allowDefault: true }) || {};
    if (!app.$vm) {
      if (!wx.$onErrorHandlers) {
        wx.$onErrorHandlers = [];
      }
      wx.$onErrorHandlers.push(fromArgs);
    } else {
      injectHook(ON_ERROR, fromArgs, app.$vm.$);
    }
  }
};
const offError = {
  args(fromArgs) {
    const app = getApp({ allowDefault: true }) || {};
    if (!app.$vm) {
      if (!wx.$onErrorHandlers) {
        return;
      }
      const index2 = wx.$onErrorHandlers.findIndex((fn) => fn === fromArgs);
      if (index2 !== -1) {
        wx.$onErrorHandlers.splice(index2, 1);
      }
    } else if (fromArgs.__weh) {
      const onErrors = app.$vm.$[ON_ERROR];
      if (onErrors) {
        const index2 = onErrors.indexOf(fromArgs.__weh);
        if (index2 > -1) {
          onErrors.splice(index2, 1);
        }
      }
    }
  }
};
const onSocketOpen = {
  args() {
    if (wx.__uni_console__) {
      if (wx.__uni_console_warned__) {
        return;
      }
      wx.__uni_console_warned__ = true;
      console.warn(`开发模式下小程序日志回显会使用 socket 连接，为了避免冲突，建议使用 SocketTask 的方式去管理 WebSocket 或手动关闭日志回显功能。[详情](https://uniapp.dcloud.net.cn/tutorial/run/mp-log.html)`);
    }
  }
};
const onSocketMessage = onSocketOpen;
const baseApis = {
  $on,
  $off,
  $once,
  $emit,
  upx2px,
  rpx2px: upx2px,
  interceptors,
  addInterceptor,
  removeInterceptor,
  onCreateVueApp,
  invokeCreateVueAppHook,
  getLocale,
  setLocale,
  onLocaleChange,
  getPushClientId,
  onPushMessage,
  offPushMessage,
  invokePushCallback,
  __f__
};
function initUni(api, protocols2, platform = wx) {
  const wrapper3 = initWrapper(protocols2);
  const UniProxyHandlers = {
    get(target, key) {
      if (hasOwn(target, key)) {
        return target[key];
      }
      if (hasOwn(api, key)) {
        return promisify(key, api[key]);
      }
      if (hasOwn(baseApis, key)) {
        return promisify(key, baseApis[key]);
      }
      return promisify(key, wrapper3(key, platform[key]));
    }
  };
  return new Proxy({}, UniProxyHandlers);
}
function initGetProvider(providers) {
  return function getProvider2({ service, success, fail, complete }) {
    let res;
    if (providers[service]) {
      res = {
        errMsg: "getProvider:ok",
        service,
        provider: providers[service]
      };
      isFunction$1(success) && success(res);
    } else {
      res = {
        errMsg: "getProvider:fail:服务[" + service + "]不存在"
      };
      isFunction$1(fail) && fail(res);
    }
    isFunction$1(complete) && complete(res);
  };
}
const objectKeys = [
  "qy",
  "env",
  "error",
  "version",
  "lanDebug",
  "cloud",
  "serviceMarket",
  "router",
  "worklet",
  "__webpack_require_UNI_MP_PLUGIN__"
];
const singlePageDisableKey = ["lanDebug", "router", "worklet"];
const launchOption = wx.getLaunchOptionsSync ? wx.getLaunchOptionsSync() : null;
function isWxKey(key) {
  if (launchOption && launchOption.scene === 1154 && singlePageDisableKey.includes(key)) {
    return false;
  }
  return objectKeys.indexOf(key) > -1 || typeof wx[key] === "function";
}
function initWx() {
  const newWx = {};
  for (const key in wx) {
    if (isWxKey(key)) {
      newWx[key] = wx[key];
    }
  }
  if (typeof globalThis !== "undefined" && typeof requireMiniProgram === "undefined") {
    globalThis.wx = newWx;
  }
  return newWx;
}
const mocks$1 = ["__route__", "__wxExparserNodeId__", "__wxWebviewId__"];
const getProvider = initGetProvider({
  oauth: ["weixin"],
  share: ["weixin"],
  payment: ["wxpay"],
  push: ["weixin"]
});
function initComponentMocks(component) {
  const res = /* @__PURE__ */ Object.create(null);
  mocks$1.forEach((name) => {
    res[name] = component[name];
  });
  return res;
}
function createSelectorQuery() {
  const query = wx$2.createSelectorQuery();
  const oldIn = query.in;
  query.in = function newIn(component) {
    if (component.$scope) {
      return oldIn.call(this, component.$scope);
    }
    return oldIn.call(this, initComponentMocks(component));
  };
  return query;
}
const wx$2 = initWx();
if (!wx$2.getAppBaseInfo || !wx$2.getAppBaseInfo()) {
  wx$2.getAppBaseInfo = wx$2.getSystemInfoSync;
}
if (!wx$2.getWindowInfo || !wx$2.getWindowInfo()) {
  wx$2.getWindowInfo = wx$2.getSystemInfoSync;
}
if (!wx$2.getDeviceInfo || !wx$2.getDeviceInfo()) {
  wx$2.getDeviceInfo = wx$2.getSystemInfoSync;
}
let baseInfo = wx$2.getAppBaseInfo && wx$2.getAppBaseInfo();
if (!baseInfo) {
  baseInfo = wx$2.getSystemInfoSync();
}
const host = baseInfo ? baseInfo.host : null;
const shareVideoMessage = host && host.env === "SAAASDK" ? wx$2.miniapp.shareVideoMessage : wx$2.shareVideoMessage;
var shims = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  createSelectorQuery,
  getProvider,
  shareVideoMessage
});
const compressImage = {
  args(fromArgs, toArgs) {
    if (fromArgs.compressedHeight && !toArgs.compressHeight) {
      toArgs.compressHeight = fromArgs.compressedHeight;
    }
    if (fromArgs.compressedWidth && !toArgs.compressWidth) {
      toArgs.compressWidth = fromArgs.compressedWidth;
    }
  }
};
var protocols = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  compressImage,
  getAppAuthorizeSetting,
  getAppBaseInfo,
  getDeviceInfo,
  getSystemInfo: getSystemInfo$1,
  getSystemInfoSync,
  getWindowInfo,
  offError,
  onError,
  onSocketMessage,
  onSocketOpen,
  previewImage,
  redirectTo,
  showActionSheet
});
const wx$1 = initWx();
var index = initUni(shims, protocols, wx$1);
/**
* @dcloudio/uni-mp-vue v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function warn$2(msg, ...args) {
  console.warn(`[Vue warn] ${msg}`, ...args);
}
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    } else {
      warn$2(`cannot run an inactive effect scope.`);
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    activeEffectScope = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this._active) {
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect2, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect2);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
function onScopeDispose(fn) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn);
  } else {
    warn$2(
      `onScopeDispose() is called when there is no active effect scope to be associated with.`
    );
  }
}
let activeEffect;
class ReactiveEffect {
  constructor(fn, trigger2, scheduler, scope) {
    this.fn = fn;
    this.trigger = trigger2;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this._dirtyLevel = 4;
    this._trackId = 0;
    this._runnings = 0;
    this._shouldSchedule = false;
    this._depsLength = 0;
    recordEffectScope(this, scope);
  }
  get dirty() {
    if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
      this._dirtyLevel = 1;
      pauseTracking();
      for (let i = 0; i < this._depsLength; i++) {
        const dep = this.deps[i];
        if (dep.computed) {
          triggerComputed(dep.computed);
          if (this._dirtyLevel >= 4) {
            break;
          }
        }
      }
      if (this._dirtyLevel === 1) {
        this._dirtyLevel = 0;
      }
      resetTracking();
    }
    return this._dirtyLevel >= 4;
  }
  set dirty(v) {
    this._dirtyLevel = v ? 4 : 0;
  }
  run() {
    this._dirtyLevel = 0;
    if (!this.active) {
      return this.fn();
    }
    let lastShouldTrack = shouldTrack;
    let lastEffect = activeEffect;
    try {
      shouldTrack = true;
      activeEffect = this;
      this._runnings++;
      preCleanupEffect(this);
      return this.fn();
    } finally {
      postCleanupEffect(this);
      this._runnings--;
      activeEffect = lastEffect;
      shouldTrack = lastShouldTrack;
    }
  }
  stop() {
    var _a;
    if (this.active) {
      preCleanupEffect(this);
      postCleanupEffect(this);
      (_a = this.onStop) == null ? void 0 : _a.call(this);
      this.active = false;
    }
  }
}
function triggerComputed(computed2) {
  return computed2.value;
}
function preCleanupEffect(effect2) {
  effect2._trackId++;
  effect2._depsLength = 0;
}
function postCleanupEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanupDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanupDepEffect(dep, effect2) {
  const trackId = dep.get(effect2);
  if (trackId !== void 0 && effect2._trackId !== trackId) {
    dep.delete(effect2);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}
let shouldTrack = true;
let pauseScheduleStack = 0;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function pauseScheduling() {
  pauseScheduleStack++;
}
function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()();
  }
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
  var _a;
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
    {
      (_a = effect2.onTrack) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
    }
  }
}
const queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
  var _a;
  pauseScheduling();
  for (const effect2 of dep.keys()) {
    let tracking;
    if (effect2._dirtyLevel < dirtyLevel && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2._shouldSchedule || (effect2._shouldSchedule = effect2._dirtyLevel === 0);
      effect2._dirtyLevel = dirtyLevel;
    }
    if (effect2._shouldSchedule && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      {
        (_a = effect2.onTrigger) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
      }
      effect2.trigger();
      if ((!effect2._runnings || effect2.allowRecurse) && effect2._dirtyLevel !== 2) {
        effect2._shouldSchedule = false;
        if (effect2.scheduler) {
          queueEffectSchedulers.push(effect2.scheduler);
        }
      }
    }
  }
  resetScheduling();
}
const createDep = (cleanup, computed2) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.computed = computed2;
  return dep;
};
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol("iterate");
const MAP_KEY_ITERATE_KEY = Symbol("Map key iterate");
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
    }
    trackEffect(
      activeEffect,
      dep,
      {
        target,
        type,
        key
      }
    );
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$1(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  pauseScheduling();
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
        dep,
        4,
        {
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        }
      );
    }
  }
  resetScheduling();
}
function getDepFromReactive(object, key) {
  var _a;
  return (_a = targetMap.get(object)) == null ? void 0 : _a.get(key);
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      pauseScheduling();
      const res = toRaw(this)[key].apply(this, args);
      resetScheduling();
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty(key) {
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray$1(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    {
      warn$2(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
  deleteProperty(target, key) {
    {
      warn$2(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
  true
);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto2 = getProto(target);
  const hadKey = proto2.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get22 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get22.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value, oldValue);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get22 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get22 ? get22.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const oldTarget = isMap(target) ? new Map(target) : new Set(target);
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0, oldTarget);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn$2(
        `${capitalize(type)} operation ${key}failed: target is readonly.`,
        toRaw(this)
      );
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has2, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has2.call(target, rawKey)) {
    const type = toRawType(target);
    warn$2(
      `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$1(target)) {
    {
      warn$2(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;
const COMPUTED_SIDE_EFFECT_WARN = `Computed is still dirty after getter evaluation, likely because a computed is mutating its own dependency in its getter. State mutations in computed getters should be avoided.  Check the docs for more details: https://vuejs.org/guide/essentials/computed.html#getters-should-be-side-effect-free`;
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this.getter = getter;
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this["__v_isReadonly"] = false;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => triggerRefValue(
        this,
        this.effect._dirtyLevel === 2 ? 2 : 3
      )
    );
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self = toRaw(this);
    if ((!self._cacheable || self.effect.dirty) && hasChanged(self._value, self._value = self.effect.run())) {
      triggerRefValue(self, 4);
    }
    trackRefValue(self);
    if (self.effect._dirtyLevel >= 2) {
      if (this._warnRecursive) {
        warn$2(COMPUTED_SIDE_EFFECT_WARN, `

getter: `, this.getter);
      }
      triggerRefValue(self, 2);
    }
    return self._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
  // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
  get _dirty() {
    return this.effect.dirty;
  }
  set _dirty(v) {
    this.effect.dirty = v;
  }
  // #endregion
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction$1(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
      warn$2("Write operation failed: computed value is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
function trackRefValue(ref2) {
  var _a;
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    trackEffect(
      activeEffect,
      (_a = ref2.dep) != null ? _a : ref2.dep = createDep(
        () => ref2.dep = void 0,
        ref2 instanceof ComputedRefImpl ? ref2 : void 0
      ),
      {
        target: ref2,
        type: "get",
        key: "value"
      }
    );
  }
}
function triggerRefValue(ref2, dirtyLevel = 4, newVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    triggerEffects(
      dep,
      dirtyLevel,
      {
        target: ref2,
        type: "set",
        key: "value",
        newValue: newVal
      }
    );
  }
}
function isRef(r2) {
  return !!(r2 && r2.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this, 4, newVal);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
function toRefs(object) {
  if (!isProxy(object)) {
    warn$2(`toRefs() expects a reactive object but received a plain one.`);
  }
  const ret = isArray$1(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = propertyToRef(object, key);
  }
  return ret;
}
class ObjectRefImpl {
  constructor(_object, _key, _defaultValue) {
    this._object = _object;
    this._key = _key;
    this._defaultValue = _defaultValue;
    this.__v_isRef = true;
  }
  get value() {
    const val = this._object[this._key];
    return val === void 0 ? this._defaultValue : val;
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
  get dep() {
    return getDepFromReactive(toRaw(this._object), this._key);
  }
}
class GetterRefImpl {
  constructor(_getter) {
    this._getter = _getter;
    this.__v_isRef = true;
    this.__v_isReadonly = true;
  }
  get value() {
    return this._getter();
  }
}
function toRef(source, key, defaultValue) {
  if (isRef(source)) {
    return source;
  } else if (isFunction$1(source)) {
    return new GetterRefImpl(source);
  } else if (isObject$1(source) && arguments.length > 1) {
    return propertyToRef(source, key, defaultValue);
  } else {
    return ref(source);
  }
}
function propertyToRef(source, key, defaultValue) {
  const val = source[key];
  return isRef(val) ? val : new ObjectRefImpl(source, key, defaultValue);
}
const stack = [];
function pushWarningContext(vnode) {
  stack.push(vnode);
}
function popWarningContext() {
  stack.pop();
}
function warn$1(msg, ...args) {
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString$1(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction$1(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
const ErrorTypeStrings = {
  ["sp"]: "serverPrefetch hook",
  ["bc"]: "beforeCreate hook",
  ["c"]: "created hook",
  ["bm"]: "beforeMount hook",
  ["m"]: "mounted hook",
  ["bu"]: "beforeUpdate hook",
  ["u"]: "updated",
  ["bum"]: "beforeUnmount hook",
  ["um"]: "unmounted hook",
  ["a"]: "activated hook",
  ["da"]: "deactivated hook",
  ["ec"]: "errorCaptured hook",
  ["rtc"]: "renderTracked hook",
  ["rtg"]: "renderTriggered hook",
  [0]: "setup function",
  [1]: "render function",
  [2]: "watcher getter",
  [3]: "watcher callback",
  [4]: "watcher cleanup function",
  [5]: "native event handler",
  [6]: "component event handler",
  [7]: "vnode hook",
  [8]: "directive hook",
  [9]: "transition hook",
  [10]: "app errorHandler",
  [11]: "app warnHandler",
  [12]: "ref function",
  [13]: "async component loader",
  [14]: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://github.com/vuejs/core ."
};
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction$1(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise$2(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values = [];
  for (let i = 0; i < fn.length; i++) {
    values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
  }
  return values;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = ErrorTypeStrings[type] || type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(
        appErrorHandler,
        null,
        10,
        [err, exposedInstance, errorInfo]
      );
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    const info = ErrorTypeStrings[type] || type;
    if (contextVNode) {
      pushWarningContext(contextVNode);
    }
    warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
    if (contextVNode) {
      popWarningContext();
    }
    if (throwInDev) {
      console.error(err);
    } else {
      console.error(err);
    }
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick$1(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.pre) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!queue.length || !queue.includes(
    job,
    isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
  )) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function hasQueueJob(job) {
  return queue.indexOf(job) > -1;
}
function invalidateJob(job) {
  const i = queue.indexOf(job);
  if (i > flushIndex) {
    queue.splice(i, 1);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray$1(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(
      cb,
      cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
    )) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i = isFlushing ? flushIndex + 1 : 0) {
  {
    seen = seen || /* @__PURE__ */ new Map();
  }
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.pre) {
      if (checkRecursiveUpdates(seen, cb)) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      cb();
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    {
      seen = seen || /* @__PURE__ */ new Map();
    }
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      if (checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex])) {
        continue;
      }
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a, b) => {
  const diff2 = getId(a) - getId(b);
  if (diff2 === 0) {
    if (a.pre && !b.pre)
      return -1;
    if (b.pre && !a.pre)
      return 1;
  }
  return diff2;
};
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  {
    seen = seen || /* @__PURE__ */ new Map();
  }
  queue.sort(comparator);
  const check = (job) => checkRecursiveUpdates(seen, job);
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (check(job)) {
          continue;
        }
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs(seen);
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs(seen);
    }
  }
}
function checkRecursiveUpdates(seen, fn) {
  if (!seen.has(fn)) {
    seen.set(fn, 1);
  } else {
    const count = seen.get(fn);
    if (count > RECURSION_LIMIT) {
      const instance = fn.ownerInstance;
      const componentName = instance && getComponentName(instance.type);
      handleError(
        `Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
        null,
        10
      );
      return true;
    } else {
      seen.set(fn, count + 1);
    }
  }
}
let devtools;
let buffer = [];
let devtoolsNotInstalled = false;
function emit$1(event, ...args) {
  if (devtools) {
    devtools.emit(event, ...args);
  } else if (!devtoolsNotInstalled) {
    buffer.push({ event, args });
  }
}
function setDevtoolsHook(hook, target) {
  var _a, _b;
  devtools = hook;
  if (devtools) {
    devtools.enabled = true;
    buffer.forEach(({ event, args }) => devtools.emit(event, ...args));
    buffer = [];
  } else if (
    // handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== "undefined" && // some envs mock window but not fully
    window.HTMLElement && // also exclude jsdom
    !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))
  ) {
    const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
    replay.push((newHook) => {
      setDevtoolsHook(newHook, target);
    });
    setTimeout(() => {
      if (!devtools) {
        target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
        devtoolsNotInstalled = true;
        buffer = [];
      }
    }, 3e3);
  } else {
    devtoolsNotInstalled = true;
    buffer = [];
  }
}
function devtoolsInitApp(app, version2) {
  emit$1("app:init", app, version2, {
    Fragment,
    Text,
    Comment,
    Static
  });
}
const devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:added"
  /* COMPONENT_ADDED */
);
const devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:updated"
  /* COMPONENT_UPDATED */
);
const _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:removed"
  /* COMPONENT_REMOVED */
);
const devtoolsComponentRemoved = (component) => {
  if (devtools && typeof devtools.cleanupBuffer === "function" && // remove the component if it wasn't buffered
  !devtools.cleanupBuffer(component)) {
    _devtoolsComponentRemoved(component);
  }
};
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function createDevtoolsComponentHook(hook) {
  return (component) => {
    emit$1(
      hook,
      component.appContext.app,
      component.uid,
      // fixed by xxxxxx
      // 为 0 是 App，无 parent 是 Page 指向 App
      component.uid === 0 ? void 0 : component.parent ? component.parent.uid : 0,
      component
    );
  };
}
const devtoolsPerfStart = /* @__PURE__ */ createDevtoolsPerformanceHook(
  "perf:start"
  /* PERFORMANCE_START */
);
const devtoolsPerfEnd = /* @__PURE__ */ createDevtoolsPerformanceHook(
  "perf:end"
  /* PERFORMANCE_END */
);
function createDevtoolsPerformanceHook(hook) {
  return (component, type, time) => {
    emit$1(hook, component.appContext.app, component.uid, component, type, time);
  };
}
function devtoolsComponentEmit(component, event, params) {
  emit$1(
    "component:emit",
    component.appContext.app,
    component,
    event,
    params
  );
}
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  {
    const {
      emitsOptions,
      propsOptions: [propsOptions]
    } = instance;
    if (emitsOptions) {
      if (!(event in emitsOptions) && true) {
        if (!propsOptions || !(toHandlerKey(event) in propsOptions)) {
          warn$1(
            `Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(event)}" prop.`
          );
        }
      } else {
        const validator = emitsOptions[event];
        if (isFunction$1(validator)) {
          const isValid2 = validator(...rawArgs);
          if (!isValid2) {
            warn$1(
              `Invalid event arguments: event validation failed for event "${event}".`
            );
          }
        }
      }
    }
  }
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a) => isString$1(a) ? a.trim() : a);
    }
    if (number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  {
    devtoolsComponentEmit(instance, event, args);
  }
  {
    const lowerCaseEvent = event.toLowerCase();
    if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) {
      warn$1(
        `Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(
          instance,
          instance.type
        )} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(
          event
        )}" instead of "${event}".`
      );
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$1(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject$1(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  instance && instance.type.__scopeId || null;
  return prev;
}
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component2 = instance.type;
    {
      const selfName = getComponentName(
        Component2,
        false
      );
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component2;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type] || Component2[type], name) || // global registration
      resolve(instance.appContext[type], name)
    );
    if (!res && maybeSelfReference) {
      return Component2;
    }
    if (warnMissing && !res) {
      const extra = `
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.`;
      warn$1(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
    }
    return res;
  } else {
    warn$1(
      `resolve${capitalize(type.slice(0, -1))} can only be used in render() or setup().`
    );
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  if (!isFunction$1(cb)) {
    warn$1(
      `\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`
    );
  }
  return doWatch(source, cb, options);
}
function doWatch(source, cb, {
  immediate,
  deep,
  flush,
  once: once2,
  onTrack,
  onTrigger
} = EMPTY_OBJ) {
  if (cb && once2) {
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      unwatch();
    };
  }
  if (deep !== void 0 && typeof deep === "number") {
    warn$1(
      `watch() "deep" option with number value will be used as watch depth in future versions. Please use a boolean instead to avoid potential breakage.`
    );
  }
  if (!cb) {
    if (immediate !== void 0) {
      warn$1(
        `watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (deep !== void 0) {
      warn$1(
        `watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (once2 !== void 0) {
      warn$1(
        `watch() "once" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
  }
  const warnInvalidSource = (s2) => {
    warn$1(
      `Invalid watch source: `,
      s2,
      `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
    );
  };
  const instance = currentInstance;
  const reactiveGetter = (source2) => deep === true ? source2 : (
    // for deep: false, only traverse root-level properties
    traverse(source2, deep === false ? 1 : void 0)
  );
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray$1(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s2) => isReactive(s2) || isShallow(s2));
    getter = () => source.map((s2) => {
      if (isRef(s2)) {
        return s2.value;
      } else if (isReactive(s2)) {
        return reactiveGetter(s2);
      } else if (isFunction$1(s2)) {
        return callWithErrorHandling(s2, instance, 2);
      } else {
        warnInvalidSource(s2);
      }
    });
  } else if (isFunction$1(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(
          source,
          instance,
          3,
          [onCleanup]
        );
      };
    }
  } else {
    getter = NOOP;
    warnInvalidSource(source);
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect2.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
      cleanup = effect2.onStop = void 0;
    };
  };
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect2.active || !effect2.dirty) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect2.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect$1(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance)
      job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect2 = new ReactiveEffect(getter, NOOP, scheduler);
  const scope = getCurrentScope();
  const unwatch = () => {
    effect2.stop();
    if (scope) {
      remove(scope.effects, effect2);
    }
  };
  {
    effect2.onTrack = onTrack;
    effect2.onTrigger = onTrigger;
  }
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect$1(
      effect2.run.bind(effect2),
      instance && instance.suspense
    );
  } else {
    effect2.run();
  }
  return unwatch;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString$1(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction$1(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments2 = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments2.length && cur; i++) {
      cur = cur[segments2[i]];
    }
    return cur;
  };
}
function traverse(value, depth, currentDepth = 0, seen) {
  if (!isObject$1(value) || value["__v_skip"]) {
    return value;
  }
  if (depth && depth > 0) {
    if (currentDepth >= depth) {
      return value;
    }
    currentDepth++;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, depth, currentDepth, seen);
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, currentDepth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, currentDepth, seen);
    });
  } else if (isPlainObject$1(value)) {
    for (const key in value) {
      traverse(value[key], depth, currentDepth, seen);
    }
  }
  return value;
}
function validateDirectiveName(name) {
  if (isBuiltInDirective(name)) {
    warn$1("Do not use built-in directive ids as custom directive id: " + name);
  }
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render2, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction$1(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject$1(rootProps)) {
      warn$1(`root props passed to app.mount() must be an object.`);
      rootProps = null;
    }
    const context2 = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const app = context2.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context2,
      _instance: null,
      version: version$1,
      get config() {
        return context2.config;
      },
      set config(v) {
        {
          warn$1(
            `app.config cannot be replaced. Modify individual options instead.`
          );
        }
      },
      use(plugin2, ...options) {
        if (installedPlugins.has(plugin2)) {
          warn$1(`Plugin has already been applied to target app.`);
        } else if (plugin2 && isFunction$1(plugin2.install)) {
          installedPlugins.add(plugin2);
          plugin2.install(app, ...options);
        } else if (isFunction$1(plugin2)) {
          installedPlugins.add(plugin2);
          plugin2(app, ...options);
        } else {
          warn$1(
            `A plugin must either be a function or an object with an "install" function.`
          );
        }
        return app;
      },
      mixin(mixin) {
        {
          if (!context2.mixins.includes(mixin)) {
            context2.mixins.push(mixin);
          } else {
            warn$1(
              "Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : "")
            );
          }
        }
        return app;
      },
      component(name, component) {
        {
          validateComponentName(name, context2.config);
        }
        if (!component) {
          return context2.components[name];
        }
        if (context2.components[name]) {
          warn$1(`Component "${name}" has already been registered in target app.`);
        }
        context2.components[name] = component;
        return app;
      },
      directive(name, directive) {
        {
          validateDirectiveName(name);
        }
        if (!directive) {
          return context2.directives[name];
        }
        if (context2.directives[name]) {
          warn$1(`Directive "${name}" has already been registered in target app.`);
        }
        context2.directives[name] = directive;
        return app;
      },
      // fixed by xxxxxx
      mount() {
      },
      // fixed by xxxxxx
      unmount() {
      },
      provide(key, value) {
        if (key in context2.provides) {
          warn$1(
            `App already provides property with key "${String(key)}". It will be overwritten with the new value.`
          );
        }
        context2.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
function provide(key, value) {
  if (!currentInstance) {
    {
      warn$1(`provide() can only be used inside setup().`);
    }
  } else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
    if (currentInstance.type.mpType === "app") {
      currentInstance.appContext.app.provide(key, value);
    }
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance || currentApp) {
    const provides = instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : currentApp._context.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction$1(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else {
      warn$1(`injection "${String(key)}" not found.`);
    }
  } else {
    warn$1(`inject() can only be used inside setup() or functional components.`);
  }
}
function hasInjectionContext() {
  return !!(currentInstance || currentRenderingInstance || currentApp);
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction$1(options) ? (
    // #8326: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    if (isRootHook(type)) {
      target = target.root;
    }
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  } else {
    const apiName = toHandlerKey(
      (ErrorTypeStrings[type] || type.replace(/^on/, "")).replace(/ hook$/, "")
    );
    warn$1(
      `${apiName} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup().`
    );
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (
  // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
  (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args) => hook(...args), target)
);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook(
  "rtg"
);
const onRenderTracked = createHook(
  "rtc"
);
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const getPublicInstance = (i) => {
  if (!i)
    return null;
  if (isStatefulComponent(i))
    return getExposeProxy(i) || i.proxy;
  return getPublicInstance(i.parent);
};
function getComponentInternalInstance(i) {
  return i;
}
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    // fixed by xxxxxx
    $: getComponentInternalInstance,
    // fixed by xxxxxx vue-i18n 在 dev 模式，访问了 $el，故模拟一个假的
    // $el: i => i.vnode.el,
    $el: (i) => i.__$el || (i.__$el = {}),
    $data: (i) => i.data,
    $props: (i) => shallowReadonly(i.props),
    $attrs: (i) => shallowReadonly(i.attrs),
    $slots: (i) => shallowReadonly(i.slots),
    $refs: (i) => shallowReadonly(i.refs),
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      i.effect.dirty = true;
      queueJob(i.update);
    }),
    // $nextTick: i => i.n || (i.n = nextTick.bind(i.proxy!)),// fixed by xxxxxx
    $watch: (i) => instanceWatch.bind(i)
  })
);
const isReservedPrefix = (key) => key === "_" || key === "$";
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key === "__isVue") {
      return true;
    }
    let normalizedProps;
    if (key[0] !== "$") {
      const n2 = accessCache[key];
      if (n2 !== void 0) {
        switch (n2) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (
        // only cache other properties when instance has declared (thus stable)
        // props
        (normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)
      ) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      } else if (key === "$slots") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (instance.exposed && hasOwn(instance.exposed, key)) {
      return instance.exposed[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else if (currentRenderingInstance && (!isString$1(key) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    key.indexOf("__v") !== 0)) {
      if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) {
        warn$1(
          `Property ${JSON.stringify(
            key
          )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
        );
      } else if (instance === currentRenderingInstance) {
        warn$1(
          `Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`
        );
      }
    }
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (setupState.__isScriptSetup && hasOwn(setupState, key)) {
      warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
      return false;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      warn$1(
        `Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`
      );
      return false;
    } else {
      if (key in instance.appContext.config.globalProperties) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          value
        });
      } else {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, propsOptions }
  }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
{
  PublicInstanceProxyHandlers.ownKeys = (target) => {
    warn$1(
      `Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`
    );
    return Reflect.ownKeys(target);
  };
}
function createDevRenderContext(instance) {
  const target = {};
  Object.defineProperty(target, `_`, {
    configurable: true,
    enumerable: false,
    get: () => instance
  });
  Object.keys(publicPropertiesMap).forEach((key) => {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get: () => publicPropertiesMap[key](instance),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: NOOP
    });
  });
  return target;
}
function exposePropsOnRenderContext(instance) {
  const {
    ctx,
    propsOptions: [propsOptions]
  } = instance;
  if (propsOptions) {
    Object.keys(propsOptions).forEach((key) => {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => instance.props[key],
        set: NOOP
      });
    });
  }
}
function exposeSetupStateOnRenderContext(instance) {
  const { ctx, setupState } = instance;
  Object.keys(toRaw(setupState)).forEach((key) => {
    if (!setupState.__isScriptSetup) {
      if (isReservedPrefix(key[0])) {
        warn$1(
          `setup() return property ${JSON.stringify(
            key
          )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
        );
        return;
      }
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => setupState[key],
        set: NOOP
      });
    }
  });
}
function useSlots() {
  return getContext().slots;
}
function getContext() {
  const i = getCurrentInstance();
  if (!i) {
    warn$1(`useContext() called without active instance.`);
  }
  return i.setupContext || (i.setupContext = createSetupContext(i));
}
function normalizePropsOrEmits(props) {
  return isArray$1(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
function createDuplicateChecker() {
  const cache = /* @__PURE__ */ Object.create(null);
  return (type, key) => {
    if (cache[key]) {
      warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
    } else {
      cache[key] = type;
    }
  };
}
let shouldCacheAccess = true;
function applyOptions$1(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render: render2,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = createDuplicateChecker();
  {
    const [propsOptions] = instance.propsOptions;
    if (propsOptions) {
      for (const key in propsOptions) {
        checkDuplicateProperties("Props", key);
      }
    }
  }
  function initInjections() {
    if (injectOptions) {
      resolveInjections(injectOptions, ctx, checkDuplicateProperties);
    }
  }
  {
    initInjections();
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction$1(methodHandler)) {
        {
          Object.defineProperty(ctx, key, {
            value: methodHandler.bind(publicThis),
            configurable: true,
            enumerable: true,
            writable: true
          });
        }
        {
          checkDuplicateProperties("Methods", key);
        }
      } else {
        warn$1(
          `Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`
        );
      }
    }
  }
  if (dataOptions) {
    if (!isFunction$1(dataOptions)) {
      warn$1(
        `The data option must be a function. Plain object usage is no longer supported.`
      );
    }
    const data = dataOptions.call(publicThis, publicThis);
    if (isPromise$2(data)) {
      warn$1(
        `data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`
      );
    }
    if (!isObject$1(data)) {
      warn$1(`data() should return an object.`);
    } else {
      instance.data = reactive(data);
      {
        for (const key in data) {
          checkDuplicateProperties("Data", key);
          if (!isReservedPrefix(key[0])) {
            Object.defineProperty(ctx, key, {
              configurable: true,
              enumerable: true,
              get: () => data[key],
              set: NOOP
            });
          }
        }
      }
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get22 = isFunction$1(opt) ? opt.bind(publicThis, publicThis) : isFunction$1(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      if (get22 === NOOP) {
        warn$1(`Computed property "${key}" has no getter.`);
      }
      const set2 = !isFunction$1(opt) && isFunction$1(opt.set) ? opt.set.bind(publicThis) : () => {
        warn$1(
          `Write operation failed: computed property "${key}" is readonly.`
        );
      };
      const c2 = computed({
        get: get22,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c2.value,
        set: (v) => c2.value = v
      });
      {
        checkDuplicateProperties("Computed", key);
      }
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  function initProvides() {
    if (provideOptions) {
      const provides = isFunction$1(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
      Reflect.ownKeys(provides).forEach((key) => {
        provide(key, provides[key]);
      });
    }
  }
  {
    initProvides();
  }
  {
    if (created) {
      callHook$1(created, instance, "c");
    }
  }
  function registerLifecycleHook(register2, hook) {
    if (isArray$1(hook)) {
      hook.forEach((_hook) => register2(_hook.bind(publicThis)));
    } else if (hook) {
      register2(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$1(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render2 && instance.render === NOOP) {
    instance.render = render2;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
  if (instance.ctx.$onApplyOptions) {
    instance.ctx.$onApplyOptions(options, instance, publicThis);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray$1(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$1(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
    {
      checkDuplicateProperties("Inject", key);
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray$1(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString$1(raw)) {
    const handler = ctx[raw];
    if (isFunction$1(handler)) {
      watch(getter, handler);
    } else {
      warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
    }
  } else if (isFunction$1(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$1(raw)) {
    if (isArray$1(raw)) {
      raw.forEach((r2) => createWatcher(r2, ctx, publicThis, key));
    } else {
      const handler = isFunction$1(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction$1(handler)) {
        watch(getter, handler, raw);
      } else {
        warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
      }
    }
  } else {
    warn$1(`Invalid watch option: "${key}"`, raw);
  }
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m2) => mergeOptions(resolved, m2, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject$1(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m2) => mergeOptions(to, m2, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") {
      warn$1(
        `"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`
      );
    } else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray$1,
  created: mergeAsArray$1,
  beforeMount: mergeAsArray$1,
  mounted: mergeAsArray$1,
  beforeUpdate: mergeAsArray$1,
  updated: mergeAsArray$1,
  beforeDestroy: mergeAsArray$1,
  beforeUnmount: mergeAsArray$1,
  destroyed: mergeAsArray$1,
  unmounted: mergeAsArray$1,
  activated: mergeAsArray$1,
  deactivated: mergeAsArray$1,
  errorCaptured: mergeAsArray$1,
  serverPrefetch: mergeAsArray$1,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction$1(to) ? to.call(this, this) : to,
      isFunction$1(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray$1(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray$1(to) && isArray$1(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray$1(to[key], from[key]);
  }
  return merged;
}
function initProps$1(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  {
    validateProps(rawProps || {}, props, instance);
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function isInHmrContext(instance) {
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !isInHmrContext() && patchFlag > 0 && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = normalizeInheritAttrsValue(instance, key, value);
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue$1(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = normalizeInheritAttrsValue(instance, key, value);
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue$1(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance, "set", "$attrs");
  }
  {
    validateProps(rawProps || {}, props, instance);
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          {
            props[camelKey] = value;
          }
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = normalizeInheritAttrsValue(instance, key, value);
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue$1(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function normalizeInheritAttrsValue(instance, key, value) {
  return value;
}
function resolvePropValue$1(options, props, key, value, instance, isAbsent) {
  const result = _resolvePropValue(
    options,
    props,
    key,
    value,
    instance,
    isAbsent
  );
  return result;
}
function _resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction$1(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys)
        needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$1(raw)) {
    for (let i = 0; i < raw.length; i++) {
      if (!isString$1(raw[i])) {
        warn$1(`props must be strings when using array syntax.`, raw[i]);
      }
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    if (!isObject$1(raw)) {
      warn$1(`invalid props options`, raw);
    }
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction$1(opt) ? { type: opt } : extend({}, opt);
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[
            0
            /* shouldCast */
          ] = booleanIndex > -1;
          prop[
            1
            /* shouldCastTrue */
          ] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$1(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  } else {
    warn$1(`Invalid prop name: "${key}" is a reserved property.`);
  }
  return false;
}
function getType$1(ctor) {
  if (ctor === null) {
    return "null";
  }
  if (typeof ctor === "function") {
    return ctor.name || "";
  } else if (typeof ctor === "object") {
    const name = ctor.constructor && ctor.constructor.name;
    return name || "";
  }
  return "";
}
function isSameType(a, b) {
  return getType$1(a) === getType$1(b);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray$1(expectedTypes)) {
    return expectedTypes.findIndex((t2) => isSameType(t2, type));
  } else if (isFunction$1(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
function validateProps(rawProps, props, instance) {
  const resolvedValues = toRaw(props);
  const options = instance.propsOptions[0];
  for (const key in options) {
    let opt = options[key];
    if (opt == null)
      continue;
    validateProp(
      key,
      resolvedValues[key],
      opt,
      shallowReadonly(resolvedValues),
      !hasOwn(rawProps, key) && !hasOwn(rawProps, hyphenate(key))
    );
  }
}
function validateProp(name, value, prop, props, isAbsent) {
  const { type, required, validator, skipCheck } = prop;
  if (required && isAbsent) {
    warn$1('Missing required prop: "' + name + '"');
    return;
  }
  if (value == null && !required) {
    return;
  }
  if (type != null && type !== true && !skipCheck) {
    let isValid2 = false;
    const types = isArray$1(type) ? type : [type];
    const expectedTypes = [];
    for (let i = 0; i < types.length && !isValid2; i++) {
      const { valid, expectedType } = assertType(value, types[i]);
      expectedTypes.push(expectedType || "");
      isValid2 = valid;
    }
    if (!isValid2) {
      warn$1(getInvalidTypeMessage(name, value, expectedTypes));
      return;
    }
  }
  if (validator && !validator(value, props)) {
    warn$1('Invalid prop: custom validator check failed for prop "' + name + '".');
  }
}
const isSimpleType = /* @__PURE__ */ makeMap(
  "String,Number,Boolean,Function,Symbol,BigInt"
);
function assertType(value, type) {
  let valid;
  const expectedType = getType$1(type);
  if (isSimpleType(expectedType)) {
    const t2 = typeof value;
    valid = t2 === expectedType.toLowerCase();
    if (!valid && t2 === "object") {
      valid = value instanceof type;
    }
  } else if (expectedType === "Object") {
    valid = isObject$1(value);
  } else if (expectedType === "Array") {
    valid = isArray$1(value);
  } else if (expectedType === "null") {
    valid = value === null;
  } else {
    valid = value instanceof type;
  }
  return {
    valid,
    expectedType
  };
}
function getInvalidTypeMessage(name, value, expectedTypes) {
  if (expectedTypes.length === 0) {
    return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
  }
  let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  const expectedValue = styleValue(value, expectedType);
  const receivedValue = styleValue(value, receivedType);
  if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) {
    message += ` with value ${expectedValue}`;
  }
  message += `, got ${receivedType} `;
  if (isExplicable(receivedType)) {
    message += `with value ${receivedValue}.`;
  }
  return message;
}
function styleValue(value, type) {
  if (type === "String") {
    return `"${value}"`;
  } else if (type === "Number") {
    return `${Number(value)}`;
  } else {
    return `${value}`;
  }
}
function isExplicable(type) {
  const explicitTypes = ["string", "number", "boolean"];
  return explicitTypes.some((elem) => type.toLowerCase() === elem);
}
function isBoolean(...args) {
  return args.some((elem) => elem.toLowerCase() === "boolean");
}
let supported;
let perf;
function startMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) {
    perf.mark(`vue-${type}-${instance.uid}`);
  }
  {
    devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
  }
}
function endMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) {
    const startTag = `vue-${type}-${instance.uid}`;
    const endTag = startTag + `:end`;
    perf.mark(endTag);
    perf.measure(
      `<${formatComponentName(instance, instance.type)}> ${type}`,
      startTag,
      endTag
    );
    perf.clearMarks(startTag);
    perf.clearMarks(endTag);
  }
  {
    devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
  }
}
function isSupported() {
  if (supported !== void 0) {
    return supported;
  }
  if (typeof window !== "undefined" && window.performance) {
    supported = true;
    perf = window.performance;
  } else {
    supported = false;
  }
  return supported;
}
const queuePostRenderEffect$1 = queuePostFlushCb;
const Fragment = Symbol.for("v-fgt");
const Text = Symbol.for("v-txt");
const Comment = Symbol.for("v-cmt");
const Static = Symbol.for("v-stc");
function isVNode$1(value) {
  return value ? value.__v_isVNode === true : false;
}
const InternalObjectKey = `__vInternal`;
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend({}, props) : props;
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    attrsProxy: null,
    slotsProxy: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null,
    // fixed by xxxxxx 用于存储uni-app的元素缓存
    $uniElements: /* @__PURE__ */ new Map(),
    $templateUniElementRefs: [],
    $templateUniElementStyles: {},
    $eS: {},
    $eA: {}
  };
  {
    instance.ctx = createDevRenderContext(instance);
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  internalSetCurrentInstance = (i) => {
    currentInstance = i;
  };
  setInSSRSetupState = (v) => {
    isInSSRComponentSetup = v;
  };
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
const isBuiltInTag = /* @__PURE__ */ makeMap("slot,component");
function validateComponentName(name, { isNativeTag }) {
  if (isBuiltInTag(name) || isNativeTag(name)) {
    warn$1(
      "Do not use built-in or reserved HTML elements as component id: " + name
    );
  }
}
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isSSR && setInSSRSetupState(isSSR);
  const {
    props
    /*, children*/
  } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps$1(instance, props, isStateful, isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component2 = instance.type;
  {
    if (Component2.name) {
      validateComponentName(Component2.name, instance.appContext.config);
    }
    if (Component2.components) {
      const names = Object.keys(Component2.components);
      for (let i = 0; i < names.length; i++) {
        validateComponentName(names[i], instance.appContext.config);
      }
    }
    if (Component2.directives) {
      const names = Object.keys(Component2.directives);
      for (let i = 0; i < names.length; i++) {
        validateDirectiveName(names[i]);
      }
    }
    if (Component2.compilerOptions && isRuntimeOnly()) {
      warn$1(
        `"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`
      );
    }
  }
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  {
    exposePropsOnRenderContext(instance);
  }
  const { setup } = Component2;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        shallowReadonly(instance.props),
        setupContext
      ]
    );
    resetTracking();
    reset();
    if (isPromise$2(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      {
        warn$1(
          `setup() returned a Promise, but the version of Vue you are using does not support it yet.`
        );
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction$1(setupResult)) {
    {
      instance.render = setupResult;
    }
  } else if (isObject$1(setupResult)) {
    if (isVNode$1(setupResult)) {
      warn$1(
        `setup() should not return VNodes directly - return a render function instead.`
      );
    }
    {
      instance.devtoolsRawSetupState = setupResult;
    }
    instance.setupState = proxyRefs(setupResult);
    {
      exposeSetupStateOnRenderContext(instance);
    }
  } else if (setupResult !== void 0) {
    warn$1(
      `setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`
    );
  }
  finishComponentSetup(instance, isSSR);
}
const isRuntimeOnly = () => true;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component2 = instance.type;
  if (!instance.render) {
    instance.render = Component2.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions$1(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
  if (!Component2.render && instance.render === NOOP && !isSSR) {
    if (Component2.template) {
      warn$1(
        `Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
      );
    } else {
      warn$1(`Component is missing template or render function.`);
    }
  }
}
function getAttrsProxy(instance) {
  return instance.attrsProxy || (instance.attrsProxy = new Proxy(
    instance.attrs,
    {
      get(target, key) {
        track(instance, "get", "$attrs");
        return target[key];
      },
      set() {
        warn$1(`setupContext.attrs is readonly.`);
        return false;
      },
      deleteProperty() {
        warn$1(`setupContext.attrs is readonly.`);
        return false;
      }
    }
  ));
}
function getSlotsProxy(instance) {
  return instance.slotsProxy || (instance.slotsProxy = new Proxy(instance.slots, {
    get(target, key) {
      track(instance, "get", "$slots");
      return target[key];
    }
  }));
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    {
      if (instance.exposed) {
        warn$1(`expose() should be called only once per setup().`);
      }
      if (exposed != null) {
        let exposedType = typeof exposed;
        if (exposedType === "object") {
          if (isArray$1(exposed)) {
            exposedType = "array";
          } else if (isRef(exposed)) {
            exposedType = "ref";
          }
        }
        if (exposedType !== "object") {
          warn$1(
            `expose() should be passed a plain object, received ${exposedType}.`
          );
        }
      }
    }
    instance.exposed = exposed || {};
  };
  {
    return Object.freeze({
      get attrs() {
        return getAttrsProxy(instance);
      },
      get slots() {
        return getSlotsProxy(instance);
      },
      get emit() {
        return (event, ...args) => instance.emit(event, ...args);
      },
      expose
    });
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        }
        return instance.proxy[key];
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c2) => c2.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component2, includeInferred = true) {
  return isFunction$1(Component2) ? Component2.displayName || Component2.name : Component2.name || includeInferred && Component2.__name;
}
function formatComponentName(instance, Component2, isRoot = false) {
  let name = getComponentName(Component2);
  if (!name && Component2.__file) {
    const match = Component2.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component2) {
          return key;
        }
      }
    };
    name = inferFromRegistry(
      instance.components || instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
const computed = (getterOrOptions, debugOptions) => {
  const c2 = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  {
    const i = getCurrentInstance();
    if (i && i.appContext.config.warnRecursiveComputed) {
      c2._warnRecursive = true;
    }
  }
  return c2;
};
const version$1 = "3.4.21";
const warn = warn$1;
function unwrapper(target) {
  return unref(target);
}
const ARRAYTYPE = "[object Array]";
const OBJECTTYPE = "[object Object]";
function diff(current, pre) {
  const result = {};
  syncKeys(current, pre);
  _diff(current, pre, "", result);
  return result;
}
function syncKeys(current, pre) {
  current = unwrapper(current);
  if (current === pre)
    return;
  const rootCurrentType = toTypeString(current);
  const rootPreType = toTypeString(pre);
  if (rootCurrentType == OBJECTTYPE && rootPreType == OBJECTTYPE) {
    for (let key in pre) {
      const currentValue = current[key];
      if (currentValue === void 0) {
        current[key] = null;
      } else {
        syncKeys(currentValue, pre[key]);
      }
    }
  } else if (rootCurrentType == ARRAYTYPE && rootPreType == ARRAYTYPE) {
    if (current.length >= pre.length) {
      pre.forEach((item, index2) => {
        syncKeys(current[index2], item);
      });
    }
  }
}
function _diff(current, pre, path, result) {
  current = unwrapper(current);
  if (current === pre)
    return;
  const rootCurrentType = toTypeString(current);
  const rootPreType = toTypeString(pre);
  if (rootCurrentType == OBJECTTYPE) {
    if (rootPreType != OBJECTTYPE || Object.keys(current).length < Object.keys(pre).length) {
      setResult(result, path, current);
    } else {
      for (let key in current) {
        const currentValue = unwrapper(current[key]);
        const preValue = pre[key];
        const currentType = toTypeString(currentValue);
        const preType = toTypeString(preValue);
        if (currentType != ARRAYTYPE && currentType != OBJECTTYPE) {
          if (currentValue != preValue) {
            setResult(
              result,
              (path == "" ? "" : path + ".") + key,
              currentValue
            );
          }
        } else if (currentType == ARRAYTYPE) {
          if (preType != ARRAYTYPE) {
            setResult(
              result,
              (path == "" ? "" : path + ".") + key,
              currentValue
            );
          } else {
            if (currentValue.length < preValue.length) {
              setResult(
                result,
                (path == "" ? "" : path + ".") + key,
                currentValue
              );
            } else {
              currentValue.forEach((item, index2) => {
                _diff(
                  item,
                  preValue[index2],
                  (path == "" ? "" : path + ".") + key + "[" + index2 + "]",
                  result
                );
              });
            }
          }
        } else if (currentType == OBJECTTYPE) {
          if (preType != OBJECTTYPE || Object.keys(currentValue).length < Object.keys(preValue).length) {
            setResult(
              result,
              (path == "" ? "" : path + ".") + key,
              currentValue
            );
          } else {
            for (let subKey in currentValue) {
              _diff(
                currentValue[subKey],
                preValue[subKey],
                (path == "" ? "" : path + ".") + key + "." + subKey,
                result
              );
            }
          }
        }
      }
    }
  } else if (rootCurrentType == ARRAYTYPE) {
    if (rootPreType != ARRAYTYPE) {
      setResult(result, path, current);
    } else {
      if (current.length < pre.length) {
        setResult(result, path, current);
      } else {
        current.forEach((item, index2) => {
          _diff(item, pre[index2], path + "[" + index2 + "]", result);
        });
      }
    }
  } else {
    setResult(result, path, current);
  }
}
function setResult(result, k, v) {
  result[k] = v;
}
function hasComponentEffect(instance) {
  return queue.includes(instance.update);
}
function flushCallbacks(instance) {
  const ctx = instance.ctx;
  const callbacks = ctx.__next_tick_callbacks;
  if (callbacks && callbacks.length) {
    const copies = callbacks.slice(0);
    callbacks.length = 0;
    for (let i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }
}
function nextTick(instance, fn) {
  const ctx = instance.ctx;
  if (!ctx.__next_tick_pending && !hasComponentEffect(instance)) {
    return nextTick$1(fn && fn.bind(instance.proxy));
  }
  let _resolve;
  if (!ctx.__next_tick_callbacks) {
    ctx.__next_tick_callbacks = [];
  }
  ctx.__next_tick_callbacks.push(() => {
    if (fn) {
      callWithErrorHandling(
        fn.bind(instance.proxy),
        instance,
        14
      );
    } else if (_resolve) {
      _resolve(instance.proxy);
    }
  });
  return new Promise((resolve2) => {
    _resolve = resolve2;
  });
}
function clone(src, seen) {
  src = unwrapper(src);
  const type = typeof src;
  if (type === "object" && src !== null) {
    let copy = seen.get(src);
    if (typeof copy !== "undefined") {
      return copy;
    }
    if (isArray$1(src)) {
      const len = src.length;
      copy = new Array(len);
      seen.set(src, copy);
      for (let i = 0; i < len; i++) {
        copy[i] = clone(src[i], seen);
      }
    } else {
      copy = {};
      seen.set(src, copy);
      for (const name in src) {
        if (hasOwn(src, name)) {
          copy[name] = clone(src[name], seen);
        }
      }
    }
    return copy;
  }
  if (type !== "symbol") {
    return src;
  }
}
function deepCopy(src) {
  return clone(src, typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : /* @__PURE__ */ new Map());
}
function getMPInstanceData(instance, keys) {
  const data = instance.data;
  const ret = /* @__PURE__ */ Object.create(null);
  keys.forEach((key) => {
    ret[key] = data[key];
  });
  return ret;
}
function patch(instance, data, oldData) {
  if (!data) {
    return;
  }
  data = deepCopy(data);
  data.$eS = instance.$eS || {};
  data.$eA = instance.$eA || {};
  const ctx = instance.ctx;
  const mpType = ctx.mpType;
  if (mpType === "page" || mpType === "component") {
    data.r0 = 1;
    const mpInstance = ctx.$scope;
    const keys = Object.keys(data);
    const diffData = diff(data, getMPInstanceData(mpInstance, keys));
    if (Object.keys(diffData).length) {
      ctx.__next_tick_pending = true;
      mpInstance.setData(diffData, () => {
        ctx.__next_tick_pending = false;
        flushCallbacks(instance);
      });
      flushPreFlushCbs();
    } else {
      flushCallbacks(instance);
    }
  }
}
function initAppConfig(appConfig) {
  appConfig.globalProperties.$nextTick = function $nextTick(fn) {
    return nextTick(this.$, fn);
  };
}
function onApplyOptions(options, instance, publicThis) {
  instance.appContext.config.globalProperties.$applyOptions(
    options,
    instance,
    publicThis
  );
  const computedOptions = options.computed;
  if (computedOptions) {
    const keys = Object.keys(computedOptions);
    if (keys.length) {
      const ctx = instance.ctx;
      if (!ctx.$computedKeys) {
        ctx.$computedKeys = [];
      }
      ctx.$computedKeys.push(...keys);
    }
  }
  delete instance.ctx.$onApplyOptions;
}
function setRef$1(instance, isUnmount = false) {
  const {
    setupState,
    $templateRefs,
    $templateUniElementRefs,
    ctx: { $scope, $mpPlatform }
  } = instance;
  if (!$scope || !$templateRefs && !$templateUniElementRefs) {
    return;
  }
  if (isUnmount) {
    if ($mpPlatform !== "mp-alipay") {
      $templateRefs && $templateRefs.forEach(
        (templateRef) => setTemplateRef(templateRef, null, setupState)
      );
    }
    $templateUniElementRefs && $templateUniElementRefs.forEach(
      (templateRef) => setTemplateRef(templateRef, null, setupState)
    );
    return;
  }
  const check = $mpPlatform === "mp-baidu" || $mpPlatform === "mp-toutiao";
  const doSetByRefs = (refs) => {
    if (refs.length === 0) {
      return [];
    }
    const mpComponents = (
      // 字节小程序 selectAllComponents 可能返回 null
      // https://github.com/dcloudio/uni-app/issues/3954
      ($scope.selectAllComponents(".r") || []).concat(
        $scope.selectAllComponents(".r-i-f") || []
      )
    );
    return refs.filter((templateRef) => {
      const refValue = findComponentPublicInstance(mpComponents, templateRef.i);
      if (check && refValue === null) {
        return true;
      }
      setTemplateRef(templateRef, refValue, setupState);
      return false;
    });
  };
  const doSet = () => {
    if ($templateRefs) {
      const refs = doSetByRefs($templateRefs);
      if (refs.length && instance.proxy && instance.proxy.$scope) {
        instance.proxy.$scope.setData({ r1: 1 }, () => {
          doSetByRefs(refs);
        });
      }
    }
  };
  if ($mpPlatform !== "mp-alipay") {
    if ($scope._$setRef) {
      $scope._$setRef(doSet);
    } else {
      nextTick(instance, doSet);
    }
  }
  if ($templateUniElementRefs && $templateUniElementRefs.length) {
    nextTick(instance, () => {
      $templateUniElementRefs.forEach((templateRef) => {
        if (isArray$1(templateRef.v)) {
          templateRef.v.forEach((v) => {
            setTemplateRef(templateRef, v, setupState);
          });
        } else {
          setTemplateRef(templateRef, templateRef.v, setupState);
        }
      });
    });
  }
}
function toSkip(value) {
  if (isObject$1(value)) {
    markRaw(value);
  }
  return value;
}
function findComponentPublicInstance(mpComponents, id) {
  const mpInstance = mpComponents.find(
    (com) => com && (com.properties || com.props).uI === id
  );
  if (mpInstance) {
    const vm = mpInstance.$vm;
    if (vm) {
      return getExposeProxy(vm.$) || vm;
    }
    return toSkip(mpInstance);
  }
  return null;
}
function setTemplateRef({ r: r2, f: f2 }, refValue, setupState) {
  if (isFunction$1(r2)) {
    r2(refValue, {});
  } else {
    const _isString = isString$1(r2);
    const _isRef = isRef(r2);
    if (_isString || _isRef) {
      if (f2) {
        if (!_isRef) {
          return;
        }
        if (!isArray$1(r2.value)) {
          r2.value = [];
        }
        const existing = r2.value;
        if (existing.indexOf(refValue) === -1) {
          existing.push(refValue);
          if (!refValue) {
            return;
          }
          if (refValue.$) {
            onBeforeUnmount(() => remove(existing, refValue), refValue.$);
          }
        }
      } else if (_isString) {
        if (hasOwn(setupState, r2)) {
          setupState[r2] = refValue;
        }
      } else if (isRef(r2)) {
        r2.value = refValue;
      } else {
        warnRef(r2);
      }
    } else {
      warnRef(r2);
    }
  }
}
function warnRef(ref2) {
  warn("Invalid template ref type:", ref2, `(${typeof ref2})`);
}
const queuePostRenderEffect = queuePostFlushCb;
function mountComponent(initialVNode, options) {
  const instance = initialVNode.component = createComponentInstance(initialVNode, options.parentComponent, null);
  instance.renderer = options.mpType ? options.mpType : "component";
  {
    instance.ctx.$onApplyOptions = onApplyOptions;
    instance.ctx.$children = [];
  }
  if (options.mpType === "app") {
    instance.render = NOOP;
  }
  if (options.onBeforeSetup) {
    options.onBeforeSetup(instance, options);
  }
  {
    pushWarningContext(initialVNode);
    startMeasure(instance, `mount`);
  }
  {
    startMeasure(instance, `init`);
  }
  setupComponent(instance);
  {
    endMeasure(instance, `init`);
  }
  {
    if (options.parentComponent && instance.proxy) {
      options.parentComponent.ctx.$children.push(getExposeProxy(instance) || instance.proxy);
    }
  }
  setupRenderEffect(instance);
  {
    popWarningContext();
    endMeasure(instance, `mount`);
  }
  return instance.proxy;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
function clearTemplateRefs(templateRefs) {
  if (!templateRefs) {
    return [];
  }
  return templateRefs.filter((templateRef) => {
    const v = templateRef.v;
    if (v && typeof v === "object" && ["UNI-LOADING-ELEMENT", "UNI-CLOUD-DB-ELEMENT"].includes(v.nodeName)) {
      return true;
    }
    return false;
  });
}
function renderComponentRoot(instance) {
  const {
    type: Component2,
    vnode,
    proxy,
    withProxy,
    props,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render: render2,
    renderCache,
    data,
    setupState,
    ctx,
    uid: uid2,
    appContext: {
      app: {
        config: {
          globalProperties: { pruneComponentPropsCache: pruneComponentPropsCache2 }
        }
      }
    },
    inheritAttrs
  } = instance;
  instance.$uniElementIds = /* @__PURE__ */ new Map();
  instance.$templateRefs = clearTemplateRefs(
    instance.$templateRefs || []
  );
  instance.$templateUniElementRefs = clearTemplateRefs(
    instance.$templateUniElementRefs || []
  );
  instance.$templateUniElementStyles = {};
  instance.$ei = 0;
  pruneComponentPropsCache2(uid2);
  instance.__counter = instance.__counter === 0 ? 1 : 0;
  let result;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      fallthroughAttrs(inheritAttrs, props, propsOptions, attrs);
      const proxyToUse = withProxy || proxy;
      result = render2.call(
        proxyToUse,
        proxyToUse,
        renderCache,
        props,
        setupState,
        data,
        ctx
      );
    } else {
      fallthroughAttrs(
        inheritAttrs,
        props,
        propsOptions,
        Component2.props ? attrs : getFunctionalFallthrough(attrs)
      );
      const render22 = Component2;
      result = render22.length > 1 ? render22(props, { attrs, slots, emit: emit2 }) : render22(
        props,
        null
        /* we know it doesn't need it */
      );
    }
  } catch (err) {
    handleError(err, instance, 1);
    result = false;
  }
  setRef$1(instance);
  setCurrentRenderingInstance(prev);
  return result;
}
function fallthroughAttrs(inheritAttrs, props, propsOptions, fallthroughAttrs2) {
  if (props && fallthroughAttrs2 && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs2).filter(
      (key) => key !== "class" && key !== "style"
    );
    if (!keys.length) {
      return;
    }
    if (propsOptions && keys.some(isModelListener)) {
      keys.forEach((key) => {
        if (!isModelListener(key) || !(key.slice(9) in propsOptions)) {
          props[key] = fallthroughAttrs2[key];
        }
      });
    } else {
      keys.forEach((key) => props[key] = fallthroughAttrs2[key]);
    }
  }
}
const updateComponentPreRender = (instance) => {
  pauseTracking();
  flushPreFlushCbs();
  resetTracking();
};
function componentUpdateScopedSlotsFn() {
  const scopedSlotsData = this.$scopedSlotsData;
  if (!scopedSlotsData || scopedSlotsData.length === 0) {
    return;
  }
  const mpInstance = this.ctx.$scope;
  const oldData = mpInstance.data;
  const diffData = /* @__PURE__ */ Object.create(null);
  scopedSlotsData.forEach(({ path, index: index2, data }) => {
    const oldScopedSlotData = getValueByDataPath(oldData, path);
    const diffPath = isString$1(index2) ? `${path}.${index2}` : `${path}[${index2}]`;
    if (typeof oldScopedSlotData === "undefined" || typeof oldScopedSlotData[index2] === "undefined") {
      diffData[diffPath] = data;
    } else {
      const diffScopedSlotData = diff(
        data,
        oldScopedSlotData[index2]
      );
      Object.keys(diffScopedSlotData).forEach((name) => {
        diffData[diffPath + "." + name] = diffScopedSlotData[name];
      });
    }
  });
  scopedSlotsData.length = 0;
  if (Object.keys(diffData).length) {
    mpInstance.setData(diffData);
  }
}
function toggleRecurse({ effect: effect2, update: update3 }, allowed) {
  effect2.allowRecurse = update3.allowRecurse = allowed;
}
function setupRenderEffect(instance) {
  const updateScopedSlots = componentUpdateScopedSlotsFn.bind(
    instance
  );
  instance.$updateScopedSlots = () => nextTick$1(() => queueJob(updateScopedSlots));
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      onBeforeUnmount(() => {
        setRef$1(instance, true);
      }, instance);
      {
        startMeasure(instance, `patch`);
      }
      patch(instance, renderComponentRoot(instance));
      {
        endMeasure(instance, `patch`);
      }
      {
        devtoolsComponentAdded(instance);
      }
    } else {
      const { next, bu, u } = instance;
      {
        pushWarningContext(next || instance.vnode);
      }
      toggleRecurse(instance, false);
      updateComponentPreRender();
      if (bu) {
        invokeArrayFns$1(bu);
      }
      toggleRecurse(instance, true);
      {
        startMeasure(instance, `patch`);
      }
      patch(instance, renderComponentRoot(instance));
      {
        endMeasure(instance, `patch`);
      }
      if (u) {
        queuePostRenderEffect(u);
      }
      {
        devtoolsComponentUpdated(instance);
      }
      {
        popWarningContext();
      }
    }
  };
  const effect2 = instance.effect = new ReactiveEffect(
    componentUpdateFn,
    NOOP,
    () => queueJob(update3),
    instance.scope
    // track it in component's effect scope
  );
  const update3 = instance.update = () => {
    if (effect2.dirty) {
      effect2.run();
    }
  };
  update3.id = instance.uid;
  toggleRecurse(instance, true);
  {
    effect2.onTrack = instance.rtc ? (e2) => invokeArrayFns$1(instance.rtc, e2) : void 0;
    effect2.onTrigger = instance.rtg ? (e2) => invokeArrayFns$1(instance.rtg, e2) : void 0;
    update3.ownerInstance = instance;
  }
  {
    update3();
  }
}
function unmountComponent(instance) {
  const { bum, scope, update: update3, um } = instance;
  if (bum) {
    invokeArrayFns$1(bum);
  }
  {
    const parentInstance = instance.parent;
    if (parentInstance) {
      const $children = parentInstance.ctx.$children;
      const target = getExposeProxy(instance) || instance.proxy;
      const index2 = $children.indexOf(target);
      if (index2 > -1) {
        $children.splice(index2, 1);
      }
    }
  }
  scope.stop();
  if (update3) {
    update3.active = false;
  }
  if (um) {
    queuePostRenderEffect(um);
  }
  queuePostRenderEffect(() => {
    instance.isUnmounted = true;
  });
  {
    devtoolsComponentRemoved(instance);
  }
}
const oldCreateApp = createAppAPI();
function getTarget() {
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  if (typeof my !== "undefined") {
    return my;
  }
}
function createVueApp(rootComponent, rootProps = null) {
  const target = getTarget();
  target.__VUE__ = true;
  {
    setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
  }
  const app = oldCreateApp(rootComponent, rootProps);
  const appContext = app._context;
  initAppConfig(appContext.config);
  const createVNode2 = (initialVNode) => {
    initialVNode.appContext = appContext;
    initialVNode.shapeFlag = 6;
    return initialVNode;
  };
  const createComponent2 = function createComponent22(initialVNode, options) {
    return mountComponent(createVNode2(initialVNode), options);
  };
  const destroyComponent = function destroyComponent2(component) {
    return component && unmountComponent(component.$);
  };
  app.mount = function mount() {
    rootComponent.render = NOOP;
    const instance = mountComponent(
      createVNode2({ type: rootComponent }),
      {
        mpType: "app",
        mpInstance: null,
        parentComponent: null,
        slots: [],
        props: null
      }
    );
    app._instance = instance.$;
    {
      devtoolsInitApp(app, version$1);
    }
    instance.$app = app;
    instance.$createComponent = createComponent2;
    instance.$destroyComponent = destroyComponent;
    appContext.$appInstance = instance;
    return instance;
  };
  app.unmount = function unmount() {
    warn(`Cannot unmount an app.`);
  };
  return app;
}
function useCssVars(getter) {
  const instance = getCurrentInstance();
  if (!instance) {
    warn(`useCssVars is called without current active component instance.`);
    return;
  }
  initCssVarsRender(instance, getter);
}
function initCssVarsRender(instance, getter) {
  instance.ctx.__cssVars = () => {
    const vars = getter(instance.proxy);
    const cssVars = {};
    for (const key in vars) {
      cssVars[`--${key}`] = vars[key];
    }
    return cssVars;
  };
}
function injectLifecycleHook(name, hook, publicThis, instance) {
  if (isFunction$1(hook)) {
    injectHook(name, hook.bind(publicThis), instance);
  }
}
function initHooks$1(options, instance, publicThis) {
  const mpType = options.mpType || publicThis.$mpType;
  if (!mpType || mpType === "component" || // instance.renderer 标识页面是否作为组件渲染
  mpType === "page" && instance.renderer === "component") {
    return;
  }
  Object.keys(options).forEach((name) => {
    if (isUniLifecycleHook(name, options[name], false)) {
      const hooks = options[name];
      if (isArray$1(hooks)) {
        hooks.forEach((hook) => injectLifecycleHook(name, hook, publicThis, instance));
      } else {
        injectLifecycleHook(name, hooks, publicThis, instance);
      }
    }
  });
}
function applyOptions$2(options, instance, publicThis) {
  initHooks$1(options, instance, publicThis);
}
function set$2(target, key, val) {
  return target[key] = val;
}
function $callMethod(method, ...args) {
  const fn = this[method];
  if (fn) {
    return fn(...args);
  }
  console.error(`method ${method} not found`);
  return null;
}
function createErrorHandler(app) {
  const userErrorHandler = app.config.errorHandler;
  return function errorHandler(err, instance, info) {
    if (userErrorHandler) {
      userErrorHandler(err, instance, info);
    }
    const appInstance = app._instance;
    if (!appInstance || !appInstance.proxy) {
      throw err;
    }
    if (appInstance[ON_ERROR]) {
      {
        appInstance.proxy.$callHook(ON_ERROR, err);
      }
    } else {
      logError(err, info, instance ? instance.$.vnode : null, false);
    }
  };
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function initOptionMergeStrategies(optionMergeStrategies) {
  UniLifecycleHooks.forEach((name) => {
    optionMergeStrategies[name] = mergeAsArray;
  });
}
let realAtob;
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const b64re = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
if (typeof atob !== "function") {
  realAtob = function(str) {
    str = String(str).replace(/[\t\n\f\r ]+/g, "");
    if (!b64re.test(str)) {
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    }
    str += "==".slice(2 - (str.length & 3));
    var bitmap;
    var result = "";
    var r1;
    var r2;
    var i = 0;
    for (; i < str.length; ) {
      bitmap = b64.indexOf(str.charAt(i++)) << 18 | b64.indexOf(str.charAt(i++)) << 12 | (r1 = b64.indexOf(str.charAt(i++))) << 6 | (r2 = b64.indexOf(str.charAt(i++)));
      result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255) : r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255) : String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
    }
    return result;
  };
} else {
  realAtob = atob;
}
function b64DecodeUnicode(str) {
  return decodeURIComponent(realAtob(str).split("").map(function(c2) {
    return "%" + ("00" + c2.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
}
function getCurrentUserInfo() {
  const token = index.getStorageSync("uni_id_token") || "";
  const tokenArr = token.split(".");
  if (!token || tokenArr.length !== 3) {
    return {
      uid: null,
      role: [],
      permission: [],
      tokenExpired: 0
    };
  }
  let userInfo;
  try {
    userInfo = JSON.parse(b64DecodeUnicode(tokenArr[1]));
  } catch (error) {
    throw new Error("获取当前用户信息出错，详细错误信息为：" + error.message);
  }
  userInfo.tokenExpired = userInfo.exp * 1e3;
  delete userInfo.exp;
  delete userInfo.iat;
  return userInfo;
}
function uniIdMixin(globalProperties) {
  globalProperties.uniIDHasRole = function(roleId) {
    const { role } = getCurrentUserInfo();
    return role.indexOf(roleId) > -1;
  };
  globalProperties.uniIDHasPermission = function(permissionId) {
    const { permission } = getCurrentUserInfo();
    return this.uniIDHasRole("admin") || permission.indexOf(permissionId) > -1;
  };
  globalProperties.uniIDTokenValid = function() {
    const { tokenExpired } = getCurrentUserInfo();
    return tokenExpired > Date.now();
  };
}
function initApp(app) {
  const appConfig = app.config;
  appConfig.errorHandler = invokeCreateErrorHandler(app, createErrorHandler);
  initOptionMergeStrategies(appConfig.optionMergeStrategies);
  const globalProperties = appConfig.globalProperties;
  {
    uniIdMixin(globalProperties);
  }
  {
    globalProperties.$set = set$2;
    globalProperties.$applyOptions = applyOptions$2;
    globalProperties.$callMethod = $callMethod;
  }
  {
    index.invokeCreateVueAppHook(app);
  }
}
const propsCaches = /* @__PURE__ */ Object.create(null);
function renderProps(props) {
  const { uid: uid2, __counter } = getCurrentInstance();
  const propsId = (propsCaches[uid2] || (propsCaches[uid2] = [])).push(guardReactiveProps(props)) - 1;
  return uid2 + "," + propsId + "," + __counter;
}
function pruneComponentPropsCache(uid2) {
  delete propsCaches[uid2];
}
function findComponentPropsData(up) {
  if (!up) {
    return;
  }
  const [uid2, propsId] = up.split(",");
  if (!propsCaches[uid2]) {
    return;
  }
  return propsCaches[uid2][parseInt(propsId)];
}
var plugin = {
  install(app) {
    initApp(app);
    app.config.globalProperties.pruneComponentPropsCache = pruneComponentPropsCache;
    const oldMount = app.mount;
    app.mount = function mount(rootContainer) {
      const instance = oldMount.call(app, rootContainer);
      const createApp2 = getCreateApp();
      if (createApp2) {
        createApp2(instance);
      } else {
        if (typeof createMiniProgramApp !== "undefined") {
          createMiniProgramApp(instance);
        }
      }
      return instance;
    };
  }
};
function getCreateApp() {
  const method = "createApp";
  if (typeof global !== "undefined" && typeof global[method] !== "undefined") {
    return global[method];
  } else if (typeof my !== "undefined") {
    return my[method];
  }
}
function stringifyStyle(value) {
  if (isString$1(value)) {
    return value;
  }
  return stringify(normalizeStyle(value));
}
function stringify(styles) {
  let ret = "";
  if (!styles || isString$1(styles)) {
    return ret;
  }
  for (const key in styles) {
    ret += `${key.startsWith(`--`) ? key : hyphenate(key)}:${styles[key]};`;
  }
  return ret;
}
function vOn(value, key) {
  const instance = getCurrentInstance();
  const ctx = instance.ctx;
  const extraKey = typeof key !== "undefined" && (ctx.$mpPlatform === "mp-weixin" || ctx.$mpPlatform === "mp-qq" || ctx.$mpPlatform === "mp-xhs") && (isString$1(key) || typeof key === "number") ? "_" + key : "";
  const name = "e" + instance.$ei++ + extraKey;
  const mpInstance = ctx.$scope;
  if (!value) {
    delete mpInstance[name];
    return name;
  }
  const existingInvoker = mpInstance[name];
  if (existingInvoker) {
    existingInvoker.value = value;
  } else {
    mpInstance[name] = createInvoker(value, instance);
  }
  return name;
}
function createInvoker(initialValue, instance) {
  const invoker = (e2) => {
    patchMPEvent(e2);
    let args = [e2];
    if (instance && instance.ctx.$getTriggerEventDetail) {
      if (typeof e2.detail === "number") {
        e2.detail = instance.ctx.$getTriggerEventDetail(e2.detail);
      }
    }
    if (e2.detail && e2.detail.__args__) {
      args = e2.detail.__args__;
    }
    const eventValue = invoker.value;
    const invoke = () => callWithAsyncErrorHandling(patchStopImmediatePropagation(e2, eventValue), instance, 5, args);
    const eventTarget = e2.target;
    const eventSync = eventTarget ? eventTarget.dataset ? String(eventTarget.dataset.eventsync) === "true" : false : false;
    if (bubbles.includes(e2.type) && !eventSync) {
      setTimeout(invoke);
    } else {
      const res = invoke();
      if (e2.type === "input" && (isArray$1(res) || isPromise$2(res))) {
        return;
      }
      return res;
    }
  };
  invoker.value = initialValue;
  return invoker;
}
const bubbles = [
  // touch事件暂不做延迟，否则在 Android 上会影响性能，比如一些拖拽跟手手势等
  // 'touchstart',
  // 'touchmove',
  // 'touchcancel',
  // 'touchend',
  "tap",
  "longpress",
  "longtap",
  "transitionend",
  "animationstart",
  "animationiteration",
  "animationend",
  "touchforcechange"
];
function patchMPEvent(event, instance) {
  if (event.type && event.target) {
    event.preventDefault = NOOP;
    event.stopPropagation = NOOP;
    event.stopImmediatePropagation = NOOP;
    if (!hasOwn(event, "detail")) {
      event.detail = {};
    }
    if (hasOwn(event, "markerId")) {
      event.detail = typeof event.detail === "object" ? event.detail : {};
      event.detail.markerId = event.markerId;
    }
    if (isPlainObject$1(event.detail) && hasOwn(event.detail, "checked") && !hasOwn(event.detail, "value")) {
      event.detail.value = event.detail.checked;
    }
    if (isPlainObject$1(event.detail)) {
      event.target = extend({}, event.target, event.detail);
    }
  }
}
function patchStopImmediatePropagation(e2, value) {
  if (isArray$1(value)) {
    const originalStop = e2.stopImmediatePropagation;
    e2.stopImmediatePropagation = () => {
      originalStop && originalStop.call(e2);
      e2._stopped = true;
    };
    return value.map((fn) => (e3) => !e3._stopped && fn(e3));
  } else {
    return value;
  }
}
function vFor(source, renderItem) {
  let ret;
  if (isArray$1(source) || isString$1(source)) {
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(source[i], i, i);
    }
  } else if (typeof source === "number") {
    if (!Number.isInteger(source)) {
      warn(`The v-for range expect an integer value but got ${source}.`);
      return [];
    }
    ret = new Array(source);
    for (let i = 0; i < source; i++) {
      ret[i] = renderItem(i + 1, i, i);
    }
  } else if (isObject$1(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(source, (item, i) => renderItem(item, i, i));
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}
function setRef(ref2, id, opts = {}) {
  const { $templateRefs } = getCurrentInstance();
  $templateRefs.push({ i: id, r: ref2, k: opts.k, f: opts.f });
}
const o = (value, key) => vOn(value, key);
const f = (source, renderItem) => vFor(source, renderItem);
const s = (value) => stringifyStyle(value);
const e = (target, ...sources) => extend(target, ...sources);
const n = (value) => normalizeClass(value);
const t = (val) => toDisplayString(val);
const p = (props) => renderProps(props);
const sr = (ref2, id, opts) => setRef(ref2, id, opts);
function createApp$1(rootComponent, rootProps = null) {
  rootComponent && (rootComponent.mpType = "app");
  return createVueApp(rootComponent, rootProps).use(plugin);
}
const createSSRApp = createApp$1;
function initVueIds(vueIds, mpInstance) {
  if (!vueIds) {
    return;
  }
  const ids = vueIds.split(",");
  const len = ids.length;
  if (len === 1) {
    mpInstance._$vueId = ids[0];
  } else if (len === 2) {
    mpInstance._$vueId = ids[0];
    mpInstance._$vuePid = ids[1];
  }
}
const EXTRAS = ["externalClasses"];
function initExtraOptions(miniProgramComponentOptions, vueOptions) {
  EXTRAS.forEach((name) => {
    if (hasOwn(vueOptions, name)) {
      miniProgramComponentOptions[name] = vueOptions[name];
    }
  });
}
const WORKLET_RE = /_(.*)_worklet_factory_/;
function initWorkletMethods(mpMethods, vueMethods) {
  if (vueMethods) {
    Object.keys(vueMethods).forEach((name) => {
      const matches = name.match(WORKLET_RE);
      if (matches) {
        const workletName = matches[1];
        mpMethods[name] = vueMethods[name];
        mpMethods[workletName] = vueMethods[workletName];
      }
    });
  }
}
function initWxsCallMethods(methods, wxsCallMethods) {
  if (!isArray$1(wxsCallMethods)) {
    return;
  }
  wxsCallMethods.forEach((callMethod) => {
    methods[callMethod] = function(args) {
      return this.$vm[callMethod](args);
    };
  });
}
function selectAllComponents(mpInstance, selector, $refs) {
  const components = mpInstance.selectAllComponents(selector);
  components.forEach((component) => {
    const ref2 = component.properties.uR;
    $refs[ref2] = component.$vm || component;
  });
}
function initRefs(instance, mpInstance) {
  Object.defineProperty(instance, "refs", {
    get() {
      const $refs = {};
      selectAllComponents(mpInstance, ".r", $refs);
      const forComponents = mpInstance.selectAllComponents(".r-i-f");
      forComponents.forEach((component) => {
        const ref2 = component.properties.uR;
        if (!ref2) {
          return;
        }
        if (!$refs[ref2]) {
          $refs[ref2] = [];
        }
        $refs[ref2].push(component.$vm || component);
      });
      return $refs;
    }
  });
}
function findVmByVueId(instance, vuePid) {
  const $children = instance.$children;
  for (let i = $children.length - 1; i >= 0; i--) {
    const childVm = $children[i];
    if (childVm.$scope._$vueId === vuePid) {
      return childVm;
    }
  }
  let parentVm;
  for (let i = $children.length - 1; i >= 0; i--) {
    parentVm = findVmByVueId($children[i], vuePid);
    if (parentVm) {
      return parentVm;
    }
  }
}
function getLocaleLanguage() {
  var _a;
  let localeLanguage = "";
  {
    const appBaseInfo = ((_a = wx.getAppBaseInfo) === null || _a === void 0 ? void 0 : _a.call(wx)) || wx.getSystemInfoSync();
    const language = appBaseInfo && appBaseInfo.language ? appBaseInfo.language : LOCALE_EN;
    localeLanguage = normalizeLocale(language) || LOCALE_EN;
  }
  return localeLanguage;
}
const MP_METHODS = [
  "createSelectorQuery",
  "createIntersectionObserver",
  "selectAllComponents",
  "selectComponent"
];
function createEmitFn(oldEmit, ctx) {
  return function emit2(event, ...args) {
    const scope = ctx.$scope;
    if (scope && event) {
      const detail = { __args__: args };
      {
        scope.triggerEvent(event, detail);
      }
    }
    return oldEmit.apply(this, [event, ...args]);
  };
}
function initBaseInstance(instance, options) {
  const ctx = instance.ctx;
  ctx.mpType = options.mpType;
  ctx.$mpType = options.mpType;
  ctx.$mpPlatform = "mp-weixin";
  ctx.$scope = options.mpInstance;
  {
    Object.defineProperties(ctx, {
      // only id
      [VIRTUAL_HOST_ID]: {
        get() {
          const id = this.$scope.data[VIRTUAL_HOST_ID];
          return id === void 0 ? "" : id;
        }
      }
    });
  }
  ctx.$mp = {};
  {
    ctx._self = {};
  }
  instance.slots = {};
  if (isArray$1(options.slots) && options.slots.length) {
    options.slots.forEach((name) => {
      instance.slots[name] = true;
    });
    if (instance.slots[SLOT_DEFAULT_NAME]) {
      instance.slots.default = true;
    }
  }
  ctx.getOpenerEventChannel = function() {
    {
      return options.mpInstance.getOpenerEventChannel();
    }
  };
  ctx.$hasHook = hasHook;
  ctx.$callHook = callHook;
  instance.emit = createEmitFn(instance.emit, ctx);
}
function initComponentInstance(instance, options) {
  initBaseInstance(instance, options);
  const ctx = instance.ctx;
  MP_METHODS.forEach((method) => {
    ctx[method] = function(...args) {
      const mpInstance = ctx.$scope;
      if (mpInstance && mpInstance[method]) {
        return mpInstance[method].apply(mpInstance, args);
      }
    };
  });
}
function initMocks(instance, mpInstance, mocks2) {
  const ctx = instance.ctx;
  mocks2.forEach((mock) => {
    if (hasOwn(mpInstance, mock)) {
      instance[mock] = ctx[mock] = mpInstance[mock];
    }
  });
}
function hasHook(name) {
  const hooks = this.$[name];
  if (hooks && hooks.length) {
    return true;
  }
  return false;
}
function callHook(name, args) {
  if (name === "mounted") {
    callHook.call(this, "bm");
    this.$.isMounted = true;
    name = "m";
  }
  const hooks = this.$[name];
  return hooks && invokeArrayFns(hooks, args);
}
const PAGE_INIT_HOOKS = [
  ON_LOAD,
  ON_SHOW,
  ON_HIDE,
  ON_UNLOAD,
  ON_RESIZE,
  ON_TAB_ITEM_TAP,
  ON_REACH_BOTTOM,
  ON_PULL_DOWN_REFRESH,
  ON_ADD_TO_FAVORITES
  // 'onReady', // lifetimes.ready
  // 'onPageScroll', // 影响性能，开发者手动注册
  // 'onShareTimeline', // 右上角菜单，开发者手动注册
  // 'onShareAppMessage' // 右上角菜单，开发者手动注册
];
function findHooks(vueOptions, hooks = /* @__PURE__ */ new Set()) {
  if (vueOptions) {
    Object.keys(vueOptions).forEach((name) => {
      if (isUniLifecycleHook(name, vueOptions[name])) {
        hooks.add(name);
      }
    });
    {
      const { extends: extendsOptions, mixins } = vueOptions;
      if (mixins) {
        mixins.forEach((mixin) => findHooks(mixin, hooks));
      }
      if (extendsOptions) {
        findHooks(extendsOptions, hooks);
      }
    }
  }
  return hooks;
}
function initHook(mpOptions, hook, excludes) {
  if (excludes.indexOf(hook) === -1 && !hasOwn(mpOptions, hook)) {
    mpOptions[hook] = function(args) {
      return this.$vm && this.$vm.$callHook(hook, args);
    };
  }
}
const EXCLUDE_HOOKS = [ON_READY];
function initHooks(mpOptions, hooks, excludes = EXCLUDE_HOOKS) {
  hooks.forEach((hook) => initHook(mpOptions, hook, excludes));
}
function initUnknownHooks(mpOptions, vueOptions, excludes = EXCLUDE_HOOKS) {
  findHooks(vueOptions).forEach((hook) => initHook(mpOptions, hook, excludes));
}
function initRuntimeHooks(mpOptions, runtimeHooks) {
  if (!runtimeHooks) {
    return;
  }
  const hooks = Object.keys(MINI_PROGRAM_PAGE_RUNTIME_HOOKS);
  hooks.forEach((hook) => {
    if (runtimeHooks & MINI_PROGRAM_PAGE_RUNTIME_HOOKS[hook]) {
      initHook(mpOptions, hook, []);
    }
  });
}
const findMixinRuntimeHooks = /* @__PURE__ */ once(() => {
  const runtimeHooks = [];
  const app = isFunction$1(getApp) && getApp({ allowDefault: true });
  if (app && app.$vm && app.$vm.$) {
    const mixins = app.$vm.$.appContext.mixins;
    if (isArray$1(mixins)) {
      const hooks = Object.keys(MINI_PROGRAM_PAGE_RUNTIME_HOOKS);
      mixins.forEach((mixin) => {
        hooks.forEach((hook) => {
          if (hasOwn(mixin, hook) && !runtimeHooks.includes(hook)) {
            runtimeHooks.push(hook);
          }
        });
      });
    }
  }
  return runtimeHooks;
});
function initMixinRuntimeHooks(mpOptions) {
  initHooks(mpOptions, findMixinRuntimeHooks());
}
const HOOKS = [
  ON_SHOW,
  ON_HIDE,
  ON_ERROR,
  ON_THEME_CHANGE,
  ON_PAGE_NOT_FOUND,
  ON_UNHANDLE_REJECTION
];
function parseApp(instance, parseAppOptions) {
  const internalInstance = instance.$;
  const appOptions = {
    globalData: instance.$options && instance.$options.globalData || {},
    $vm: instance,
    // mp-alipay 组件 data 初始化比 onLaunch 早，提前挂载
    onLaunch(options) {
      this.$vm = instance;
      const ctx = internalInstance.ctx;
      if (this.$vm && ctx.$scope && ctx.$callHook) {
        return;
      }
      initBaseInstance(internalInstance, {
        mpType: "app",
        mpInstance: this,
        slots: []
      });
      ctx.globalData = this.globalData;
      instance.$callHook(ON_LAUNCH, options);
    }
  };
  const onErrorHandlers = wx.$onErrorHandlers;
  if (onErrorHandlers) {
    onErrorHandlers.forEach((fn) => {
      injectHook(ON_ERROR, fn, internalInstance);
    });
    onErrorHandlers.length = 0;
  }
  initLocale(instance);
  const vueOptions = instance.$.type;
  initHooks(appOptions, HOOKS);
  initUnknownHooks(appOptions, vueOptions);
  {
    const methods = vueOptions.methods;
    methods && extend(appOptions, methods);
  }
  return appOptions;
}
function initCreateApp(parseAppOptions) {
  return function createApp2(vm) {
    return App(parseApp(vm));
  };
}
function initCreateSubpackageApp(parseAppOptions) {
  return function createApp2(vm) {
    const appOptions = parseApp(vm);
    const app = isFunction$1(getApp) && getApp({
      allowDefault: true
    });
    if (!app)
      return;
    vm.$.ctx.$scope = app;
    const globalData = app.globalData;
    if (globalData) {
      Object.keys(appOptions.globalData).forEach((name) => {
        if (!hasOwn(globalData, name)) {
          globalData[name] = appOptions.globalData[name];
        }
      });
    }
    Object.keys(appOptions).forEach((name) => {
      if (!hasOwn(app, name)) {
        app[name] = appOptions[name];
      }
    });
    initAppLifecycle(appOptions, vm);
  };
}
function initAppLifecycle(appOptions, vm) {
  if (isFunction$1(appOptions.onLaunch)) {
    const args = wx.getLaunchOptionsSync && wx.getLaunchOptionsSync();
    appOptions.onLaunch(args);
  }
  if (isFunction$1(appOptions.onShow) && wx.onAppShow) {
    wx.onAppShow((args) => {
      vm.$callHook("onShow", args);
    });
  }
  if (isFunction$1(appOptions.onHide) && wx.onAppHide) {
    wx.onAppHide((args) => {
      vm.$callHook("onHide", args);
    });
  }
}
function initLocale(appVm) {
  const locale = ref(getLocaleLanguage());
  Object.defineProperty(appVm, "$locale", {
    get() {
      return locale.value;
    },
    set(v) {
      locale.value = v;
    }
  });
}
const builtInProps = [
  // 百度小程序,快手小程序自定义组件不支持绑定动态事件，动态dataset，故通过props传递事件信息
  // event-opts
  "eO",
  // 组件 ref
  "uR",
  // 组件 ref-in-for
  "uRIF",
  // 组件 id
  "uI",
  // 组件类型 m: 小程序组件
  "uT",
  // 组件 props
  "uP",
  // 小程序不能直接定义 $slots 的 props，所以通过 vueSlots 转换到 $slots
  "uS"
];
function initDefaultProps(options, isBehavior = false) {
  const properties = {};
  if (!isBehavior) {
    let observerSlots = function(newVal) {
      const $slots = /* @__PURE__ */ Object.create(null);
      newVal && newVal.forEach((slotName) => {
        $slots[slotName] = true;
      });
      this.setData({
        $slots
      });
    };
    builtInProps.forEach((name) => {
      properties[name] = {
        type: null,
        value: ""
      };
    });
    properties.uS = {
      type: null,
      value: []
    };
    {
      properties.uS.observer = observerSlots;
    }
  }
  if (options.behaviors) {
    if (options.behaviors.includes("wx://form-field")) {
      if (!options.properties || !options.properties.name) {
        properties.name = {
          type: null,
          value: ""
        };
      }
      if (!options.properties || !options.properties.value) {
        properties.value = {
          type: null,
          value: ""
        };
      }
    }
  }
  return properties;
}
function initVirtualHostProps(options) {
  const properties = {};
  {
    if (options && options.virtualHost) {
      properties[VIRTUAL_HOST_STYLE] = {
        type: null,
        value: ""
      };
      properties[VIRTUAL_HOST_CLASS] = {
        type: null,
        value: ""
      };
      properties[VIRTUAL_HOST_HIDDEN] = {
        type: null,
        value: ""
      };
      properties[VIRTUAL_HOST_ID] = {
        type: null,
        value: ""
      };
    }
  }
  return properties;
}
function initProps(mpComponentOptions) {
  if (!mpComponentOptions.properties) {
    mpComponentOptions.properties = {};
  }
  extend(mpComponentOptions.properties, initDefaultProps(mpComponentOptions), initVirtualHostProps(mpComponentOptions.options));
}
const PROP_TYPES = [String, Number, Boolean, Object, Array, null];
function parsePropType(type, defaultValue) {
  if (isArray$1(type) && type.length === 1) {
    return type[0];
  }
  return type;
}
function normalizePropType(type, defaultValue) {
  const res = parsePropType(type);
  return PROP_TYPES.indexOf(res) !== -1 ? res : null;
}
function initPageProps({ properties }, rawProps) {
  if (isArray$1(rawProps)) {
    rawProps.forEach((key) => {
      properties[key] = {
        type: String,
        value: ""
      };
    });
  } else if (isPlainObject$1(rawProps)) {
    Object.keys(rawProps).forEach((key) => {
      const opts = rawProps[key];
      if (isPlainObject$1(opts)) {
        let value = opts.default;
        if (isFunction$1(value)) {
          value = value();
        }
        const type = opts.type;
        opts.type = normalizePropType(type);
        properties[key] = {
          type: opts.type,
          value
        };
      } else {
        properties[key] = {
          type: normalizePropType(opts)
        };
      }
    });
  }
}
function findPropsData(properties, isPage2) {
  return (isPage2 ? findPagePropsData(properties) : findComponentPropsData(resolvePropValue(properties.uP))) || {};
}
function findPagePropsData(properties) {
  const propsData = {};
  if (isPlainObject$1(properties)) {
    Object.keys(properties).forEach((name) => {
      if (builtInProps.indexOf(name) === -1) {
        propsData[name] = resolvePropValue(properties[name]);
      }
    });
  }
  return propsData;
}
function initFormField(vm) {
  const vueOptions = vm.$options;
  if (isArray$1(vueOptions.behaviors) && vueOptions.behaviors.includes("uni://form-field")) {
    vm.$watch("modelValue", () => {
      vm.$scope && vm.$scope.setData({
        name: vm.name,
        value: vm.modelValue
      });
    }, {
      immediate: true
    });
  }
}
function resolvePropValue(prop) {
  return prop;
}
function initData(_) {
  return {};
}
function initPropsObserver(componentOptions) {
  const observe = function observe2() {
    const up = this.properties.uP;
    if (!up) {
      return;
    }
    if (this.$vm) {
      updateComponentProps(resolvePropValue(up), this.$vm.$);
    } else if (resolvePropValue(this.properties.uT) === "m") {
      updateMiniProgramComponentProperties(resolvePropValue(up), this);
    } else
      ;
  };
  {
    if (!componentOptions.observers) {
      componentOptions.observers = {};
    }
    componentOptions.observers.uP = observe;
  }
}
function updateMiniProgramComponentProperties(up, mpInstance) {
  const prevProps = mpInstance.properties;
  const nextProps = findComponentPropsData(up) || {};
  if (hasPropsChanged(prevProps, nextProps, false)) {
    mpInstance.setData(nextProps);
  }
}
function updateComponentProps(up, instance) {
  const prevProps = toRaw(instance.props);
  const nextProps = findComponentPropsData(up) || {};
  if (hasPropsChanged(prevProps, nextProps)) {
    updateProps(instance, nextProps, prevProps);
    if (hasQueueJob(instance.update)) {
      invalidateJob(instance.update);
    }
    {
      instance.update();
    }
  }
}
function hasPropsChanged(prevProps, nextProps, checkLen = true) {
  const nextKeys = Object.keys(nextProps);
  if (checkLen && nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
function initBehaviors(vueOptions) {
  const vueBehaviors = vueOptions.behaviors;
  let vueProps = vueOptions.props;
  if (!vueProps) {
    vueOptions.props = vueProps = [];
  }
  const behaviors = [];
  if (isArray$1(vueBehaviors)) {
    vueBehaviors.forEach((behavior) => {
      behaviors.push(behavior.replace("uni://", "wx://"));
      if (behavior === "uni://form-field") {
        if (isArray$1(vueProps)) {
          vueProps.push("name");
          vueProps.push("modelValue");
        } else {
          vueProps.name = {
            type: String,
            default: ""
          };
          vueProps.modelValue = {
            type: [String, Number, Boolean, Array, Object, Date],
            default: ""
          };
        }
      }
    });
  }
  return behaviors;
}
function applyOptions(componentOptions, vueOptions) {
  componentOptions.data = initData();
  componentOptions.behaviors = initBehaviors(vueOptions);
}
function parseComponent(vueOptions, { parse, mocks: mocks2, isPage: isPage2, isPageInProject, initRelation: initRelation2, handleLink: handleLink2, initLifetimes: initLifetimes2 }) {
  vueOptions = vueOptions.default || vueOptions;
  const options = {
    multipleSlots: true,
    // styleIsolation: 'apply-shared',
    addGlobalClass: true,
    pureDataPattern: /^uP$/
  };
  if (isArray$1(vueOptions.mixins)) {
    vueOptions.mixins.forEach((item) => {
      if (isObject$1(item.options)) {
        extend(options, item.options);
      }
    });
  }
  if (vueOptions.options) {
    extend(options, vueOptions.options);
  }
  const mpComponentOptions = {
    options,
    lifetimes: initLifetimes2({ mocks: mocks2, isPage: isPage2, initRelation: initRelation2, vueOptions }),
    pageLifetimes: {
      show() {
        this.$vm && this.$vm.$callHook("onPageShow");
      },
      hide() {
        this.$vm && this.$vm.$callHook("onPageHide");
      },
      resize(size2) {
        this.$vm && this.$vm.$callHook("onPageResize", size2);
      }
    },
    methods: {
      __l: handleLink2
    }
  };
  {
    applyOptions(mpComponentOptions, vueOptions);
  }
  initProps(mpComponentOptions);
  initPropsObserver(mpComponentOptions);
  initExtraOptions(mpComponentOptions, vueOptions);
  initWxsCallMethods(mpComponentOptions.methods, vueOptions.wxsCallMethods);
  {
    initWorkletMethods(mpComponentOptions.methods, vueOptions.methods);
  }
  if (parse) {
    parse(mpComponentOptions, { handleLink: handleLink2 });
  }
  return mpComponentOptions;
}
function initCreateComponent(parseOptions2) {
  return function createComponent2(vueComponentOptions) {
    return Component(parseComponent(vueComponentOptions, parseOptions2));
  };
}
let $createComponentFn;
let $destroyComponentFn;
function getAppVm() {
  return getApp().$vm;
}
function $createComponent(initialVNode, options) {
  if (!$createComponentFn) {
    $createComponentFn = getAppVm().$createComponent;
  }
  const proxy = $createComponentFn(initialVNode, options);
  return getExposeProxy(proxy.$) || proxy;
}
function $destroyComponent(instance) {
  if (!$destroyComponentFn) {
    $destroyComponentFn = getAppVm().$destroyComponent;
  }
  return $destroyComponentFn(instance);
}
function parsePage(vueOptions, parseOptions2) {
  const { parse, mocks: mocks2, isPage: isPage2, initRelation: initRelation2, handleLink: handleLink2, initLifetimes: initLifetimes2 } = parseOptions2;
  const miniProgramPageOptions = parseComponent(vueOptions, {
    mocks: mocks2,
    isPage: isPage2,
    isPageInProject: true,
    initRelation: initRelation2,
    handleLink: handleLink2,
    initLifetimes: initLifetimes2
  });
  initPageProps(miniProgramPageOptions, (vueOptions.default || vueOptions).props);
  const methods = miniProgramPageOptions.methods;
  methods.onLoad = function(query) {
    {
      this.options = query;
    }
    this.$page = {
      fullPath: addLeadingSlash(this.route + stringifyQuery(query))
    };
    return this.$vm && this.$vm.$callHook(ON_LOAD, query);
  };
  initHooks(methods, PAGE_INIT_HOOKS);
  {
    initUnknownHooks(methods, vueOptions);
  }
  initRuntimeHooks(methods, vueOptions.__runtimeHooks);
  initMixinRuntimeHooks(methods);
  parse && parse(miniProgramPageOptions, { handleLink: handleLink2 });
  return miniProgramPageOptions;
}
function initCreatePage(parseOptions2) {
  return function createPage2(vuePageOptions) {
    return Component(parsePage(vuePageOptions, parseOptions2));
  };
}
function initCreatePluginApp(parseAppOptions) {
  return function createApp2(vm) {
    initAppLifecycle(parseApp(vm), vm);
  };
}
const MPPage = Page;
const MPComponent = Component;
function initTriggerEvent(mpInstance) {
  const oldTriggerEvent = mpInstance.triggerEvent;
  const newTriggerEvent = function(event, ...args) {
    return oldTriggerEvent.apply(mpInstance, [
      customizeEvent(event),
      ...args
    ]);
  };
  try {
    mpInstance.triggerEvent = newTriggerEvent;
  } catch (error) {
    mpInstance._triggerEvent = newTriggerEvent;
  }
}
function initMiniProgramHook(name, options, isComponent) {
  const oldHook = options[name];
  if (!oldHook) {
    options[name] = function() {
      initTriggerEvent(this);
    };
  } else {
    options[name] = function(...args) {
      initTriggerEvent(this);
      return oldHook.apply(this, args);
    };
  }
}
Page = function(options) {
  initMiniProgramHook(ON_LOAD, options);
  return MPPage(options);
};
Component = function(options) {
  initMiniProgramHook("created", options);
  const isVueComponent = options.properties && options.properties.uP;
  if (!isVueComponent) {
    initProps(options);
    initPropsObserver(options);
  }
  return MPComponent(options);
};
function initLifetimes({ mocks: mocks2, isPage: isPage2, initRelation: initRelation2, vueOptions }) {
  return {
    attached() {
      let properties = this.properties;
      initVueIds(properties.uI, this);
      const relationOptions = {
        vuePid: this._$vuePid
      };
      initRelation2(this, relationOptions);
      const mpInstance = this;
      const isMiniProgramPage = isPage2(mpInstance);
      let propsData = properties;
      this.$vm = $createComponent({
        type: vueOptions,
        props: findPropsData(propsData, isMiniProgramPage)
      }, {
        mpType: isMiniProgramPage ? "page" : "component",
        mpInstance,
        slots: properties.uS || {},
        // vueSlots
        parentComponent: relationOptions.parent && relationOptions.parent.$,
        onBeforeSetup(instance, options) {
          initRefs(instance, mpInstance);
          initMocks(instance, mpInstance, mocks2);
          initComponentInstance(instance, options);
        }
      });
      if (!isMiniProgramPage) {
        initFormField(this.$vm);
      }
    },
    ready() {
      if (this.$vm) {
        {
          this.$vm.$callHook("mounted");
          this.$vm.$callHook(ON_READY);
        }
      }
    },
    detached() {
      if (this.$vm) {
        pruneComponentPropsCache(this.$vm.$.uid);
        $destroyComponent(this.$vm);
      }
    }
  };
}
const mocks = ["__route__", "__wxExparserNodeId__", "__wxWebviewId__"];
function isPage(mpInstance) {
  return !!mpInstance.route;
}
function initRelation(mpInstance, detail) {
  mpInstance.triggerEvent("__l", detail);
}
function handleLink(event) {
  const detail = event.detail || event.value;
  const vuePid = detail.vuePid;
  let parentVm;
  if (vuePid) {
    parentVm = findVmByVueId(this.$vm, vuePid);
  }
  if (!parentVm) {
    parentVm = this.$vm;
  }
  detail.parent = parentVm;
}
var parseOptions = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  handleLink,
  initLifetimes,
  initRelation,
  isPage,
  mocks
});
const createApp = initCreateApp();
const createPage = initCreatePage(parseOptions);
const createComponent = initCreateComponent(parseOptions);
const createPluginApp = initCreatePluginApp();
const createSubpackageApp = initCreateSubpackageApp();
{
  wx.createApp = global.createApp = createApp;
  wx.createPage = createPage;
  wx.createComponent = createComponent;
  wx.createPluginApp = global.createPluginApp = createPluginApp;
  wx.createSubpackageApp = global.createSubpackageApp = createSubpackageApp;
}
function set(target, key, val) {
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  target[key] = val;
  return val;
}
function del(target, key) {
  if (Array.isArray(target)) {
    target.splice(key, 1);
    return;
  }
  delete target[key];
}
/*!
 * pinia v2.1.7
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */
let activePinia;
const setActivePinia = (pinia) => activePinia = pinia;
const piniaSymbol = Symbol("pinia");
function isPlainObject(o2) {
  return o2 && typeof o2 === "object" && Object.prototype.toString.call(o2) === "[object Object]" && typeof o2.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
const IS_CLIENT = typeof window !== "undefined";
const USE_DEVTOOLS = IS_CLIENT;
const componentStateTypes = [];
const getStoreType = (id) => "🍍 " + id;
function addStoreToDevtools(app, store) {
  if (!componentStateTypes.includes(getStoreType(store.$id))) {
    componentStateTypes.push(getStoreType(store.$id));
  }
}
function patchActionForGrouping(store, actionNames, wrapWithProxy) {
  const actions = actionNames.reduce((storeActions, actionName) => {
    storeActions[actionName] = toRaw(store)[actionName];
    return storeActions;
  }, {});
  for (const actionName in actions) {
    store[actionName] = function() {
      const trackedStore = wrapWithProxy ? new Proxy(store, {
        get(...args) {
          return Reflect.get(...args);
        },
        set(...args) {
          return Reflect.set(...args);
        }
      }) : store;
      const retValue = actions[actionName].apply(trackedStore, arguments);
      return retValue;
    };
  }
}
function devtoolsPlugin({ app, store, options }) {
  if (store.$id.startsWith("__hot:")) {
    return;
  }
  store._isOptionsAPI = !!options.state;
  patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
  const originalHotUpdate = store._hotUpdate;
  toRaw(store)._hotUpdate = function(newStore) {
    originalHotUpdate.apply(this, arguments);
    patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
  };
  addStoreToDevtools(
    app,
    // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
    store
  );
}
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia = markRaw({
    install(app) {
      setActivePinia(pinia);
      {
        pinia._a = app;
        app.provide(piniaSymbol, pinia);
        app.config.globalProperties.$pinia = pinia;
        toBeInstalled.forEach((plugin2) => _p.push(plugin2));
        toBeInstalled = [];
      }
    },
    use(plugin2) {
      if (!this._a && true) {
        toBeInstalled.push(plugin2);
      } else {
        _p.push(plugin2);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
    pinia.use(devtoolsPlugin);
  }
  return pinia;
}
function patchObject(newState, oldState) {
  for (const key in oldState) {
    const subPatch = oldState[key];
    if (!(key in newState)) {
      continue;
    }
    const targetValue = newState[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && !isRef(subPatch) && !isReactive(subPatch)) {
      newState[key] = patchObject(targetValue, subPatch);
    } else {
      {
        newState[key] = subPatch;
      }
    }
  }
  return newState;
}
const noop = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
const fallbackRunWithContext = (fn) => fn();
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  }
  if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = Symbol("pinia:skipHydration");
function shouldHydrate(obj) {
  return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign } = Object;
function isComputed(o2) {
  return !!(isRef(o2) && o2.effect);
}
function createOptionsStore(id, options, pinia, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia.state.value[id];
  let store;
  function setup() {
    if (!initialState && !hot) {
      {
        pinia.state.value[id] = state ? state() : {};
      }
    }
    const localState = hot ? (
      // use ref() to unwrap refs inside state TODO: check if this is still necessary
      toRefs(ref(state ? state() : {}).value)
    ) : toRefs(pinia.state.value[id]);
    return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      if (name in localState) {
        console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
      }
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia);
        const store2 = pinia._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign({ actions: {} }, options);
  if (!pinia._e.active) {
    throw new Error("Pinia destroyed");
  }
  const $subscribeOptions = {
    deep: true
    // flush: 'post',
  };
  {
    $subscribeOptions.onTrigger = (event) => {
      if (isListening) {
        debuggerEvents = event;
      } else if (isListening == false && !store._hotUpdating) {
        if (Array.isArray(debuggerEvents)) {
          debuggerEvents.push(event);
        } else {
          console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
        }
      }
    };
  }
  let isListening;
  let isSyncListening;
  let subscriptions = [];
  let actionSubscriptions = [];
  let debuggerEvents;
  const initialState = pinia.state.value[$id];
  if (!isOptionsStore && !initialState && !hot) {
    {
      pinia.state.value[$id] = {};
    }
  }
  const hotState = ref({});
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    {
      debuggerEvents = [];
    }
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick$1().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign($state, newState);
    });
  } : (
    /* istanbul ignore next */
    () => {
      throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
    }
  );
  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id);
  }
  function wrapAction(name, action) {
    return function() {
      setActivePinia(pinia);
      const args = Array.from(arguments);
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError2(callback) {
        onErrorCallbackList.push(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError: onError2
      });
      let ret;
      try {
        ret = action.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackList, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackList, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }
  const _hmrPayload = /* @__PURE__ */ markRaw({
    actions: {},
    getters: {},
    state: [],
    hotState
  });
  const partialStore = {
    _p: pinia,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(assign(
    {
      _hmrPayload,
      _customProperties: markRaw(/* @__PURE__ */ new Set())
      // devtools custom properties
    },
    partialStore
    // must be added later
    // setupStore
  ));
  pinia._s.set($id, store);
  const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
  const setupStore = runWithContext(() => pinia._e.run(() => (scope = effectScope()).run(setup)));
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (hot) {
        set(hotState.value, key, toRef(setupStore, key));
      } else if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        {
          pinia.state.value[$id][key] = prop;
        }
      }
      {
        _hmrPayload.state.push(key);
      }
    } else if (typeof prop === "function") {
      const actionValue = hot ? prop : wrapAction(key, prop);
      {
        setupStore[key] = actionValue;
      }
      {
        _hmrPayload.actions[key] = prop;
      }
      optionsForPlugin.actions[key] = prop;
    } else {
      if (isComputed(prop)) {
        _hmrPayload.getters[key] = isOptionsStore ? (
          // @ts-expect-error
          options.getters[key]
        ) : prop;
        if (IS_CLIENT) {
          const getters = setupStore._getters || // @ts-expect-error: same
          (setupStore._getters = markRaw([]));
          getters.push(key);
        }
      }
    }
  }
  {
    assign(store, setupStore);
    assign(toRaw(store), setupStore);
  }
  Object.defineProperty(store, "$state", {
    get: () => hot ? hotState.value : pinia.state.value[$id],
    set: (state) => {
      if (hot) {
        throw new Error("cannot set hotState");
      }
      $patch(($state) => {
        assign($state, state);
      });
    }
  });
  {
    store._hotUpdate = markRaw((newStore) => {
      store._hotUpdating = true;
      newStore._hmrPayload.state.forEach((stateKey) => {
        if (stateKey in store.$state) {
          const newStateTarget = newStore.$state[stateKey];
          const oldStateSource = store.$state[stateKey];
          if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
            patchObject(newStateTarget, oldStateSource);
          } else {
            newStore.$state[stateKey] = oldStateSource;
          }
        }
        set(store, stateKey, toRef(newStore.$state, stateKey));
      });
      Object.keys(store.$state).forEach((stateKey) => {
        if (!(stateKey in newStore.$state)) {
          del(store, stateKey);
        }
      });
      isListening = false;
      isSyncListening = false;
      pinia.state.value[$id] = toRef(newStore._hmrPayload, "hotState");
      isSyncListening = true;
      nextTick$1().then(() => {
        isListening = true;
      });
      for (const actionName in newStore._hmrPayload.actions) {
        const action = newStore[actionName];
        set(store, actionName, wrapAction(actionName, action));
      }
      for (const getterName in newStore._hmrPayload.getters) {
        const getter = newStore._hmrPayload.getters[getterName];
        const getterValue = isOptionsStore ? (
          // special handling of options api
          computed(() => {
            setActivePinia(pinia);
            return getter.call(store, store);
          })
        ) : getter;
        set(store, getterName, getterValue);
      }
      Object.keys(store._hmrPayload.getters).forEach((key) => {
        if (!(key in newStore._hmrPayload.getters)) {
          del(store, key);
        }
      });
      Object.keys(store._hmrPayload.actions).forEach((key) => {
        if (!(key in newStore._hmrPayload.actions)) {
          del(store, key);
        }
      });
      store._hmrPayload = newStore._hmrPayload;
      store._getters = newStore._getters;
      store._hotUpdating = false;
    });
  }
  if (USE_DEVTOOLS) {
    const nonEnumerable = {
      writable: true,
      configurable: true,
      // avoid warning on devtools trying to display this property
      enumerable: false
    };
    ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p2) => {
      Object.defineProperty(store, p2, assign({ value: store[p2] }, nonEnumerable));
    });
  }
  pinia._p.forEach((extender) => {
    if (USE_DEVTOOLS) {
      const extensions = scope.run(() => extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      }));
      Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
      assign(store, extensions);
    } else {
      assign(store, scope.run(() => extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      })));
    }
  });
  if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
    console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
  }
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options;
  const isSetupStore = typeof setup === "function";
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
    if (typeof id !== "string") {
      throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
    }
  }
  function useStore(pinia, hot) {
    const hasContext = hasInjectionContext();
    pinia = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    pinia || (hasContext ? inject(piniaSymbol, null) : null);
    if (pinia)
      setActivePinia(pinia);
    if (!activePinia) {
      throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
    }
    pinia = activePinia;
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
      {
        useStore._pinia = pinia;
      }
    }
    const store = pinia._s.get(id);
    if (hot) {
      const hotId = "__hot:" + id;
      const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
      hot._hotUpdate(newStore);
      delete pinia.state.value[hotId];
      pinia._s.delete(hotId);
    }
    if (IS_CLIENT) {
      const currentInstance2 = getCurrentInstance();
      if (currentInstance2 && currentInstance2.proxy && // avoid adding stores that are just built for hot module replacement
      !hot) {
        const vm = currentInstance2.proxy;
        const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
        cache[id] = store;
      }
    }
    return store;
  }
  useStore.$id = id;
  return useStore;
}
/*!
 * vuex v4.1.0
 * (c) 2022 Evan You
 * @license MIT
 */
var storeKey = "store";
function forEachValue(obj, fn) {
  Object.keys(obj).forEach(function(key) {
    return fn(obj[key], key);
  });
}
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isPromise$1(val) {
  return val && typeof val.then === "function";
}
function assert(condition, msg) {
  if (!condition) {
    throw new Error("[vuex] " + msg);
  }
}
function partial(fn, arg) {
  return function() {
    return fn(arg);
  };
}
function genericSubscribe(fn, subs, options) {
  if (subs.indexOf(fn) < 0) {
    options && options.prepend ? subs.unshift(fn) : subs.push(fn);
  }
  return function() {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  };
}
function resetStore(store, hot) {
  store._actions = /* @__PURE__ */ Object.create(null);
  store._mutations = /* @__PURE__ */ Object.create(null);
  store._wrappedGetters = /* @__PURE__ */ Object.create(null);
  store._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  var state = store.state;
  installModule(store, state, [], store._modules.root, true);
  resetStoreState(store, state, hot);
}
function resetStoreState(store, state, hot) {
  var oldState = store._state;
  var oldScope = store._scope;
  store.getters = {};
  store._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  var wrappedGetters = store._wrappedGetters;
  var computedObj = {};
  var computedCache = {};
  var scope = effectScope(true);
  scope.run(function() {
    forEachValue(wrappedGetters, function(fn, key) {
      computedObj[key] = partial(fn, store);
      computedCache[key] = computed(function() {
        return computedObj[key]();
      });
      Object.defineProperty(store.getters, key, {
        get: function() {
          return computedCache[key].value;
        },
        enumerable: true
        // for local getters
      });
    });
  });
  store._state = reactive({
    data: state
  });
  store._scope = scope;
  if (store.strict) {
    enableStrictMode(store);
  }
  if (oldState) {
    if (hot) {
      store._withCommit(function() {
        oldState.data = null;
      });
    }
  }
  if (oldScope) {
    oldScope.stop();
  }
}
function installModule(store, rootState, path, module2, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);
  if (module2.namespaced) {
    if (store._modulesNamespaceMap[namespace] && true) {
      console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
    }
    store._modulesNamespaceMap[namespace] = module2;
  }
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function() {
      {
        if (moduleName in parentState) {
          console.warn(
            '[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path.join(".") + '"'
          );
        }
      }
      parentState[moduleName] = module2.state;
    });
  }
  var local = module2.context = makeLocalContext(store, namespace, path);
  module2.forEachMutation(function(mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });
  module2.forEachAction(function(action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });
  module2.forEachGetter(function(getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });
  module2.forEachChild(function(child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
function makeLocalContext(store, namespace, path) {
  var noNamespace = namespace === "";
  var local = {
    dispatch: noNamespace ? store.dispatch : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
        if (!store._actions[type]) {
          console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
          return;
        }
      }
      return store.dispatch(type, payload);
    },
    commit: noNamespace ? store.commit : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
        if (!store._mutations[type]) {
          console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
          return;
        }
      }
      store.commit(type, payload, options);
    }
  };
  Object.defineProperties(local, {
    getters: {
      get: noNamespace ? function() {
        return store.getters;
      } : function() {
        return makeLocalGetters(store, namespace);
      }
    },
    state: {
      get: function() {
        return getNestedState(store.state, path);
      }
    }
  });
  return local;
}
function makeLocalGetters(store, namespace) {
  if (!store._makeLocalGettersCache[namespace]) {
    var gettersProxy = {};
    var splitPos = namespace.length;
    Object.keys(store.getters).forEach(function(type) {
      if (type.slice(0, splitPos) !== namespace) {
        return;
      }
      var localType = type.slice(splitPos);
      Object.defineProperty(gettersProxy, localType, {
        get: function() {
          return store.getters[type];
        },
        enumerable: true
      });
    });
    store._makeLocalGettersCache[namespace] = gettersProxy;
  }
  return store._makeLocalGettersCache[namespace];
}
function registerMutation(store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store, local.state, payload);
  });
}
function registerAction(store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload);
    if (!isPromise$1(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function(err) {
        store._devtoolHook.emit("vuex:error", err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
function registerGetter(store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    {
      console.error("[vuex] duplicate getter key: " + type);
    }
    return;
  }
  store._wrappedGetters[type] = function wrappedGetter(store2) {
    return rawGetter(
      local.state,
      // local state
      local.getters,
      // local getters
      store2.state,
      // root state
      store2.getters
      // root getters
    );
  };
}
function enableStrictMode(store) {
  watch(function() {
    return store._state.data;
  }, function() {
    {
      assert(store._committing, "do not mutate vuex store state outside mutation handlers.");
    }
  }, { deep: true, flush: "sync" });
}
function getNestedState(state, path) {
  return path.reduce(function(state2, key) {
    return state2[key];
  }, state);
}
function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }
  {
    assert(typeof type === "string", "expects string as the type, but found " + typeof type + ".");
  }
  return { type, payload, options };
}
var Module = function Module2(rawModule, runtime) {
  this.runtime = runtime;
  this._children = /* @__PURE__ */ Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
};
var prototypeAccessors$1 = { namespaced: { configurable: true } };
prototypeAccessors$1.namespaced.get = function() {
  return !!this._rawModule.namespaced;
};
Module.prototype.addChild = function addChild(key, module2) {
  this._children[key] = module2;
};
Module.prototype.removeChild = function removeChild(key) {
  delete this._children[key];
};
Module.prototype.getChild = function getChild(key) {
  return this._children[key];
};
Module.prototype.hasChild = function hasChild(key) {
  return key in this._children;
};
Module.prototype.update = function update(rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};
Module.prototype.forEachChild = function forEachChild(fn) {
  forEachValue(this._children, fn);
};
Module.prototype.forEachGetter = function forEachGetter(fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};
Module.prototype.forEachAction = function forEachAction(fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};
Module.prototype.forEachMutation = function forEachMutation(fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};
Object.defineProperties(Module.prototype, prototypeAccessors$1);
var ModuleCollection = function ModuleCollection2(rawRootModule) {
  this.register([], rawRootModule, false);
};
ModuleCollection.prototype.get = function get2(path) {
  return path.reduce(function(module2, key) {
    return module2.getChild(key);
  }, this.root);
};
ModuleCollection.prototype.getNamespace = function getNamespace(path) {
  var module2 = this.root;
  return path.reduce(function(namespace, key) {
    module2 = module2.getChild(key);
    return namespace + (module2.namespaced ? key + "/" : "");
  }, "");
};
ModuleCollection.prototype.update = function update$1(rawRootModule) {
  update2([], this.root, rawRootModule);
};
ModuleCollection.prototype.register = function register(path, rawModule, runtime) {
  var this$1$1 = this;
  if (runtime === void 0)
    runtime = true;
  {
    assertRawModule(path, rawModule);
  }
  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function(rawChildModule, key) {
      this$1$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};
ModuleCollection.prototype.unregister = function unregister(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  var child = parent.getChild(key);
  if (!child) {
    {
      console.warn(
        "[vuex] trying to unregister module '" + key + "', which is not registered"
      );
    }
    return;
  }
  if (!child.runtime) {
    return;
  }
  parent.removeChild(key);
};
ModuleCollection.prototype.isRegistered = function isRegistered(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (parent) {
    return parent.hasChild(key);
  }
  return false;
};
function update2(path, targetModule, newModule) {
  {
    assertRawModule(path, newModule);
  }
  targetModule.update(newModule);
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        {
          console.warn(
            "[vuex] trying to add a new module '" + key + "' on hot reloading, manual reload is needed"
          );
        }
        return;
      }
      update2(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}
var functionAssert = {
  assert: function(value) {
    return typeof value === "function";
  },
  expected: "function"
};
var objectAssert = {
  assert: function(value) {
    return typeof value === "function" || typeof value === "object" && typeof value.handler === "function";
  },
  expected: 'function or object with "handler" function'
};
var assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};
function assertRawModule(path, rawModule) {
  Object.keys(assertTypes).forEach(function(key) {
    if (!rawModule[key]) {
      return;
    }
    var assertOptions = assertTypes[key];
    forEachValue(rawModule[key], function(value, type) {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      );
    });
  });
}
function makeAssertionMessage(path, key, type, value, expected) {
  var buf = key + " should be " + expected + ' but "' + key + "." + type + '"';
  if (path.length > 0) {
    buf += ' in module "' + path.join(".") + '"';
  }
  buf += " is " + JSON.stringify(value) + ".";
  return buf;
}
function createStore(options) {
  return new Store(options);
}
var Store = function Store2(options) {
  var this$1$1 = this;
  if (options === void 0)
    options = {};
  {
    assert(typeof Promise !== "undefined", "vuex requires a Promise polyfill in this browser.");
    assert(this instanceof Store2, "store must be called with the new operator.");
  }
  var plugins = options.plugins;
  if (plugins === void 0)
    plugins = [];
  var strict = options.strict;
  if (strict === void 0)
    strict = false;
  var devtools2 = options.devtools;
  this._committing = false;
  this._actions = /* @__PURE__ */ Object.create(null);
  this._actionSubscribers = [];
  this._mutations = /* @__PURE__ */ Object.create(null);
  this._wrappedGetters = /* @__PURE__ */ Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  this._subscribers = [];
  this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  this._scope = null;
  this._devtools = devtools2;
  var store = this;
  var ref2 = this;
  var dispatch2 = ref2.dispatch;
  var commit2 = ref2.commit;
  this.dispatch = function boundDispatch(type, payload) {
    return dispatch2.call(store, type, payload);
  };
  this.commit = function boundCommit(type, payload, options2) {
    return commit2.call(store, type, payload, options2);
  };
  this.strict = strict;
  var state = this._modules.root.state;
  installModule(this, state, [], this._modules.root);
  resetStoreState(this, state);
  plugins.forEach(function(plugin2) {
    return plugin2(this$1$1);
  });
};
var prototypeAccessors = { state: { configurable: true } };
Store.prototype.install = function install(app, injectKey) {
  app.provide(injectKey || storeKey, this);
  app.config.globalProperties.$store = this;
  this._devtools !== void 0 ? this._devtools : true;
};
prototypeAccessors.state.get = function() {
  return this._state.data;
};
prototypeAccessors.state.set = function(v) {
  {
    assert(false, "use store.replaceState() to explicit replace store state.");
  }
};
Store.prototype.commit = function commit(_type, _payload, _options) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload, _options);
  var type = ref2.type;
  var payload = ref2.payload;
  var options = ref2.options;
  var mutation = { type, payload };
  var entry = this._mutations[type];
  if (!entry) {
    {
      console.error("[vuex] unknown mutation type: " + type);
    }
    return;
  }
  this._withCommit(function() {
    entry.forEach(function commitIterator(handler) {
      handler(payload);
    });
  });
  this._subscribers.slice().forEach(function(sub) {
    return sub(mutation, this$1$1.state);
  });
  if (options && options.silent) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
    );
  }
};
Store.prototype.dispatch = function dispatch(_type, _payload) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload);
  var type = ref2.type;
  var payload = ref2.payload;
  var action = { type, payload };
  var entry = this._actions[type];
  if (!entry) {
    {
      console.error("[vuex] unknown action type: " + type);
    }
    return;
  }
  try {
    this._actionSubscribers.slice().filter(function(sub) {
      return sub.before;
    }).forEach(function(sub) {
      return sub.before(action, this$1$1.state);
    });
  } catch (e2) {
    {
      console.warn("[vuex] error in before action subscribers: ");
      console.error(e2);
    }
  }
  var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
    return handler(payload);
  })) : entry[0](payload);
  return new Promise(function(resolve2, reject) {
    result.then(function(res) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.after;
        }).forEach(function(sub) {
          return sub.after(action, this$1$1.state);
        });
      } catch (e2) {
        {
          console.warn("[vuex] error in after action subscribers: ");
          console.error(e2);
        }
      }
      resolve2(res);
    }, function(error) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.error;
        }).forEach(function(sub) {
          return sub.error(action, this$1$1.state, error);
        });
      } catch (e2) {
        {
          console.warn("[vuex] error in error action subscribers: ");
          console.error(e2);
        }
      }
      reject(error);
    });
  });
};
Store.prototype.subscribe = function subscribe(fn, options) {
  return genericSubscribe(fn, this._subscribers, options);
};
Store.prototype.subscribeAction = function subscribeAction(fn, options) {
  var subs = typeof fn === "function" ? { before: fn } : fn;
  return genericSubscribe(subs, this._actionSubscribers, options);
};
Store.prototype.watch = function watch$1(getter, cb, options) {
  var this$1$1 = this;
  {
    assert(typeof getter === "function", "store.watch only accepts a function.");
  }
  return watch(function() {
    return getter(this$1$1.state, this$1$1.getters);
  }, cb, Object.assign({}, options));
};
Store.prototype.replaceState = function replaceState(state) {
  var this$1$1 = this;
  this._withCommit(function() {
    this$1$1._state.data = state;
  });
};
Store.prototype.registerModule = function registerModule(path, rawModule, options) {
  if (options === void 0)
    options = {};
  if (typeof path === "string") {
    path = [path];
  }
  {
    assert(Array.isArray(path), "module path must be a string or an Array.");
    assert(path.length > 0, "cannot register the root module by using registerModule.");
  }
  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  resetStoreState(this, this.state);
};
Store.prototype.unregisterModule = function unregisterModule(path) {
  var this$1$1 = this;
  if (typeof path === "string") {
    path = [path];
  }
  {
    assert(Array.isArray(path), "module path must be a string or an Array.");
  }
  this._modules.unregister(path);
  this._withCommit(function() {
    var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
    delete parentState[path[path.length - 1]];
  });
  resetStore(this);
};
Store.prototype.hasModule = function hasModule(path) {
  if (typeof path === "string") {
    path = [path];
  }
  {
    assert(Array.isArray(path), "module path must be a string or an Array.");
  }
  return this._modules.isRegistered(path);
};
Store.prototype.hotUpdate = function hotUpdate(newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};
Store.prototype._withCommit = function _withCommit(fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};
Object.defineProperties(Store.prototype, prototypeAccessors);
const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = getCurrentInstance()) => {
  !isInSSRComponentSetup && injectHook(lifecycle, hook, target);
};
const onShow = /* @__PURE__ */ createLifeCycleHook(
  ON_SHOW,
  1 | 2
  /* HookFlags.PAGE */
);
const onHide = /* @__PURE__ */ createLifeCycleHook(
  ON_HIDE,
  1 | 2
  /* HookFlags.PAGE */
);
const onLoad = /* @__PURE__ */ createLifeCycleHook(
  ON_LOAD,
  2
  /* HookFlags.PAGE */
);
const onUnload = /* @__PURE__ */ createLifeCycleHook(
  ON_UNLOAD,
  2
  /* HookFlags.PAGE */
);
const onShareTimeline = /* @__PURE__ */ createLifeCycleHook(
  ON_SHARE_TIMELINE,
  2
  /* HookFlags.PAGE */
);
const onShareAppMessage = /* @__PURE__ */ createLifeCycleHook(
  ON_SHARE_APP_MESSAGE,
  2
  /* HookFlags.PAGE */
);
var browser = {};
var canPromise$1 = function() {
  return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
};
var qrcode = {};
var utils$1 = {};
let toSJISFunction;
const CODEWORDS_COUNT = [
  0,
  // Not used
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706
];
utils$1.getSymbolSize = function getSymbolSize(version2) {
  if (!version2)
    throw new Error('"version" cannot be null or undefined');
  if (version2 < 1 || version2 > 40)
    throw new Error('"version" should be in range from 1 to 40');
  return version2 * 4 + 17;
};
utils$1.getSymbolTotalCodewords = function getSymbolTotalCodewords(version2) {
  return CODEWORDS_COUNT[version2];
};
utils$1.getBCHDigit = function(data) {
  let digit = 0;
  while (data !== 0) {
    digit++;
    data >>>= 1;
  }
  return digit;
};
utils$1.setToSJISFunction = function setToSJISFunction(f2) {
  if (typeof f2 !== "function") {
    throw new Error('"toSJISFunc" is not a valid function.');
  }
  toSJISFunction = f2;
};
utils$1.isKanjiModeEnabled = function() {
  return typeof toSJISFunction !== "undefined";
};
utils$1.toSJIS = function toSJIS(kanji2) {
  return toSJISFunction(kanji2);
};
var errorCorrectionLevel = {};
(function(exports2) {
  exports2.L = { bit: 1 };
  exports2.M = { bit: 0 };
  exports2.Q = { bit: 3 };
  exports2.H = { bit: 2 };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "l":
      case "low":
        return exports2.L;
      case "m":
      case "medium":
        return exports2.M;
      case "q":
      case "quartile":
        return exports2.Q;
      case "h":
      case "high":
        return exports2.H;
      default:
        throw new Error("Unknown EC Level: " + string);
    }
  }
  exports2.isValid = function isValid2(level) {
    return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
  };
  exports2.from = function from(value, defaultValue) {
    if (exports2.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e2) {
      return defaultValue;
    }
  };
})(errorCorrectionLevel);
function BitBuffer$1() {
  this.buffer = [];
  this.length = 0;
}
BitBuffer$1.prototype = {
  get: function(index2) {
    const bufIndex = Math.floor(index2 / 8);
    return (this.buffer[bufIndex] >>> 7 - index2 % 8 & 1) === 1;
  },
  put: function(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit((num >>> length - i - 1 & 1) === 1);
    }
  },
  getLengthInBits: function() {
    return this.length;
  },
  putBit: function(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 128 >>> this.length % 8;
    }
    this.length++;
  }
};
var bitBuffer = BitBuffer$1;
function BitMatrix$1(size2) {
  if (!size2 || size2 < 1) {
    throw new Error("BitMatrix size must be defined and greater than 0");
  }
  this.size = size2;
  this.data = new Uint8Array(size2 * size2);
  this.reservedBit = new Uint8Array(size2 * size2);
}
BitMatrix$1.prototype.set = function(row, col, value, reserved) {
  const index2 = row * this.size + col;
  this.data[index2] = value;
  if (reserved)
    this.reservedBit[index2] = true;
};
BitMatrix$1.prototype.get = function(row, col) {
  return this.data[row * this.size + col];
};
BitMatrix$1.prototype.xor = function(row, col, value) {
  this.data[row * this.size + col] ^= value;
};
BitMatrix$1.prototype.isReserved = function(row, col) {
  return this.reservedBit[row * this.size + col];
};
var bitMatrix = BitMatrix$1;
var alignmentPattern = {};
(function(exports2) {
  const getSymbolSize3 = utils$1.getSymbolSize;
  exports2.getRowColCoords = function getRowColCoords(version2) {
    if (version2 === 1)
      return [];
    const posCount = Math.floor(version2 / 7) + 2;
    const size2 = getSymbolSize3(version2);
    const intervals = size2 === 145 ? 26 : Math.ceil((size2 - 13) / (2 * posCount - 2)) * 2;
    const positions = [size2 - 7];
    for (let i = 1; i < posCount - 1; i++) {
      positions[i] = positions[i - 1] - intervals;
    }
    positions.push(6);
    return positions.reverse();
  };
  exports2.getPositions = function getPositions2(version2) {
    const coords = [];
    const pos = exports2.getRowColCoords(version2);
    const posLength = pos.length;
    for (let i = 0; i < posLength; i++) {
      for (let j = 0; j < posLength; j++) {
        if (i === 0 && j === 0 || // top-left
        i === 0 && j === posLength - 1 || // bottom-left
        i === posLength - 1 && j === 0) {
          continue;
        }
        coords.push([pos[i], pos[j]]);
      }
    }
    return coords;
  };
})(alignmentPattern);
var finderPattern = {};
const getSymbolSize2 = utils$1.getSymbolSize;
const FINDER_PATTERN_SIZE = 7;
finderPattern.getPositions = function getPositions(version2) {
  const size2 = getSymbolSize2(version2);
  return [
    // top-left
    [0, 0],
    // top-right
    [size2 - FINDER_PATTERN_SIZE, 0],
    // bottom-left
    [0, size2 - FINDER_PATTERN_SIZE]
  ];
};
var maskPattern = {};
(function(exports2) {
  exports2.Patterns = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  const PenaltyScores = {
    N1: 3,
    N2: 3,
    N3: 40,
    N4: 10
  };
  exports2.isValid = function isValid2(mask) {
    return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
  };
  exports2.from = function from(value) {
    return exports2.isValid(value) ? parseInt(value, 10) : void 0;
  };
  exports2.getPenaltyN1 = function getPenaltyN1(data) {
    const size2 = data.size;
    let points = 0;
    let sameCountCol = 0;
    let sameCountRow = 0;
    let lastCol = null;
    let lastRow = null;
    for (let row = 0; row < size2; row++) {
      sameCountCol = sameCountRow = 0;
      lastCol = lastRow = null;
      for (let col = 0; col < size2; col++) {
        let module2 = data.get(row, col);
        if (module2 === lastCol) {
          sameCountCol++;
        } else {
          if (sameCountCol >= 5)
            points += PenaltyScores.N1 + (sameCountCol - 5);
          lastCol = module2;
          sameCountCol = 1;
        }
        module2 = data.get(col, row);
        if (module2 === lastRow) {
          sameCountRow++;
        } else {
          if (sameCountRow >= 5)
            points += PenaltyScores.N1 + (sameCountRow - 5);
          lastRow = module2;
          sameCountRow = 1;
        }
      }
      if (sameCountCol >= 5)
        points += PenaltyScores.N1 + (sameCountCol - 5);
      if (sameCountRow >= 5)
        points += PenaltyScores.N1 + (sameCountRow - 5);
    }
    return points;
  };
  exports2.getPenaltyN2 = function getPenaltyN2(data) {
    const size2 = data.size;
    let points = 0;
    for (let row = 0; row < size2 - 1; row++) {
      for (let col = 0; col < size2 - 1; col++) {
        const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
        if (last === 4 || last === 0)
          points++;
      }
    }
    return points * PenaltyScores.N2;
  };
  exports2.getPenaltyN3 = function getPenaltyN3(data) {
    const size2 = data.size;
    let points = 0;
    let bitsCol = 0;
    let bitsRow = 0;
    for (let row = 0; row < size2; row++) {
      bitsCol = bitsRow = 0;
      for (let col = 0; col < size2; col++) {
        bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
        if (col >= 10 && (bitsCol === 1488 || bitsCol === 93))
          points++;
        bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
        if (col >= 10 && (bitsRow === 1488 || bitsRow === 93))
          points++;
      }
    }
    return points * PenaltyScores.N3;
  };
  exports2.getPenaltyN4 = function getPenaltyN4(data) {
    let darkCount = 0;
    const modulesCount = data.data.length;
    for (let i = 0; i < modulesCount; i++)
      darkCount += data.data[i];
    const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
    return k * PenaltyScores.N4;
  };
  function getMaskAt(maskPattern2, i, j) {
    switch (maskPattern2) {
      case exports2.Patterns.PATTERN000:
        return (i + j) % 2 === 0;
      case exports2.Patterns.PATTERN001:
        return i % 2 === 0;
      case exports2.Patterns.PATTERN010:
        return j % 3 === 0;
      case exports2.Patterns.PATTERN011:
        return (i + j) % 3 === 0;
      case exports2.Patterns.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case exports2.Patterns.PATTERN101:
        return i * j % 2 + i * j % 3 === 0;
      case exports2.Patterns.PATTERN110:
        return (i * j % 2 + i * j % 3) % 2 === 0;
      case exports2.Patterns.PATTERN111:
        return (i * j % 3 + (i + j) % 2) % 2 === 0;
      default:
        throw new Error("bad maskPattern:" + maskPattern2);
    }
  }
  exports2.applyMask = function applyMask(pattern, data) {
    const size2 = data.size;
    for (let col = 0; col < size2; col++) {
      for (let row = 0; row < size2; row++) {
        if (data.isReserved(row, col))
          continue;
        data.xor(row, col, getMaskAt(pattern, row, col));
      }
    }
  };
  exports2.getBestMask = function getBestMask(data, setupFormatFunc) {
    const numPatterns = Object.keys(exports2.Patterns).length;
    let bestPattern = 0;
    let lowerPenalty = Infinity;
    for (let p2 = 0; p2 < numPatterns; p2++) {
      setupFormatFunc(p2);
      exports2.applyMask(p2, data);
      const penalty = exports2.getPenaltyN1(data) + exports2.getPenaltyN2(data) + exports2.getPenaltyN3(data) + exports2.getPenaltyN4(data);
      exports2.applyMask(p2, data);
      if (penalty < lowerPenalty) {
        lowerPenalty = penalty;
        bestPattern = p2;
      }
    }
    return bestPattern;
  };
})(maskPattern);
var errorCorrectionCode = {};
const ECLevel$1 = errorCorrectionLevel;
const EC_BLOCKS_TABLE = [
  // L  M  Q  H
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  1,
  2,
  2,
  4,
  1,
  2,
  4,
  4,
  2,
  4,
  4,
  4,
  2,
  4,
  6,
  5,
  2,
  4,
  6,
  6,
  2,
  5,
  8,
  8,
  4,
  5,
  8,
  8,
  4,
  5,
  8,
  11,
  4,
  8,
  10,
  11,
  4,
  9,
  12,
  16,
  4,
  9,
  16,
  16,
  6,
  10,
  12,
  18,
  6,
  10,
  17,
  16,
  6,
  11,
  16,
  19,
  6,
  13,
  18,
  21,
  7,
  14,
  21,
  25,
  8,
  16,
  20,
  25,
  8,
  17,
  23,
  25,
  9,
  17,
  23,
  34,
  9,
  18,
  25,
  30,
  10,
  20,
  27,
  32,
  12,
  21,
  29,
  35,
  12,
  23,
  34,
  37,
  12,
  25,
  34,
  40,
  13,
  26,
  35,
  42,
  14,
  28,
  38,
  45,
  15,
  29,
  40,
  48,
  16,
  31,
  43,
  51,
  17,
  33,
  45,
  54,
  18,
  35,
  48,
  57,
  19,
  37,
  51,
  60,
  19,
  38,
  53,
  63,
  20,
  40,
  56,
  66,
  21,
  43,
  59,
  70,
  22,
  45,
  62,
  74,
  24,
  47,
  65,
  77,
  25,
  49,
  68,
  81
];
const EC_CODEWORDS_TABLE = [
  // L  M  Q  H
  7,
  10,
  13,
  17,
  10,
  16,
  22,
  28,
  15,
  26,
  36,
  44,
  20,
  36,
  52,
  64,
  26,
  48,
  72,
  88,
  36,
  64,
  96,
  112,
  40,
  72,
  108,
  130,
  48,
  88,
  132,
  156,
  60,
  110,
  160,
  192,
  72,
  130,
  192,
  224,
  80,
  150,
  224,
  264,
  96,
  176,
  260,
  308,
  104,
  198,
  288,
  352,
  120,
  216,
  320,
  384,
  132,
  240,
  360,
  432,
  144,
  280,
  408,
  480,
  168,
  308,
  448,
  532,
  180,
  338,
  504,
  588,
  196,
  364,
  546,
  650,
  224,
  416,
  600,
  700,
  224,
  442,
  644,
  750,
  252,
  476,
  690,
  816,
  270,
  504,
  750,
  900,
  300,
  560,
  810,
  960,
  312,
  588,
  870,
  1050,
  336,
  644,
  952,
  1110,
  360,
  700,
  1020,
  1200,
  390,
  728,
  1050,
  1260,
  420,
  784,
  1140,
  1350,
  450,
  812,
  1200,
  1440,
  480,
  868,
  1290,
  1530,
  510,
  924,
  1350,
  1620,
  540,
  980,
  1440,
  1710,
  570,
  1036,
  1530,
  1800,
  570,
  1064,
  1590,
  1890,
  600,
  1120,
  1680,
  1980,
  630,
  1204,
  1770,
  2100,
  660,
  1260,
  1860,
  2220,
  720,
  1316,
  1950,
  2310,
  750,
  1372,
  2040,
  2430
];
errorCorrectionCode.getBlocksCount = function getBlocksCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_BLOCKS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
errorCorrectionCode.getTotalCodewordsCount = function getTotalCodewordsCount(version2, errorCorrectionLevel2) {
  switch (errorCorrectionLevel2) {
    case ECLevel$1.L:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 0];
    case ECLevel$1.M:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 1];
    case ECLevel$1.Q:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 2];
    case ECLevel$1.H:
      return EC_CODEWORDS_TABLE[(version2 - 1) * 4 + 3];
    default:
      return void 0;
  }
};
var polynomial = {};
var galoisField = {};
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 285;
    }
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();
galoisField.log = function log(n2) {
  if (n2 < 1)
    throw new Error("log(" + n2 + ")");
  return LOG_TABLE[n2];
};
galoisField.exp = function exp(n2) {
  return EXP_TABLE[n2];
};
galoisField.mul = function mul(x, y) {
  if (x === 0 || y === 0)
    return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
};
(function(exports2) {
  const GF = galoisField;
  exports2.mul = function mul2(p1, p2) {
    const coeff = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        coeff[i + j] ^= GF.mul(p1[i], p2[j]);
      }
    }
    return coeff;
  };
  exports2.mod = function mod(divident, divisor) {
    let result = new Uint8Array(divident);
    while (result.length - divisor.length >= 0) {
      const coeff = result[0];
      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= GF.mul(divisor[i], coeff);
      }
      let offset = 0;
      while (offset < result.length && result[offset] === 0)
        offset++;
      result = result.slice(offset);
    }
    return result;
  };
  exports2.generateECPolynomial = function generateECPolynomial(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      poly = exports2.mul(poly, new Uint8Array([1, GF.exp(i)]));
    }
    return poly;
  };
})(polynomial);
const Polynomial = polynomial;
function ReedSolomonEncoder$1(degree) {
  this.genPoly = void 0;
  this.degree = degree;
  if (this.degree)
    this.initialize(this.degree);
}
ReedSolomonEncoder$1.prototype.initialize = function initialize(degree) {
  this.degree = degree;
  this.genPoly = Polynomial.generateECPolynomial(this.degree);
};
ReedSolomonEncoder$1.prototype.encode = function encode(data) {
  if (!this.genPoly) {
    throw new Error("Encoder not initialized");
  }
  const paddedData = new Uint8Array(data.length + this.degree);
  paddedData.set(data);
  const remainder = Polynomial.mod(paddedData, this.genPoly);
  const start = this.degree - remainder.length;
  if (start > 0) {
    const buff = new Uint8Array(this.degree);
    buff.set(remainder, start);
    return buff;
  }
  return remainder;
};
var reedSolomonEncoder = ReedSolomonEncoder$1;
var version = {};
var mode = {};
var versionCheck = {};
versionCheck.isValid = function isValid(version2) {
  return !isNaN(version2) && version2 >= 1 && version2 <= 40;
};
var regex = {};
const numeric = "[0-9]+";
const alphanumeric = "[A-Z $%*+\\-./:]+";
let kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
kanji = kanji.replace(/u/g, "\\u");
const byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
regex.KANJI = new RegExp(kanji, "g");
regex.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
regex.BYTE = new RegExp(byte, "g");
regex.NUMERIC = new RegExp(numeric, "g");
regex.ALPHANUMERIC = new RegExp(alphanumeric, "g");
const TEST_KANJI = new RegExp("^" + kanji + "$");
const TEST_NUMERIC = new RegExp("^" + numeric + "$");
const TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
regex.testKanji = function testKanji(str) {
  return TEST_KANJI.test(str);
};
regex.testNumeric = function testNumeric(str) {
  return TEST_NUMERIC.test(str);
};
regex.testAlphanumeric = function testAlphanumeric(str) {
  return TEST_ALPHANUMERIC.test(str);
};
(function(exports2) {
  const VersionCheck = versionCheck;
  const Regex = regex;
  exports2.NUMERIC = {
    id: "Numeric",
    bit: 1 << 0,
    ccBits: [10, 12, 14]
  };
  exports2.ALPHANUMERIC = {
    id: "Alphanumeric",
    bit: 1 << 1,
    ccBits: [9, 11, 13]
  };
  exports2.BYTE = {
    id: "Byte",
    bit: 1 << 2,
    ccBits: [8, 16, 16]
  };
  exports2.KANJI = {
    id: "Kanji",
    bit: 1 << 3,
    ccBits: [8, 10, 12]
  };
  exports2.MIXED = {
    bit: -1
  };
  exports2.getCharCountIndicator = function getCharCountIndicator(mode2, version2) {
    if (!mode2.ccBits)
      throw new Error("Invalid mode: " + mode2);
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid version: " + version2);
    }
    if (version2 >= 1 && version2 < 10)
      return mode2.ccBits[0];
    else if (version2 < 27)
      return mode2.ccBits[1];
    return mode2.ccBits[2];
  };
  exports2.getBestModeForData = function getBestModeForData(dataStr) {
    if (Regex.testNumeric(dataStr))
      return exports2.NUMERIC;
    else if (Regex.testAlphanumeric(dataStr))
      return exports2.ALPHANUMERIC;
    else if (Regex.testKanji(dataStr))
      return exports2.KANJI;
    else
      return exports2.BYTE;
  };
  exports2.toString = function toString(mode2) {
    if (mode2 && mode2.id)
      return mode2.id;
    throw new Error("Invalid mode");
  };
  exports2.isValid = function isValid2(mode2) {
    return mode2 && mode2.bit && mode2.ccBits;
  };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "numeric":
        return exports2.NUMERIC;
      case "alphanumeric":
        return exports2.ALPHANUMERIC;
      case "kanji":
        return exports2.KANJI;
      case "byte":
        return exports2.BYTE;
      default:
        throw new Error("Unknown mode: " + string);
    }
  }
  exports2.from = function from(value, defaultValue) {
    if (exports2.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e2) {
      return defaultValue;
    }
  };
})(mode);
(function(exports2) {
  const Utils2 = utils$1;
  const ECCode2 = errorCorrectionCode;
  const ECLevel2 = errorCorrectionLevel;
  const Mode2 = mode;
  const VersionCheck = versionCheck;
  const G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
  const G18_BCH = Utils2.getBCHDigit(G18);
  function getBestVersionForDataLength(mode2, length, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      if (length <= exports2.getCapacity(currentVersion, errorCorrectionLevel2, mode2)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  function getReservedBitsCount(mode2, version2) {
    return Mode2.getCharCountIndicator(mode2, version2) + 4;
  }
  function getTotalBitsFromDataArray(segments2, version2) {
    let totalBits = 0;
    segments2.forEach(function(data) {
      const reservedBits = getReservedBitsCount(data.mode, version2);
      totalBits += reservedBits + data.getBitsLength();
    });
    return totalBits;
  }
  function getBestVersionForMixedData(segments2, errorCorrectionLevel2) {
    for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
      const length = getTotalBitsFromDataArray(segments2, currentVersion);
      if (length <= exports2.getCapacity(currentVersion, errorCorrectionLevel2, Mode2.MIXED)) {
        return currentVersion;
      }
    }
    return void 0;
  }
  exports2.from = function from(value, defaultValue) {
    if (VersionCheck.isValid(value)) {
      return parseInt(value, 10);
    }
    return defaultValue;
  };
  exports2.getCapacity = function getCapacity(version2, errorCorrectionLevel2, mode2) {
    if (!VersionCheck.isValid(version2)) {
      throw new Error("Invalid QR Code version");
    }
    if (typeof mode2 === "undefined")
      mode2 = Mode2.BYTE;
    const totalCodewords = Utils2.getSymbolTotalCodewords(version2);
    const ecTotalCodewords = ECCode2.getTotalCodewordsCount(version2, errorCorrectionLevel2);
    const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
    if (mode2 === Mode2.MIXED)
      return dataTotalCodewordsBits;
    const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode2, version2);
    switch (mode2) {
      case Mode2.NUMERIC:
        return Math.floor(usableBits / 10 * 3);
      case Mode2.ALPHANUMERIC:
        return Math.floor(usableBits / 11 * 2);
      case Mode2.KANJI:
        return Math.floor(usableBits / 13);
      case Mode2.BYTE:
      default:
        return Math.floor(usableBits / 8);
    }
  };
  exports2.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel2) {
    let seg;
    const ecl = ECLevel2.from(errorCorrectionLevel2, ECLevel2.M);
    if (Array.isArray(data)) {
      if (data.length > 1) {
        return getBestVersionForMixedData(data, ecl);
      }
      if (data.length === 0) {
        return 1;
      }
      seg = data[0];
    } else {
      seg = data;
    }
    return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
  };
  exports2.getEncodedBits = function getEncodedBits2(version2) {
    if (!VersionCheck.isValid(version2) || version2 < 7) {
      throw new Error("Invalid QR Code version");
    }
    let d = version2 << 12;
    while (Utils2.getBCHDigit(d) - G18_BCH >= 0) {
      d ^= G18 << Utils2.getBCHDigit(d) - G18_BCH;
    }
    return version2 << 12 | d;
  };
})(version);
var formatInfo = {};
const Utils$4 = utils$1;
const G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
const G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
const G15_BCH = Utils$4.getBCHDigit(G15);
formatInfo.getEncodedBits = function getEncodedBits(errorCorrectionLevel2, mask) {
  const data = errorCorrectionLevel2.bit << 3 | mask;
  let d = data << 10;
  while (Utils$4.getBCHDigit(d) - G15_BCH >= 0) {
    d ^= G15 << Utils$4.getBCHDigit(d) - G15_BCH;
  }
  return (data << 10 | d) ^ G15_MASK;
};
var segments = {};
const Mode$4 = mode;
function NumericData(data) {
  this.mode = Mode$4.NUMERIC;
  this.data = data.toString();
}
NumericData.getBitsLength = function getBitsLength(length) {
  return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
};
NumericData.prototype.getLength = function getLength() {
  return this.data.length;
};
NumericData.prototype.getBitsLength = function getBitsLength2() {
  return NumericData.getBitsLength(this.data.length);
};
NumericData.prototype.write = function write(bitBuffer2) {
  let i, group, value;
  for (i = 0; i + 3 <= this.data.length; i += 3) {
    group = this.data.substr(i, 3);
    value = parseInt(group, 10);
    bitBuffer2.put(value, 10);
  }
  const remainingNum = this.data.length - i;
  if (remainingNum > 0) {
    group = this.data.substr(i);
    value = parseInt(group, 10);
    bitBuffer2.put(value, remainingNum * 3 + 1);
  }
};
var numericData = NumericData;
const Mode$3 = mode;
const ALPHA_NUM_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  " ",
  "$",
  "%",
  "*",
  "+",
  "-",
  ".",
  "/",
  ":"
];
function AlphanumericData(data) {
  this.mode = Mode$3.ALPHANUMERIC;
  this.data = data;
}
AlphanumericData.getBitsLength = function getBitsLength3(length) {
  return 11 * Math.floor(length / 2) + 6 * (length % 2);
};
AlphanumericData.prototype.getLength = function getLength2() {
  return this.data.length;
};
AlphanumericData.prototype.getBitsLength = function getBitsLength4() {
  return AlphanumericData.getBitsLength(this.data.length);
};
AlphanumericData.prototype.write = function write2(bitBuffer2) {
  let i;
  for (i = 0; i + 2 <= this.data.length; i += 2) {
    let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
    value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
    bitBuffer2.put(value, 11);
  }
  if (this.data.length % 2) {
    bitBuffer2.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
  }
};
var alphanumericData = AlphanumericData;
const Mode$2 = mode;
function ByteData(data) {
  this.mode = Mode$2.BYTE;
  if (typeof data === "string") {
    this.data = new TextEncoder().encode(data);
  } else {
    this.data = new Uint8Array(data);
  }
}
ByteData.getBitsLength = function getBitsLength5(length) {
  return length * 8;
};
ByteData.prototype.getLength = function getLength3() {
  return this.data.length;
};
ByteData.prototype.getBitsLength = function getBitsLength6() {
  return ByteData.getBitsLength(this.data.length);
};
ByteData.prototype.write = function(bitBuffer2) {
  for (let i = 0, l = this.data.length; i < l; i++) {
    bitBuffer2.put(this.data[i], 8);
  }
};
var byteData = ByteData;
const Mode$1 = mode;
const Utils$3 = utils$1;
function KanjiData(data) {
  this.mode = Mode$1.KANJI;
  this.data = data;
}
KanjiData.getBitsLength = function getBitsLength7(length) {
  return length * 13;
};
KanjiData.prototype.getLength = function getLength4() {
  return this.data.length;
};
KanjiData.prototype.getBitsLength = function getBitsLength8() {
  return KanjiData.getBitsLength(this.data.length);
};
KanjiData.prototype.write = function(bitBuffer2) {
  let i;
  for (i = 0; i < this.data.length; i++) {
    let value = Utils$3.toSJIS(this.data[i]);
    if (value >= 33088 && value <= 40956) {
      value -= 33088;
    } else if (value >= 57408 && value <= 60351) {
      value -= 49472;
    } else {
      throw new Error(
        "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
      );
    }
    value = (value >>> 8 & 255) * 192 + (value & 255);
    bitBuffer2.put(value, 13);
  }
};
var kanjiData = KanjiData;
var dijkstra = { exports: {} };
(function(module2) {
  var dijkstra2 = {
    single_source_shortest_paths: function(graph, s2, d) {
      var predecessors = {};
      var costs = {};
      costs[s2] = 0;
      var open = dijkstra2.PriorityQueue.make();
      open.push(s2, 0);
      var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
      while (!open.empty()) {
        closest = open.pop();
        u = closest.value;
        cost_of_s_to_u = closest.cost;
        adjacent_nodes = graph[u] || {};
        for (v in adjacent_nodes) {
          if (adjacent_nodes.hasOwnProperty(v)) {
            cost_of_e = adjacent_nodes[v];
            cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
            cost_of_s_to_v = costs[v];
            first_visit = typeof costs[v] === "undefined";
            if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
              costs[v] = cost_of_s_to_u_plus_cost_of_e;
              open.push(v, cost_of_s_to_u_plus_cost_of_e);
              predecessors[v] = u;
            }
          }
        }
      }
      if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
        var msg = ["Could not find a path from ", s2, " to ", d, "."].join("");
        throw new Error(msg);
      }
      return predecessors;
    },
    extract_shortest_path_from_predecessor_list: function(predecessors, d) {
      var nodes = [];
      var u = d;
      while (u) {
        nodes.push(u);
        predecessors[u];
        u = predecessors[u];
      }
      nodes.reverse();
      return nodes;
    },
    find_path: function(graph, s2, d) {
      var predecessors = dijkstra2.single_source_shortest_paths(graph, s2, d);
      return dijkstra2.extract_shortest_path_from_predecessor_list(
        predecessors,
        d
      );
    },
    /**
     * A very naive priority queue implementation.
     */
    PriorityQueue: {
      make: function(opts) {
        var T = dijkstra2.PriorityQueue, t2 = {}, key;
        opts = opts || {};
        for (key in T) {
          if (T.hasOwnProperty(key)) {
            t2[key] = T[key];
          }
        }
        t2.queue = [];
        t2.sorter = opts.sorter || T.default_sorter;
        return t2;
      },
      default_sorter: function(a, b) {
        return a.cost - b.cost;
      },
      /**
       * Add a new item to the queue and ensure the highest priority element
       * is at the front of the queue.
       */
      push: function(value, cost) {
        var item = { value, cost };
        this.queue.push(item);
        this.queue.sort(this.sorter);
      },
      /**
       * Return the highest priority element in the queue.
       */
      pop: function() {
        return this.queue.shift();
      },
      empty: function() {
        return this.queue.length === 0;
      }
    }
  };
  {
    module2.exports = dijkstra2;
  }
})(dijkstra);
var dijkstraExports = dijkstra.exports;
(function(exports2) {
  const Mode2 = mode;
  const NumericData2 = numericData;
  const AlphanumericData2 = alphanumericData;
  const ByteData2 = byteData;
  const KanjiData2 = kanjiData;
  const Regex = regex;
  const Utils2 = utils$1;
  const dijkstra2 = dijkstraExports;
  function getStringByteLength(str) {
    return unescape(encodeURIComponent(str)).length;
  }
  function getSegments(regex2, mode2, str) {
    const segments2 = [];
    let result;
    while ((result = regex2.exec(str)) !== null) {
      segments2.push({
        data: result[0],
        index: result.index,
        mode: mode2,
        length: result[0].length
      });
    }
    return segments2;
  }
  function getSegmentsFromString(dataStr) {
    const numSegs = getSegments(Regex.NUMERIC, Mode2.NUMERIC, dataStr);
    const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode2.ALPHANUMERIC, dataStr);
    let byteSegs;
    let kanjiSegs;
    if (Utils2.isKanjiModeEnabled()) {
      byteSegs = getSegments(Regex.BYTE, Mode2.BYTE, dataStr);
      kanjiSegs = getSegments(Regex.KANJI, Mode2.KANJI, dataStr);
    } else {
      byteSegs = getSegments(Regex.BYTE_KANJI, Mode2.BYTE, dataStr);
      kanjiSegs = [];
    }
    const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
    return segs.sort(function(s1, s2) {
      return s1.index - s2.index;
    }).map(function(obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length
      };
    });
  }
  function getSegmentBitsLength(length, mode2) {
    switch (mode2) {
      case Mode2.NUMERIC:
        return NumericData2.getBitsLength(length);
      case Mode2.ALPHANUMERIC:
        return AlphanumericData2.getBitsLength(length);
      case Mode2.KANJI:
        return KanjiData2.getBitsLength(length);
      case Mode2.BYTE:
        return ByteData2.getBitsLength(length);
    }
  }
  function mergeSegments(segs) {
    return segs.reduce(function(acc, curr) {
      const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
      if (prevSeg && prevSeg.mode === curr.mode) {
        acc[acc.length - 1].data += curr.data;
        return acc;
      }
      acc.push(curr);
      return acc;
    }, []);
  }
  function buildNodes(segs) {
    const nodes = [];
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      switch (seg.mode) {
        case Mode2.NUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.ALPHANUMERIC, length: seg.length },
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.ALPHANUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: seg.length }
          ]);
          break;
        case Mode2.KANJI:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
          break;
        case Mode2.BYTE:
          nodes.push([
            { data: seg.data, mode: Mode2.BYTE, length: getStringByteLength(seg.data) }
          ]);
      }
    }
    return nodes;
  }
  function buildGraph(nodes, version2) {
    const table = {};
    const graph = { start: {} };
    let prevNodeIds = ["start"];
    for (let i = 0; i < nodes.length; i++) {
      const nodeGroup = nodes[i];
      const currentNodeIds = [];
      for (let j = 0; j < nodeGroup.length; j++) {
        const node = nodeGroup[j];
        const key = "" + i + j;
        currentNodeIds.push(key);
        table[key] = { node, lastCount: 0 };
        graph[key] = {};
        for (let n2 = 0; n2 < prevNodeIds.length; n2++) {
          const prevNodeId = prevNodeIds[n2];
          if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
            graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
            table[prevNodeId].lastCount += node.length;
          } else {
            if (table[prevNodeId])
              table[prevNodeId].lastCount = node.length;
            graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode2.getCharCountIndicator(node.mode, version2);
          }
        }
      }
      prevNodeIds = currentNodeIds;
    }
    for (let n2 = 0; n2 < prevNodeIds.length; n2++) {
      graph[prevNodeIds[n2]].end = 0;
    }
    return { map: graph, table };
  }
  function buildSingleSegment(data, modesHint) {
    let mode2;
    const bestMode = Mode2.getBestModeForData(data);
    mode2 = Mode2.from(modesHint, bestMode);
    if (mode2 !== Mode2.BYTE && mode2.bit < bestMode.bit) {
      throw new Error('"' + data + '" cannot be encoded with mode ' + Mode2.toString(mode2) + ".\n Suggested mode is: " + Mode2.toString(bestMode));
    }
    if (mode2 === Mode2.KANJI && !Utils2.isKanjiModeEnabled()) {
      mode2 = Mode2.BYTE;
    }
    switch (mode2) {
      case Mode2.NUMERIC:
        return new NumericData2(data);
      case Mode2.ALPHANUMERIC:
        return new AlphanumericData2(data);
      case Mode2.KANJI:
        return new KanjiData2(data);
      case Mode2.BYTE:
        return new ByteData2(data);
    }
  }
  exports2.fromArray = function fromArray(array) {
    return array.reduce(function(acc, seg) {
      if (typeof seg === "string") {
        acc.push(buildSingleSegment(seg, null));
      } else if (seg.data) {
        acc.push(buildSingleSegment(seg.data, seg.mode));
      }
      return acc;
    }, []);
  };
  exports2.fromString = function fromString(data, version2) {
    const segs = getSegmentsFromString(data, Utils2.isKanjiModeEnabled());
    const nodes = buildNodes(segs);
    const graph = buildGraph(nodes, version2);
    const path = dijkstra2.find_path(graph.map, "start", "end");
    const optimizedSegs = [];
    for (let i = 1; i < path.length - 1; i++) {
      optimizedSegs.push(graph.table[path[i]].node);
    }
    return exports2.fromArray(mergeSegments(optimizedSegs));
  };
  exports2.rawSplit = function rawSplit(data) {
    return exports2.fromArray(
      getSegmentsFromString(data, Utils2.isKanjiModeEnabled())
    );
  };
})(segments);
const Utils$2 = utils$1;
const ECLevel = errorCorrectionLevel;
const BitBuffer = bitBuffer;
const BitMatrix = bitMatrix;
const AlignmentPattern = alignmentPattern;
const FinderPattern = finderPattern;
const MaskPattern = maskPattern;
const ECCode = errorCorrectionCode;
const ReedSolomonEncoder = reedSolomonEncoder;
const Version = version;
const FormatInfo = formatInfo;
const Mode = mode;
const Segments = segments;
function setupFinderPattern(matrix, version2) {
  const size2 = matrix.size;
  const pos = FinderPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || size2 <= row + r)
        continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || size2 <= col + c)
          continue;
        if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupTimingPattern(matrix) {
  const size2 = matrix.size;
  for (let r = 8; r < size2 - 8; r++) {
    const value = r % 2 === 0;
    matrix.set(r, 6, value, true);
    matrix.set(6, r, value, true);
  }
}
function setupAlignmentPattern(matrix, version2) {
  const pos = AlignmentPattern.getPositions(version2);
  for (let i = 0; i < pos.length; i++) {
    const row = pos[i][0];
    const col = pos[i][1];
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
          matrix.set(row + r, col + c, true, true);
        } else {
          matrix.set(row + r, col + c, false, true);
        }
      }
    }
  }
}
function setupVersionInfo(matrix, version2) {
  const size2 = matrix.size;
  const bits = Version.getEncodedBits(version2);
  let row, col, mod;
  for (let i = 0; i < 18; i++) {
    row = Math.floor(i / 3);
    col = i % 3 + size2 - 8 - 3;
    mod = (bits >> i & 1) === 1;
    matrix.set(row, col, mod, true);
    matrix.set(col, row, mod, true);
  }
}
function setupFormatInfo(matrix, errorCorrectionLevel2, maskPattern2) {
  const size2 = matrix.size;
  const bits = FormatInfo.getEncodedBits(errorCorrectionLevel2, maskPattern2);
  let i, mod;
  for (i = 0; i < 15; i++) {
    mod = (bits >> i & 1) === 1;
    if (i < 6) {
      matrix.set(i, 8, mod, true);
    } else if (i < 8) {
      matrix.set(i + 1, 8, mod, true);
    } else {
      matrix.set(size2 - 15 + i, 8, mod, true);
    }
    if (i < 8) {
      matrix.set(8, size2 - i - 1, mod, true);
    } else if (i < 9) {
      matrix.set(8, 15 - i - 1 + 1, mod, true);
    } else {
      matrix.set(8, 15 - i - 1, mod, true);
    }
  }
  matrix.set(size2 - 8, 8, 1, true);
}
function setupData(matrix, data) {
  const size2 = matrix.size;
  let inc = -1;
  let row = size2 - 1;
  let bitIndex = 7;
  let byteIndex = 0;
  for (let col = size2 - 1; col > 0; col -= 2) {
    if (col === 6)
      col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (!matrix.isReserved(row, col - c)) {
          let dark = false;
          if (byteIndex < data.length) {
            dark = (data[byteIndex] >>> bitIndex & 1) === 1;
          }
          matrix.set(row, col - c, dark);
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || size2 <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}
function createData(version2, errorCorrectionLevel2, segments2) {
  const buffer2 = new BitBuffer();
  segments2.forEach(function(data) {
    buffer2.put(data.mode.bit, 4);
    buffer2.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version2));
    data.write(buffer2);
  });
  const totalCodewords = Utils$2.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
  if (buffer2.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
    buffer2.put(0, 4);
  }
  while (buffer2.getLengthInBits() % 8 !== 0) {
    buffer2.putBit(0);
  }
  const remainingByte = (dataTotalCodewordsBits - buffer2.getLengthInBits()) / 8;
  for (let i = 0; i < remainingByte; i++) {
    buffer2.put(i % 2 ? 17 : 236, 8);
  }
  return createCodewords(buffer2, version2, errorCorrectionLevel2);
}
function createCodewords(bitBuffer2, version2, errorCorrectionLevel2) {
  const totalCodewords = Utils$2.getSymbolTotalCodewords(version2);
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version2, errorCorrectionLevel2);
  const dataTotalCodewords = totalCodewords - ecTotalCodewords;
  const ecTotalBlocks = ECCode.getBlocksCount(version2, errorCorrectionLevel2);
  const blocksInGroup2 = totalCodewords % ecTotalBlocks;
  const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
  const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
  const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
  const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
  const rs = new ReedSolomonEncoder(ecCount);
  let offset = 0;
  const dcData = new Array(ecTotalBlocks);
  const ecData = new Array(ecTotalBlocks);
  let maxDataSize = 0;
  const buffer2 = new Uint8Array(bitBuffer2.buffer);
  for (let b = 0; b < ecTotalBlocks; b++) {
    const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
    dcData[b] = buffer2.slice(offset, offset + dataSize);
    ecData[b] = rs.encode(dcData[b]);
    offset += dataSize;
    maxDataSize = Math.max(maxDataSize, dataSize);
  }
  const data = new Uint8Array(totalCodewords);
  let index2 = 0;
  let i, r;
  for (i = 0; i < maxDataSize; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      if (i < dcData[r].length) {
        data[index2++] = dcData[r][i];
      }
    }
  }
  for (i = 0; i < ecCount; i++) {
    for (r = 0; r < ecTotalBlocks; r++) {
      data[index2++] = ecData[r][i];
    }
  }
  return data;
}
function createSymbol(data, version2, errorCorrectionLevel2, maskPattern2) {
  let segments2;
  if (Array.isArray(data)) {
    segments2 = Segments.fromArray(data);
  } else if (typeof data === "string") {
    let estimatedVersion = version2;
    if (!estimatedVersion) {
      const rawSegments = Segments.rawSplit(data);
      estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel2);
    }
    segments2 = Segments.fromString(data, estimatedVersion || 40);
  } else {
    throw new Error("Invalid data");
  }
  const bestVersion = Version.getBestVersionForData(segments2, errorCorrectionLevel2);
  if (!bestVersion) {
    throw new Error("The amount of data is too big to be stored in a QR Code");
  }
  if (!version2) {
    version2 = bestVersion;
  } else if (version2 < bestVersion) {
    throw new Error(
      "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
    );
  }
  const dataBits = createData(version2, errorCorrectionLevel2, segments2);
  const moduleCount = Utils$2.getSymbolSize(version2);
  const modules = new BitMatrix(moduleCount);
  setupFinderPattern(modules, version2);
  setupTimingPattern(modules);
  setupAlignmentPattern(modules, version2);
  setupFormatInfo(modules, errorCorrectionLevel2, 0);
  if (version2 >= 7) {
    setupVersionInfo(modules, version2);
  }
  setupData(modules, dataBits);
  if (isNaN(maskPattern2)) {
    maskPattern2 = MaskPattern.getBestMask(
      modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel2)
    );
  }
  MaskPattern.applyMask(maskPattern2, modules);
  setupFormatInfo(modules, errorCorrectionLevel2, maskPattern2);
  return {
    modules,
    version: version2,
    errorCorrectionLevel: errorCorrectionLevel2,
    maskPattern: maskPattern2,
    segments: segments2
  };
}
qrcode.create = function create(data, options) {
  if (typeof data === "undefined" || data === "") {
    throw new Error("No input text");
  }
  let errorCorrectionLevel2 = ECLevel.M;
  let version2;
  let mask;
  if (typeof options !== "undefined") {
    errorCorrectionLevel2 = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
    version2 = Version.from(options.version);
    mask = MaskPattern.from(options.maskPattern);
    if (options.toSJISFunc) {
      Utils$2.setToSJISFunction(options.toSJISFunc);
    }
  }
  return createSymbol(data, version2, errorCorrectionLevel2, mask);
};
var canvas = {};
var utils = {};
(function(exports2) {
  function hex2rgba(hex) {
    if (typeof hex === "number") {
      hex = hex.toString();
    }
    if (typeof hex !== "string") {
      throw new Error("Color should be defined as hex string");
    }
    let hexCode = hex.slice().replace("#", "").split("");
    if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
      throw new Error("Invalid hex color: " + hex);
    }
    if (hexCode.length === 3 || hexCode.length === 4) {
      hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
        return [c, c];
      }));
    }
    if (hexCode.length === 6)
      hexCode.push("F", "F");
    const hexValue = parseInt(hexCode.join(""), 16);
    return {
      r: hexValue >> 24 & 255,
      g: hexValue >> 16 & 255,
      b: hexValue >> 8 & 255,
      a: hexValue & 255,
      hex: "#" + hexCode.slice(0, 6).join("")
    };
  }
  exports2.getOptions = function getOptions(options) {
    if (!options)
      options = {};
    if (!options.color)
      options.color = {};
    const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
    const width = options.width && options.width >= 21 ? options.width : void 0;
    const scale = options.scale || 4;
    return {
      width,
      scale: width ? 4 : scale,
      margin,
      color: {
        dark: hex2rgba(options.color.dark || "#000000ff"),
        light: hex2rgba(options.color.light || "#ffffffff")
      },
      type: options.type,
      rendererOpts: options.rendererOpts || {}
    };
  };
  exports2.getScale = function getScale(qrSize, opts) {
    return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
  };
  exports2.getImageWidth = function getImageWidth(qrSize, opts) {
    const scale = exports2.getScale(qrSize, opts);
    return Math.floor((qrSize + opts.margin * 2) * scale);
  };
  exports2.qrToImageData = function qrToImageData(imgData, qr, opts) {
    const size2 = qr.modules.size;
    const data = qr.modules.data;
    const scale = exports2.getScale(size2, opts);
    const symbolSize = Math.floor((size2 + opts.margin * 2) * scale);
    const scaledMargin = opts.margin * scale;
    const palette = [opts.color.light, opts.color.dark];
    for (let i = 0; i < symbolSize; i++) {
      for (let j = 0; j < symbolSize; j++) {
        let posDst = (i * symbolSize + j) * 4;
        let pxColor = opts.color.light;
        if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
          const iSrc = Math.floor((i - scaledMargin) / scale);
          const jSrc = Math.floor((j - scaledMargin) / scale);
          pxColor = palette[data[iSrc * size2 + jSrc] ? 1 : 0];
        }
        imgData[posDst++] = pxColor.r;
        imgData[posDst++] = pxColor.g;
        imgData[posDst++] = pxColor.b;
        imgData[posDst] = pxColor.a;
      }
    }
  };
})(utils);
(function(exports2) {
  const Utils2 = utils;
  function clearCanvas(ctx, canvas2, size2) {
    ctx.clearRect(0, 0, canvas2.width, canvas2.height);
    if (!canvas2.style)
      canvas2.style = {};
    canvas2.height = size2;
    canvas2.width = size2;
    canvas2.style.height = size2 + "px";
    canvas2.style.width = size2 + "px";
  }
  function getCanvasElement() {
    try {
      return document.createElement("canvas");
    } catch (e2) {
      throw new Error("You need to specify a canvas element");
    }
  }
  exports2.render = function render2(qrData, canvas2, options) {
    let opts = options;
    let canvasEl = canvas2;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!canvas2) {
      canvasEl = getCanvasElement();
    }
    opts = Utils2.getOptions(opts);
    const size2 = Utils2.getImageWidth(qrData.modules.size, opts);
    const ctx = canvasEl.getContext("2d");
    const image = ctx.createImageData(size2, size2);
    Utils2.qrToImageData(image.data, qrData, opts);
    clearCanvas(ctx, canvasEl, size2);
    ctx.putImageData(image, 0, 0);
    return canvasEl;
  };
  exports2.renderToDataURL = function renderToDataURL(qrData, canvas2, options) {
    let opts = options;
    if (typeof opts === "undefined" && (!canvas2 || !canvas2.getContext)) {
      opts = canvas2;
      canvas2 = void 0;
    }
    if (!opts)
      opts = {};
    const canvasEl = exports2.render(qrData, canvas2, opts);
    const type = opts.type || "image/png";
    const rendererOpts = opts.rendererOpts || {};
    return canvasEl.toDataURL(type, rendererOpts.quality);
  };
})(canvas);
var svgTag = {};
const Utils$1 = utils;
function getColorAttrib(color, attrib) {
  const alpha = color.a / 255;
  const str = attrib + '="' + color.hex + '"';
  return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
}
function svgCmd(cmd, x, y) {
  let str = cmd + x;
  if (typeof y !== "undefined")
    str += " " + y;
  return str;
}
function qrToPath(data, size2, margin) {
  let path = "";
  let moveBy = 0;
  let newRow = false;
  let lineLength = 0;
  for (let i = 0; i < data.length; i++) {
    const col = Math.floor(i % size2);
    const row = Math.floor(i / size2);
    if (!col && !newRow)
      newRow = true;
    if (data[i]) {
      lineLength++;
      if (!(i > 0 && col > 0 && data[i - 1])) {
        path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
        moveBy = 0;
        newRow = false;
      }
      if (!(col + 1 < size2 && data[i + 1])) {
        path += svgCmd("h", lineLength);
        lineLength = 0;
      }
    } else {
      moveBy++;
    }
  }
  return path;
}
svgTag.render = function render(qrData, options, cb) {
  const opts = Utils$1.getOptions(options);
  const size2 = qrData.modules.size;
  const data = qrData.modules.data;
  const qrcodesize = size2 + opts.margin * 2;
  const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
  const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size2, opts.margin) + '"/>';
  const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
  const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
  const svgTag2 = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
  if (typeof cb === "function") {
    cb(null, svgTag2);
  }
  return svgTag2;
};
const canPromise = canPromise$1;
const QRCode = qrcode;
const CanvasRenderer = canvas;
const SvgRenderer = svgTag;
function renderCanvas(renderFunc, canvas2, text, opts, cb) {
  const args = [].slice.call(arguments, 1);
  const argsNum = args.length;
  const isLastArgCb = typeof args[argsNum - 1] === "function";
  if (!isLastArgCb && !canPromise()) {
    throw new Error("Callback required as last argument");
  }
  if (isLastArgCb) {
    if (argsNum < 2) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 2) {
      cb = text;
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 3) {
      if (canvas2.getContext && typeof cb === "undefined") {
        cb = opts;
        opts = void 0;
      } else {
        cb = opts;
        opts = text;
        text = canvas2;
        canvas2 = void 0;
      }
    }
  } else {
    if (argsNum < 1) {
      throw new Error("Too few arguments provided");
    }
    if (argsNum === 1) {
      text = canvas2;
      canvas2 = opts = void 0;
    } else if (argsNum === 2 && !canvas2.getContext) {
      opts = text;
      text = canvas2;
      canvas2 = void 0;
    }
    return new Promise(function(resolve2, reject) {
      try {
        const data = QRCode.create(text, opts);
        resolve2(renderFunc(data, canvas2, opts));
      } catch (e2) {
        reject(e2);
      }
    });
  }
  try {
    const data = QRCode.create(text, opts);
    cb(null, renderFunc(data, canvas2, opts));
  } catch (e2) {
    cb(e2);
  }
}
browser.create = QRCode.create;
browser.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
browser.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
browser.toString = renderCanvas.bind(null, function(data, _, opts) {
  return SvgRenderer.render(data, opts);
});
const numericProp = [Number, String];
const makeRequiredProp = (type) => ({
  type,
  required: true
});
const makeArrayProp = () => ({
  type: Array,
  default: () => []
});
const makeBooleanProp = (defaultVal) => ({
  type: Boolean,
  default: defaultVal
});
const makeNumberProp = (defaultVal) => ({
  type: Number,
  default: defaultVal
});
const makeNumericProp = (defaultVal) => ({
  type: numericProp,
  default: defaultVal
});
const makeStringProp = (defaultVal) => ({
  type: String,
  default: defaultVal
});
const baseProps = {
  /**
   * 自定义根节点样式
   */
  customStyle: makeStringProp(""),
  /**
   * 自定义根节点样式类
   */
  customClass: makeStringProp("")
};
const badgeProps = {
  ...baseProps,
  /**
   * 显示值
   */
  modelValue: numericProp,
  /** 当数值为 0 时，是否展示徽标 */
  showZero: makeBooleanProp(false),
  bgColor: String,
  /**
   * 最大值，超过最大值会显示 '{max}+'，要求 value 是 Number 类型
   */
  max: Number,
  /**
   * 是否为红色点状标注
   */
  isDot: Boolean,
  /**
   * 是否隐藏 badge
   */
  hidden: Boolean,
  /**
   * badge类型，可选值primary / success / warning / danger / info
   */
  type: makeStringProp(void 0),
  /**
   * 为正时，角标向下偏移对应的像素
   */
  top: numericProp,
  /**
   * 为正时，角标向左偏移对应的像素
   */
  right: numericProp
};
class AbortablePromise {
  constructor(executor) {
    this._reject = null;
    this.promise = new Promise((resolve2, reject) => {
      executor(resolve2, reject);
      this._reject = reject;
    });
  }
  // 提供abort方法来中止Promise
  abort(error) {
    if (this._reject) {
      this._reject(error);
    }
  }
  then(onfulfilled, onrejected) {
    return this.promise.then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.promise.catch(onrejected);
  }
}
function uuid() {
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}
function s4() {
  return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
}
function addUnit(num) {
  return Number.isNaN(Number(num)) ? `${num}` : `${num}px`;
}
function isObj(value) {
  return Object.prototype.toString.call(value) === "[object Object]" || typeof value === "object";
}
function getType(target) {
  const typeStr = Object.prototype.toString.call(target);
  const match = typeStr.match(/\[object (\w+)\]/);
  const type = match && match.length ? match[1].toLowerCase() : "";
  return type;
}
const defaultDisplayFormat = function(items, kv) {
  const labelKey = (kv == null ? void 0 : kv.labelKey) || "value";
  if (Array.isArray(items)) {
    return items.map((item) => item[labelKey]).join(", ");
  } else {
    return items[labelKey];
  }
};
const isDef = (value) => value !== void 0 && value !== null;
const checkNumRange = (num, label = "value") => {
  if (num < 0) {
    throw new Error(`${label} shouldn't be less than zero`);
  }
};
function rgbToHex(r, g, b) {
  const hex = (r << 16 | g << 8 | b).toString(16);
  const paddedHex = "#" + "0".repeat(Math.max(0, 6 - hex.length)) + hex;
  return paddedHex;
}
function hexToRgb(hex) {
  const rgb = [];
  for (let i = 1; i < 7; i += 2) {
    rgb.push(parseInt("0x" + hex.slice(i, i + 2), 16));
  }
  return rgb;
}
const gradient = (startColor, endColor, step = 2) => {
  const sColor = hexToRgb(startColor);
  const eColor = hexToRgb(endColor);
  const rStep = (eColor[0] - sColor[0]) / step;
  const gStep = (eColor[1] - sColor[1]) / step;
  const bStep = (eColor[2] - sColor[2]) / step;
  const gradientColorArr = [];
  for (let i = 0; i < step; i++) {
    gradientColorArr.push(
      rgbToHex(parseInt(String(rStep * i + sColor[0])), parseInt(String(gStep * i + sColor[1])), parseInt(String(bStep * i + sColor[2])))
    );
  }
  return gradientColorArr;
};
const range = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};
const isEqual = (value1, value2) => {
  if (value1 === value2) {
    return true;
  }
  if (!Array.isArray(value1) || !Array.isArray(value2)) {
    return false;
  }
  if (value1.length !== value2.length) {
    return false;
  }
  for (let i = 0; i < value1.length; ++i) {
    if (value1[i] !== value2[i]) {
      return false;
    }
  }
  return true;
};
const context = {
  id: 1e3
};
function getRect(selector, all, scope, useFields) {
  return new Promise((resolve2, reject) => {
    let query = null;
    if (scope) {
      query = index.createSelectorQuery().in(scope);
    } else {
      query = index.createSelectorQuery();
    }
    const method = all ? "selectAll" : "select";
    const callback = (rect) => {
      if (all && isArray(rect) && rect.length > 0) {
        resolve2(rect);
      } else if (!all && rect) {
        resolve2(rect);
      } else {
        reject(new Error("No nodes found"));
      }
    };
    {
      query[method](selector).boundingClientRect(callback).exec();
    }
  });
}
function kebabCase(word) {
  const newWord = word.replace(/[A-Z]/g, function(match) {
    return "-" + match;
  }).toLowerCase();
  return newWord;
}
function camelCase(word) {
  return word.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}
function isArray(value) {
  if (typeof Array.isArray === "function") {
    return Array.isArray(value);
  }
  return Object.prototype.toString.call(value) === "[object Array]";
}
function isFunction(value) {
  return getType(value) === "function" || getType(value) === "asyncfunction";
}
function isString(value) {
  return getType(value) === "string";
}
function isNumber(value) {
  return getType(value) === "number";
}
function isPromise(value) {
  if (isObj(value) && isDef(value)) {
    return isFunction(value.then) && isFunction(value.catch);
  }
  return false;
}
function objToStyle(styles) {
  if (isArray(styles)) {
    const result = styles.filter(function(item) {
      return item != null && item !== "";
    }).map(function(item) {
      return objToStyle(item);
    }).join(";");
    return result ? result.endsWith(";") ? result : result + ";" : "";
  }
  if (isString(styles)) {
    return styles ? styles.endsWith(";") ? styles : styles + ";" : "";
  }
  if (isObj(styles)) {
    const result = Object.keys(styles).filter(function(key) {
      return styles[key] != null && styles[key] !== "";
    }).map(function(key) {
      return [kebabCase(key), styles[key]].join(":");
    }).join(";");
    return result ? result.endsWith(";") ? result : result + ";" : "";
  }
  return "";
}
const pause = (ms = 1e3 / 30) => {
  return new AbortablePromise((resolve2) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve2(true);
    }, ms);
  });
};
function deepClone(obj, cache = /* @__PURE__ */ new Map()) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (isDate(obj)) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  if (obj instanceof Error) {
    const errorCopy = new Error(obj.message);
    errorCopy.stack = obj.stack;
    return errorCopy;
  }
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  const copy = Array.isArray(obj) ? [] : {};
  cache.set(obj, copy);
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepClone(obj[key], cache);
    }
  }
  return copy;
}
function deepMerge(target, source) {
  target = deepClone(target);
  if (typeof target !== "object" || typeof source !== "object") {
    throw new Error("Both target and source must be objects.");
  }
  for (const prop in source) {
    if (!source.hasOwnProperty(prop))
      continue;
    target[prop] = source[prop];
  }
  return target;
}
function deepAssign(target, source) {
  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const newObjValue = source[key];
    if (isObj(targetValue) && isObj(newObjValue)) {
      deepAssign(targetValue, newObjValue);
    } else {
      target[key] = newObjValue;
    }
  });
  return target;
}
function debounce(func, wait, options = {}) {
  let timeoutId = null;
  let lastArgs;
  let lastThis;
  let result;
  const leading = isDef(options.leading) ? options.leading : false;
  const trailing = isDef(options.trailing) ? options.trailing : true;
  function invokeFunc() {
    if (lastArgs !== void 0) {
      result = func.apply(lastThis, lastArgs);
      lastArgs = void 0;
    }
  }
  function startTimer() {
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (trailing) {
        invokeFunc();
      }
    }, wait);
  }
  function cancelTimer() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    if (timeoutId === null) {
      if (leading) {
        invokeFunc();
      }
      startTimer();
    } else if (trailing) {
      cancelTimer();
      startTimer();
    }
    return result;
  }
  return debounced;
}
const getPropByPath = (obj, path) => {
  const keys = path.split(".");
  try {
    return keys.reduce((acc, key) => acc !== void 0 && acc !== null ? acc[key] : void 0, obj);
  } catch (error) {
    return void 0;
  }
};
const isDate = (val) => Object.prototype.toString.call(val) === "[object Date]" && !Number.isNaN(val.getTime());
function getSystemInfo() {
  let systemInfo;
  try {
    const deviceInfo = index.getDeviceInfo();
    const windowInfo = index.getWindowInfo();
    const appBaseInfo = index.getAppBaseInfo();
    systemInfo = {
      ...deviceInfo,
      ...windowInfo,
      ...appBaseInfo
    };
  } catch (error) {
    console.warn("获取系统信息失败，降级使用uni.getSystemInfoSync:", error);
    systemInfo = index.getSystemInfoSync();
  }
  return systemInfo;
}
const overlayProps = {
  ...baseProps,
  /**
   * 是否展示遮罩层
   */
  show: makeBooleanProp(false),
  /**
   * 动画时长，单位毫秒
   */
  duration: {
    type: [Object, Number, Boolean],
    default: 300
  },
  /**
   * 是否锁定滚动
   */
  lockScroll: makeBooleanProp(true),
  /**
   * 层级
   */
  zIndex: makeNumberProp(10)
};
const transitionProps = {
  ...baseProps,
  /**
   * 是否展示组件
   * 类型：boolean
   * 默认值：false
   */
  show: makeBooleanProp(false),
  /**
   * 动画执行时间
   * 类型：number | boolean | Record<string, number>
   * 默认值：300 (毫秒)
   */
  duration: {
    type: [Object, Number, Boolean],
    default: 300
  },
  /**
   * 弹层内容懒渲染，触发展示时才渲染内容
   * 类型：boolean
   * 默认值：false
   */
  lazyRender: makeBooleanProp(false),
  /**
   * 动画类型
   * 类型：string
   * 可选值：fade / fade-up / fade-down / fade-left / fade-right / slide-up / slide-down / slide-left / slide-right / zoom-in
   * 默认值：'fade'
   */
  name: [String, Array],
  /**
   * 是否在动画结束时销毁子节点（display: none)
   * 类型：boolean
   * 默认值：false
   */
  destroy: makeBooleanProp(true),
  /**
   * 进入过渡的开始状态
   * 类型：string
   */
  enterClass: makeStringProp(""),
  /**
   * 进入过渡的激活状态
   * 类型：string
   */
  enterActiveClass: makeStringProp(""),
  /**
   * 进入过渡的结束状态
   * 类型：string
   */
  enterToClass: makeStringProp(""),
  /**
   * 离开过渡的开始状态
   * 类型：string
   */
  leaveClass: makeStringProp(""),
  /**
   * 离开过渡的激活状态
   * 类型：string
   */
  leaveActiveClass: makeStringProp(""),
  /**
   * 离开过渡的结束状态
   * 类型：string
   */
  leaveToClass: makeStringProp(""),
  /**
   * 是否阻止触摸滚动
   * 类型：boolean
   * 默认值：false
   */
  disableTouchMove: makeBooleanProp(false)
};
const pickerViewProps = {
  ...baseProps,
  /**
   * 加载状态
   */
  loading: makeBooleanProp(false),
  /**
   * 加载的颜色，只能使用十六进制的色值写法，且不能使用缩写
   */
  loadingColor: makeStringProp("#4D80F0"),
  /**
   * picker内部滚筒高
   */
  columnsHeight: makeNumberProp(217),
  /**
   * picker item的高度
   */
  itemHeight: makeNumberProp(35),
  /**
   * 选项对象中，value对应的 key
   */
  valueKey: makeStringProp("value"),
  /**
   * 选项对象中，展示的文本对应的 key
   */
  labelKey: makeStringProp("label"),
  /**
   * 是否在手指松开时立即触发picker-view的 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
   */
  immediateChange: makeBooleanProp(false),
  /**
   * 选中项，如果为多列选择器，则其类型应为数组
   */
  modelValue: {
    type: [String, Number, Boolean, Array, Array, Array],
    default: "",
    required: true
  },
  /**
   * 选择器数据，可以为字符串数组，也可以为对象数组，如果为二维数组，则为多列选择器
   */
  columns: makeArrayProp(),
  /**
   * 接收 pickerView 实例、选中项、当前修改列的下标、resolve 作为入参，根据选中项和列下标进行判断，通过 pickerView 实例暴露出来的 setColumnData 方法修改其他列的数据源。
   */
  columnChange: Function
};
function formatArray(array, valueKey, labelKey) {
  let tempArray = isArray(array) ? array : [array];
  const firstLevelTypeList = new Set(array.map(getType));
  if (firstLevelTypeList.size !== 1 && firstLevelTypeList.has("object")) {
    throw Error("The columns are correct");
  }
  if (!isArray(array[0])) {
    tempArray = [tempArray];
  }
  const result = tempArray.map((col) => {
    return col.map((row) => {
      if (!isObj(row)) {
        return {
          [valueKey]: row,
          [labelKey]: row
        };
      }
      if (!row.hasOwnProperty(valueKey) && !row.hasOwnProperty(labelKey)) {
        throw Error("Can't find valueKey and labelKey in columns");
      }
      if (!row.hasOwnProperty(labelKey)) {
        row[labelKey] = row[valueKey];
      }
      if (!row.hasOwnProperty(valueKey)) {
        row[valueKey] = row[labelKey];
      }
      return row;
    });
  });
  return result;
}
const zhCN = {
  calendar: {
    placeholder: "请选择",
    title: "选择日期",
    day: "日",
    week: "周",
    month: "月",
    confirm: "确定",
    startTime: "开始时间",
    endTime: "结束时间",
    to: "至",
    timeFormat: "YY年MM月DD日 HH:mm:ss",
    dateFormat: "YYYY年MM月DD日",
    weekFormat: (year, week) => `${year} 第 ${week} 周`,
    startWeek: "开始周",
    endWeek: "结束周",
    startMonth: "开始月",
    endMonth: "结束月",
    monthFormat: "YYYY年MM月"
  },
  calendarView: {
    startTime: "开始",
    endTime: "结束",
    weeks: {
      sun: "日",
      mon: "一",
      tue: "二",
      wed: "三",
      thu: "四",
      fri: "五",
      sat: "六"
    },
    rangePrompt: (maxRange) => `选择天数不能超过${maxRange}天`,
    rangePromptWeek: (maxRange) => `选择周数不能超过${maxRange}周`,
    rangePromptMonth: (maxRange) => `选择月份不能超过${maxRange}个月`,
    monthTitle: "YYYY年M月",
    yearTitle: "YYYY年",
    month: "M月",
    hour: (value) => `${value}时`,
    minute: (value) => `${value}分`,
    second: (value) => `${value}秒`
  },
  collapse: {
    expand: "展开",
    retract: "收起"
  },
  colPicker: {
    title: "请选择",
    placeholder: "请选择",
    select: "请选择"
  },
  datetimePicker: {
    start: "开始时间",
    end: "结束时间",
    to: "至",
    placeholder: "请选择",
    confirm: "完成",
    cancel: "取消"
  },
  loadmore: {
    loading: "正在努力加载中...",
    finished: "已加载完毕",
    error: "加载失败",
    retry: "点击重试"
  },
  messageBox: {
    inputPlaceholder: "请输入",
    confirm: "确定",
    cancel: "取消",
    inputNoValidate: "输入的数据不合法"
  },
  numberKeyboard: {
    confirm: "完成"
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: (value) => `当前页：${value}`,
    total: (total) => `当前数据：${total}条`,
    size: (size2) => `分页大小：${size2}`
  },
  picker: {
    cancel: "取消",
    done: "完成",
    placeholder: "请选择"
  },
  imgCropper: {
    confirm: "完成",
    cancel: "取消"
  },
  search: {
    search: "搜索",
    cancel: "取消"
  },
  steps: {
    wait: "未开始",
    finished: "已完成",
    process: "进行中",
    failed: "失败"
  },
  tabs: {
    all: "全部"
  },
  upload: {
    error: "上传失败"
  },
  input: {
    placeholder: "请输入..."
  },
  selectPicker: {
    title: "请选择",
    placeholder: "请选择",
    select: "请选择",
    confirm: "确认",
    filterPlaceholder: "搜索"
  },
  tag: {
    placeholder: "请输入",
    add: "新增标签"
  },
  textarea: {
    placeholder: "请输入..."
  },
  tableCol: {
    indexLabel: "序号"
  },
  tour: {
    prev: "上一步",
    next: "下一步",
    finish: "完成",
    skip: "跳过"
  },
  signature: {
    confirmText: "确认",
    clearText: "清空",
    revokeText: "撤销",
    restoreText: "恢复"
  },
  slideVerify: {
    text: "向右滑动验证",
    successText: "验证通过"
  }
};
const lang = ref("zh-CN");
const messages = reactive({
  "zh-CN": zhCN
});
const Locale = {
  messages() {
    return messages[lang.value];
  },
  use(newLang, newMessage) {
    lang.value = newLang;
    if (newMessage) {
      this.add({ [newLang]: newMessage });
    }
  },
  add(newMessages = {}) {
    deepAssign(messages, newMessages);
  }
};
const useTranslate = (name) => {
  const prefix = name ? camelCase(name) + "." : "";
  const translate = (key, ...args) => {
    const currentMessages = Locale.messages();
    const message = getPropByPath(currentMessages, prefix + key);
    return isFunction(message) ? message(...args) : isDef(message) ? message : `${prefix}${key}`;
  };
  return { translate };
};
const pickerProps = {
  ...baseProps,
  /**
   * label 外部自定义样式
   */
  customLabelClass: makeStringProp(""),
  /**
   * value 外部自定义样式
   */
  customValueClass: makeStringProp(""),
  /**
   * pickerView 外部自定义样式
   */
  customViewClass: makeStringProp(""),
  /**
   * 选择器左侧文案
   */
  label: String,
  /**
   * 选择器占位符
   */
  placeholder: String,
  /**
   * 是否禁用
   */
  disabled: makeBooleanProp(false),
  /**
   * 是否只读
   */
  readonly: makeBooleanProp(false),
  /**
   * 加载中
   */
  loading: makeBooleanProp(false),
  /**
   * 加载中颜色
   */
  loadingColor: makeStringProp("#4D80F0"),
  /* popup */
  /**
   * 弹出层标题
   */
  title: String,
  /**
   * 取消按钮文案
   */
  cancelButtonText: String,
  /**
   * 确认按钮文案
   */
  confirmButtonText: String,
  /**
   * 是否必填
   */
  required: makeBooleanProp(false),
  /**
   * 尺寸
   */
  size: String,
  /**
   * 设置左侧标题宽度
   */
  labelWidth: makeStringProp("33%"),
  /**
   * 使用默认插槽
   * @deprecated 可以直接使用默认插槽，无需配置此选项
   */
  useDefaultSlot: makeBooleanProp(false),
  /**
   * 使用标签插槽
   * @deprecated 可以直接使用标签插槽，无需配置此选项
   */
  useLabelSlot: makeBooleanProp(false),
  /**
   * 错误状态
   */
  error: makeBooleanProp(false),
  /**
   * 右对齐
   */
  alignRight: makeBooleanProp(false),
  /**
   * 确定前校验函数，接收 (value, resolve, picker) 参数，通过 resolve 继续执行 picker，resolve 接收1个boolean参数
   */
  beforeConfirm: Function,
  /**
   * 点击蒙层关闭
   */
  closeOnClickModal: makeBooleanProp(true),
  /**
   * 底部安全区域内
   */
  safeAreaInsetBottom: makeBooleanProp(true),
  /**
   * 文本溢出显示省略号
   */
  ellipsis: makeBooleanProp(false),
  /**
   * 选项总高度
   */
  columnsHeight: makeNumberProp(217),
  /**
   * 选项值对应的键名
   */
  valueKey: makeStringProp("value"),
  /**
   * 选项文本对应的键名
   */
  labelKey: makeStringProp("label"),
  /**
   * 选中项，如果为多列选择器，则其类型应为数组
   */
  modelValue: {
    type: [String, Number, Array],
    default: ""
  },
  /**
   * 选择器数据，可以为字符串数组，也可以为对象数组，如果为二维数组，则为多列选择器
   */
  columns: {
    type: Array,
    default: () => []
  },
  /**
   * 接收 pickerView 实例、选中项、当前修改列的下标、resolve 作为入参，根据选中项和列下标进行判断，通过 pickerView 实例暴露出来的 setColumnData 方法修改其他列的数据源。
   */
  columnChange: Function,
  /**
   * 自定义展示文案的格式化函数，返回一个字符串
   */
  displayFormat: Function,
  /**
   * 自定义层级
   */
  zIndex: makeNumberProp(15),
  /**
   * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
   */
  prop: String,
  /**
   * 表单验证规则，结合wd-form组件使用
   */
  rules: makeArrayProp(),
  /**
   * 是否在手指松开时立即触发 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
   */
  immediateChange: makeBooleanProp(false),
  /**
   * 是否从页面中脱离出来，用于解决各种 fixed 失效问题 (H5: teleport, APP: renderjs, 小程序: root-portal)
   */
  rootPortal: makeBooleanProp(false),
  /**
   * 显示清空按钮
   */
  clearable: makeBooleanProp(false),
  /**
   * 必填标记位置，可选值：before、after
   */
  markerSide: makeStringProp("before")
};
function useParent(key) {
  const parent = inject(key, null);
  if (parent) {
    const instance = getCurrentInstance();
    const { link, unlink, internalChildren } = parent;
    link(instance);
    onUnmounted(() => unlink(instance));
    const index2 = computed(() => internalChildren.indexOf(instance));
    return {
      parent,
      index: index2
    };
  }
  return {
    parent: null,
    index: ref(-1)
  };
}
const TABS_KEY = Symbol("wd-tabs");
const tabsProps = {
  ...baseProps,
  /**
   * 绑定值
   */
  modelValue: makeNumericProp(0),
  /**
   * 标签数超过阈值可滑动
   */
  slidableNum: makeNumberProp(6),
  /**
   * 标签数超过阈值显示导航地图
   */
  mapNum: makeNumberProp(10),
  /**
   * 导航地图的标题
   */
  mapTitle: String,
  /**
   * 粘性布局
   */
  sticky: makeBooleanProp(false),
  /**
   * 粘性布局吸顶位置
   */
  offsetTop: makeNumberProp(0),
  /**
   * 开启手势滑动
   */
  swipeable: makeBooleanProp(false),
  /**
   * 自动调整底部条宽度，设置了 lineWidth 后无效
   */
  autoLineWidth: makeBooleanProp(false),
  /**
   * 底部条宽度，单位像素
   */
  lineWidth: numericProp,
  /**
   * 底部条高度，单位像素
   */
  lineHeight: numericProp,
  /**
   * 颜色
   */
  color: makeStringProp(""),
  /**
   * 非活动状态颜色
   */
  inactiveColor: makeStringProp(""),
  /**
   * 是否开启切换标签内容时的过渡动画
   */
  animated: makeBooleanProp(false),
  /**
   * 切换动画过渡时间，单位毫秒
   */
  duration: makeNumberProp(300),
  /**
   * 是否开启滚动导航
   * 可选值：'auto' | 'always'
   * @default auto
   */
  slidable: makeStringProp("auto"),
  /**
   * 标签可滑动时是否显示滚动条
   */
  showScrollbar: makeBooleanProp(false)
};
const tabProps = {
  ...baseProps,
  /**
   * 唯一标识符
   */
  name: numericProp,
  /**
   * tab的标题
   */
  title: String,
  /**
   *  是否禁用，无法点击
   */
  disabled: makeBooleanProp(false),
  /**
   * 是否懒加载，切换到该tab时才加载内容
   * @default true
   */
  lazy: makeBooleanProp(true),
  /**
   * 徽标属性，透传给 Badge 组件
   */
  badgeProps: Object
};
function useTouch() {
  const direction = ref("");
  const deltaX = ref(0);
  const deltaY = ref(0);
  const offsetX = ref(0);
  const offsetY = ref(0);
  const startX = ref(0);
  const startY = ref(0);
  function touchStart(event) {
    const touch = event.touches[0];
    direction.value = "";
    deltaX.value = 0;
    deltaY.value = 0;
    offsetX.value = 0;
    offsetY.value = 0;
    startX.value = touch.clientX;
    startY.value = touch.clientY;
  }
  function touchMove(event) {
    const touch = event.touches[0];
    deltaX.value = touch.clientX - startX.value;
    deltaY.value = touch.clientY - startY.value;
    offsetX.value = Math.abs(deltaX.value);
    offsetY.value = Math.abs(deltaY.value);
    direction.value = offsetX.value > offsetY.value ? "horizontal" : offsetX.value < offsetY.value ? "vertical" : "";
  }
  return {
    touchStart,
    touchMove,
    direction,
    deltaX,
    deltaY,
    offsetX,
    offsetY,
    startX,
    startY
  };
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function flattenVNodes(children) {
  const result = [];
  const traverse2 = (children2) => {
    const vNode = Array.isArray(children2) ? children2 : [children2];
    vNode.forEach((child) => {
      var _a;
      if (Array.isArray(child)) {
        traverse2(child);
      } else if (isVNode(child) && ((_a = child.component) == null ? void 0 : _a.subTree)) {
        result.push(child);
        traverse2(child.component.subTree);
      } else if (isVNode(child) && Array.isArray(child.children)) {
        traverse2(child.children);
      } else if (isVNode(child)) {
        result.push(child);
      }
    });
  };
  traverse2(children);
  return result;
}
const findVNodeIndex = (vnodes, vnode) => {
  const index2 = vnodes.indexOf(vnode);
  if (index2 === -1) {
    return vnodes.findIndex((item) => vnode.key !== void 0 && vnode.key !== null && item.type === vnode.type && item.key === vnode.key);
  }
  return index2;
};
function sortChildren(parent, publicChildren, internalChildren) {
  const vnodes = parent && parent.subTree && parent.subTree.children ? flattenVNodes(parent.subTree) : [];
  internalChildren.sort((a, b) => findVNodeIndex(vnodes, a.vnode) - findVNodeIndex(vnodes, b.vnode));
  const orderedPublicChildren = internalChildren.map((item) => item.proxy);
  publicChildren.sort((a, b) => {
    const getIndex = (comp) => {
      const uid2 = comp.$.uid;
      return orderedPublicChildren.findIndex((i) => i.$.uid === uid2);
    };
    const indexA = getIndex(a);
    const indexB = getIndex(b);
    return indexA - indexB;
  });
}
function useChildren(key) {
  const publicChildren = reactive([]);
  const internalChildren = reactive([]);
  const parent = getCurrentInstance();
  const linkChildren = (value) => {
    const link = (child) => {
      if (child.proxy) {
        internalChildren.push(child);
        publicChildren.push(child.proxy);
        sortChildren(parent, publicChildren, internalChildren);
      }
    };
    const unlink = (child) => {
      const index2 = internalChildren.indexOf(child);
      publicChildren.splice(index2, 1);
      internalChildren.splice(index2, 1);
    };
    provide(
      key,
      Object.assign(
        {
          link,
          unlink,
          children: publicChildren,
          internalChildren
        },
        value
      )
    );
  };
  return {
    children: publicChildren,
    linkChildren
  };
}
const toastDefaultOptionKey = "__TOAST_OPTION__";
const defaultOptions = {
  duration: 2e3,
  show: false
};
const None = Symbol("None");
const toastTimerMap = /* @__PURE__ */ new Map();
function useToast(selector = "") {
  const toastOptionKey = getToastOptionKey(selector);
  const toastOption = inject(toastOptionKey, ref(None));
  if (toastOption.value === None) {
    toastOption.value = defaultOptions;
    provide(toastOptionKey, toastOption);
  }
  const createMethod = (toastOptions) => {
    return (options) => {
      return show(deepMerge(toastOptions, typeof options === "string" ? { msg: options } : options));
    };
  };
  const show = (option) => {
    const options = deepMerge(defaultOptions, typeof option === "string" ? { msg: option } : option);
    toastOption.value = deepMerge(options, {
      show: true
    });
    const prevTimer = toastTimerMap.get(toastOptionKey);
    if (prevTimer) {
      clearTimeout(prevTimer);
      toastTimerMap.delete(toastOptionKey);
    }
    if (options.duration && options.duration > 0) {
      const nextTimer = setTimeout(() => {
        toastTimerMap.delete(toastOptionKey);
        close();
      }, options.duration);
      toastTimerMap.set(toastOptionKey, nextTimer);
    }
  };
  const loading = createMethod({
    iconName: "loading",
    duration: 0,
    cover: true
  });
  const success = createMethod({
    iconName: "success",
    duration: 1500
  });
  const error = createMethod({ iconName: "error" });
  const warning = createMethod({ iconName: "warning" });
  const info = createMethod({ iconName: "info" });
  const close = () => {
    const timer = toastTimerMap.get(toastOptionKey);
    if (timer) {
      clearTimeout(timer);
      toastTimerMap.delete(toastOptionKey);
    }
    toastOption.value = { show: false };
  };
  return {
    show,
    loading,
    success,
    error,
    warning,
    info,
    close
  };
}
const getToastOptionKey = (selector) => {
  return selector ? `${toastDefaultOptionKey}${selector}` : toastDefaultOptionKey;
};
const CELL_GROUP_KEY = Symbol("wd-cell-group");
({
  ...baseProps
});
function useCell() {
  const { parent: cellGroup, index: index2 } = useParent(CELL_GROUP_KEY);
  const border = computed(() => {
    return cellGroup && cellGroup.props.border && index2.value;
  });
  return { border };
}
const USE_CONFIG_PROVIDER_KEY = "__CONFIG_PROVIDER__";
var SECONDS_A_MINUTE = 60;
var SECONDS_A_HOUR = SECONDS_A_MINUTE * 60;
var SECONDS_A_DAY = SECONDS_A_HOUR * 24;
var SECONDS_A_WEEK = SECONDS_A_DAY * 7;
var MILLISECONDS_A_SECOND = 1e3;
var MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND;
var MS = "millisecond";
var S = "second";
var MIN = "minute";
var H = "hour";
var D = "day";
var W = "week";
var M = "month";
var Q = "quarter";
var Y = "year";
var DATE = "date";
var FORMAT_DEFAULT = "YYYY-MM-DDTHH:mm:ssZ";
var INVALID_DATE_STRING = "Invalid Date";
var REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
var REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
const en = {
  name: "en",
  weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
  months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
  ordinal: function ordinal(n2) {
    var s2 = ["th", "st", "nd", "rd"];
    var v = n2 % 100;
    return "[" + n2 + (s2[(v - 20) % 10] || s2[v] || s2[0]) + "]";
  }
};
var padStart = function padStart2(string, length, pad) {
  var s2 = String(string);
  if (!s2 || s2.length >= length)
    return string;
  return "" + Array(length + 1 - s2.length).join(pad) + string;
};
var padZoneStr = function padZoneStr2(instance) {
  var negMinutes = -instance.utcOffset();
  var minutes = Math.abs(negMinutes);
  var hourOffset = Math.floor(minutes / 60);
  var minuteOffset = minutes % 60;
  return (negMinutes <= 0 ? "+" : "-") + padStart(hourOffset, 2, "0") + ":" + padStart(minuteOffset, 2, "0");
};
var monthDiff = function monthDiff2(a, b) {
  if (a.date() < b.date())
    return -monthDiff2(b, a);
  var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month());
  var anchor = a.clone().add(wholeMonthDiff, M);
  var c = b - anchor < 0;
  var anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), M);
  return +(-(wholeMonthDiff + (b - anchor) / (c ? anchor - anchor2 : anchor2 - anchor)) || 0);
};
var absFloor = function absFloor2(n2) {
  return n2 < 0 ? Math.ceil(n2) || 0 : Math.floor(n2);
};
var prettyUnit = function prettyUnit2(u) {
  var special = {
    M,
    y: Y,
    w: W,
    d: D,
    D: DATE,
    h: H,
    m: MIN,
    s: S,
    ms: MS,
    Q
  };
  return special[u] || String(u || "").toLowerCase().replace(/s$/, "");
};
var isUndefined = function isUndefined2(s2) {
  return s2 === void 0;
};
const U = {
  s: padStart,
  z: padZoneStr,
  m: monthDiff,
  a: absFloor,
  p: prettyUnit,
  u: isUndefined
};
var L = "en";
var Ls = {};
Ls[L] = en;
var IS_DAYJS = "$isDayjsObject";
var isDayjs = function isDayjs2(d) {
  return d instanceof Dayjs || !!(d && d[IS_DAYJS]);
};
var parseLocale = function parseLocale2(preset, object, isLocal) {
  var l;
  if (!preset)
    return L;
  if (typeof preset === "string") {
    var presetLower = preset.toLowerCase();
    if (Ls[presetLower]) {
      l = presetLower;
    }
    if (object) {
      Ls[presetLower] = object;
      l = presetLower;
    }
    var presetSplit = preset.split("-");
    if (!l && presetSplit.length > 1) {
      return parseLocale2(presetSplit[0]);
    }
  } else {
    var name = preset.name;
    Ls[name] = preset;
    l = name;
  }
  if (!isLocal && l)
    L = l;
  return l || !isLocal && L;
};
var dayjs = function dayjs2(date, c) {
  if (isDayjs(date)) {
    return date.clone();
  }
  var cfg = typeof c === "object" ? c : {};
  cfg.date = date;
  cfg.args = arguments;
  return new Dayjs(cfg);
};
var wrapper = function wrapper2(date, instance) {
  return dayjs(date, {
    locale: instance.$L,
    utc: instance.$u,
    x: instance.$x,
    $offset: instance.$offset
    // todo: refactor; do not use this.$offset in you code
  });
};
var Utils = U;
Utils.l = parseLocale;
Utils.i = isDayjs;
Utils.w = wrapper;
var parseDate = function parseDate2(cfg) {
  var date = cfg.date, utc = cfg.utc;
  if (date === null)
    return /* @__PURE__ */ new Date(NaN);
  if (Utils.u(date))
    return /* @__PURE__ */ new Date();
  if (date instanceof Date)
    return new Date(date);
  if (typeof date === "string" && !/Z$/i.test(date)) {
    var d = date.match(REGEX_PARSE);
    if (d) {
      var m = d[2] - 1 || 0;
      var ms = (d[7] || "0").substring(0, 3);
      if (utc) {
        return new Date(Date.UTC(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms));
      }
      return new Date(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms);
    }
  }
  return new Date(date);
};
var Dayjs = /* @__PURE__ */ function() {
  function Dayjs2(cfg) {
    this.$L = parseLocale(cfg.locale, null, true);
    this.parse(cfg);
    this.$x = this.$x || cfg.x || {};
    this[IS_DAYJS] = true;
  }
  var _proto = Dayjs2.prototype;
  _proto.parse = function parse(cfg) {
    this.$d = parseDate(cfg);
    this.init();
  };
  _proto.init = function init() {
    var $d = this.$d;
    this.$y = $d.getFullYear();
    this.$M = $d.getMonth();
    this.$D = $d.getDate();
    this.$W = $d.getDay();
    this.$H = $d.getHours();
    this.$m = $d.getMinutes();
    this.$s = $d.getSeconds();
    this.$ms = $d.getMilliseconds();
  };
  _proto.$utils = function $utils() {
    return Utils;
  };
  _proto.isValid = function isValid2() {
    return !(this.$d.toString() === INVALID_DATE_STRING);
  };
  _proto.isSame = function isSame(that, units) {
    var other = dayjs(that);
    return this.startOf(units) <= other && other <= this.endOf(units);
  };
  _proto.isAfter = function isAfter(that, units) {
    return dayjs(that) < this.startOf(units);
  };
  _proto.isBefore = function isBefore(that, units) {
    return this.endOf(units) < dayjs(that);
  };
  _proto.$g = function $g(input, get3, set2) {
    if (Utils.u(input))
      return this[get3];
    return this.set(set2, input);
  };
  _proto.unix = function unix() {
    return Math.floor(this.valueOf() / 1e3);
  };
  _proto.valueOf = function valueOf() {
    return this.$d.getTime();
  };
  _proto.startOf = function startOf(units, _startOf) {
    var _this = this;
    var isStartOf = !Utils.u(_startOf) ? _startOf : true;
    var unit = Utils.p(units);
    var instanceFactory = function instanceFactory2(d, m) {
      var ins = Utils.w(_this.$u ? Date.UTC(_this.$y, m, d) : new Date(_this.$y, m, d), _this);
      return isStartOf ? ins : ins.endOf(D);
    };
    var instanceFactorySet = function instanceFactorySet2(method, slice) {
      var argumentStart = [0, 0, 0, 0];
      var argumentEnd = [23, 59, 59, 999];
      return Utils.w(_this.toDate()[method].apply(
        // eslint-disable-line prefer-spread
        _this.toDate("s"),
        (isStartOf ? argumentStart : argumentEnd).slice(slice)
      ), _this);
    };
    var $W = this.$W, $M = this.$M, $D = this.$D;
    var utcPad = "set" + (this.$u ? "UTC" : "");
    switch (unit) {
      case Y:
        return isStartOf ? instanceFactory(1, 0) : instanceFactory(31, 11);
      case M:
        return isStartOf ? instanceFactory(1, $M) : instanceFactory(0, $M + 1);
      case W: {
        var weekStart = this.$locale().weekStart || 0;
        var gap = ($W < weekStart ? $W + 7 : $W) - weekStart;
        return instanceFactory(isStartOf ? $D - gap : $D + (6 - gap), $M);
      }
      case D:
      case DATE:
        return instanceFactorySet(utcPad + "Hours", 0);
      case H:
        return instanceFactorySet(utcPad + "Minutes", 1);
      case MIN:
        return instanceFactorySet(utcPad + "Seconds", 2);
      case S:
        return instanceFactorySet(utcPad + "Milliseconds", 3);
      default:
        return this.clone();
    }
  };
  _proto.endOf = function endOf(arg) {
    return this.startOf(arg, false);
  };
  _proto.$set = function $set(units, _int) {
    var _C$D$C$DATE$C$M$C$Y$C;
    var unit = Utils.p(units);
    var utcPad = "set" + (this.$u ? "UTC" : "");
    var name = (_C$D$C$DATE$C$M$C$Y$C = {}, _C$D$C$DATE$C$M$C$Y$C[D] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[DATE] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[M] = utcPad + "Month", _C$D$C$DATE$C$M$C$Y$C[Y] = utcPad + "FullYear", _C$D$C$DATE$C$M$C$Y$C[H] = utcPad + "Hours", _C$D$C$DATE$C$M$C$Y$C[MIN] = utcPad + "Minutes", _C$D$C$DATE$C$M$C$Y$C[S] = utcPad + "Seconds", _C$D$C$DATE$C$M$C$Y$C[MS] = utcPad + "Milliseconds", _C$D$C$DATE$C$M$C$Y$C)[unit];
    var arg = unit === D ? this.$D + (_int - this.$W) : _int;
    if (unit === M || unit === Y) {
      var date = this.clone().set(DATE, 1);
      date.$d[name](arg);
      date.init();
      this.$d = date.set(DATE, Math.min(this.$D, date.daysInMonth())).$d;
    } else if (name)
      this.$d[name](arg);
    this.init();
    return this;
  };
  _proto.set = function set2(string, _int2) {
    return this.clone().$set(string, _int2);
  };
  _proto.get = function get3(unit) {
    return this[Utils.p(unit)]();
  };
  _proto.add = function add2(number, units) {
    var _this2 = this, _C$MIN$C$H$C$S$unit;
    number = Number(number);
    var unit = Utils.p(units);
    var instanceFactorySet = function instanceFactorySet2(n2) {
      var d = dayjs(_this2);
      return Utils.w(d.date(d.date() + Math.round(n2 * number)), _this2);
    };
    if (unit === M) {
      return this.set(M, this.$M + number);
    }
    if (unit === Y) {
      return this.set(Y, this.$y + number);
    }
    if (unit === D) {
      return instanceFactorySet(1);
    }
    if (unit === W) {
      return instanceFactorySet(7);
    }
    var step = (_C$MIN$C$H$C$S$unit = {}, _C$MIN$C$H$C$S$unit[MIN] = MILLISECONDS_A_MINUTE, _C$MIN$C$H$C$S$unit[H] = MILLISECONDS_A_HOUR, _C$MIN$C$H$C$S$unit[S] = MILLISECONDS_A_SECOND, _C$MIN$C$H$C$S$unit)[unit] || 1;
    var nextTimeStamp = this.$d.getTime() + number * step;
    return Utils.w(nextTimeStamp, this);
  };
  _proto.subtract = function subtract(number, string) {
    return this.add(number * -1, string);
  };
  _proto.format = function format(formatStr) {
    var _this3 = this;
    var locale = this.$locale();
    if (!this.isValid())
      return locale.invalidDate || INVALID_DATE_STRING;
    var str = formatStr || FORMAT_DEFAULT;
    var zoneStr = Utils.z(this);
    var $H = this.$H, $m = this.$m, $M = this.$M;
    var weekdays = locale.weekdays, months = locale.months, meridiem = locale.meridiem;
    var getShort = function getShort2(arr, index2, full, length) {
      return arr && (arr[index2] || arr(_this3, str)) || full[index2].slice(0, length);
    };
    var get$H = function get$H2(num) {
      return Utils.s($H % 12 || 12, num, "0");
    };
    var meridiemFunc = meridiem || function(hour, minute, isLowercase) {
      var m = hour < 12 ? "AM" : "PM";
      return isLowercase ? m.toLowerCase() : m;
    };
    var matches = function matches2(match) {
      switch (match) {
        case "YY":
          return String(_this3.$y).slice(-2);
        case "YYYY":
          return Utils.s(_this3.$y, 4, "0");
        case "M":
          return $M + 1;
        case "MM":
          return Utils.s($M + 1, 2, "0");
        case "MMM":
          return getShort(locale.monthsShort, $M, months, 3);
        case "MMMM":
          return getShort(months, $M);
        case "D":
          return _this3.$D;
        case "DD":
          return Utils.s(_this3.$D, 2, "0");
        case "d":
          return String(_this3.$W);
        case "dd":
          return getShort(locale.weekdaysMin, _this3.$W, weekdays, 2);
        case "ddd":
          return getShort(locale.weekdaysShort, _this3.$W, weekdays, 3);
        case "dddd":
          return weekdays[_this3.$W];
        case "H":
          return String($H);
        case "HH":
          return Utils.s($H, 2, "0");
        case "h":
          return get$H(1);
        case "hh":
          return get$H(2);
        case "a":
          return meridiemFunc($H, $m, true);
        case "A":
          return meridiemFunc($H, $m, false);
        case "m":
          return String($m);
        case "mm":
          return Utils.s($m, 2, "0");
        case "s":
          return String(_this3.$s);
        case "ss":
          return Utils.s(_this3.$s, 2, "0");
        case "SSS":
          return Utils.s(_this3.$ms, 3, "0");
        case "Z":
          return zoneStr;
      }
      return null;
    };
    return str.replace(REGEX_FORMAT, function(match, $1) {
      return $1 || matches(match) || zoneStr.replace(":", "");
    });
  };
  _proto.utcOffset = function utcOffset() {
    return -Math.round(this.$d.getTimezoneOffset() / 15) * 15;
  };
  _proto.diff = function diff2(input, units, _float) {
    var _this4 = this;
    var unit = Utils.p(units);
    var that = dayjs(input);
    var zoneDelta = (that.utcOffset() - this.utcOffset()) * MILLISECONDS_A_MINUTE;
    var diff3 = this - that;
    var getMonth = function getMonth2() {
      return Utils.m(_this4, that);
    };
    var result;
    switch (unit) {
      case Y:
        result = getMonth() / 12;
        break;
      case M:
        result = getMonth();
        break;
      case Q:
        result = getMonth() / 3;
        break;
      case W:
        result = (diff3 - zoneDelta) / MILLISECONDS_A_WEEK;
        break;
      case D:
        result = (diff3 - zoneDelta) / MILLISECONDS_A_DAY;
        break;
      case H:
        result = diff3 / MILLISECONDS_A_HOUR;
        break;
      case MIN:
        result = diff3 / MILLISECONDS_A_MINUTE;
        break;
      case S:
        result = diff3 / MILLISECONDS_A_SECOND;
        break;
      default:
        result = diff3;
        break;
    }
    return _float ? result : Utils.a(result);
  };
  _proto.daysInMonth = function daysInMonth() {
    return this.endOf(M).$D;
  };
  _proto.$locale = function $locale() {
    return Ls[this.$L];
  };
  _proto.locale = function locale(preset, object) {
    if (!preset)
      return this.$L;
    var that = this.clone();
    var nextLocaleName = parseLocale(preset, object, true);
    if (nextLocaleName)
      that.$L = nextLocaleName;
    return that;
  };
  _proto.clone = function clone2() {
    return Utils.w(this.$d, this);
  };
  _proto.toDate = function toDate() {
    return new Date(this.valueOf());
  };
  _proto.toJSON = function toJSON() {
    return this.isValid() ? this.toISOString() : null;
  };
  _proto.toISOString = function toISOString() {
    return this.$d.toISOString();
  };
  _proto.toString = function toString() {
    return this.$d.toUTCString();
  };
  return Dayjs2;
}();
var proto = Dayjs.prototype;
dayjs.prototype = proto;
[["$ms", MS], ["$s", S], ["$m", MIN], ["$H", H], ["$W", D], ["$M", M], ["$y", Y], ["$D", DATE]].forEach(function(g) {
  proto[g[1]] = function(input) {
    return this.$g(input, g[0], g[1]);
  };
});
dayjs.extend = function(plugin2, option) {
  if (!plugin2.$i) {
    plugin2(option, Dayjs, dayjs);
    plugin2.$i = true;
  }
  return dayjs;
};
dayjs.locale = parseLocale;
dayjs.isDayjs = isDayjs;
dayjs.unix = function(timestamp) {
  return dayjs(timestamp * 1e3);
};
dayjs.en = Ls[L];
dayjs.Ls = Ls;
dayjs.p = {};
const iconProps = {
  ...baseProps,
  /**
   * 使用的图标名字，可以使用链接图片
   */
  name: makeRequiredProp(String),
  /**
   * 图标的颜色
   */
  color: String,
  /**
   * 图标的字体大小
   */
  size: numericProp,
  /**
   * 类名前缀，用于使用自定义图标
   */
  classPrefix: makeStringProp("wd-icon")
};
const popupProps = {
  ...baseProps,
  /**
   * 动画类型，参见 wd-transition 组件的name
   * 类型：string
   * 可选值：fade / fade-up / fade-down / fade-left / fade-right / slide-up / slide-down / slide-left / slide-right / zoom-in
   */
  transition: String,
  /**
   * 关闭按钮
   * 类型：boolean
   * 默认值：false
   */
  closable: makeBooleanProp(false),
  /**
   * 弹出框的位置
   * 类型：string
   * 默认值：center
   * 可选值：center / top / right / bottom / left
   */
  position: makeStringProp("center"),
  /**
   * 点击遮罩是否关闭
   * 类型：boolean
   * 默认值：true
   */
  closeOnClickModal: makeBooleanProp(true),
  /**
   * 动画持续时间
   * 类型：number | boolean
   * 默认值：300
   */
  duration: {
    type: [Number, Boolean],
    default: 300
  },
  /**
   * 是否显示遮罩
   * 类型：boolean
   * 默认值：true
   */
  modal: makeBooleanProp(true),
  /**
   * 设置层级
   * 类型：number
   * 默认值：10
   */
  zIndex: makeNumberProp(10),
  /**
   * 是否当关闭时将弹出层隐藏（display: none)
   * 类型：boolean
   * 默认值：true
   */
  hideWhenClose: makeBooleanProp(true),
  /**
   * 遮罩样式
   * 类型：string
   * 默认值：''
   */
  modalStyle: makeStringProp(""),
  /**
   * 弹出面板是否设置底部安全距离（iphone X 类型的机型）
   * 类型：boolean
   * 默认值：false
   */
  safeAreaInsetBottom: makeBooleanProp(false),
  /**
   * 弹出层是否显示
   */
  modelValue: makeBooleanProp(false),
  /**
   * 弹层内容懒渲染，触发展示时才渲染内容
   * 类型：boolean
   * 默认值：true
   */
  lazyRender: makeBooleanProp(true),
  /**
   * 是否锁定滚动
   * 类型：boolean
   * 默认值：true
   */
  lockScroll: makeBooleanProp(true),
  /**
   * 是否从页面中脱离出来，用于解决各种 fixed 失效问题 (H5: teleport, APP: renderjs, 小程序: root-portal)
   * 类型：boolean
   * 默认值：false
   */
  rootPortal: makeBooleanProp(false)
};
const FORM_KEY = Symbol("wd-form");
({
  ...baseProps
});
const cellProps = {
  ...baseProps,
  /**
   * 标题
   */
  title: String,
  /**
   * 右侧内容
   */
  value: makeNumericProp(""),
  /**
   * 图标类名
   */
  icon: String,
  /**
   * 图标大小
   */
  iconSize: numericProp,
  /**
   * 描述信息
   */
  label: String,
  /**
   * 是否为跳转链接
   */
  isLink: makeBooleanProp(false),
  /**
   * 跳转地址
   */
  to: String,
  /**
   * 跳转时是否替换栈顶页面
   */
  replace: makeBooleanProp(false),
  /**
   * 开启点击反馈，is-link 默认开启
   */
  clickable: makeBooleanProp(false),
  /**
   * 设置单元格大小，可选值：large
   */
  size: String,
  /**
   * 是否展示边框线
   */
  border: makeBooleanProp(void 0),
  /**
   * 设置左侧标题宽度
   */
  titleWidth: String,
  /**
   * 是否垂直居中，默认顶部居中
   */
  center: makeBooleanProp(false),
  /**
   * 是否必填
   */
  required: makeBooleanProp(false),
  /**
   * 表单属性，上下结构
   */
  vertical: makeBooleanProp(false),
  /**
   * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
   */
  prop: String,
  /**
   * 表单验证规则，结合wd-form组件使用
   */
  rules: makeArrayProp(),
  /**
   * icon 使用 slot 时的自定义样式
   */
  customIconClass: makeStringProp(""),
  /**
   * label 使用 slot 时的自定义样式
   */
  customLabelClass: makeStringProp(""),
  /**
   * value 使用 slot 时的自定义样式
   */
  customValueClass: makeStringProp(""),
  /**
   * title 使用 slot 时的自定义样式
   */
  customTitleClass: makeStringProp(""),
  /**
   * value 文字对齐方式，可选值：left、right、center
   */
  valueAlign: makeStringProp("right"),
  /**
   * 是否超出隐藏，显示省略号
   */
  ellipsis: makeBooleanProp(false),
  /**
   * 是否启用title插槽，默认启用，用来解决插槽传递时v-slot和v-if冲突问题。
   * 问题见：https://github.com/dcloudio/uni-app/issues/4847
   */
  useTitleSlot: makeBooleanProp(true),
  /**
   * 必填标记位置,可选值:before(标签前)、after(标签后)
   */
  markerSide: makeStringProp("before"),
  /**
   * 箭头方向,可选值:left、up、down、right,只在 is-link 为 true 时生效
   */
  arrowDirection: makeStringProp("right")
};
const stickyProps = {
  ...baseProps,
  /**
   * 层级
   */
  zIndex: makeNumberProp(1),
  /**
   * 吸顶距离
   */
  offsetTop: makeNumberProp(0)
};
const STICKY_BOX_KEY = Symbol("wd-sticky-box");
const RADIO_GROUP_KEY = Symbol("wd-radio-group");
const radioGroupProps = {
  ...baseProps,
  /** 会自动选中value对应的单选框 */
  modelValue: [String, Number, Boolean],
  /** 单选框形状，可选值为 dot / button / check，默认为 check */
  shape: makeStringProp("check"),
  /** 选中的颜色，默认为 #4D80F0 */
  checkedColor: String,
  /** 是否禁用，默认为 false */
  disabled: makeBooleanProp(false),
  /** 表单模式，默认为 false */
  cell: makeBooleanProp(false),
  /** 设置大小，默认为空 */
  size: makeStringProp(""),
  /** 同行展示，默认为 false */
  inline: makeBooleanProp(false),
  /** 图标位置，默认为 left */
  iconPlacement: makeStringProp("auto")
};
const radioProps = {
  ...baseProps,
  /** 选中时的值 */
  value: makeRequiredProp([String, Number, Boolean]),
  /** 单选框的形状 */
  shape: String,
  /** 选中的颜色 */
  checkedColor: String,
  /** 禁用 */
  disabled: {
    type: [Boolean, null],
    default: null
  },
  /** 单元格 */
  cell: {
    type: [Boolean, null],
    default: null
  },
  /** 大小 */
  size: String,
  /** 内联 */
  inline: {
    type: [Boolean, null],
    default: null
  },
  /** 最大宽度 */
  maxWidth: String,
  /**
   * 图标位置
   * 可选值: 'left' | 'right' | 'auto'
   */
  iconPlacement: {
    type: String
  }
};
const textareaProps = {
  ...baseProps,
  /**
   * * 自定义文本域容器class名称。
   * 类型：string
   */
  customTextareaContainerClass: makeStringProp(""),
  /**
   * * 自定义文本域class名称。
   * 类型：string
   */
  customTextareaClass: makeStringProp(""),
  /**
   * * 自定义标签class名称。
   * 类型：string
   */
  customLabelClass: makeStringProp(""),
  // 原生属性
  /**
   * * 绑定值。
   * 类型：string | number
   */
  modelValue: makeNumericProp(""),
  /**
   * * 占位文本。
   * 类型：string
   * 默认值：'请输入...'
   */
  placeholder: String,
  /**
   * 指定placeholder的样式。
   * 类型：string
   */
  placeholderStyle: String,
  /**
   * * 指定placeholder的样式类。
   * 类型：string
   * 默认值：空字符串
   */
  placeholderClass: makeStringProp(""),
  /**
   * * 禁用输入框。
   * 类型：boolean
   * 默认值：false
   */
  disabled: makeBooleanProp(false),
  /**
   * * 最大输入长度，设置为-1表示不限制最大长度。
   * 类型：number
   * 默认值：-1
   */
  maxlength: makeNumberProp(-1),
  /**
   * * 自动聚焦并拉起键盘。
   * 类型：boolean
   * 默认值：false
   */
  autoFocus: makeBooleanProp(false),
  /**
   * * 获取焦点。
   * 类型：boolean
   * 默认值：false
   */
  focus: makeBooleanProp(false),
  /**
   * * 是否自动增高输入框高度，style.height属性在auto-height生效时不生效。
   * 类型：boolean
   * 默认值：false
   */
  autoHeight: makeBooleanProp(false),
  /**
   * * 如果textarea处于position:fixed区域，需要设置此属性为true。
   * 类型：boolean
   * 默认值：false
   */
  fixed: makeBooleanProp(false),
  /**
   * * 指定光标与键盘的距离，取textarea距离底部的距离和cursor-spacing指定的距离的最小值作为实际距离。
   * 类型：number
   * 默认值：0
   */
  cursorSpacing: makeNumberProp(0),
  /**
   * * 指定focus时的光标位置。
   * 类型：number
   * 默认值：-1
   */
  cursor: makeNumberProp(-1),
  /**
   * * 设置键盘右下角按钮的文字。
   * 类型：string
   * 默认值：'done'
   * 可选值有'done', 'go', 'next', 'search', 'send'
   */
  confirmType: String,
  /**
   * * 点击键盘右下角按钮时是否保持键盘不收起。
   * 类型：boolean
   * 默认值：false
   */
  confirmHold: makeBooleanProp(false),
  /**
   * * 是否显示键盘上方带有“完成”按钮那一栏。
   * 类型：boolean
   * 默认值：true
   */
  showConfirmBar: makeBooleanProp(true),
  /**
   * * 光标起始位置，自动聚集时有效，需与selection-end搭配使用。
   * 类型：number
   * 默认值：-1
   */
  selectionStart: makeNumberProp(-1),
  /**
   * * 光标结束位置，自动聚集时有效，需与selection-start搭配使用。
   * 类型：number
   * 默认值：-1
   */
  selectionEnd: makeNumberProp(-1),
  /**
   * * 键盘弹起时是否自动上推页面。
   * 类型：boolean
   * 默认值：true
   */
  adjustPosition: makeBooleanProp(true),
  /**
   * * 是否去掉iOS下的默认内边距。
   * 类型：boolean
   * 默认值：false
   */
  disableDefaultPadding: makeBooleanProp(false),
  /**
   * * focus状态下点击页面时是否不收起键盘。
   * 类型：boolean
   * 默认值：false
   */
  holdKeyboard: makeBooleanProp(false),
  // 非原生属性
  /**
   * * 显示为密码框。
   * 类型：boolean
   * 默认值：false
   */
  showPassword: makeBooleanProp(false),
  /**
   * * 是否显示清空按钮。
   * 类型：boolean
   * 默认值：false
   */
  clearable: makeBooleanProp(false),
  /**
   * * 输入框只读状态。
   * 类型：boolean
   * 默认值：false
   */
  readonly: makeBooleanProp(false),
  /**
   * * 前置图标，icon组件中的图标类名。
   * 类型：string
   */
  prefixIcon: String,
  /**
   * * 是否显示字数限制，需要同时设置maxlength。
   * 类型：boolean
   * 默认值：false
   */
  showWordLimit: makeBooleanProp(false),
  /**
   * 设置左侧标题。
   * 类型：string
   */
  label: String,
  /**
   * 设置左侧标题宽度。
   * 类型：string
   */
  labelWidth: makeStringProp(""),
  /**
   * * 设置输入框大小。
   * 类型：string
   */
  size: String,
  /**
   * * 设置输入框错误状态（红色）。
   * 类型：boolean
   * 默认值：false
   */
  error: makeBooleanProp(false),
  /**
   * * 当存在label属性时，设置标题和输入框垂直居中，默认为顶部居中。
   * 类型：boolean
   * 默认值：false
   */
  center: makeBooleanProp(false),
  /**
   * * 非cell类型下是否隐藏下划线。
   * 类型：boolean
   * 默认值：false
   */
  noBorder: makeBooleanProp(false),
  /**
   * * cell类型下必填样式。
   * 类型：boolean
   * 默认值：false
   */
  required: makeBooleanProp(false),
  /**
   * * 表单域model字段名，在使用表单校验功能的情况下，该属性是必填的。
   * 类型：string
   */
  prop: makeStringProp(""),
  /**
   * * 表单验证规则。
   * 类型：FormItemRule[]
   * 默认值：[]
   */
  rules: makeArrayProp(),
  /**
   * 显示清除图标的时机，always 表示输入框不为空时展示，focus 表示输入框聚焦且不为空时展示
   * 类型: "focus" | "always"
   * 默认值: "always"
   */
  clearTrigger: makeStringProp("always"),
  /**
   * 是否在点击清除按钮时聚焦输入框
   * 类型: boolean
   * 默认值: true
   */
  focusWhenClear: makeBooleanProp(true),
  /**
   * 是否忽略组件内对文本合成系统事件的处理。为 false 时将触发 compositionstart、compositionend、compositionupdate 事件，且在文本合成期间会触发 input 事件
   * 类型: boolean
   * 默认值: true
   */
  ignoreCompositionEvent: makeBooleanProp(true),
  /**
   * 它提供了用户在编辑元素或其内容时可能输入的数据类型的提示。在符合条件的高版本webview里，uni-app的web和app-vue平台中可使用本属性。
   * 类型: InputMode
   * 可选值: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | "password"
   * 默认值: "text"
   */
  inputmode: makeStringProp("text"),
  /**
   * 必填标记位置，可选值：before（标签前）、after（标签后）
   */
  markerSide: makeStringProp("before"),
  /**
   * 支付宝小程序，可以在 input / textarea 组件中加上 enableNative="{{false}}"，避免 textarea 弹出键盘后出现内容上移
   * 仅支付宝小程序支持
   * 类型: boolean
   * 默认值: true
   */
  enableNative: makeBooleanProp(true)
};
const inputProps = {
  ...baseProps,
  customInputClass: makeStringProp(""),
  customLabelClass: makeStringProp(""),
  // 原生属性
  /**
   * 占位文本
   */
  placeholder: String,
  /**
   * 原生属性，指定 placeholder 的样式，目前仅支持color,font-size和font-weight
   */
  placeholderStyle: String,
  /**
   * 原生属性，指定 placeholder 的样式类
   */
  placeholderClass: makeStringProp(""),
  /**
   * 原生属性，指定光标与键盘的距离。取 input 距离底部的距离和cursor-spacing指定的距离的最小值作为光标与键盘的距离
   */
  cursorSpacing: makeNumberProp(0),
  /**
   * 原生属性，指定focus时的光标位置
   */
  cursor: makeNumberProp(-1),
  /**
   * 原生属性，光标起始位置，自动聚集时有效，需与selection-end搭配使用
   */
  selectionStart: makeNumberProp(-1),
  /**
   * 原生属性，光标结束位置，自动聚集时有效，需与selection-start搭配使用
   */
  selectionEnd: makeNumberProp(-1),
  /**
   * 原生属性，键盘弹起时，是否自动上推页面
   */
  adjustPosition: makeBooleanProp(true),
  /**
   * focus时，点击页面的时候不收起键盘
   */
  holdKeyboard: makeBooleanProp(false),
  /**
   * 设置键盘右下角按钮的文字，仅在type='text'时生效，可选值：done / go / next / search / send
   */
  confirmType: makeStringProp("done"),
  /**
   * 点击键盘右下角按钮时是否保持键盘不收起
   */
  confirmHold: makeBooleanProp(false),
  /**
   * 原生属性，获取焦点
   */
  focus: makeBooleanProp(false),
  /**
   * 类型，可选值：text / number / digit / idcard / safe-password / nickname / tel
   */
  type: makeStringProp("text"),
  /**
   * 原生属性，最大长度
   */
  maxlength: {
    type: Number,
    default: -1
  },
  /**
   * 原生属性，禁用
   */
  disabled: makeBooleanProp(false),
  /**
   * 微信小程序原生属性，强制 input 处于同层状态，默认 focus 时 input 会切到非同层状态 (仅在 iOS 下生效)
   */
  alwaysEmbed: makeBooleanProp(false),
  // 原生属性结束
  /**
   * 输入框的值靠右展示
   */
  alignRight: makeBooleanProp(false),
  /**
   * 绑定值
   */
  modelValue: makeNumericProp(""),
  /**
   * 显示为密码框
   */
  showPassword: makeBooleanProp(false),
  /**
   * 显示清空按钮
   */
  clearable: makeBooleanProp(false),
  /**
   * 只读
   */
  readonly: makeBooleanProp(false),
  /**
   * 前置图标，icon组件中的图标类名
   */
  prefixIcon: String,
  /**
   * 后置图标，icon组件中的图标类名
   */
  suffixIcon: String,
  /**
   * 显示字数限制，需要同时设置 maxlength
   */
  showWordLimit: makeBooleanProp(false),
  /**
   * 设置左侧标题
   */
  label: String,
  /**
   * 设置左侧标题宽度
   */
  labelWidth: makeStringProp(""),
  /**
   * 设置输入框大小，可选值：large
   */
  size: String,
  /**
   * 设置输入框错误状态，错误状态时为红色
   */
  error: makeBooleanProp(false),
  /**
   * 当有label属性时，设置标题和输入框垂直居中，默认为顶部居中
   */
  center: makeBooleanProp(false),
  /**
   * 非 cell 类型下是否隐藏下划线
   */
  noBorder: makeBooleanProp(false),
  /**
   * 是否必填
   */
  required: makeBooleanProp(false),
  /**
   * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
   */
  prop: String,
  /**
   * 表单验证规则，结合wd-form组件使用
   */
  rules: makeArrayProp(),
  /**
   * 显示清除图标的时机，always 表示输入框不为空时展示，focus 表示输入框聚焦且不为空时展示
   * 类型: "focus" | "always"
   * 默认值: "always"
   */
  clearTrigger: makeStringProp("always"),
  /**
   * 是否在点击清除按钮时聚焦输入框
   * 类型: boolean
   * 默认值: true
   */
  focusWhenClear: makeBooleanProp(true),
  /**
   * 是否忽略组件内对文本合成系统事件的处理。为 false 时将触发 compositionstart、compositionend、compositionupdate 事件，且在文本合成期间会触发 input 事件
   * 类型: boolean
   * 默认值: true
   */
  ignoreCompositionEvent: makeBooleanProp(true),
  /**
   * 它提供了用户在编辑元素或其内容时可能输入的数据类型的提示。在符合条件的高版本webview里，uni-app的web和app-vue平台中可使用本属性。
   * 类型: InputMode
   * 可选值: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | "password"
   * 默认值: "text"
   */
  inputmode: makeStringProp("text"),
  /**
   * 必填标记位置，可选值：before（标签前）、after（标签后）
   */
  markerSide: makeStringProp("before"),
  /**
   * 支付宝小程序，可以在 input / textarea 组件中加上 enableNative="{{false}}"，避免 textarea 弹出键盘后出现内容上移
   * 仅支付宝小程序支持
   * 类型: boolean
   * 默认值: true
   */
  enableNative: makeBooleanProp(true)
};
const _b64chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"];
const _mkUriSafe = (src) => src.replace(/[+/]/g, (m0) => m0 === "+" ? "-" : "_").replace(/=+\$/m, "");
const fromUint8Array = (src, rfc4648 = false) => {
  let b642 = "";
  for (let i = 0, l = src.length; i < l; i += 3) {
    const [a0, a1, a2] = [src[i], src[i + 1], src[i + 2]];
    const ord = a0 << 16 | a1 << 8 | a2;
    b642 += _b64chars[ord >>> 18];
    b642 += _b64chars[ord >>> 12 & 63];
    b642 += typeof a1 !== "undefined" ? _b64chars[ord >>> 6 & 63] : "=";
    b642 += typeof a2 !== "undefined" ? _b64chars[ord & 63] : "=";
  }
  return rfc4648 ? _mkUriSafe(b642) : b642;
};
const _btoa = typeof btoa === "function" ? (s2) => btoa(s2) : (s2) => {
  if (s2.charCodeAt(0) > 255) {
    throw new RangeError("The string contains invalid characters.");
  }
  return fromUint8Array(Uint8Array.from(s2, (c) => c.charCodeAt(0)));
};
const utob = (src) => unescape(encodeURIComponent(src));
function encode2(src, rfc4648 = false) {
  const b642 = _btoa(utob(src));
  return rfc4648 ? _mkUriSafe(b642) : b642;
}
const buttonProps = {
  ...baseProps,
  /**
   * 幽灵按钮
   */
  plain: makeBooleanProp(false),
  /**
   * 圆角按钮
   */
  round: makeBooleanProp(true),
  /**
   * 禁用按钮
   */
  disabled: makeBooleanProp(false),
  /**
   * 是否细边框
   */
  hairline: makeBooleanProp(false),
  /**
   * 块状按钮
   */
  block: makeBooleanProp(false),
  /**
   * 按钮类型，可选值：primary / success / info / warning / error / text / icon
   */
  type: makeStringProp("primary"),
  /**
   * 按钮尺寸，可选值：small / medium / large
   */
  size: makeStringProp("medium"),
  /**
   * 图标类名
   */
  icon: String,
  /**
   * 类名前缀，用于使用自定义图标，用法参考Icon组件
   */
  classPrefix: makeStringProp("wd-icon"),
  /**
   * 加载中按钮
   */
  loading: makeBooleanProp(false),
  /**
   * 加载图标颜色
   */
  loadingColor: String,
  /**
   * 开放能力
   */
  openType: String,
  /**
   * 指定是否阻止本节点的祖先节点出现点击态
   */
  hoverStopPropagation: Boolean,
  /**
   * 指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文
   */
  lang: String,
  /**
   * 会话来源，open-type="contact"时有效
   */
  sessionFrom: String,
  /**
   * 会话内消息卡片标题，open-type="contact"时有效
   */
  sendMessageTitle: String,
  /**
   * 会话内消息卡片点击跳转小程序路径，open-type="contact"时有效
   */
  sendMessagePath: String,
  /**
   * 会话内消息卡片图片，open-type="contact"时有效
   */
  sendMessageImg: String,
  /**
   * 打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效
   */
  appParameter: String,
  /**
   * 是否显示会话内消息卡片，设置此参数为 true，用户进入客服会话会在右下角显示"可能要发送的小程序"提示，用户点击后可以快速发送小程序消息，open-type="contact"时有效
   */
  showMessageCard: Boolean,
  /**
   * 按钮的唯一标识，可用于设置隐私同意授权按钮的id
   */
  buttonId: String,
  /**
   * 支付宝小程序，当 open-type 为 getAuthorize 时有效。
   * 可选值：'phoneNumber' | 'userInfo'
   */
  scope: String
};
({
  ...baseProps
});
const CONFIG_PROVIDER_KEY = Symbol("wd-config-provider");
const loadingProps = {
  ...baseProps,
  /**
   * 加载指示器类型，可选值：'outline' | 'ring' | 'spinner'
   */
  type: makeStringProp("ring"),
  /**
   * 设置加载指示器颜色
   */
  color: makeStringProp("#4D80F0"),
  /**
   * 设置加载指示器大小
   */
  size: makeNumericProp("")
};
const resizeProps = {
  ...baseProps,
  customContainerClass: makeStringProp("")
};
exports.AbortablePromise = AbortablePromise;
exports.CONFIG_PROVIDER_KEY = CONFIG_PROVIDER_KEY;
exports.FORM_KEY = FORM_KEY;
exports.RADIO_GROUP_KEY = RADIO_GROUP_KEY;
exports.STICKY_BOX_KEY = STICKY_BOX_KEY;
exports.TABS_KEY = TABS_KEY;
exports.USE_CONFIG_PROVIDER_KEY = USE_CONFIG_PROVIDER_KEY;
exports._export_sfc = _export_sfc;
exports.addUnit = addUnit;
exports.badgeProps = badgeProps;
exports.baseProps = baseProps;
exports.browser = browser;
exports.buttonProps = buttonProps;
exports.cellProps = cellProps;
exports.checkNumRange = checkNumRange;
exports.computed = computed;
exports.context = context;
exports.createPinia = createPinia;
exports.createSSRApp = createSSRApp;
exports.createStore = createStore;
exports.debounce = debounce;
exports.deepClone = deepClone;
exports.defaultDisplayFormat = defaultDisplayFormat;
exports.defineComponent = defineComponent;
exports.defineStore = defineStore;
exports.e = e;
exports.encode = encode2;
exports.f = f;
exports.formatArray = formatArray;
exports.getCurrentInstance = getCurrentInstance;
exports.getPropByPath = getPropByPath;
exports.getRect = getRect;
exports.getSystemInfo = getSystemInfo;
exports.getType = getType;
exports.gradient = gradient;
exports.iconProps = iconProps;
exports.index = index;
exports.inject = inject;
exports.inputProps = inputProps;
exports.isArray = isArray;
exports.isDef = isDef;
exports.isEqual = isEqual;
exports.isFunction = isFunction;
exports.isNumber = isNumber;
exports.isObj = isObj;
exports.isPromise = isPromise;
exports.isString = isString;
exports.loadingProps = loadingProps;
exports.n = n;
exports.nextTick$1 = nextTick$1;
exports.o = o;
exports.objToStyle = objToStyle;
exports.onBeforeMount = onBeforeMount;
exports.onBeforeUnmount = onBeforeUnmount;
exports.onHide = onHide;
exports.onLoad = onLoad;
exports.onMounted = onMounted;
exports.onShareAppMessage = onShareAppMessage;
exports.onShareTimeline = onShareTimeline;
exports.onShow = onShow;
exports.onUnload = onUnload;
exports.overlayProps = overlayProps;
exports.p = p;
exports.pause = pause;
exports.pickerProps = pickerProps;
exports.pickerViewProps = pickerViewProps;
exports.popupProps = popupProps;
exports.radioGroupProps = radioGroupProps;
exports.radioProps = radioProps;
exports.range = range;
exports.reactive = reactive;
exports.ref = ref;
exports.resizeProps = resizeProps;
exports.resolveComponent = resolveComponent;
exports.s = s;
exports.sr = sr;
exports.stickyProps = stickyProps;
exports.t = t;
exports.tabProps = tabProps;
exports.tabsProps = tabsProps;
exports.textareaProps = textareaProps;
exports.toRefs = toRefs;
exports.transitionProps = transitionProps;
exports.unref = unref;
exports.useCell = useCell;
exports.useChildren = useChildren;
exports.useCssVars = useCssVars;
exports.useParent = useParent;
exports.useSlots = useSlots;
exports.useToast = useToast;
exports.useTouch = useTouch;
exports.useTranslate = useTranslate;
exports.uuid = uuid;
exports.watch = watch;
exports.wx$1 = wx$1;
