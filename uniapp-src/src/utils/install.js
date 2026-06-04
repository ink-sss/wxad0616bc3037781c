import { config } from '../env/config.js';
import { gotopage } from '../common/gotopage.js';
import { OnFire } from '../common/onfire.js';
import { requestFun } from './request.js';
import { validator } from './validator.js';

function defaultTabBar(theme = 2) {
  return {
    backgroundColor: '#FFFFFF',
    is_auto: '0',
    textColor: '#000000',
    textHoverColor: '#ffcc00',
    type: '0',
    list: [
      { iconPath: '/static/tabbar/home.png', link_url: '/pages/index/index', selectedIconPath: `/static/tabbar/home_${theme}.png`, text: '首页' },
      { iconPath: '/static/tabbar/category.png', link_url: '/pages/product/category', selectedIconPath: `/static/tabbar/category_${theme}.png`, text: '分类' },
      { iconPath: '/static/tabbar/shop.png', is_show: false, link_url: '/pages/shop/shop_list', selectedIconPath: `/static/tabbar/shop_${theme}.png`, text: '商户' },
      { iconPath: '/static/tabbar/cart.png', is_show: true, link_url: '/pages/cart/cart', selectedIconPath: `/static/tabbar/cart_${theme}.png`, text: '购物车' },
      { iconPath: '/static/tabbar/user.png', is_show: true, link_url: '/pages/user/index/index', selectedIconPath: `/static/tabbar/user_${theme}.png`, text: '我的' }
    ]
  };
}

export function installSharedRuntime(app, options = {}) {
  app.config.globalProperties.$fire = options.eventBus || new OnFire();
  app.config.globalProperties.config = options.config || config;
  app.config.globalProperties.websiteUrl = app.config.globalProperties.config.app_url;
  app.config.globalProperties.app_id = app.config.globalProperties.config.app_id;
  app.config.globalProperties.gotoPage = options.gotoPage || gotopage;
  app.config.globalProperties.static_url = app.config.globalProperties.config.static_url;
  app.config.globalProperties.font_url = app.config.globalProperties.config.font_url;

  if (options.store) {
    app.config.globalProperties.$store = options.store;
    app.config.globalProperties.footTabberData = options.footTabberData || { active: 'home' };
    app.config.globalProperties.points_name = function pointsName(text) {
      if (text) {
        return text.replace(new RegExp('积分', 'g'), options.store.state.points_name);
      }
      return options.store.state.points_name;
    };
    app.config.globalProperties.theme = function theme() {
      return `theme${this.$store.state.theme}` || '';
    };
    app.config.globalProperties.getThemeColor = function getThemeColor() {
      return ['#ff5704', '#19ad57', '#ffcc00', '#33a7ff', '#e4e4e4', '#c8ba97', '#623ceb'][
        this.$store.state.theme
      ];
    };
  }

  requestFun(app);
  validator(app);

  app.config.globalProperties.getTabBarLinks = function getTabBarLinks() {
    const tabBar = uni.getStorageSync('TabBar');
    const tabInited = uni.getStorageSync('tabInited');
    const theme = uni.getStorageSync('theme');

    if (tabBar != null && tabBar !== '' && tabInited !== undefined && tabInited !== 'undefined') {
      this.setTabBarLinks(tabBar, theme);
      return;
    }

    const nextTheme = 2;
    const data = defaultTabBar(nextTheme);
    if (this.$store) this.$store.commit('changeTheme', nextTheme);
    uni.setStorageSync('theme', nextTheme);
    uni.setStorageSync('TabBar', data);
    uni.setStorageSync('tabInited', data.is_auto);
    this.setTabBarLinks(data, nextTheme);
  };

  app.config.globalProperties.setTabBarLinks = function setTabBarLinks(tabBar) {
    tabBar.list = [];
  };

  app.config.globalProperties.tabInited = function tabInited() {
    return uni.getStorageSync('tabInited');
  };

  app.config.globalProperties.navBack = function navBack() {
    try {
      uni.navigateBack({
        fail() {
          uni.switchTab({
            url: '/pages/index/index',
          });
        },
      });
    } catch (error) {
      uni.switchTab({
        url: '/pages/index/index',
      });
    }
  };
}

export default installSharedRuntime;
