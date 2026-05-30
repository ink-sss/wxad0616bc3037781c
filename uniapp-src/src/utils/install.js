import { config } from '../env/config.js';
import { gotopage } from '../common/gotopage.js';
import { OnFire } from '../common/onfire.js';
import { requestFun } from './request.js';
import { validator } from './validator.js';

export function installSharedRuntime(app, options = {}) {
  app.config.globalProperties.$fire = options.eventBus || new OnFire();
  app.config.globalProperties.config = options.config || config;
  app.config.globalProperties.websiteUrl = app.config.globalProperties.config.app_url;
  app.config.globalProperties.app_id = app.config.globalProperties.config.app_id;
  app.config.globalProperties.gotoPage = options.gotoPage || gotopage;
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

    uni.request({
      url: `${this.config.app_url}/index.php/api/index/nav`,
      data: {
        app_id: this.config.app_id,
        appid: this.config.appid,
      },
      success: (response) => {
        const data = response.data.data.vars.data;
        const nextTheme = response.data.data.theme.theme;

        if (this.$store) this.$store.commit('changeTheme', nextTheme);
        uni.setStorageSync('theme', nextTheme);
        uni.setStorageSync('TabBar', data);
        uni.setStorageSync('tabInited', data.is_auto);
        this.setTabBarLinks(data, nextTheme);
      },
    });
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
