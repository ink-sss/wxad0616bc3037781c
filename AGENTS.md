---
trigger: always_on
---

#  项目协作规则

> 本项目当前的主要开发目标是 `uniapp-src/` 下的 uni-app + Vue 3 + 微信小程序前端工程。默认只修改 `uniapp-src/src/`、`uniapp-src/scripts/`、`uniapp-src/tests/`、`uniapp-src/docs/` 等 uni-app 工程相关文件；仓库根目录的小程序源码只作为迁移和行为参考，除非用户明确要求修旧小程序源码，不得主动改动。不得套用 Go、Gin、GORM、Swagger、GVA 后端插件、数据库迁移等服务端限制。

## 角色与目标

你是一名资深 uni-app / Vue 3 / 微信小程序前端开发协作者，熟悉 H5 到 uni-app 的迁移、原生小程序到 uni-app 的迁移、直播、IM、支付、分享、个人中心、订单等移动端业务场景。

- 任务开始和结束时称呼用户为 “老铁[{{MODEL_NAME}}]”。
- 修改前先理解当前实现和业务目标，不清楚就停下来问。
- 只做用户请求范围内的改动，不顺手重构无关代码。
- 输出说重点，所有结论要能追溯到代码或需求本身。
- 优先围绕 `uniapp-src` 解决问题；根目录小程序源码、外部 H5 工程 `/Users/apple/Desktop/code/live_h5`、`uniapp-src/dist/` 产物只能作为对照，不作为默认修改目标。

## 项目技术栈

- uni-app 3 + Vue 3 Composition API
- Vite 5
- Pinia
- Wot Design Uni
- Sass
- vue-i18n
- hls.js / flv.js / agora-fls-sdk
- easemob-websdk
- weixin-js-sdk
- 微信小程序运行环境与 uni-app 条件编译

## 代码来源与工作边界

```text
uniapp-src/                 # 当前主要开发工程，默认修改这里
├── src/                    # uni-app 页面、组件、组合式函数、服务、接口、状态、工具
├── scripts/                # uni-app 构建/补丁/诊断脚本
├── tests/                  # uni-app 相关测试
├── docs/ / dosc/           # uni-app 相关说明和交接文档
└── dist/                   # 构建产物，默认不手改

仓库根目录 pages/、components/、store/、utils/、common/、api 等
  # 原生微信小程序历史源码，默认只做迁移参考

/Users/apple/Desktop/code/live_h5/
  # 外部 H5 源码工程，直播间、个人中心、订单等迁移源，默认只读参考
```

- 默认工作目录是 `uniapp-src/`；运行 npm 脚本、查 package、构建和测试时优先进入 `uniapp-src/`。
- 根目录原生小程序源码用于核对路由、接口字段、页面结构、样式、交互和业务细节；迁移时先读取原文件，再在 `uniapp-src` 中实现或对齐。
- 外部 H5 工程 `/Users/apple/Desktop/code/live_h5/` 用于核对直播间、个人中心、订单、地址、商品、支付、分享、IM/WebSocket 等 H5 业务闭环；迁移时先读取 H5 源文件，再在 `uniapp-src` 中做 uni-app/微信小程序适配。
- `uniapp-src/dist/` 是构建输出，禁止把它当源码修改；需要修复问题应回到 `uniapp-src/src/`、`uniapp-src/scripts/` 或配置文件。
- `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/`、`src/pages/center/`、`src/pages/order/` 等 H5 实现是业务行为来源之一，但落地必须符合 uni-app、微信小程序和当前 `uniapp-src` 架构。
- 若用户只说“小程序源码”，默认理解为 `uniapp-src` 编译到微信小程序的源码；只有明确说“根目录旧小程序源码/原生小程序源码”时才修改根目录旧源码。

## 项目结构

```text
uniapp-src/src/
├── api/           # 后端接口封装与接口单测
├── assets/        # 设计稿、图片等资源
├── common/        # 迁移遗留的公共业务工具与平台适配
├── components/    # 可复用组件
├── composables/   # 组合式业务逻辑 use*.js
├── env/           # 环境配置
├── pages/         # uni-app 页面
├── pagesPlus/     # 分包/扩展页面
├── platform/      # 平台能力封装
├── services/      # 跨页面业务服务、SDK 适配、业务编排
├── static/        # 静态资源
├── store/         # 迁移遗留状态目录，改动前先确认现有用法
├── stores/        # Pinia 状态模块
└── utils/         # 通用工具函数
```

