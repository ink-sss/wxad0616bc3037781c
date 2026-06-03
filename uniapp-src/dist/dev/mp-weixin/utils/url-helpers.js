"use strict";
const api_h5 = require("../api/h5.js");
function ensureCurrentProtocol(url = "") {
  if (!url)
    return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
function parseAbsoluteUrl(rawUrl = "", options = {}) {
  let value = String(rawUrl || "").trim();
  if (!value)
    return null;
  const defaultProtocol = String(options.defaultProtocol || "https").replace(/:$/, "");
  if (value.startsWith("//")) {
    value = `${defaultProtocol}:${value}`;
  } else if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    if (options.assumeDomain === false || value.startsWith("/"))
      return null;
    value = `${defaultProtocol}://${value}`;
  }
  const match = value.match(/^([a-z][a-z\d+.-]*):\/\/([^/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/i);
  if (!match)
    return null;
  const protocol = match[1].toLowerCase();
  const host = match[2];
  const pathname = match[3] || "/";
  const search = match[4] || "";
  const hash = match[5] || "";
  return {
    protocol,
    host,
    pathname,
    search,
    hash,
    origin: `${protocol}://${host}`,
    href: `${protocol}://${host}${pathname}${search}${hash}`
  };
}
function getUrlOrigin(rawUrl = "") {
  const parsed = parseAbsoluteUrl(rawUrl);
  return parsed ? parsed.origin : "";
}
function removeUrlQueryParam(rawUrl = "", paramName = "") {
  const value = String(rawUrl || "").trim();
  const blockedName = String(paramName || "").toLowerCase();
  if (!value || !blockedName)
    return value;
  const withoutHash = value.split("#")[0];
  const queryIndex = withoutHash.indexOf("?");
  if (queryIndex < 0)
    return withoutHash;
  const path = withoutHash.slice(0, queryIndex);
  const query = withoutHash.slice(queryIndex + 1);
  const nextQuery = query.split("&").filter((part) => {
    if (!part)
      return false;
    const key = part.split("=")[0].toLowerCase();
    return key !== blockedName;
  }).join("&");
  return `${path}${nextQuery ? `?${nextQuery}` : ""}`;
}
function normalizeDomainProtocol(domain = "") {
  return ensureCurrentProtocol(domain);
}
function isLocalDevelopmentHost(hostname = "") {
  const host = String(hostname || "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}
function resolveLandingDomainsForHost(landingDomains = []) {
  return Array.isArray(landingDomains) ? landingDomains : [];
}
function getApiBaseUrl() {
  return api_h5.getH5ApiBaseUrl();
}
exports.getApiBaseUrl = getApiBaseUrl;
exports.getUrlOrigin = getUrlOrigin;
exports.isLocalDevelopmentHost = isLocalDevelopmentHost;
exports.normalizeDomainProtocol = normalizeDomainProtocol;
exports.parseAbsoluteUrl = parseAbsoluteUrl;
exports.removeUrlQueryParam = removeUrlQueryParam;
exports.resolveLandingDomainsForHost = resolveLandingDomainsForHost;
