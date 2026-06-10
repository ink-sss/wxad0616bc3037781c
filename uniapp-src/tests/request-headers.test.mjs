import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadRequestModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "request-headers-"));
  const sourcePath = join(root, "src/utils/request.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { redirectToNativeLogin } from '../services/h5-auth-context.js';",
      "const redirectToNativeLogin = globalThis.__redirectToNativeLogin;"
    )
    .replace(
      "import { buildRequestIdentityHeaders } from './request-identity-headers.js';",
      "const buildRequestIdentityHeaders = globalThis.__buildRequestIdentityHeaders;"
    );
  const modulePath = join(tempDir, "request.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

async function loadH5Module() {
  const tempDir = await mkdtemp(join(tmpdir(), "h5-headers-"));
  const sourcePath = join(root, "src/api/h5.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { handleH5Unauthorized } from '../services/h5-auth-context.js'",
      "const handleH5Unauthorized = globalThis.__handleH5Unauthorized;"
    )
    .replace(
      "import { buildRequestIdentityHeaders } from '../utils/request-identity-headers.js'",
      "const buildRequestIdentityHeaders = globalThis.__buildRequestIdentityHeaders;"
    )
    .replace(
      "import { getRuntimeConfig } from '../utils/runtime-config.js'",
      "const getRuntimeConfig = globalThis.__getRuntimeConfig;"
    );
  const modulePath = join(tempDir, "h5.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

async function loadRequestIdentityHeadersModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "request-identity-headers-"));
  const sourcePath = join(root, "src/utils/request-identity-headers.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { getAccountInfo } from '../platform/weixin/account.js';",
      "const getAccountInfo = globalThis.__getAccountInfo;"
    )
    .replace(
      "import { getRuntimeConfig } from './runtime-config.js';",
      "const getRuntimeConfig = globalThis.__getRuntimeConfig;"
    );
  const modulePath = join(tempDir, "request-identity-headers.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

function createVm() {
  return {
    config: {
      token: "token-1",
      appid: "wx-config",
    },
    websiteUrl: "https://api.example.com",
    getAppId() {
      return 393016;
    },
    showError() {},
    doLogin() {},
    gotoPage() {},
  };
}

test("request wrapper sends mini program identity headers when values exist", async () => {
  let requestOptions;

  globalThis.__redirectToNativeLogin = () => {};
  globalThis.__buildRequestIdentityHeaders = () => ({
    "X-Appid": "wx-current",
    "X-Openid": "open-1",
    "X-Unionid": "union-1",
  });
  globalThis.uni = {
    request(options) {
      requestOptions = options;
      options.success?.({ statusCode: 200, data: { code: 1, data: {} } });
      return { abort() {} };
    },
  };

  const { requestFun } = await loadRequestModule();
  const installedApp = { config: { globalProperties: {} } };
  requestFun(installedApp);

  installedApp.config.globalProperties._post.call(createVm(), "demo/test", {}, () => {});

  assert.equal(requestOptions.header["content-type"], "application/json;charset=UTF-8");
  assert.equal(requestOptions.header["X-Appid"], "wx-current");
  assert.equal(requestOptions.header["X-Openid"], "open-1");
  assert.equal(requestOptions.header["X-Unionid"], "union-1");
});

test("identity headers use current mini program appid and optional ids", async () => {
  const storage = new Map([
    ["mini_program_open_id", "open-1"],
    ["mini_program_union_id", "union-1"],
  ]);

  globalThis.__getAccountInfo = () => ({ miniProgram: { appId: "wx-current" } });
  globalThis.__getRuntimeConfig = () => ({
    miniprogram_appid: "wx-runtime",
    appid: "wx-config",
  });
  globalThis.getApp = () => ({ globalData: {} });
  globalThis.uni = {
    getStorageSync(key) {
      return storage.get(key) || "";
    },
  };

  const { buildRequestIdentityHeaders } = await loadRequestIdentityHeadersModule();
  const header = buildRequestIdentityHeaders();

  assert.equal(header["X-Appid"], "wx-current");
  assert.equal(header["X-Openid"], "open-1");
  assert.equal(header["X-Unionid"], "union-1");
});

test("identity headers omit openid and unionid when unavailable", async () => {
  globalThis.__getAccountInfo = () => null;
  globalThis.__getRuntimeConfig = () => ({
    miniprogram_appid: "wx-runtime",
    appid: "wx-config",
  });
  globalThis.getApp = () => ({ globalData: {} });
  globalThis.uni = {
    getStorageSync() {
      return "";
    },
  };

  const { buildRequestIdentityHeaders } = await loadRequestIdentityHeadersModule();
  const header = buildRequestIdentityHeaders();

  assert.equal(header["X-Appid"], "wx-runtime");
  assert.equal("X-Openid" in header, false);
  assert.equal("X-Unionid" in header, false);
});

test("request wrapper omits optional identity headers when values are missing", async () => {
  let requestOptions;

  globalThis.__redirectToNativeLogin = () => {};
  globalThis.__buildRequestIdentityHeaders = () => ({
    "X-Appid": "wx-runtime",
  });
  globalThis.uni = {
    request(options) {
      requestOptions = options;
      options.success?.({ statusCode: 200, data: { code: 1, data: {} } });
      return { abort() {} };
    },
  };

  const { requestFun } = await loadRequestModule();
  const installedApp = { config: { globalProperties: {} } };
  requestFun(installedApp);

  installedApp.config.globalProperties._get.call(createVm(), "demo/test", {}, () => {});

  assert.equal(requestOptions.header["X-Appid"], "wx-runtime");
  assert.equal("X-Openid" in requestOptions.header, false);
  assert.equal("X-Unionid" in requestOptions.header, false);
  assert.equal("content-type" in requestOptions.header, false);
});

test("h5 request adapter adds mini program identity headers", async () => {
  let requestOptions;

  globalThis.__handleH5Unauthorized = () => false;
  globalThis.__buildRequestIdentityHeaders = () => ({
    "X-Appid": "wx-current",
    "X-Openid": "open-1",
  });
  globalThis.__getRuntimeConfig = () => ({
    h5_api_url: "https://h5.example.com/api",
    app_url: "https://api.example.com",
  });
  globalThis.uni = {
    getStorageSync(key) {
      return key === "token" ? "token-1" : "";
    },
    request(options) {
      requestOptions = options;
      options.success?.({ statusCode: 200, data: { code: 0, data: { ok: true } } });
    },
  };

  const { h5Get } = await loadH5Module();
  const result = await h5Get("/demo");

  assert.deepEqual(result, { ok: true });
  assert.equal(requestOptions.header["X-Appid"], "wx-current");
  assert.equal(requestOptions.header["X-Openid"], "open-1");
  assert.equal(requestOptions.header.Authorization, "Bearer token-1");
  assert.equal(requestOptions.header["X-Token"], "token-1");
});
