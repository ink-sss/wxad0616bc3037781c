import { getAccountInfo } from '../platform/weixin/account.js';
import { getRuntimeConfig } from './runtime-config.js';

const OPEN_ID_KEYS = ['mini_program_open_id', 'open_id', 'openId', 'openid'];
const UNION_ID_KEYS = ['mini_program_union_id', 'union_id', 'unionId', 'unionid', 'wechatUnionid'];

function readStorage(keys = []) {
  try {
    for (const key of keys) {
      const value = uni.getStorageSync(key);
      if (value) return value;
    }
  } catch (error) {}
  return '';
}

function readGlobalData(keys = []) {
  try {
    const globalData = getApp()?.globalData || {};
    for (const key of keys) {
      const value = globalData[key];
      if (value) return value;
    }
  } catch (error) {}
  return '';
}

function getMiniProgramAppId() {
  const accountInfo = getAccountInfo();
  const currentAppId = accountInfo?.miniProgram?.appId;
  if (currentAppId) return currentAppId;

  const runtimeConfig = getRuntimeConfig();
  return (
    readGlobalData(['appid', 'appId', 'miniprogram_appid', 'miniProgramAppId']) ||
    readStorage(['miniprogram_app_id']) ||
    runtimeConfig.miniprogram_appid ||
    runtimeConfig.appid ||
    ''
  );
}

export function buildRequestIdentityHeaders() {
  const header = {};

  const appId = getMiniProgramAppId();
  if (appId) header['X-Appid'] = appId;

  const unionId = readStorage(UNION_ID_KEYS) || readGlobalData(['union_id', 'unionId', 'unionid', 'wechatUnionid']);
  if (unionId) header['X-Unionid'] = unionId;

  const openId = readStorage(OPEN_ID_KEYS) || readGlobalData(['open_id', 'openId', 'openid']);
  if (openId) header['X-Openid'] = openId;

  return header;
}
