import { jump } from './jump.js';
import { navigateToMiniProgram } from '../platform/weixin/navigation.js';

const defaultTabBarPages = [
  '/pages/index/index',
  '/pages/product/category',
  '/pages/shop/shop_list',
  '/pages/cart/cart',
  '/pages/user/index/index',
];

function normalizePageUrl(url) {
  return url.substr(0, 1) === '/' ? url : `/${url}`;
}

function pathOnly(url) {
  const queryIndex = url.indexOf('?');
  return queryIndex === -1 ? url : url.substr(0, queryIndex);
}

function isRuntimeTabPage(path) {
  const tabBar = uni.getStorageSync('TabBar');
  const list = tabBar && Array.isArray(tabBar.list) ? tabBar.list : [];

  return list.some((item) => item && item.link_url === path);
}

export function gotopage(url, navType) {
  if (!url || url.length === 0) return false;
  if (!jump.checkAndNavigate(url)) return false;

  if (url.startsWith('#小程序')) {
    navigateToMiniProgram({
      shortLink: url,
      fail() {
        uni.showToast({
          title: '打开链接失败',
          icon: 'none',
        });
      },
    });
    return true;
  }

  if (url.indexOf('https://') === 0) {
    uni.navigateTo({
      url: `/pagesPlus/main/webview/webview?url=${encodeURIComponent(url)}`,
    });
    return true;
  }

  const pageUrl = normalizePageUrl(url);
  const pagePath = pathOnly(pageUrl);

  if (isRuntimeTabPage(pagePath) || defaultTabBarPages.indexOf(pagePath) > -1) {
    uni.reLaunch({ url: pageUrl });
    return true;
  }

  if (navType === 'redirect') {
    uni.redirectTo({ url: pageUrl });
    return true;
  }

  if (navType === 'reLaunch') {
    uni.reLaunch({ url: pageUrl });
    return true;
  }

  uni.navigateTo({ url: pageUrl });
  return true;
}

export default gotopage;
