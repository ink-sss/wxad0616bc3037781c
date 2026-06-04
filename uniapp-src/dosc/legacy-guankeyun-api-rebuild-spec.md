# 精简旧管客云接口复刻交付文档

生成日期：2026-06-04

## 1. 本轮交付口径

本轮只要求服务端复刻首页、分类、商品展示所需的旧管客云接口。购物车、优惠券领取、账号密码、短信验证码、主播端登录不做服务端复刻。

前端购物车已改为本机缓存草稿购物车，只支持加购、加减数量、删除、清空、刷新后持久化展示；不展示结算按钮，不进入 `cart_ids` 下单链路。

## 2. 服务端本轮需要复刻的固定接口

完整 URL 规则：

```text
https://api.guankeyun.net/index.php/api/{endpoint}
```

固定接口共 5 个：

| Method | Endpoint | 主要用途 |
| --- | --- | --- |
| GET | `index/index` | 首页 DIY 配置、首页分享、首页弹窗配置 |
| GET | `index/nav` | TabBar 配置、主题色 |
| GET | `product.category/index` | 分类页模板、分类树 |
| GET | `product.product/lists` | 首页 DIY 商品流、分类商品列表、商品列表页 |
| GET | `product.product/detail` | 商品详情、多规格加购弹窗需要的商品与 SKU 数据 |

本轮不复刻：

| Endpoint | 原用途 | 本轮处理 |
| --- | --- | --- |
| `order.cart/lists` | 服务端购物车列表 | 前端读 `local_cart_v1` |
| `order.cart/add` | 服务端加购/加数量 | 前端写 `local_cart_v1` |
| `order.cart/sub` | 服务端减数量 | 前端写 `local_cart_v1` |
| `order.cart/delete` | 服务端删除/清空购物车 | 前端写 `local_cart_v1` |
| `product.Category/lists` | 分类页快捷购物车汇总 | 前端读 `local_cart_v1` |
| `user.coupon/receive` | 优惠券领取 | 本轮不支持领取，不要求服务端实现 |
| `index/loginSetting` | 旧登录配置 | 本轮不要求服务端实现，登录走微信插件/H5 链路 |
| `user.useropen/phonelogin` | 账号密码登录 | 不做 |
| `user.useropen/smslogin` | 短信登录 | 不做 |
| `user.useropen/register` | 注册 | 不做 |
| `user.useropen/resetpassword` | 找回密码 | 不做 |
| `user.useropen/sendCode` | 发验证码 | 不做 |
| `user.user/getUserByTokenH5` | 旧 token 快捷登录 | 不做 |
| `user.user/anchorLogin` | 主播登录 | 无主播端功能，不做 |

## 3. 公共请求规则

封装文件：`src/utils/request.js`

`_get/_post` 会自动追加：

| 参数 | 来源 | 说明 |
| --- | --- | --- |
| `token` | `config.token` | 固定配置 token |
| `app_id` | `getAppId()` | 运行时 app id |
| `appid` | `config.appid` | 微信 appid |
| `source_client` | 固定 `wx` | `_get/_post` 自动追加 |

`index/nav` 还有一个直接 `uni.request` 调用来自 `src/utils/install.js`，只传：

```json
{
  "app_id": 393016,
  "appid": "wx3bf933f8a2018d8d"
}
```

服务端响应建议统一 envelope：

```json
{
  "code": 1,
  "msg": "成功",
  "data": {}
}
```

前端通用处理：

- `code === 1` 或非 `0/-1/-2`：进入业务 success 回调。
- `code === 0`：展示 `msg`，执行失败回调。
- `code === -1`：判定登录失效，跳登录。
- `_get` 遇到 `code === -2`：展示 `msg` 并清除 storage `token`。

## 4. 接口明细

### 4.1 `GET index/index`

调用点：`src/pages/index/index.vue`

触发：

- 首页 `onLoad`。
- 下拉刷新。
- 首页 DIY 子组件触发重新加载。

显式入参：

```json
{
  "url": ""
}
```

前端实际消费字段：

