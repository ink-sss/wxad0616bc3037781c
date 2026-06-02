import { redirectToH5Login } from '../services/h5-auth-context.js';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function withCommonParams(vm, params = {}, includeSourceClient = false) {
  const data = { ...params };

  data.token = vm.config.token;
  data.app_id = vm.getAppId();
  data.appid = vm.config.appid;
  if (includeSourceClient) data.source_client = 'wx';

  return data;
}

function requestByContext(vm, options) {
  const data = withCommonParams(vm, options.data, options.includeSourceClient);

  if (options.endpoint === 'user.user/getSession') {
    delete data.appid;
  }

  return uni.request({
    url: `${vm.websiteUrl}/index.php/api/${options.endpoint}`,
    data,
    dataType: 'json',
    method: options.method,
    header: options.method === 'POST' ? { 'content-type': 'application/json;charset=UTF-8' } : undefined,
    success(response) {
      if (response.statusCode !== 200 || !isObject(response.data)) return false;

      if (response.data.code === -2 && options.clearTokenOnExpired) {
        vm.showError(response.data.msg, () => {
          uni.removeStorageSync('token');
        });
        return false;
      }

      if (response.data.code === -1) {
        console.log('登录态失效, 重新登录');
        options.onInvalidLogin(vm);
        return false;
      }

      if (response.data.code === 0) {
        vm.showError(response.data.msg, () => {
          if (options.fail) options.fail(response);
        });
        return false;
      }

      if (options.success) options.success(response.data);
      return true;
    },
    fail(error) {
      if (options.fail) options.fail(error);
    },
    complete(result) {
      if (options.complete) options.complete(result);
    },
  });
}

function appInvalidLogin(vm) {
  vm.doLogin();
}

function storeInvalidLogin(vm) {
  vm.gotoPage('/pages/branch/login');
}

function supplierInvalidLogin(vm) {
  vm.gotoPage('/pages/live-management/login');
}

function supplierPostInvalidLogin(vm) {
  vm.gotoPage('/pages/live-management/login', 'reLaunch');
}

export function requestFun(app) {
  app.config.globalProperties._get = function _get(endpoint, data, success, fail, complete) {
    return requestByContext(this, {
      endpoint,
      data,
      success,
      fail,
      complete,
      method: 'GET',
      includeSourceClient: true,
      clearTokenOnExpired: true,
      onInvalidLogin: appInvalidLogin,
    });
  };

  app.config.globalProperties._post = function _post(endpoint, data, success, fail, complete) {
    return requestByContext(this, {
      endpoint,
      data,
      success,
      fail,
      complete,
      method: 'POST',
      includeSourceClient: true,
      clearTokenOnExpired: false,
      onInvalidLogin: appInvalidLogin,
    });
  };

  app.config.globalProperties._StoreGet = function _StoreGet(endpoint, data, success, fail, complete) {
    return requestByContext(this, {
      endpoint,
      data,
      success,
      fail,
      complete,
      method: 'GET',
      includeSourceClient: false,
      clearTokenOnExpired: true,
      onInvalidLogin: storeInvalidLogin,
    });
  };

  app.config.globalProperties._StorePost = function _StorePost(endpoint, data, success, fail, complete) {
    return requestByContext(this, {
      endpoint,
      data,
      success,
      fail,
      complete,
      method: 'POST',
      includeSourceClient: false,
      clearTokenOnExpired: false,
      onInvalidLogin: storeInvalidLogin,
    });
  };

  app.config.globalProperties._SupplierGet = function _SupplierGet(endpoint, data, success, fail, complete) {
    return requestByContext(this, {
      endpoint,
      data,
      success,
      fail,
      complete,
      method: 'GET',
      includeSourceClient: false,
      clearTokenOnExpired: true,
      onInvalidLogin: supplierInvalidLogin,
    });
  };

  app.config.globalProperties._SupplierPost = function _SupplierPost(endpoint, data, success, fail, complete) {
    return requestByContext(this, {
      endpoint,
      data,
      success,
      fail,
      complete,
      method: 'POST',
      includeSourceClient: false,
      clearTokenOnExpired: false,
      onInvalidLogin: supplierPostInvalidLogin,
    });
  };

  app.config.globalProperties.doLogin = function doLogin() {
    const pages = getCurrentPages();
    let redirect = '/pages/center/index';
    if (pages.length) {
      const currentPage = pages[pages.length - 1];
      if (
        currentPage.route !== 'pages/login/login' &&
        currentPage.route !== 'pages/login/weblogin' &&
        currentPage.route !== 'pages/login/openlogin'
      ) {
        uni.setStorageSync('currentPage', currentPage.route);
        uni.setStorageSync('currentPageOptions', currentPage.$page && currentPage.$page.options);
        const options = (currentPage.$page && currentPage.$page.options) || currentPage.options || {};
        const query = Object.keys(options)
          .filter((key) => options[key] !== undefined && options[key] !== null && options[key] !== '')
          .map((key) => `${key}=${encodeURIComponent(options[key])}`)
          .join('&');
        redirect = `/${currentPage.route}${query ? `?${query}` : ''}`;
      }
    }

    console.log(`app_ID=${this.getAppId()}`);
    if (uni.getStorageSync('me')) {
      this.gotoPage('/pages/login/anchorlogin');
    } else {
      redirectToH5Login({ redirect });
    }
  };
}

export default requestFun;
