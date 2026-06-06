import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadInstallModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "install-runtime-"));
  const sourcePath = join(root, "src/utils/install.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace("import { gotopage } from '../common/gotopage.js';", "const gotopage = () => {};")
    .replace("import { OnFire } from '../common/onfire.js';", "class OnFire {}")
    .replace("import { requestFun } from './request.js';", "const requestFun = () => {};")
    .replace("import { validator } from './validator.js';", "const validator = () => {};")
    .replace(
      "import { defaultNavData, defaultNavTheme } from './default-style-data.js';",
      "const defaultNavTheme = () => 2; const defaultNavData = () => ({ is_auto: '0', list: [] });"
    )
    .replace(
      "import { getRuntimeConfig } from './runtime-config.js';",
      "const getRuntimeConfig = (value) => ({ app_url: 'https://api.guankeyun.net', app_id: 393016, static_url: 'https://man.lqjy.cc/static', font_url: 'https://man.lqjy.cc/static/fonts/font_4197023_cp26qx5fd6.ttf', ...(value || {}) });"
    );
  const modulePath = join(tempDir, "install.mjs");
  await writeFile(modulePath, source, "utf8");
  return await import(pathToFileURL(modulePath).href);
}

async function loadRuntimeConfigModuleWithMissingConfig() {
  const tempDir = await mkdtemp(join(tmpdir(), "runtime-config-"));
  const sourcePath = join(root, "src/utils/runtime-config.js");
  let source = await readFile(sourcePath, "utf8");
  source = source.replace("import rawConfig from '../env/config.js';", "const rawConfig = undefined;");
  const modulePath = join(tempDir, "runtime-config.mjs");
  await writeFile(modulePath, source, "utf8");
  return await import(pathToFileURL(modulePath).href);
}

async function loadH5ApiModuleWithMissingConfig() {
  const tempDir = await mkdtemp(join(tmpdir(), "h5-api-config-"));
  const sourcePath = join(root, "src/api/h5.js");
  const runtimeModulePath = join(tempDir, "runtime-config.mjs");
  const runtimeSource = (await readFile(join(root, "src/utils/runtime-config.js"), "utf8"))
    .replace("import rawConfig from '../env/config.js';", "const rawConfig = undefined;");
  await writeFile(runtimeModulePath, runtimeSource, "utf8");

  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { handleH5Unauthorized } from '../services/h5-auth-context.js'",
      "const handleH5Unauthorized = () => false;"
    )
    .replace(
      "import { getRuntimeConfig } from '../utils/runtime-config.js'",
      `import { getRuntimeConfig } from ${JSON.stringify(pathToFileURL(runtimeModulePath).href)};`
    );
  const modulePath = join(tempDir, "h5.mjs");
  await writeFile(modulePath, source, "utf8");
  return await import(pathToFileURL(modulePath).href);
}

function createAppStub() {
  return {
    config: {
      globalProperties: {},
    },
  };
}

test("installSharedRuntime falls back when env config is missing", async () => {
  const { installSharedRuntime } = await loadInstallModule();
  const app = createAppStub();

  assert.doesNotThrow(() => installSharedRuntime(app));
  assert.equal(app.config.globalProperties.websiteUrl, "https://api.guankeyun.net");
  assert.equal(app.config.globalProperties.app_id, 393016);
  assert.equal(app.config.globalProperties.static_url, "https://man.lqjy.cc/static");
  assert.ok(app.config.globalProperties.config.app_url);
});

test("installSharedRuntime keeps explicit runtime config values", async () => {
  const { installSharedRuntime } = await loadInstallModule();
  const app = createAppStub();

  installSharedRuntime(app, {
    config: {
      app_url: "https://example.test",
      app_id: 123,
      static_url: "https://static.example.test",
      font_url: "https://static.example.test/font.ttf",
    },
  });

  assert.equal(app.config.globalProperties.websiteUrl, "https://example.test");
  assert.equal(app.config.globalProperties.app_id, 123);
  assert.equal(app.config.globalProperties.static_url, "https://static.example.test");
  assert.equal(app.config.globalProperties.font_url, "https://static.example.test/font.ttf");
});

test("runtime config falls back when env config import is missing", async () => {
  const { getRuntimeConfig } = await loadRuntimeConfigModuleWithMissingConfig();
  const config = getRuntimeConfig();

  assert.equal(config.app_url, "https://api.guankeyun.net");
  assert.equal(config.h5_api_url, "https://man.lqjy.cc/api");
  assert.equal(config.appid, "wx9ea83e805b82f59d");
});

test("h5 api base URL falls back when env config import is missing", async () => {
  globalThis.uni = {
    getStorageSync() {
      return "";
    },
  };
  const { getH5ApiBaseUrl } = await loadH5ApiModuleWithMissingConfig();

  assert.equal(getH5ApiBaseUrl(), "https://man.lqjy.cc/api");
});