```json
{
  "data": {
    "items": [],
    "page": {
      "params": {
        "share_title": "首页分享标题",
        "share_img": "首页分享图",
        "name": "首页标题"
      }
    },
    "setting": {
      "collection": { "status": "1" },
      "officia": { "status": "0" },
      "homepush": {
        "is_open": false,
        "name": ""
      }
    }
  }
}
```

交互说明：

- `items` 传给 `<diy>` 渲染首页模块。
- `page.params.share_title/share_img` 用于分享。
- `page.params.name` 用于导航标题。
- `setting.collection.status === "1"` 时展示“添加到我的小程序”提示。
- `setting.officia.status` 控制公众号关注提示。
- `setting.homepush.is_open` 控制首页弹窗。

### 4.2 `GET index/nav`

调用点：

- `src/components/tabbar/footTabbar.vue`
- `src/utils/install.js`

显式入参：无；直接 `uni.request` 只传 `app_id/appid`。

前端实际消费字段：

```json
{
  "data": {
    "vars": {
      "data": {
        "is_auto": "1",
        "backgroundColor": "#FFFFFF",
        "textColor": "#000000",
        "textHoverColor": "#f03b2f",
        "type": "0",
        "list": [
          {
            "text": "首页",
            "link_url": "/pages/index/index",
            "iconPath": "/static/tabbar/home.png",
            "selectedIconPath": "/static/tabbar/home_red.png",
            "is_show": true
          }
        ]
      }
    },
    "theme": {
      "theme": "red"
    }
  }
}
```

交互说明：

- `vars.data` 写入 storage `TabBar` 并渲染底部导航。
- `theme.theme` 写入 storage `theme`，用于主题色。

### 4.3 `GET product.category/index`

调用点：`src/pages/product/category.vue`

触发：

- 分类页 `onShow`。
- 分类快捷购物车旧请求失败后的重载路径已移除，本轮不再由购物车服务触发。

显式入参：无。

前端实际消费字段：

```json
{
  "data": {
    "template": {
      "category_style": 10,
      "wind_style": 4
    },
    "list": [
      {
        "category_id": 1,
        "name": "分类名",
        "images": { "file_path": "https://..." },
        "child": []
      }
    ],
    "background": "#ffffff"
  }
}
```

交互说明：

- `template.category_style` 映射页面 `show_type`。
- `template.wind_style` 映射页面 `style`。
- `list` 用于分类树和子分类切换。
- 首个分类或首个子分类会作为默认 `category_id`，随后请求商品列表。

### 4.4 `GET product.product/lists`

调用点：

- `src/pages/product/category.vue`
- `src/pages/product/list/list.vue`
- `src/components/diy/diy.vue`

典型入参：

```json
{
  "page": 1,
  "category_id": 0,
  "search": "",
  "sortType": "",
  "sortPrice": "",
  "list_rows": 20
}
```

首页 DIY 商品流会传：

```json
{
  "page": 1,
  "category_id": 0,
  "search": "",
  "sortType": "all",
  "sortPrice": 0,
  "list_rows": 20
}
```

前端实际消费字段：

```json
{
  "data": {
    "list": {
      "data": [
        {
          "product_id": 1,
          "product_name": "商品名",
          "product_image": "https://...",
          "product_price": "10.00",
          "product_min_price": "10.00",
          "product_stock": 100,
          "spec_type": 10,
          "isActivity": 0,
          "is_virtual": 0,
          "custom_form": "",
          "product_sku": {
            "product_price": "10.00",
            "line_price": "20.00",
            "stock_num": 100,
            "product_attr": ""
          }
        }
      ],
      "last_page": 1
    }
  }
}
```

交互说明：

- `list.data` 追加到当前商品列表。
- `last_page` 控制分页结束。
- 分类页快捷加购使用 `product_id/product_name/product_image/product_min_price/product_price/product_stock/spec_type/isActivity/is_virtual/custom_form`。
- `spec_type === 20` 时不直接本地加购，而是请求 `product.product/detail` 打开规格弹窗。

### 4.5 `GET product.product/detail`

调用点：

