import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const loginPageSourcePath = join(root, "src/pagesPlus/main/login/login.vue");
const pagesJsonPath = join(root, "src/pages.json");

async function loadLoginPageToolsModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "login-page-tools-"));
  const sourcePath = join(root, "src/pagesPlus/main/login/page-tools.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { login as weixinLogin, normalizePhoneNumberEvent } from '../../../platform/weixin/index.js'",
      "const weixinLogin = globalThis.__weixinLogin;\nconst normalizePhoneNumberEvent = globalThis.__normalizePhoneNumberEvent;"
    )
    .replace(
      /import\s+\{[\s\S]*?bindMobileMiniProgram[\s\S]*?\}\s+from '\.\.\/\.\.\/\.\.\/api\/miniprogram-login\.js'/,
      "const bindMobileMiniProgram = globalThis.__bindMobileMiniProgram;\nconst loginMiniProgram = globalThis.__loginMiniProgram;\nconst persistMiniProgramLoginSession = globalThis.__persistMiniProgramLoginSession;"
    )
    .replace(
      "import { loginAndRedirectWithMiniProgramWechat } from '../../../services/h5-auth.js'",
      "const loginAndRedirectWithMiniProgramWechat = globalThis.__loginAndRedirectWithMiniProgramWechat;"
    )
    .replace(
      /import\s+\{[\s\S]*?syncH5AuthSession,\s*\}\s+from '\.\.\/\.\.\/\.\.\/services\/h5-auth-context\.js'/,
      "const buildH5AuthContext = globalThis.__buildH5AuthContext;\nconst getCurrentPageUrl = globalThis.__getCurrentPageUrl;\nconst hasH5Token = globalThis.__hasH5Token;\nconst redirectAfterNativeLogin = globalThis.__redirectAfterNativeLogin;\nconst redirectAfterH5LoginSkipped = globalThis.__redirectAfterH5LoginSkipped;\nconst saveNativeLoginRedirectFromQuery = globalThis.__saveNativeLoginRedirectFromQuery;\nconst saveH5AuthContext = globalThis.__saveH5AuthContext;\nconst syncH5AuthSession = globalThis.__syncH5AuthSession;"
    );
  const modulePath = join(tempDir, "page-tools.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

test("developer tools login reuses the local session without calling login APIs", async () => {
  const storage = new Map();
  const app = {
    globalData: {},
    imLogin() {
      app.imLoginCalled = true;
    },
  };
  let wxLoginCalled = false;
  let loginApiCalled = false;
  let syncedSession;
  let persistedSession;

  globalThis.__weixinLogin = async () => {
    wxLoginCalled = true;
    return { code: "dynamic-code" };
  };
  globalThis.__normalizePhoneNumberEvent = () => ({});
  globalThis.__bindMobileMiniProgram = async () => ({});
  globalThis.__loginMiniProgram = async () => {
    loginApiCalled = true;
    throw new Error("login API should not be called");
  };
  globalThis.__persistMiniProgramLoginSession = (data = {}) => {
    persistedSession = data;
    const openId = data.open_id || data.openId || data.openid || "";
    if (openId) {
      ["mini_program_open_id", "open_id", "openId", "openid"].forEach((key) => storage.set(key, openId));
      app.globalData.open_id = openId;
      app.globalData.openId = openId;
    }
    if (data.im_user_id) {
      storage.set("im_user_id", data.im_user_id);
      storage.set("imUserId", data.im_user_id);
      app.globalData.imUserId = data.im_user_id;
    }
    if (data.im_user_sig) {
      storage.set("im_user_sig", data.im_user_sig);
      storage.set("imUserSig", data.im_user_sig);
      app.globalData.imUserSig = data.im_user_sig;
    }
    return data;
  };
  globalThis.__loginAndRedirectWithMiniProgramWechat = async () => ({});
  globalThis.__buildH5AuthContext = (context) => context;
  globalThis.__getCurrentPageUrl = (fallback) => fallback;
  globalThis.__hasH5Token = () => false;
  globalThis.__redirectAfterNativeLogin = () => {};
  globalThis.__redirectAfterH5LoginSkipped = () => {};
  globalThis.__saveNativeLoginRedirectFromQuery = () => {};
  globalThis.__saveH5AuthContext = (context) => context;
  globalThis.__syncH5AuthSession = (data = {}) => {
    syncedSession = data;
    return data;
  };
  globalThis.uni = {
    setStorageSync(key, value) {
      storage.set(key, value);
    },
    getStorageSync(key) {
      return storage.get(key) || "";
    },
    showToast() {},
  };
  globalThis.getApp = () => app;

  const { loginWithWechatDevtoolsProfile } = await loadLoginPageToolsModule();
  const session = await loginWithWechatDevtoolsProfile();

  assert.equal(wxLoginCalled, false);
  assert.equal(loginApiCalled, false);
  assert.equal(session.token, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcklkIjo4ODQsInRlbmFudElkIjoxNSwib3BlbklkIjoiIiwidW5pb25JZCI6Im9NeDFVMmZQZmVNRTlTWU5jS29kRThDVzJFUFkiLCJwaG9uZSI6IiIsIm5pY2tuYW1lIjoiaW5rIiwiYnVmZmVyVGltZSI6ODY0MDAsImlzcyI6InFtUGx1cyIsImF1ZCI6WyJINSJdLCJleHAiOjE3ODE2NjQwMTUsIm5iZiI6MTc4MTA1OTIxNX0.BmUA7oOYNRvkb4RTQ__HDLc42TkKjPCJamLKtTCjpHY");
  assert.equal(session.user_id, 884);
  assert.equal(session.open_id, "ot-Fn3Z4r2e0iN6UpuTl1MGUysg8");
  assert.equal(session.im_user_id, "customer_884");
  assert.equal(session.im_user_sig, "YWMtthuFrmR1EfGO_UW_jQLOQBDcftnmIkpPnhC-J8NjAz7Jf3SwY-UR8YbLLxRUuu46AwMAAAGer2bgUAABUYCN1BVSQZHZpztaKdOX4sDn-RqVqMbPADWGoyUK08u8lw");
  assert.equal(session.shop_supplier_id, 15);
  assert.equal(session.msg, "登录成功");
  assert.equal(session.nickName, "ink");
  assert.equal(storage.get("token"), session.token);
  assert.equal(storage.get("user_id"), 884);
  assert.equal(storage.get("shop_supplier_id"), 15);
  assert.equal(storage.get("mini_program_open_id"), "ot-Fn3Z4r2e0iN6UpuTl1MGUysg8");
  assert.equal(storage.get("open_id"), "ot-Fn3Z4r2e0iN6UpuTl1MGUysg8");
  assert.equal(storage.get("im_user_id"), "customer_884");
  assert.equal(app.globalData.is_login, true);
  assert.equal(app.globalData.open_id, "ot-Fn3Z4r2e0iN6UpuTl1MGUysg8");
  assert.equal(app.globalData.imUserId, "customer_884");
  assert.equal(app.globalData.imUserSig, session.im_user_sig);
  assert.equal(app.imLoginCalled, true);
  assert.equal(syncedSession.token, session.token);
  assert.equal(persistedSession.token, session.token);
});

test("login page declares the wechat-login plugin component", async () => {
  const [loginPageSource, pagesJsonSource] = await Promise.all([
    readFile(loginPageSourcePath, "utf8"),
    readFile(pagesJsonPath, "utf8"),
  ]);
  const pagesConfig = JSON.parse(pagesJsonSource);
  const loginPage = pagesConfig.subPackages
    .flatMap((subPackage) => subPackage.pages.map((page) => ({
      ...page,
      path: `${subPackage.root}${page.path}`,
    })))
    .find((page) => page.path === "pagesPlus/main/login/login");

  assert.ok(loginPage);
  assert.equal(loginPageSource.includes("<wechat-login"), true);
  assert.equal(loginPage.style?.usingComponents?.["wechat-login"], "plugin://wx43134e071b752953/wechat-login");
});
