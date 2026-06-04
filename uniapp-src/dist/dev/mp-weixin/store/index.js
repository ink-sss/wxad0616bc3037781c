"use strict";
const common_vendor = require("../common/vendor.js");
function getStorageSync(key, fallback = "") {
  if (typeof common_vendor.index === "undefined" || typeof common_vendor.index.getStorageSync !== "function") {
    return fallback;
  }
  try {
    const value = common_vendor.index.getStorageSync(key);
    return value === void 0 || value === null ? fallback : value;
  } catch (error) {
    console.warn(`[store] Unable to read storage key "${key}"`, error);
    return fallback;
  }
}
function createInitialState() {
  return {
    theme: getStorageSync("theme", 2) || 2,
    footTab: "",
    points_name: "积分",
    is_prohibition: 0,
    is_close_comment: 0,
    is_fake_prohibition: 0,
    is_check_open: 0,
    is_checkin_open: 0,
    coupon_data: {},
    grade_detail: {},
    welfare_data: {},
    store_mobile_permission: null
  };
}
const store = common_vendor.createStore({
  state: createInitialState,
  mutations: {
    changeTheme(state, value) {
      state.theme = value;
    },
    changefootTab(state, value) {
      state.footTab = value;
    },
    changePoints(state, value) {
      state.points_name = value;
    },
    changeProhibition(state, value) {
      state.is_prohibition = value;
    },
    changeFakeProhibition(state, value) {
      state.is_fake_prohibition = value;
    },
    changeCloseComment(state, value) {
      state.is_close_comment = value;
    },
    changecheckOpen(state, value) {
      state.is_check_open = value;
    },
    changechecinkOpen(state, value) {
      state.is_checkin_open = value;
    },
    changeCouponOpen(state, value) {
      state.coupon_data = value;
    },
    changeGradeDetail(state, value) {
      state.grade_detail = value;
    },
    changeWelfareOpen(state, value) {
      state.welfare_data = value;
    },
    roomChangeWelfareOpen(state, value) {
      const cachedWelfare = getStorageSync(`welfare_data_${value.room_id}`);
      if (!cachedWelfare || cachedWelfare.push_id !== value.push_id) {
        state.welfare_data = value;
      }
    },
    changeStoreMobilePermission(state, value) {
      state.store_mobile_permission = value;
    }
  },
  getters: {},
  actions: {}
});
function installStore(app) {
  app.use(store);
  app.config.globalProperties.$store = store;
  return store;
}
exports.installStore = installStore;
