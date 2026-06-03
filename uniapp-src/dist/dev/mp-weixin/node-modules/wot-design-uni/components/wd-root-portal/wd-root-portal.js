"use strict";
const common_vendor = require("../../../../common/vendor.js");
const __default__ = {
  name: "wd-root-portal",
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  setup(__props) {
    const None = Symbol("None");
    const hooksProvider = common_vendor.inject(common_vendor.USE_CONFIG_PROVIDER_KEY, None);
    const { parent: configProvider } = common_vendor.useParent(common_vendor.CONFIG_PROVIDER_KEY);
    const configProviderStyle = common_vendor.computed(() => {
      return hooksProvider !== None ? hooksProvider.themeStyle.value || "" : (configProvider == null ? void 0 : configProvider.themeStyle.value) || "";
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.s(configProviderStyle.value)
      };
    };
  }
});
wx.createComponent(_sfc_main);
