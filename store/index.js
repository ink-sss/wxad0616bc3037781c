var e = require("../common/vendor.js"),
  n = e.createStore({
    state: {
      theme: e.index.getStorageSync("theme") || 0,
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
    },
    mutations: {
      changeTheme: function(e, n) {
        e.theme = n
      },
      changefootTab: function(e, n) {
        e.footTab = n
      },
      changePoints: function(e, n) {
        e.points_name = n
      },
      changeProhibition: function(e, n) {
        e.is_prohibition = n
      },
      changeFakeProhibition: function(e, n) {
        e.is_fake_prohibition = n
      },
      changeCloseComment: function(e, n) {
        e.is_close_comment = n
      },
      changecheckOpen: function(e, n) {
        e.is_check_open = n
      },
      changechecinkOpen: function(e, n) {
        e.is_checkin_open = n
      },
      changeCouponOpen: function(e, n) {
        e.coupon_data = n
      },
      changeGradeDetail: function(e, n) {
        e.grade_detail = n
      },
      changeWelfareOpen: function(e, n) {
        e.welfare_data = n
      },
      roomChangeWelfareOpen: function(n, o) {
        var i = e.index.getStorageSync("welfare_data_" + o.room_id);
        i && i.push_id == o.push_id || (n.welfare_data = o)
      },
      changeStoreMobilePermission: function(e, n) {
        e.store_mobile_permission = n
      }
    },
    getters: {},
    actions: {}
  });
exports.store = n;