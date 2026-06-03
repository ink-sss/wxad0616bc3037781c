"use strict";
const api_bind = require("../api/bind.js");
const services_h5AuthContext = require("./h5-auth-context.js");
const BIND_TTL_MS = 2 * 365 * 24 * 60 * 60 * 1e3;
function randomBindSuffix() {
  return Math.random().toString(36).slice(2, 10);
}
function normalizeIdentityPayload(identity = {}) {
  const data = (identity == null ? void 0 : identity.data) && typeof identity.data === "object" ? identity.data : identity;
  const token = data.jwtToken || data.jwt_token || data.token || data.h5Token || data.h5_token || data.accessToken || data.access_token || "";
  const customer = data.customer || data.customerInfo || data.userInfo || data.user || null;
  return {
    ...data,
    token,
    jwtToken: data.jwtToken || token,
    customer
  };
}
class MiniProgramBindIDManager {
  constructor() {
    this.bindId = "";
    this.bindExpireTime = 0;
  }
  setBindId(bindId) {
    if (!bindId)
      return "";
    this.bindId = String(bindId);
    this.bindExpireTime = Date.now() + BIND_TTL_MS;
    services_h5AuthContext.persistBindId(this.bindId);
    return this.bindId;
  }
  generateBindId() {
    return this.setBindId(`bind_${Date.now()}_${randomBindSuffix()}`);
  }
  getCurrentBindId() {
    if (this.bindId && (!this.bindExpireTime || Date.now() < this.bindExpireTime)) {
      services_h5AuthContext.persistBindId(this.bindId);
      return this.bindId;
    }
    const stored = services_h5AuthContext.readBindId();
    if (!stored)
      return "";
    this.bindId = stored;
    this.bindExpireTime = Date.now() + BIND_TTL_MS;
    return this.bindId;
  }
  createBindImageRequest() {
    return Promise.resolve({
      bindSuccess: false,
      skipped: true,
      reason: "mp-weixin-no-cross-domain-image-cookie"
    });
  }
  async tryGetIdentity() {
    const bindId = this.getCurrentBindId();
    if (!bindId)
      return null;
    const identity = normalizeIdentityPayload(await api_bind.getBindIdentity(bindId));
    if (!identity.token && !identity.jwtToken)
      return null;
    services_h5AuthContext.syncH5AuthSession({
      ...identity,
      token: identity.token || identity.jwtToken,
      customer: identity.customer
    });
    return identity;
  }
  async smartAutoLogin() {
    const identity = await this.tryGetIdentity();
    return {
      success: !!((identity == null ? void 0 : identity.token) || (identity == null ? void 0 : identity.jwtToken)),
      identity,
      bindId: this.getCurrentBindId()
    };
  }
  async tryAutoLoginFromAuthDomain() {
    return this.smartAutoLogin();
  }
  async syncLoginToOtherDomains() {
    return {
      synced: 0,
      failed: 0,
      localStored: this.getCurrentBindId() ? 1 : 0,
      bindId: this.getCurrentBindId(),
      skipped: true,
      reason: "mp-weixin-no-cross-domain-iframe-cookie"
    };
  }
  clear() {
    this.bindId = "";
    this.bindExpireTime = 0;
  }
}
const bindIDManager = new MiniProgramBindIDManager();
exports.bindIDManager = bindIDManager;
