# uniapp-src 主包 JS 瘦身

## 背景

当前 `uniapp-src/dist/build/mp-weixin` 构建产物主包 JS 体积偏大。既有分析显示主包 JS 约 `3.25MB`，其中 `common/vendor.js` 约 `1.08MB`，区域数据产物 `area.js` 约 `305KB`。主包还承载了大量非首屏、非直播页面。

## 目标

1. 保留直播相关页面和 tab 页面在主包。
2. 将其他当前主包页面迁移到 `pagesPlus/main/...` 分包，路径从 `/pages/<old>` 改为 `/pagesPlus/main/<old>`。
3. 更新项目内跳转、分享、回跳 URL 和页面常量，避免继续引用被迁移页面的旧路径。
4. 将 `src/utils/area.json` 的静态大 JSON 引用替换为更紧凑的数据加载器，避免继续生成 305KB 级别的原始 `area.js`。
5. 保持直播主包链路、tabBar、`entryPagePath` 不变。

## 主包保留范围

- `pages/index/index`
- `pages/product/category`
- `pages/shop/shop_list`
- `pages/cart/cart`
- `pages/user/index/index`
- `pages/broadcast/*`
- `pages/prize-record/*`
- `pages/invitation*`
- `pages/report/*`

## 迁移规则

非保留范围内的主包页面按以下规则迁移：

```text
/pages/<old> -> /pagesPlus/main/<old>
```

示例：

```text
/pages/login/login -> /pagesPlus/main/login/login
/pages/shop/shop -> /pagesPlus/main/shop/shop
```

## 非目标

- 不移动直播相关页面，避免影响直播直达。
- 不修改 tabBar 页面路径。
- 不删除 `@tencentcloud/chat`、`tim-upload-plugin` 等当前未被源码 import 的依赖；本轮只做验证结论，不把它们作为主包瘦身手段。
- 不手改 `uniapp-src/dist/` 构建产物。

## 验证

1. 运行 `cd uniapp-src && npm run build:mp-weixin`。
2. 统计 `common/vendor.js`、`area.js`、主包 JS 总量、主包总大小，并对比 `3.25MB JS / 4.47MB 主包` 基线。
3. 检查 `src/pages.json` 中所有路由都有 `.vue` 文件。
4. 检查同一路径没有同时出现在主包和分包。
5. 静态扫描被迁移页面的旧 `/pages/...` 路径不再出现在源码导航逻辑中，除非是明确保留的兼容注释。
6. 构建通过后，在微信开发者工具中手测分包加载和关键页面链路。
