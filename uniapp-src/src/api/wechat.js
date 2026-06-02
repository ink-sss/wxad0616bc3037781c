import { h5Get } from "./h5";

export function getWechatAuthConfig(tenantId) {
  return h5Get(
    "/h5/wechat/authConfig",
    tenantId ? { tenantId } : {},
    { authRedirect: false },
  );
}
