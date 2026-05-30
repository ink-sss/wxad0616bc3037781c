# W2 State/dependencies Notes

`uniapp-src/package.json` should declare the state and live dependencies recovered from the compiled mp-weixin output:

## Runtime dependencies

* `vuex@4.1.0` for `src/store/index.js` and legacy `$store.commit(...)` compatibility.
* `pinia@2.1.7` for `src/store/chat.js` and `useChatStore()`; newer 2.3.x releases require Vue 3.5.11+, while this migration keeps Vue 3.4.21 to match the compiled runtime.
* `@tencentcloud/chat@3.5.7` for the IM runtime used by `App.vue`/live pages.
* `tim-upload-plugin@1.4.2` for Tencent Cloud Chat image/file upload support.
* A Tencent TRTC Mini Program SDK compatible with the compiled `TRTC-WX` usage. The compiled bundle embeds TRTC code, but source should use a package dependency instead of the compiled vendor bundle.

## Integration notes

* `main.js` should install the Vuex store with `app.use(store)` and set `app.config.globalProperties.$store = store` so recovered Options API pages can keep calling `this.$store.commit(...)`.
* `main.js` should create and install a single Pinia instance before live pages/components call `useChatStore()`.
* Do not import the compiled root vendor bundle from `uniapp-src`; dependencies above must come from npm packages.
