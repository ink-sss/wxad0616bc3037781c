"use strict";
const api_h5 = require("./h5.js");
function getBindIdentity(bindId) {
  return api_h5.h5Get(
    "/h5/bind/identity",
    { bindId },
    { authRedirect: false }
  );
}
exports.getBindIdentity = getBindIdentity;