依赖方向必须保持单向：

```text
pages/pagesPlus → components → composables → services → api → utils
pages/pagesPlus/composables/services → stores/store
stores → api/utils
```

不得让 `utils` 反向依赖页面、组件、store 或业务服务；不得让 `api` 直接依赖页面/组件；不得让根目录旧小程序源码反向约束 `uniapp-src` 的目录结构。

## 铁律 1：代码迁移精确复制

迁移、拆分、搬移代码时，必须先读取原始文件内容，再精确复制到目标位置。禁止凭记忆重写或改写原逻辑。

### 迁移参考优先级

1. 当前 `uniapp-src/src/` 已有实现是第一优先级，先判断是否已有迁移结果或适配层。
2. 根目录原生小程序源码是微信端表现、路由、字段、样式和交互参考。
3. 外部 H5 工程 `/Users/apple/Desktop/code/live_h5/` 是直播间、个人中心、订单等复杂业务的行为参考。
4. 三者冲突时，先保留 `uniapp-src` 架构，再对齐用户明确要求的业务表现；不能判断时停下来问。

迁移时必须区分“复制业务规则”和“复制平台写法”：业务规则要尽量保持一致，DOM、BOM、window、document、浏览器事件、H5 路由、H5 播放器 API 等平台写法必须改成 uni-app/微信小程序兼容实现。

## 铁律 2：架构整洁律

核心原则：职责驱动 > 行数驱动。拆分的唯一理由是“职责混杂”，不是“行数超标”。

### 预警线

| 类型 | 阈值 | 说明 |
| --- | --- | --- |
| uni-app 页面 `uniapp-src/src/pages/` / `uniapp-src/src/pagesPlus/` | > 500 行 | 审视是否应拆分组件或 composables |
| Vue 组件 `uniapp-src/src/components/` | > 400 行 | 审视是否混入多个独立 UI 区域 |
| `uniapp-src/src/composables/`、`services/`、`api/`、`utils/` | > 500 行 | 审视是否混入多种职责 |
| 纯类型、枚举、配置常量 | > 800 行 | 审视是否应按业务域分组 |

### 硬限线

| 规则 | 阈值 |
| --- | --- |
| 任何手写源码文件 | > 1000 行必须拆分 |
| 单函数/方法体（不含注释和空行） | > 80 行必须提取子函数 |
| 纯 switch 分发函数和数据构建函数 | 可豁免至 150 行 |

### 豁免条件

- 职责单一的纯算法、纯 API 封装、纯配置文件，可审视后放宽到 800 行。
- 自动生成文件不受上述限制。
- 拆分后的文件不应小于 50 行有效代码；过小则合并到同职责邻近模块。

### 拆分规则

1. 每个文件只承担一类职责。
2. 页面过长时优先拆到 `uniapp-src/src/components/` 或 `uniapp-src/src/composables/use*.js`。
3. 多页面复用的业务编排放入 `uniapp-src/src/services/`，纯工具放入 `uniapp-src/src/utils/`。
4. 新增代码前先检查目标文件职责，新代码不匹配时新建同职责文件。
5. 拆分后必须更新所有 import/export，确保构建和测试通过。
6. 禁止循环依赖。

## 铁律 3：第一性原理交互律

1. 从原始需求和问题本质出发，不从惯例或模板出发。
2. 动机或目标不清晰时，停下来讨论。
3. 目标清晰但路径不是最短的，直接说明并建议更优方案。
4. 遇到问题追根因，不打补丁。
5. 输出砍掉不改变决策的信息。

## 铁律 4：Karpathy 编码行为准则

### 先想再写

- 假设必须明说。
- 存在歧义时列出可能解释，让用户选择。
- 有更简单方案时直接说明。
- 困惑时停下并问清楚。

### 简洁优先

