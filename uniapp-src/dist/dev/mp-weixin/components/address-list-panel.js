"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const _sfc_main = {
  __name: "address-list-panel",
  props: {
    list: {
      type: Array,
      default: () => []
    },
    selectedId: {
      type: [Number, null],
      default: null
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    buttonText: {
      type: String,
      default: "保存"
    },
    pageMode: {
      type: Boolean,
      default: false
    },
    showDefaultRow: {
      type: Boolean,
      default: true
    },
    buttonDisabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    }
  },
  emits: [
    "select",
    "save",
    "edit",
    "add",
    "delete",
    "import-wx"
  ],
  setup(__props, { emit: __emit }) {
    function onSave() {
      if (props.buttonDisabled) {
        return;
      }
      emit("save");
    }
    const props = __props;
    const emit = __emit;
    function onDelete(item) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除该收货地址吗？",
        success(res) {
          if (res.confirm) {
            emit("delete", item);
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !__props.pageMode && __props.title
      }, !__props.pageMode && __props.title ? {
        b: common_vendor.t(__props.title)
      } : {}, {
        c: __props.list.length === 0
      }, __props.list.length === 0 ? {
        d: common_assets._imports_0$8,
        e: common_vendor.o(($event) => emit("add"), "74"),
        f: common_vendor.o(($event) => emit("import-wx"), "ff")
      } : __props.list.length > 0 ? common_vendor.e({
        h: common_vendor.f(__props.list, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name),
            b: common_vendor.t(item.mobile),
            c: item.tag
          }, item.tag ? {
            d: common_vendor.t(item.tag)
          } : {}, {
            e: common_vendor.o(($event) => emit("edit", item), item.id),
            f: common_vendor.o(($event) => onDelete(item), item.id),
            g: common_vendor.t(item.fullAddress),
            h: item.id,
            i: common_vendor.n(__props.selectedId === item.id ? "address-item-selected" : ""),
            j: common_vendor.o(($event) => emit("select", item.id), item.id)
          });
        }),
        i: __props.showFooter
      }, __props.showFooter ? {
        j: common_vendor.t(__props.buttonText),
        k: common_vendor.n(__props.buttonDisabled ? "address-save-btn-disabled" : ""),
        l: common_vendor.o(onSave, "8a"),
        m: common_vendor.o(($event) => emit("import-wx"), "25"),
        n: common_vendor.n(__props.pageMode ? "address-footer-page" : "")
      } : {}) : {}, {
        g: __props.list.length > 0,
        o: common_vendor.n(__props.pageMode ? "address-panel-page" : "")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-decb1bb7"]]);
wx.createComponent(Component);
