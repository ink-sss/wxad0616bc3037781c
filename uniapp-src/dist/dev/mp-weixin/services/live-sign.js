"use strict";
const api_live = require("../api/live.js");
function submitLiveSign(roomId, formData = {}, context = {}) {
  return api_live.submitSign(roomId, formData, context);
}
exports.submitLiveSign = submitLiveSign;
