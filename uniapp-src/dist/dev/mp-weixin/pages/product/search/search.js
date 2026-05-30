"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      form: {},
      arr: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      common_vendor.index.getStorage({
        key: "search_list",
        success: (res) => {
          if (res != null && res.data != null)
            this.arr = res.data;
        }
      });
    },
    search(keyword) {
      let searchText = keyword || null;
      if (searchText == null) {
        searchText = this.form.keyWord;
        const history = this.arr;
        if (searchText === void 0 || searchText == null || searchText === "") {
          common_vendor.index.showToast({ title: "请输入搜索的关键字", icon: "none", duration: 2e3 });
          return false;
        }
        history.push(searchText);
        common_vendor.index.setStorage({
          key: "search_list",
          data: history
        });
      }
      this.gotoPage("/pages/product/list/list?search=" + searchText + "&category_id=0&sortType=all");
    },
    clearStorage() {
      common_vendor.index.removeStorage({
        key: "search_list",
        success: () => {
          this.arr = [];
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.search(), "2e"),
    b: $data.form.keyWord,
    c: common_vendor.o(($event) => $data.form.keyWord = $event.detail.value, "52"),
    d: common_vendor.o(($event) => _ctx.gotoSearch && _ctx.gotoSearch(), "09"),
    e: common_vendor.o((...args) => $options.clearStorage && $options.clearStorage(...args), "23"),
    f: common_vendor.f($data.arr, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index,
        c: common_vendor.o(($event) => $options.search(item), index)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b270fa00"]]);
wx.createPage(MiniProgramPage);
