# 首页搜索框补充搜索图标

## Goal

让 uni-app 首页顶部搜索框显示旧小程序同款搜索 icon，恢复图 2 中搜索框左侧图标效果。

## What I already know

- 用户反馈当前首页搜索框没有搜索 icon。
- 旧小程序顶部 DIY 搜索源码 `components/diy/search/search.wxml` 使用 `<text class="icon iconfont icon-sousuo1 ..."></text>` 显示搜索图标；弹窗搜索 `components/searchProduct.wxml` 使用 `icon-sousuo`。
- 默认修改目标是 `uniapp-src/`，根目录旧小程序源码只作为对照。

## Requirements

- 首页顶部搜索框左侧显示搜索 icon。
- 复用旧小程序已有 iconfont class，不新增图片资源或无关组件。
- 不改变搜索框点击、路由、商品列表或其他页面行为。

## Acceptance Criteria

- [ ] `uniapp-src` 首页搜索框模板包含搜索 icon。
- [ ] 图标样式在搜索框内垂直居中，和旧小程序视觉接近。
- [ ] 最小验证通过，或说明无法运行完整构建的原因。

## Out of Scope

- 不修改根目录旧小程序源码。
- 不重构首页、DIY 搜索组件或商品列表。

## Technical Notes

- Relevant old Mini Program references: `components/diy/search/search.wxml`, `components/diy/topMerge/topMerge.wxml`, `app.wxss`.
- Relevant uni-app files to inspect: `uniapp-src/src/pages/index/index.vue`, `uniapp-src/src/components/diy/search/search.vue`, `uniapp-src/src/components/diy/topMerge/topMerge.vue`.