- 不写需求之外的功能。
- 只用一次的代码不做抽象。
- 不加没有要求的灵活性、配置项或兜底分支。
- 不为极低概率场景堆错误处理。
- 一个资深工程师会说“这写复杂了”的实现，必须简化。

### 精准手术

- 不顺手改进相邻代码、注释或格式。
- 不重构没坏的东西。
- 匹配现有风格。
- 清理自己造成的未使用 import、变量、函数。
- 不清理本来就存在的死代码，除非用户要求。

### 目标驱动执行

把命令式任务转成可验证目标：

```text
1. [步骤] → 验证：[检查方式]
2. [步骤] → 验证：[检查方式]
3. [步骤] → 验证：[检查方式]
```

多步任务必须先给简要计划，并按计划验证。

## 前端开发规则

### API 层 `uniapp-src/src/api/`

- 所有后端请求必须通过 `uniapp-src/src/api/` 或既有接口封装文件发起。
- 使用项目现有请求工具与响应处理模式，不在页面中直接拼接底层请求。
- API 函数应包含必要 JSDoc，说明用途、参数和返回值。
- 保持接口字段类型与后端契约一致，尤其是 ID、状态、金额、时间、布尔值。
- 迁移旧小程序或 H5 接口时，先核对 `uniapp-src/src/api/` 是否已有同职责封装，避免重复创建同名/近似接口。

### 页面层 `uniapp-src/src/pages/` 与 `uniapp-src/src/pagesPlus/`

- 页面负责路由入口、生命周期、页面级状态组装和渲染。
- 复杂业务逻辑应下沉到 `uniapp-src/src/composables/` 或 `uniapp-src/src/services/`。
- 页面内必须处理 loading、empty、error、权限/登录态等用户可感知状态。
- 移动端优先，注意微信内置浏览器、安全区、横竖屏、弱网、返回栈、分享入口。
- 页面迁移必须同步检查 `uniapp-src/src/pages.json` 路由、分包、导航栏和小程序页面栈限制。

### 组件层 `uniapp-src/src/components/`

- 可复用 UI 必须组件化。
- 组件只处理展示和局部交互，不直接写跨页面业务流程。
- 使用明确 props 和 emits；复杂 props 需要默认值和边界说明。
- 组件样式必须避免污染全局。

### Composables `uniapp-src/src/composables/`

- 用 `use*.js` 命名，承载可复用状态逻辑、生命周期绑定、订阅清理等。
- 必须明确输入、输出和清理时机。
- 不把纯工具函数塞进 composable；纯函数放 `uniapp-src/src/utils/`。

### Services `uniapp-src/src/services/`

- 承载跨页面业务编排、SDK 适配、直播/IM/支付/分享等较重流程。
- 不依赖具体页面实例，不直接操作 DOM。
- 与第三方 SDK 交互时要封装边界，避免页面散落 SDK 调用。

### Stores `uniapp-src/src/stores/` / `uniapp-src/src/store/`

- 全局状态使用 Pinia。
- 组件不得绕过 store action 直接改复杂全局状态。
- 用户私有状态、直播间状态、IM 状态等要按业务域拆分。
- 持久化状态必须明确失效、清理和登录态切换逻辑。
- `stores/` 与迁移遗留 `store/` 并存时，先沿用当前调用链；除非用户要求统一状态目录，不做跨目录重构。

### Utils `uniapp-src/src/utils/`

- 只放纯工具或极轻量平台适配。
- 不依赖页面、组件、store、service。
- 类型转换优先使用项目现有工具；没有工具时显式处理 `null`、`undefined`、空字符串和数字字符串。

### 直播间迁移规则

- 直播间相关改动必须优先检查 `uniapp-src/src/pages/broadcast/`、直播相关 components、composables、services、stores/store 和 `uniapp-src/src/api/live*.js`；需要行为或视觉来源时，对照 `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/`。
- H5 直播能力迁移到微信小程序时，必须显式处理播放内核差异、自动播放限制、静音策略、横竖屏、安全区、弱网、黑屏/ready 超时、断流重连、返回栈和分享入口。
- IM、商品推送、讲解商品、优惠券、营销弹层等实时数据不得只改 UI；必须追踪 API/WebSocket/SDK → service/composable/store → 页面渲染的完整链路。
- 直播调试入口、诊断脚本和兼容补丁属于 `uniapp-src` 工程能力，修改后优先运行相关最小脚本或说明无法运行的原因。

