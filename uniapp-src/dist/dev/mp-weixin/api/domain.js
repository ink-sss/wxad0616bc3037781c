"use strict";
const api_h5 = require("./h5.js");
function getDomainConfig(tenantId) {
  return api_h5.h5Get("/h5/domain/config", { tenantId: Number(tenantId || 0) });
}
exports.getDomainConfig = getDomainConfig;
