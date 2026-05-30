"use strict";
const env_development = require("./development.js");
const env_production = require("./production.js");
var define_import_meta_env_default = { MODE: "development" };
const env = define_import_meta_env_default || {};
const appUrl = env.MODE === "development" && env_development.dev_url.url ? env_development.dev_url.url : env_production.pro_url.url;
const config = {
  app_url: appUrl,
  app_id: 393016,
  appid: "wxad0616bc3037781c",
  token: "d1eb418107ca0674b7654ede4d3162fc",
  h5_addr: "/h5",
  im_log_level: 1,
  font_url: "https://at.alicdn.com/t/c/font_4197023_cp26qx5fd6.ttf?t=1703641583677",
  pic_url: "https://cos.images.guankeyun.net"
};
exports.config = config;
