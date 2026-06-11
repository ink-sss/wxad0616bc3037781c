# Runtime Dependencies

The current project has no source package manifest. Dependencies inferred from compiled output:

* `vue@3.4.21`
* `@dcloudio/uni-app`
* `@dcloudio/uni-mp-weixin`
* `@dcloudio/vite-plugin-uni`
* `vite`
* `@vue/compiler-sfc`
* `vuex@4.1.0`
* `pinia@2.1.7` (newer 2.3.x releases require Vue 3.5.11+, while the compiled runtime pins Vue 3.4.21)
* `@tencentcloud/chat@3.5.7`
* `tim-upload-plugin@1.4.2`
* Tencent TRTC Mini Program SDK, likely `trtc-wx-sdk` or the compatible SDK matching existing usage

`common/vendor.js` must not be reused as source. It is a compiled aggregate bundle containing private runtime helpers such as `_export_sfc`, `index`, and `wx$1`.

`main.js` should use `createSSRApp(App)`, register global components, install Vuex and Pinia, and mount the existing global properties used throughout page code.

`App.vue` should preserve `globalData`, launch/hide lifecycle, update manager, startup scene parsing, nav initialization, IM initialization/retry, and group join/exit methods.