- `src/pages/product/category.vue`：分类页多规格加购弹窗。
- `src/pages/product/detail/detail.vue`：商品详情页。

分类页显式入参：

```json
{
  "product_id": 1,
  "url": "",
  "visitcode": ""
}
```

商品详情页额外可能传：

```json
{
  "referee_id": ""
}
```

前端实际消费字段：

```json
{
  "data": {
    "detail": {
      "product_id": 1,
      "product_name": "商品名",
      "product_price": "10.00",
      "product_max_price": "20.00",
      "line_price": "30.00",
      "product_stock": 100,
      "spec_type": 20,
      "single_num": 1,
      "limit_num": 0,
      "image": [
        { "file_path": "https://..." }
      ],
      "supplier": {
        "shop_supplier_id": 0,
        "name": "供应商"
      }
    },
    "specData": {
      "spec_attr": [
        {
          "group_name": "颜色",
          "spec_items": [
            { "item_id": "1", "spec_value": "红色" }
          ]
        }
      ],
      "spec_list": [
        {
          "spec_sku_id": "1_2",
          "spec_form": {
            "product_price": "10.00",
            "line_price": "20.00",
            "stock_num": 100,
            "product_weight": 0,
            "image_id": 0,
            "image_path": ""
          }
        }
      ]
    },
    "mp_service": {
      "service_type": 10
    }
  }
}
```

交互说明：

- 分类页多规格加购只要求 `detail` 与 `specData`。
- 弹窗选择完规格后，前端把 `detail/show_sku/selectSpec` 写入本地购物车。
- 商品详情页还会消费促销、预售、秒杀、评价、详情内容等字段；这些属于商品详情展示范围，服务端如需完整跑通详情页，应按现有详情页消费字段补齐。

## 5. 前端本地购物车实现说明

本地购物车缓存 key：

```text
local_cart_v1
```

勾选状态缓存 key 沿用旧值：

```text
CheckedData
```

本地购物车 item 结构：

```json
{
  "local_cart_id": "product_id:spec_sku_id",
  "cart_id": "product_id:spec_sku_id",
  "product_id": 1,
  "spec_sku_id": "1_2",
  "product_name": "商品名",
  "product_image": "https://...",
  "product_price": "10.00",
  "line_price": "20.00",
  "total_num": 1,
  "stock_num": 100,
  "product_attr": "\"红色\" \"XL\"",
  "selected": true,
  "updated_at": 1717500000000,
  "product_sku": {
    "product_attr": "\"红色\" \"XL\"",
    "stock_num": 100,
    "product_price": "10.00",
    "line_price": "20.00",
    "spec_sku_id": "1_2"
  }
}
```

行为规则：

- `local_cart_id = ${product_id}:${spec_sku_id || 0}`。
- 同一商品同一 SKU 重复加购时累加数量。
- 如果有 `stock_num`，累加数量不超过库存。
- 购物车页、分类快捷购物车浮层共享同一份缓存。
- 购物车页不展示结算按钮。
- 分类快捷购物车底栏不展示结算按钮。
- 不产生 `order_type=cart&cart_ids=...` 跳转。

本地购物车不支持：

- 跨设备同步。
- 登录后合并。
- 服务端库存锁定。
- 服务端价格锁定。
- 优惠券核销、订单创建、支付。

## 6. 验收检查

服务端验收：

- 打开首页只需要 `index/index`、`index/nav`。
- 打开分类页只需要 `product.category/index`、`product.product/lists`。
- 分类页多规格商品打开弹窗只需要 `product.product/detail`。
- 不需要实现 `order.cart/*`、`product.Category/lists`、`user.coupon/receive`、旧登录和主播端接口。

前端验收：

- 分类页单规格商品点击快捷加购后，本地购物车数量和金额更新。
- 多规格商品选择规格后加入购物车，本地购物车显示规格、价格、数量。
- 购物车页刷新后仍展示本地缓存商品。
- 购物车页可以勾选、全选、加数量、减数量、删除。
- 购物车页和分类快捷购物车都没有结算按钮。
- 购物车操作期间不发起 `order.cart/*` 或 `product.Category/lists` 网络请求。
