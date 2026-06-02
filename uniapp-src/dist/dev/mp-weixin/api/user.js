"use strict";
const api_h5 = require("./h5.js");
function getCenter() {
  return api_h5.h5Get("/h5/user/center");
}
exports.getCenter = getCenter;
