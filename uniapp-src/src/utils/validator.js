import { utils } from '../common/utils.js';
import { hasWeixinApi, requestSubscribeMessage } from '../platform/weixin/index.js';
import { getRuntimeConfig } from './runtime-config.js';

function safeMenuButtonRect() {
  if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
    return uni.getMenuButtonBoundingClientRect();
  }

  return {
    top: 0,
    height: 0,
    width: 0,
    right: 0,
  };
}

function safeWindowInfo() {
  if (typeof uni.getWindowInfo === 'function') {
    return uni.getWindowInfo();
  }

  return uni.getSystemInfoSync();
}

export function validator(app) {
  const config = getRuntimeConfig();
  app.config.globalProperties.getAppId = function getAppId() {
    return uni.getStorageSync('me')
      ? uni.getStorageSync('me') || config.app_id || 10001
      : config.app_id || uni.getStorageSync('app_id') || 10001;
  };

  app.config.globalProperties.compareVersion = function compareVersion(left, right) {
    const leftParts = left.split('.');
    const rightParts = right.split('.');
    const length = Math.max(leftParts.length, rightParts.length);

    while (leftParts.length < length) leftParts.push('0');
    while (rightParts.length < length) rightParts.push('0');

    for (let index = 0; index < length; index += 1) {
      const leftValue = parseInt(leftParts[index], 10);
      const rightValue = parseInt(rightParts[index], 10);
      if (leftValue > rightValue) return 1;
      if (leftValue < rightValue) return -1;
    }

    return 0;
  };

  app.config.globalProperties.getVisitcode = function getVisitcode() {
    let visitcode = uni.getStorageSync('visitcode');

    if (!visitcode) {
      visitcode = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, (item) => {
          const random = (16 * Math.random()) | 0;
          return (item === 'x' ? random : (random & 3) | 8).toString(16);
        })
        .replace(/-/g, '');
      uni.setStorageSync('visitcode', visitcode);
    }

    return visitcode;
  };

  app.config.globalProperties.subMessage = function subMessage(templateIds, callback) {
    const systemInfo = uni.getSystemInfoSync();
    const done = typeof callback === 'function' ? callback : () => {};

    if (
      templateIds &&
      templateIds.length !== 0 &&
      this.compareVersion(systemInfo.SDKVersion || '0.0.0', '2.8.2') >= 0 &&
      hasWeixinApi('requestSubscribeMessage')
    ) {
      uni.hideLoading();
      requestSubscribeMessage(templateIds).finally(done);
      return;
    }

    done();
  };

  app.config.globalProperties.showError = function showError(message, callback) {
    if (!message) {
      if (callback) callback();
      return;
    }

    uni.showModal({
      title: '友情提示',
      content: message,
      showCancel: false,
      success() {
        if (callback) callback();
      },
    });
  };

  app.config.globalProperties.showSuccess = function showSuccess(message, callback) {
    uni.showModal({
      title: '友情提示',
      content: message,
      showCancel: false,
      success() {
        if (callback) callback();
      },
    });
  };

  app.config.globalProperties.getShareUrlParams = function getShareUrlParams(params) {
    return utils.urlEncode(
      Object.assign(
        {
          referee_id: this.getUserId(),
          app_id: this.getAppId(),
        },
        params,
      ),
    );
  };

  app.config.globalProperties.getUserId = function getUserId() {
    return uni.getStorageSync('user_id');
  };

  app.config.globalProperties.ios = function ios() {
    const systemInfo = uni.getSystemInfoSync();
    return systemInfo.platform === 'ios';
  };

  app.config.globalProperties.isWeixin = function isWeixin() {
    return false;
  };

  app.config.globalProperties.getPlatform = function getPlatform() {
    return 'wx';
  };

  app.config.globalProperties.topBarTop = function topBarTop() {
    return safeMenuButtonRect().top;
  };

  app.config.globalProperties.topBarHeight = function topBarHeight() {
    return safeMenuButtonRect().height;
  };

  app.config.globalProperties.topBarRight = function topBarRight() {
    const rect = safeMenuButtonRect();
    return `${2 * (rect.width + 10)}rpx`;
  };

  app.config.globalProperties.subPrice = function subPrice(price, type) {
    const value = String(price);
    if (type == 1) return value.substring(0, value.indexOf('.'));
    if (type == 2) {
      const index = value.indexOf('.');
      return value.slice(index + 1, index + 3);
    }
    return '';
  };

  app.config.globalProperties.convertTwo = function convertTwo(value) {
    return value < 10 ? `0${value}` : value;
  };

  app.config.globalProperties.yulan = function yulan(source, current) {
    let urls = [];

    if (Array.isArray(source)) {
      if (source[0] && source[0].file_path) {
        urls = source.map((item) => item.file_path);
      } else {
        urls = source;
      }
    } else {
      urls = [source];
    }

    uni.previewImage({
      urls,
      current: Number(current),
      indicator: 'default',
    });
  };

  app.config.globalProperties.mpMessage = function mpMessage() {};

  app.config.globalProperties.getNavHeight = function getNavHeight() {
    const windowInfo = safeWindowInfo();
    const statusBarHeight = windowInfo.statusBarHeight || 0;
    const menuRect = safeMenuButtonRect();
    const navHeight = menuRect.height + 2 * (menuRect.top - statusBarHeight) + statusBarHeight;
    const screenWidth = windowInfo.screenWidth || 0;

    return {
      navHeight,
      statusBarHeight,
      navWidth: screenWidth - (menuRect.width + (screenWidth - menuRect.right)),
      jnWidth: menuRect.width + (screenWidth - menuRect.right),
    };
  };
}

export default validator;