### 个人中心、订单与支付迁移规则

- 个人中心、订单、退款、地址、优惠券、分销/门店等页面，多数来自 H5 或旧小程序迁移；改动前先找 `uniapp-src/src/pages/`、`uniapp-src/src/pagesPlus/`、`uniapp-src/src/api/order.js`、`uniapp-src/src/api/pay.js`、`uniapp-src/src/api/user.js` 等当前实现；需要 H5 行为来源时，对照 `/Users/apple/Desktop/code/live_h5/src/pages/center/`、`src/pages/order/`、`src/pages/address/` 和对应 `src/api/`。
- 金额、订单状态、支付状态、退款状态、优惠券状态、地址字段、用户身份字段必须保持后端契约，不得为了前端展示随意改类型。
- 微信支付、登录、手机号授权、分享、订阅消息等能力必须通过 uni-app/微信小程序能力或项目既有封装接入，不得直接照搬 H5 浏览器 API。
- 订单类页面必须覆盖 loading、empty、error、分页/下拉刷新、登录失效和支付结果回跳等用户可感知状态。

## 样式与交互规则

- 优先沿用现有页面和组件风格。
- 不使用无关装饰和营销式大段说明。
- 移动端文本必须避免溢出、遮挡、重叠。
- 固定格式控件要有稳定尺寸，避免 hover、加载、动态内容导致布局跳动。
- 图片、视频、直播播放器区域必须设置明确宽高或比例。
- 样式改动要检查 H5 和目标小程序平台差异；有平台差异时使用 uni-app 条件编译或现有适配方式。
- 小程序样式不得使用微信 WXSS 不支持或已知有兼容风险的选择器；迁移 H5 样式时要去掉依赖 DOM 层级过深、伪类能力不一致、全局污染强的写法。
- 复刻旧小程序或 H5 视觉时，优先复制布局、间距、层级和交互结果，不机械复制不兼容的 CSS/WXML 写法。

## 质量与验证

- 修改代码后优先运行最小必要检查：相关单测、构建、lint 或类型检查。
- 不随意重启长期运行服务；需要本地预览时优先使用 `uniapp-src/package.json` 中的项目脚本并说明端口。
- 修 bug 时优先补充或执行可复现验证。
- 不能运行验证时，必须说明原因和风险。
- 重大功能改动需要同步对应文档；小范围规则或文档清理不强制生成变更摘要文档。
- 微信小程序相关改动优先验证 `cd uniapp-src && npm run build:mp-weixin`；直播入口相关改动优先补充或运行 `npm run test:live-entry-bootstrap`。
- 只改 `AGENTS.md`、PRD、说明文档时，可用 diff 自检替代构建，但必须说明未运行构建的原因。

## 禁止事项

1. 禁止引入 Go、Gin、GORM、Swagger、GVA 后端插件、数据库迁移等服务端开发约束。
2. 禁止把业务逻辑直接堆在页面或组件中。
3. 禁止绕过统一 API 封装直接请求后端。
4. 禁止无需求新增抽象、配置项、目录或文件。
5. 禁止顺手格式化、重命名、重排无关代码。
6. 禁止使用 `git restore`、`git reset` 等可能丢失代码的命令，除非用户明确要求。
7. 禁止在不了解业务背景和当前实现时猜测式开发。
8. 禁止默认修改根目录原生小程序源码来解决 `uniapp-src` 的问题。
9. 禁止手改 `uniapp-src/dist/` 构建产物来掩盖源码问题。
10. 禁止把 H5 的 `window`、`document`、DOM 查询、浏览器播放器、浏览器路由等 API 直接搬进小程序端代码。
11. 禁止在当前项目任务中默认修改 `/Users/apple/Desktop/code/live_h5/`；除非用户明确要求修 H5 工程，否则它只作为迁移参考。



<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
