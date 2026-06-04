import { createStore } from 'vuex'

function getStorageSync(key, fallback = '') {
  if (typeof uni === 'undefined' || typeof uni.getStorageSync !== 'function') {
    return fallback
  }

  try {
    const value = uni.getStorageSync(key)
    return value === undefined || value === null ? fallback : value
  } catch (error) {
    console.warn(`[store] Unable to read storage key "${key}"`, error)
    return fallback
  }
}

export function createInitialState() {
  return {
    theme: getStorageSync('theme', 2) || 2,
    footTab: '',
    points_name: '积分',
    is_prohibition: 0,
    is_close_comment: 0,
    is_fake_prohibition: 0,
    is_check_open: 0,
    is_checkin_open: 0,
    coupon_data: {},
    grade_detail: {},
    welfare_data: {},
    store_mobile_permission: null
  }
}

export const store = createStore({
  state: createInitialState,
  mutations: {
    changeTheme(state, value) {
      state.theme = value
    },
    changefootTab(state, value) {
      state.footTab = value
    },
    changePoints(state, value) {
      state.points_name = value
    },
    changeProhibition(state, value) {
      state.is_prohibition = value
    },
    changeFakeProhibition(state, value) {
      state.is_fake_prohibition = value
    },
    changeCloseComment(state, value) {
      state.is_close_comment = value
    },
    changecheckOpen(state, value) {
      state.is_check_open = value
    },
    changechecinkOpen(state, value) {
      state.is_checkin_open = value
    },
    changeCouponOpen(state, value) {
      state.coupon_data = value
    },
    changeGradeDetail(state, value) {
      state.grade_detail = value
    },
    changeWelfareOpen(state, value) {
      state.welfare_data = value
    },
    roomChangeWelfareOpen(state, value) {
      const cachedWelfare = getStorageSync(`welfare_data_${value.room_id}`)

      if (!cachedWelfare || cachedWelfare.push_id !== value.push_id) {
        state.welfare_data = value
      }
    },
    changeStoreMobilePermission(state, value) {
      state.store_mobile_permission = value
    }
  },
  getters: {},
  actions: {}
})

export function installStore(app) {
  app.use(store)
  app.config.globalProperties.$store = store
  return store
}

export default store
