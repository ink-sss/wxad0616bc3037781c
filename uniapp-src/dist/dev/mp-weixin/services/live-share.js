"use strict";
const api_live = require("../api/live.js");
function getLiveDistributorShareUrl(roomId) {
  return api_live.getDistributorShareUrl(roomId);
}
exports.getLiveDistributorShareUrl = getLiveDistributorShareUrl;
