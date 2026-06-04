"use strict";
const env_development = require("./development.js");
const env_production = require("./production.js");
var define_import_meta_env_default = { MODE: "development" };
const env = define_import_meta_env_default || {};
const appUrl = env.MODE === "development" && env_development.dev_url.url ? env_development.dev_url.url : env_production.pro_url.url;
const configuredH5Url = env.MODE === "development" ? env_development.dev_url.h5_url : env_production.pro_url.h5_url;
const envH5Url = env.VITE_H5_API_BASE_URL || env.VITE_H5_API_URL || env.VITE_H5_URL || "";
const h5Url = envH5Url || configuredH5Url;
const tenantId = env.VITE_TENANT_ID || "";
const staticUrl = "https://man.lqjy.cc/static";
const config = {
  app_url: appUrl,
  h5_url: h5Url,
  h5_api_url: h5Url,
  tenant_id: tenantId,
  app_id: 393016,
  appid: "wx3bf933f8a2018d8d",
  miniprogram_login_app_id: "wx43134e071b752953",
  token: "d1eb418107ca0674b7654ede4d3162fc",
  h5_addr: "/h5",
  im_log_level: 1,
  static_url: staticUrl,
  font_url: `${staticUrl}/fonts/font_4197023_cp26qx5fd6.ttf`,
  pic_url: staticUrl
};
exports.config = config;
