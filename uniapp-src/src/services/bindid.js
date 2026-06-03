import { getBindIdentity } from "@/api/bind";
import {
  persistBindId,
  readBindId,
  syncH5AuthSession,
} from "@/services/h5-auth-context";

const BIND_TTL_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function randomBindSuffix() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeIdentityPayload(identity = {}) {
  const data = identity?.data && typeof identity.data === "object" ? identity.data : identity;
  const token =
    data.jwtToken ||
    data.jwt_token ||
    data.token ||
    data.h5Token ||
    data.h5_token ||
    data.accessToken ||
    data.access_token ||
    "";
  const customer = data.customer || data.customerInfo || data.userInfo || data.user || null;
  return {
    ...data,
    token,
    jwtToken: data.jwtToken || token,
    customer,
  };
}

class MiniProgramBindIDManager {
  constructor() {
    this.bindId = "";
    this.bindExpireTime = 0;
  }

  setBindId(bindId) {
    if (!bindId) return "";
    this.bindId = String(bindId);
    this.bindExpireTime = Date.now() + BIND_TTL_MS;
    persistBindId(this.bindId);
    return this.bindId;
  }

  generateBindId() {
    return this.setBindId(`bind_${Date.now()}_${randomBindSuffix()}`);
  }

  getCurrentBindId() {
    if (this.bindId && (!this.bindExpireTime || Date.now() < this.bindExpireTime)) {
      persistBindId(this.bindId);
      return this.bindId;
    }
    const stored = readBindId();
    if (!stored) return "";
    this.bindId = stored;
    this.bindExpireTime = Date.now() + BIND_TTL_MS;
    return this.bindId;
  }

  createBindImageRequest() {
    return Promise.resolve({
      bindSuccess: false,
      skipped: true,
      reason: "mp-weixin-no-cross-domain-image-cookie",
    });
  }

  async tryGetIdentity() {
    const bindId = this.getCurrentBindId();
    if (!bindId) return null;
    const identity = normalizeIdentityPayload(await getBindIdentity(bindId));
    if (!identity.token && !identity.jwtToken) return null;
    syncH5AuthSession({
      ...identity,
      token: identity.token || identity.jwtToken,
      customer: identity.customer,
    });
    return identity;
  }

  async smartAutoLogin() {
    const identity = await this.tryGetIdentity();
    return {
      success: !!(identity?.token || identity?.jwtToken),
      identity,
      bindId: this.getCurrentBindId(),
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
      reason: "mp-weixin-no-cross-domain-iframe-cookie",
    };
  }

  clear() {
    this.bindId = "";
    this.bindExpireTime = 0;
  }
}

export const bindIDManager = new MiniProgramBindIDManager();
