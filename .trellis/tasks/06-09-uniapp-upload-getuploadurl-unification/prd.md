# 统一 uniapp 上传接口到 H5 投诉预签名上传

## Goal

将 `uniapp-src` 中所有业务上传链路统一改为先请求 `https://man.lqjy.cc/api/h5/complaint/getUploadUrl` 获取预签名上传地址，再把本地文件上传到返回的 `uploadUrl`，避免继续使用旧的 `https://api.guankeyun.net/index.php?s=/api/file.upload/image` 上传接口。

## What I already know

* 用户明确要求：`uniapp-src` 所有上传接口应该都走 `https://man.lqjy.cc/api/h5/complaint/getUploadUrl`。
* 当前运行配置中 `h5_api_url` 默认是 `https://man.lqjy.cc/api`，因此 API 层调用 `/h5/complaint/getUploadUrl` 会落到该完整地址。
* 当前老上传链路有三处：
  * `uniapp-src/src/utils/upload.js` 使用 `uni.uploadFile` 到 `${websiteUrl}/index.php?s=/api/file.upload/image`。
  * `uniapp-src/src/components/upload/upload.vue` 使用 `uni.uploadFile` 到 `${websiteUrl}/index.php?s=/api/file.upload/image`。
  * `uniapp-src/src/pagesPlus/main/user/set/set.vue` 头像上传使用 `uni.uploadFile` 到 `${websiteUrl}/index.php?s=/api/file.upload/image`。
* 当前已有预签名上传能力：
  * `uniapp-src/src/api/complaint.js` 的 `uploadComplaintImage()` 调 `/h5/complaint/getUploadUrl` 后调用 `putFileToPresignedUrl()`。
  * `uniapp-src/src/api/refund.js` 的 `uploadRefundImage()` 目前调 `/h5/refund/getUploadUrl` 后调用 `putFileToPresignedUrl()`。
  * `uniapp-src/src/platform/weixin/file.js` 中 `putFileToPresignedUrl()` 会优先用 `uni.request` PUT 原始文件内容，失败后回退 `uploadFile` multipart PUT。

## Assumptions (temporary)

* “所有上传接口”包括通用上传组件、头像上传、投诉图片上传、退款图片上传。
* 返回给调用方的文件对象需要兼容旧上传返回的 `file_path`，否则旧页面可能无法直接展示/保存。
* 视频上传如果仍经由通用上传组件触发，也应走同一 `complaint/getUploadUrl`，content type 和文件名按本地路径推断。

## Open Questions

* 已确认：退款上传也必须从 `/h5/refund/getUploadUrl` 改为 `/h5/complaint/getUploadUrl`。

## Requirements (evolving)

* 所有 `uniapp-src` 业务上传不再直接请求旧的 `/index.php?s=/api/file.upload/image`。
* 退款上传不再请求 `/h5/refund/getUploadUrl`，统一改为 `/h5/complaint/getUploadUrl`。
* 上传前统一通过 H5 API `/h5/complaint/getUploadUrl` 获取 `uploadUrl` 和 `fileUrl`。
* 上传实际文件时复用现有微信平台预签名上传封装。
* 保持现有页面/组件回调形状尽量兼容，尤其是 `file_path` 字段。

## Acceptance Criteria (evolving)

* [x] `rg "file.upload/image|uni\.uploadFile" uniapp-src/src` 不再出现业务直接上传旧接口；平台封装 fallback 可保留。
* [x] 通用上传组件、头像上传、投诉上传、退款上传均通过 `/h5/complaint/getUploadUrl` 统一预签名上传能力。
* [x] 上传返回值包含页面现有逻辑需要的 URL 字段。
* [x] 至少运行相关最小测试或 `npm run build:mp-weixin`；如无法运行说明原因。

## Definition of Done (team quality bar)

* Tests added/updated where appropriate.
* Lint / typecheck / build checks green, or明确说明无法运行原因。
* 白名单影响明确：request 需要 `https://man.lqjy.cc`，上传实际目标需要后端返回的对象存储域名。

## Out of Scope (explicit)

* 不修改根目录旧小程序源码。
* 不修改 `/Users/apple/Desktop/code/live_h5`。
* 不改后端接口契约。
* 不手改 `uniapp-src/dist/`。

## Technical Notes

* Relevant files inspected:
  * `uniapp-src/src/utils/upload.js`
  * `uniapp-src/src/components/upload/upload.vue`
  * `uniapp-src/src/pagesPlus/main/user/set/set.vue`
  * `uniapp-src/src/api/complaint.js`
  * `uniapp-src/src/api/refund.js`
  * `uniapp-src/src/platform/weixin/file.js`
* Existing dependency direction suggests a shared upload API/helper should live in `api/` or `services/`, while components/pages should call the helper instead of directly calling `uni.uploadFile`.


## Verification

* `cd uniapp-src && node --test tests/upload-api.test.mjs` passed.
* `cd uniapp-src && rg "file.upload/image|/h5/refund/getUploadUrl|uni\.uploadFile\(" src` returned no matches.
* `cd uniapp-src && npm run build:mp-weixin` passed.
* `npm test` was not available because `uniapp-src/package.json` has no `test` script.
