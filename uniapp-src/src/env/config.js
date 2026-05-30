import { dev_url } from './development.js';
import { pro_url } from './production.js';

const env = import.meta.env || {};
const appUrl = env.MODE === 'development' && dev_url.url ? dev_url.url : pro_url.url;

export const config = {
  app_url: appUrl,
  app_id: 393016,
  appid: 'wxad0616bc3037781c',
  token: 'd1eb418107ca0674b7654ede4d3162fc',
  h5_addr: '/h5',
  im_log_level: 1,
  font_url: 'https://at.alicdn.com/t/c/font_4197023_cp26qx5fd6.ttf?t=1703641583677',
  pic_url: 'https://cos.images.guankeyun.net',
};

export default config;
