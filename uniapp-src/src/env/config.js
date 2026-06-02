import { dev_url } from './development.js';
import { pro_url } from './production.js';

const env = import.meta.env || {};
const appUrl = env.MODE === 'development' && dev_url.url ? dev_url.url : pro_url.url;
const configuredH5Url = env.MODE === 'development' ? dev_url.h5_url : pro_url.h5_url;
const envH5Url = env.VITE_H5_API_BASE_URL || env.VITE_H5_API_URL || env.VITE_H5_URL || '';
const h5Url = envH5Url || configuredH5Url;

export const config = {
  app_url: appUrl,
  h5_url: h5Url || '',
  h5_api_url: h5Url || '',
  app_id: 393016,
  appid: 'wx3bf933f8a2018d8d',
  token: 'd1eb418107ca0674b7654ede4d3162fc',
  h5_addr: '/h5',
  im_log_level: 1,
  font_url: 'https://at.alicdn.com/t/c/font_4197023_cp26qx5fd6.ttf?t=1703641583677',
  pic_url: 'https://cos.images.guankeyun.net',
};

export default config;
