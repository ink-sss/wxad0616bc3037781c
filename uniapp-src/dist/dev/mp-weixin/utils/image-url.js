"use strict";
const api_h5 = require("../api/h5.js");
function toSizedImageUrl(url = "") {
  return api_h5.normalizeH5AssetUrl(url);
}
exports.toSizedImageUrl = toSizedImageUrl;
