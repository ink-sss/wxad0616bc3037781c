# 管客云展示接口服务端开发交付文档

生成日期：2026-06-04

## 1. 接口范围

本交付文档覆盖小程序首页、分类、商品列表、商品详情展示所需的旧管客云接口。

完整 URL 规则：

```text
https://api.guankeyun.net/index.php/api/{endpoint}
```

接口清单：

| Method | Endpoint | 用途 |
| --- | --- | --- |
| GET | `index/index` | 首页 DIY 配置、分享信息、首页弹窗配置 |
| GET | `index/nav` | TabBar 配置、主题色 |
| GET | `product.category/index` | 分类页模板、分类树 |
| GET | `product.product/lists` | 商品列表、首页 DIY 商品流、分类商品流 |
| GET | `product.product/detail` | 商品详情、多规格 SKU 数据 |

## 2. 公共请求规则

请求封装：`src/utils/request.js`

`_get/_post` 会自动追加公共参数：

| 参数 | 类型 | 来源 | 说明 |
| --- | --- | --- | --- |
| `token` | string | `config.token` | 固定配置 token |
| `app_id` | number/string | `getAppId()` | 运行时 app id |
| `appid` | string | `config.appid` | 微信 appid |
| `source_client` | string | 固定 `wx` | 小程序来源标识 |

`index/nav` 存在一个直接 `uni.request` 调用，参数为：

```json
{
  "app_id": 393016,
  "appid": "wx3bf933f8a2018d8d"
}
```

建议统一响应 envelope：

```json
{
  "code": 1,
  "msg": "成功",
  "data": {}
}
```

错误码处理：

| `code` | 前端处理 |
| --- | --- |
| `1` 或其它成功码 | 进入业务 success 回调 |
| `0` | 展示 `msg`，执行失败回调 |
| `-1` | 判定鉴权状态失效，触发统一鉴权处理 |
| `-2` | `_get` 场景展示 `msg` 并清除 storage `token` |

## 3. `GET index/index`

调用页面：`src/pages/index/index.vue`

触发时机：

- 首页 `onLoad`
- 首页下拉刷新
- 首页 DIY 子组件触发重新加载

显式入参：

```json
{
  "url": ""
}
```

公共参数由请求封装自动追加。

前端消费字段：

```json
{
  "code": 1,
  "msg": "成功",
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
      "collection": {
        "status": "1"
      },
      "officia": {
        "status": "0"
      },
      "homepush": {
        "is_open": false,
        "name": ""
      }
    }
  }
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data.items` | 首页 DIY 模块列表，传给 `<diy>` 渲染 |
| `data.page.params.share_title` | 首页分享标题 |
| `data.page.params.share_img` | 首页分享图 |
| `data.page.params.name` | 首页导航标题 |
| `data.setting.collection.status` | 控制“添加到我的小程序”提示 |
| `data.setting.officia.status` | 控制公众号关注提示 |
| `data.setting.homepush.is_open` | 控制首页弹窗 |
| `data.setting.homepush.name` | 首页弹窗去重标识 |

## 4. `GET index/nav`

调用位置：

- `src/components/tabbar/footTabbar.vue`
- `src/utils/install.js`

显式入参：

普通 `_get` 调用无显式业务参数；直接 `uni.request` 调用传：

```json
{
  "app_id": 393016,
  "appid": "wx3bf933f8a2018d8d"
}
```

前端消费字段：

```json
{
  "code": 1,
  "msg": "成功",
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

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data.vars.data` | TabBar 配置对象，会写入 storage `TabBar` |
| `data.vars.data.is_auto` | TabBar 初始化标识 |
| `data.vars.data.backgroundColor` | TabBar 背景色 |
| `data.vars.data.textColor` | 未选中文字颜色 |
| `data.vars.data.textHoverColor` | 选中文字颜色 |
| `data.vars.data.type` | TabBar 样式类型 |
| `data.vars.data.list` | TabBar 项列表 |
| `data.vars.data.list[].text` | TabBar 文案 |
| `data.vars.data.list[].link_url` | TabBar 跳转地址 |
| `data.vars.data.list[].iconPath` | 默认图标 |
| `data.vars.data.list[].selectedIconPath` | 选中图标 |
| `data.vars.data.list[].is_show` | 是否显示 |
| `data.theme.theme` | 主题标识，会写入 storage `theme` |

## 5. `GET product.category/index`

调用页面：`src/pages/product/category.vue`

触发时机：

- 分类页 `onShow`

显式入参：无。

公共参数由请求封装自动追加。

前端消费字段：

