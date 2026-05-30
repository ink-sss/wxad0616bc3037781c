"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_live_pageTools = require("../page-tools.js");
const platform_weixin_navigation = require("../../../platform/weixin/navigation.js");
const _sfc_main = {
  props: {
    liveId: { type: [Number, String], default: "" },
    isOrder: { type: [Number, String], default: 1 }
  },
  emits: ["openMyOrder", "goShop"],
  data() {
    return {
      visible: false,
      list: [],
      page: 1,
      finished: false,
      loading: false
    };
  },
  methods: {
    showShowList() {
      this.visible = true;
      this.page = 1;
      this.list = [];
      this.finished = false;
      this.loadMore();
    },
    close() {
      this.visible = false;
    },
    loadMore() {
      if (this.loading || this.finished)
        return;
      this.loading = true;
      pages_live_pageTools.requestWithVm(this, "_get", "live.RoomNewProduct/lists", {
        live_id: this.liveId,
        list_rows: 10,
        page: this.page
      }).then((res) => {
        const rows = ((res.data || {}).list || {}).data || res.data || [];
        if (rows.length) {
          this.list = this.list.concat(rows);
          this.page += 1;
        } else {
          this.finished = true;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    goProduct(item) {
      if (item.product_id > 0) {
        this.$emit("goShop", item.product_id, item.spec_sku_id);
      } else if (item.link_type === 1 && item.link_url) {
        common_vendor.index.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(item.link_url)}` });
      } else if (item.link_url) {
        platform_weixin_navigation.navigateToMiniProgram({
          shortLink: item.link_url,
          appId: item.wechat_app_id,
          path: `${item.link_url || ""}${item.scene || ""}`
        });
      }
      this.close();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible
  }, $data.visible ? common_vendor.e({
    b: Number($props.isOrder) === 1
  }, Number($props.isOrder) === 1 ? {
    c: common_vendor.o(($event) => _ctx.$emit("openMyOrder"), "7e")
  } : {}, {
    d: common_vendor.f($data.list, (item, index, i0) => {
      return {
        a: item.product_image,
        b: common_vendor.t(item.product_name || item.name),
        c: common_vendor.t(item.selling_point),
        d: common_vendor.t(item.product_price || item.product_min_price || item.price || "0.00"),
        e: item.product_id || index,
        f: common_vendor.o(($event) => $options.goProduct(item), item.product_id || index)
      };
    }),
    e: common_vendor.t($data.finished ? "已经到底了" : "上拉加载更多"),
    f: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "1e"),
    g: common_vendor.o(() => {
    }, "4a"),
    h: common_vendor.o((...args) => $options.close && $options.close(...args), "7e")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8ae82cfc"]]);
wx.createComponent(Component);
