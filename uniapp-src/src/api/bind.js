import { h5Delete, h5Get } from "./h5";

export function checkBindStatus(bindId) {
  return h5Get(
    "/h5/bind/status",
    { id: bindId },
    { authRedirect: false },
  );
}

export function getBindIdentity(bindId) {
  return h5Get(
    "/h5/bind/identity",
    { bindId },
    { authRedirect: false },
  );
}

export function clearBind(bindId) {
  return h5Delete(
    "/h5/bind/clear",
    { bindId },
    { authRedirect: false },
  );
}