```json
{
  "code": 1,
  "msg": "成功",
  "data": {
    "template": {
      "category_style": 10,
      "wind_style": 4
    },
    "list": [
      {
        "category_id": 1,
        "name": "分类名",
        "images": {
          "file_path": "https://..."
        },
        "child": [
          {
            "category_id": 2,
            "name": "子分类名",
            "images": {
              "file_path": "https://..."
            }
          }
        ]
      }
    ],
    "background": "#ffffff"
  }
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data.template.category_style` | 分类展示类型，前端映射为 `show_type` |
| `data.template.wind_style` | 分类页面风格，前端映射为 `style` |
| `data.list` | 一级分类列表 |
| `data.list[].category_id` | 分类 id |
| `data.list[].name` | 分类名称 |
| `data.list[].images.file_path` | 分类图片 |
| `data.list[].child` | 子分类列表 |
| `data.background` | 分类页背景配置 |

默认选中规则：

- 如果首个一级分类存在 `child` 且 `category_style === 20`，默认取首个子分类的 `category_id`。
- 否则默认取首个一级分类的 `category_id`。

## 6. `GET product.product/lists`

调用位置：

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

首页 DIY 商品流入参：

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

前端消费字段：

```json
{
  "code": 1,
  "msg": "成功",
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

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data.list.data` | 当前页商品列表 |
| `data.list.last_page` | 总页数，用于分页结束判断 |
| `product_id` | 商品 id |
| `product_name` | 商品名称 |
| `product_image` | 商品主图 |
| `product_price` | 商品展示价 |
| `product_min_price` | 商品最低价 |
| `product_stock` | 商品库存 |
| `spec_type` | 规格类型，`20` 表示多规格 |
| `isActivity` | 活动标识 |
| `is_virtual` | 是否虚拟商品 |
| `custom_form` | 自定义表单标识 |
| `product_sku.product_price` | SKU 价格 |
| `product_sku.line_price` | SKU 划线价 |
| `product_sku.stock_num` | SKU 库存 |
| `product_sku.product_attr` | SKU 属性文案 |

分页规则：

- 前端把 `data.list.data` 追加到当前列表。
- 当前页大于等于 `last_page` 后停止继续加载。

## 7. `GET product.product/detail`

调用位置：

- `src/pages/product/category.vue`
- `src/pages/product/detail/detail.vue`

分类页入参：

```json
{
  "product_id": 1,
  "url": "",
  "visitcode": ""
}
```

商品详情页入参：

```json
{
  "product_id": 1,
  "url": "",
  "visitcode": "",
  "referee_id": ""
}
```

前端消费字段：

```json
{
  "code": 1,
  "msg": "成功",
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
        {
          "file_path": "https://..."
        }
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
            {
              "item_id": "1",
              "spec_value": "红色"
            }
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

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data.detail` | 商品详情主体 |
| `detail.product_id` | 商品 id |
| `detail.product_name` | 商品名称 |
| `detail.product_price` | 商品价格 |
| `detail.product_max_price` | 多规格最高价 |
| `detail.line_price` | 划线价 |
| `detail.product_stock` | 商品库存 |
| `detail.spec_type` | 规格类型 |
| `detail.single_num` | 起售/限购数量展示 |
| `detail.limit_num` | 限购数量 |
| `detail.image[].file_path` | 商品图 |
| `detail.supplier` | 供应商信息 |
| `data.specData.spec_attr` | 规格维度列表 |
| `spec_attr[].group_name` | 规格组名称 |
| `spec_attr[].spec_items` | 规格值列表 |
| `spec_items[].item_id` | 规格值 id |
| `spec_items[].spec_value` | 规格值文案 |
| `data.specData.spec_list` | SKU 列表 |
| `spec_list[].spec_sku_id` | SKU id，前端按所选 `item_id` 用 `_` 拼接匹配 |
| `spec_list[].spec_form.product_price` | SKU 价格 |
| `spec_list[].spec_form.line_price` | SKU 划线价 |
| `spec_list[].spec_form.stock_num` | SKU 库存 |
| `spec_list[].spec_form.product_weight` | SKU 重量 |
| `spec_list[].spec_form.image_id` | SKU 图片 id |
| `spec_list[].spec_form.image_path` | SKU 图片地址 |
| `data.mp_service.service_type` | 小程序客服类型 |

SKU 匹配规则：

- 前端按规格选择顺序收集 `item_id`。
- 用 `_` 拼接成 `spec_sku_id`，例如 `1_2`。
- 在 `specData.spec_list` 中查找同名 `spec_sku_id`。
