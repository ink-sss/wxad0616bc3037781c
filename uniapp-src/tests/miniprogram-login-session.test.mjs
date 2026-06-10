import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadMiniProgramLoginModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "miniprogram-login-"));
  const sourcePath = join(root, "src/api/miniprogram-login.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import { h5Post } from \'./h5.js\'', "const h5Post = globalThis.__h5Post;")
    .replace('import { getRuntimeConfig } from \'../utils/runtime-config.js\'', "const getRuntimeConfig = globalThis.__getRuntimeConfig;");
  const modulePath = join(tempDir, "miniprogram-login.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

test("miniprogram login session persists Easemob IM credentials", async () => {
  const storage = new Map();
  const app = { globalData: {} };
  globalThis.__h5Post = async () => ({});
  globalThis.__getRuntimeConfig = () => ({});
  globalThis.getApp = () => app;
  globalThis.uni = {
    setStorageSync(key, value) {
      storage.set(key, value);
    },
    getStorageSync(key) {
      return storage.get(key) || "";
    },
  };

  const { persistMiniProgramLoginSession } = await loadMiniProgramLoginModule();
  persistMiniProgramLoginSession({
    im_user_id: "customer_870",
    im_user_sig: "easemob-token",
  });

  assert.equal(storage.get("im_user_id"), "customer_870");
  assert.equal(storage.get("imUserId"), "customer_870");
  assert.equal(storage.get("im_user_sig"), "easemob-token");
  assert.equal(storage.get("imUserSig"), "easemob-token");
  assert.equal(app.globalData.imUserId, "customer_870");
  assert.equal(app.globalData.imUserSig, "easemob-token");
});

test("miniprogram login session persists unionid aliases", async () => {
  const storage = new Map();
  const app = { globalData: {} };
  globalThis.__h5Post = async () => ({});
  globalThis.__getRuntimeConfig = () => ({});
  globalThis.getApp = () => app;
  globalThis.uni = {
    setStorageSync(key, value) {
      storage.set(key, value);
    },
    getStorageSync(key) {
      return storage.get(key) || "";
    },
  };

  const {
    getStoredMiniProgramUnionId,
    persistMiniProgramLoginSession,
  } = await loadMiniProgramLoginModule();
  persistMiniProgramLoginSession({
    unionId: "union-870",
  });

  assert.equal(storage.get("mini_program_union_id"), "union-870");
  assert.equal(storage.get("union_id"), "union-870");
  assert.equal(storage.get("unionId"), "union-870");
  assert.equal(storage.get("unionid"), "union-870");
  assert.equal(storage.get("wechatUnionid"), "union-870");
  assert.equal(app.globalData.union_id, "union-870");
  assert.equal(app.globalData.unionId, "union-870");
  assert.equal(app.globalData.wechatUnionid, "union-870");
  assert.equal(getStoredMiniProgramUnionId(), "union-870");
});
