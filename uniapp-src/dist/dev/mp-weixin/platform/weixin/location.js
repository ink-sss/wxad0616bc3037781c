"use strict";
const platform_weixin_auth = require("./auth.js");
const platform_weixin_runtime = require("./runtime.js");
const USER_LOCATION_SCOPE = "scope.userLocation";
function getLocation(options = {}) {
  return platform_weixin_runtime.promisifyApi("getLocation", options, { preferUni: true });
}
function openLocation(options = {}) {
  return platform_weixin_runtime.promisifyApi("openLocation", options, { preferUni: true });
}
async function ensureLocationAuthorized() {
  const setting = await platform_weixin_auth.getSetting();
  const authSetting = setting.authSetting || {};
  if (authSetting[USER_LOCATION_SCOPE] === true) {
    return true;
  }
  if (authSetting[USER_LOCATION_SCOPE] === false) {
    await platform_weixin_auth.openSetting();
    const nextSetting = await platform_weixin_auth.getSetting();
    return nextSetting.authSetting && nextSetting.authSetting[USER_LOCATION_SCOPE] === true;
  }
  await platform_weixin_auth.authorize(USER_LOCATION_SCOPE);
  return true;
}
exports.ensureLocationAuthorized = ensureLocationAuthorized;
exports.getLocation = getLocation;
exports.openLocation = openLocation;
