"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "HomePush",
  props: {
    homepushData: {
      type: Object,
      default: () => ({})
    },
    homepush_data: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["close"],
  data() {
    return {
      visible: true
    };
  },
  computed: {
    source() {
      return this.homepushData && Object.keys(this.homepushData).length ? this.homepushData : this.homepush_data;
    },
    title() {
      return this.source.title || this.source.name || "活动提醒";
    },
    summary() {
      return this.source.summary || this.source.describe || this.source.content || "";
    },
    imageUrl() {
      return this.source.image || this.source.image_url || this.source.file_path || this.source.imageFile && this.source.imageFile.file_path || "";
    },
    linkUrl() {
      return this.source.link_url || this.source.linkUrl || this.source.url || "";
    }
  },
  methods: {
    close() {
      this.visible = false;
      if (this.source.name) {
        common_vendor.index.setStorageSync("homepush_name", this.source.name);
      }
      this.$emit("close");
    },
    openLink() {
      if (!this.linkUrl) {
        this.close();
        return;
      }
      if (typeof this.gotoPage === "function") {
        this.gotoPage(this.linkUrl);
      } else {
        common_vendor.index.navigateTo({ url: this.linkUrl.startsWith("/") ? this.linkUrl : "/" + this.linkUrl });
      }
      this.close();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible
  }, $data.visible ? common_vendor.e({
    b: $options.imageUrl
  }, $options.imageUrl ? {
    c: $options.imageUrl,
    d: common_vendor.o((...args) => $options.openLink && $options.openLink(...args), "52")
  } : {}, {
    e: common_vendor.t($options.title),
    f: $options.summary
  }, $options.summary ? {
    g: common_vendor.t($options.summary)
  } : {}, {
    h: common_vendor.o((...args) => $options.openLink && $options.openLink(...args), "6e"),
    i: common_vendor.o((...args) => $options.close && $options.close(...args), "b3"),
    j: common_vendor.o(() => {
    }, "12"),
    k: common_vendor.o((...args) => $options.close && $options.close(...args), "68")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aed1cfb9"]]);
wx.createComponent(Component);
