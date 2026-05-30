"use strict";
const platform_weixin_runtime = require("./runtime.js");
function createLivePlayerContext(id = "live-video", component) {
  const api = platform_weixin_runtime.getWeixinApi("createLivePlayerContext");
  if (!api || typeof api.createLivePlayerContext !== "function") {
    return null;
  }
  return component ? api.createLivePlayerContext(id, component) : api.createLivePlayerContext(id);
}
function createLivePusherContext(component) {
  if (component && typeof component.createLivePusherContext === "function") {
    return component.createLivePusherContext();
  }
  const api = platform_weixin_runtime.getWeixinApi("createLivePusherContext");
  if (!api || typeof api.createLivePusherContext !== "function") {
    return null;
  }
  return api.createLivePusherContext();
}
function liveContextCall(context, methodName, options = {}) {
  return platform_weixin_runtime.callContext(context, methodName, options);
}
function playLive(context, options = {}) {
  return liveContextCall(context, "play", options);
}
function callTrtc(instance, methodName, ...args) {
  if (!instance || typeof instance[methodName] !== "function") {
    return Promise.reject(platform_weixin_runtime.unsupportedError(`TRTC.${methodName}`));
  }
  try {
    return Promise.resolve(instance[methodName](...args));
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.callTrtc = callTrtc;
exports.createLivePlayerContext = createLivePlayerContext;
exports.createLivePusherContext = createLivePusherContext;
exports.playLive = playLive;
