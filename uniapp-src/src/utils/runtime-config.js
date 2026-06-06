import rawConfig from '../env/config.js';

const DEFAULT_RUNTIME_CONFIG = {
  app_url: 'https://api.guankeyun.net',
  h5_url: 'https://man.lqjy.cc/api',
  h5_api_url: 'https://man.lqjy.cc/api',
  tenant_id: '',
  app_id: 393016,
  appid: 'wx9ea83e805b82f59d',
  miniprogram_appid: 'wx9ea83e805b82f59d',
  miniprogram_login_app_id: 'wx43134e071b752953',
  token: 'd1eb418107ca0674b7654ede4d3162fc',
  h5_addr: '/h5',
  im_log_level: 1,
  static_url: 'https://man.lqjy.cc/static',
  font_url: 'https://man.lqjy.cc/static/fonts/font_4197023_cp26qx5fd6.ttf',
  pic_url: 'https://man.lqjy.cc/static',
};

export function normalizeRuntimeConfig(value = rawConfig) {
  return {
    ...DEFAULT_RUNTIME_CONFIG,
    ...(value && typeof value === 'object' ? value : {}),
  };
}

export function getRuntimeConfig(overrides) {
  return normalizeRuntimeConfig(overrides || rawConfig);
}

export default getRuntimeConfig;
