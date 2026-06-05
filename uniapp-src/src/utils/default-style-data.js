export const DEFAULT_THEME = 0;

const DEFAULT_NAV_RESPONSE_DATA = {
  vars: {
    data: {
      is_auto: '1',
      type: '0',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      textHoverColor: '#E2231A',
      bulge: true,
      list: [
        {
          text: '首页',
          iconPath: 'https://api.guankeyun.net/image/tabbar/home.png',
          selectedIconPath: 'https://api.guankeyun.net/image/tabbar/home_active.png',
          link_url: '/pages/index/index',
          is_show: true,
        },
        {
          text: '分类',
          iconPath: 'https://api.guankeyun.net/image/tabbar/category.png',
          selectedIconPath: 'https://api.guankeyun.net/image/tabbar/category_active.png',
          link_url: '/pages/product/category',
          is_show: true,
        },
        {
          text: '购物车',
          iconPath: 'https://api.guankeyun.net/image/tabbar/cart.png',
          selectedIconPath: 'https://api.guankeyun.net/image/tabbar/cart_active.png',
          link_url: '/pages/cart/cart',
          is_show: true,
        },
        {
          text: '我的',
          iconPath: 'https://api.guankeyun.net/image/tabbar/user.png',
          selectedIconPath: 'https://api.guankeyun.net/image/tabbar/user_active.png',
          link_url: '/pages/user/index/index',
          is_show: true,
        },
      ],
    },
  },
  theme: {
    theme: '0',
  },
  points_name: '积分',
};

const DEFAULT_HOME_RESPONSE_DATA = {
  page: {
    type: 'page',
    name: '页面设置',
    params: {
      name: '首页',
      share_title: '分享标题',
      share_img: 'https://cos.images.guankeyun.net/static/live/default_logo.jpeg',
    },
  },
  items: {
    0: {
      name: '搜索框',
      type: 'search',
      group: 'media',
      icon: 'icon-sousuokuang',
      style: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        topRadio: 0,
        bottomRadio: 0,
        titleTextColor: '#ffffff',
        searchBackGround: '#ffffff',
        searchColor: '#959494',
        background: '#fd642a',
        bgcolor: '#fd642a',
      },
      params: {
        title_type: 'image',
        toplogo: 'https://f3a5f14130.guankeyun.net/image/diy/logo_top.png',
        title: '',
        searchType: 'image',
      },
    },
    1: {
      type: 'product',
      data: [],
      params: {
        column: 2,
        productName: true,
        productPrice: true,
        linePrice: true,
        productSales: true,
        comment: false,
        showCart: 0,
      },
      style: {
        background: '#f7f7f7',
        bgcolor_color1: '#ffffff',
        bgcolor_color2: '#ffffff',
        product_name_color: '#333333',
        product_price_color: '#ff5704',
        line_price_color: '#999999',
        product_sales_color: '#999999',
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 20,
        topRadio: 8,
        bottomRadio: 8,
        productTopRadio: 8,
        productBottomRadio: 0,
      },
    },
    page: {
      type: 'page',
      name: '页面设置',
      params: {
        name: '首页',
        share_title: '分享标题',
        share_img: 'https://cos.images.guankeyun.net/static/live/default_logo.jpeg',
      },
    },
  },
  msgNum: 0,
  setting: {
    collection: {
      status: 0,
    },
    officia: {
      status: 0,
    },
    homepush: {
      is_open: 0,
    },
  },
  share: {
    signPackage: '',
    shareParams: '',
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function defaultNavData() {
  return clone(DEFAULT_NAV_RESPONSE_DATA.vars.data);
}

export function defaultNavTheme() {
  return Number(DEFAULT_NAV_RESPONSE_DATA.theme.theme) || DEFAULT_THEME;
}

export function defaultHomeData() {
  return clone(DEFAULT_HOME_RESPONSE_DATA);
}
