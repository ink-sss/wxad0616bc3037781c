import { getRuntimeConfig } from '../utils/runtime-config.js'

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toMoney(value) {
  return toNumber(value, 0).toFixed(2)
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

export function getProductIdentity(item = {}) {
  const value = firstValue(item.product_id, item.productId, item.goodsId, item.goods_id, item.id)
  return value === undefined || value === null || value === '' ? '' : String(value)
}

export function dedupeProductList(items = []) {
  if (!Array.isArray(items)) return []
  const seen = new Set()
  const result = []

  items.forEach((item) => {
    if (!item || typeof item !== 'object') return
    const key = getProductIdentity(item)
    if (key) {
      if (seen.has(key)) return
      seen.add(key)
    }
    result.push(item)
  })

  return result
}

export function mergeProductLists(current = [], incoming = []) {
  const result = Array.isArray(current) ? current.slice() : []
  const seen = new Set(result.map(getProductIdentity).filter(Boolean))

  ;(Array.isArray(incoming) ? incoming : []).forEach((item) => {
    if (!item || typeof item !== 'object') return
    const key = getProductIdentity(item)
    if (key) {
      if (seen.has(key)) return
      seen.add(key)
    }
    result.push(item)
  })

  return result
}

function normalizeBaseUrl(baseUrl = '') {
  return baseUrl.replace(/\/$/, '')
}

function imageList(product = {}) {
  const images = []
  if (product.coverImage) images.push(product.coverImage)
  if (Array.isArray(product.images)) images.push(...product.images)
  return [...new Set(images.filter(Boolean))]
}

function detailImages(product = {}) {
  if (Array.isArray(product.detailImages) && product.detailImages.length > 0) {
    return product.detailImages.map((filePath) => ({ file_path: filePath })).filter((item) => item.file_path)
  }
  if (product.detail) return []
  return imageList(product).map((filePath) => ({ file_path: filePath }))
}

function buildSkuId(sku = {}) {
  if (sku.specValueIds) return `${sku.specValueIds}`.split(',').filter(Boolean).join('_')
  return sku.id ? `${sku.id}` : '0'
}

function requestDisplayApi(path, data = {}) {
  const config = getRuntimeConfig()
  const baseUrl = normalizeBaseUrl(config.h5_api_url || config.h5_url || config.app_url)
  const requestData = {
    ...data,
    appId: config.appid
  }
  if (config.tenant_id) requestData.tenantId = config.tenant_id

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${path}`,
      data: requestData,
      dataType: 'json',
      method: 'GET',
      success(response) {
        const body = response.data || {}
        if (response.statusCode !== 200 || body.code !== 0) {
          reject(new Error(body.msg || '接口请求失败'))
          return
        }
        resolve(body.data)
      },
      fail(error) {
        reject(error)
      }
    })
  })
}

export function normalizeCategory(item = {}) {
  const rawChildren = Array.isArray(item.children) ? item.children : item.child
  const children = Array.isArray(rawChildren) ? rawChildren.map(normalizeCategory) : []
  return {
    ...item,
    category_id: firstValue(item.category_id, item.categoryId, item.id, 0),
    name: firstValue(item.name, item.category_name, item.categoryName, item.title, item.label, '未命名分类'),
    images: {
      file_path: firstValue(item.images?.file_path, item.image, item.icon, '')
    },
    child: children
  }
}

export function normalizeProduct(item = {}) {
  const productId = firstValue(item.product_id, item.productId, item.goodsId, item.goods_id, item.id, '')
  const productPrice = firstValue(item.product_price, item.salePrice, item.priceMin, item.price, 0)
  const linePrice = firstValue(item.line_price, item.linePrice, 0)
  const productStock = toNumber(firstValue(item.product_stock, item.stock, 0), 0)
  const productSku = {
    product_price: toMoney(productPrice),
    line_price: toMoney(linePrice),
    stock_num: productStock,
    product_attr: '',
    spec_sku_id: 0
  }

  return {
    ...item,
    product_id: productId,
    product_name: firstValue(item.product_name, item.name, ''),
    product_image: firstValue(item.product_image, item.coverImage, ''),
    product_price: toMoney(productPrice),
    product_min_price: toMoney(firstValue(item.product_min_price, item.priceMin, productPrice)),
    line_price: toMoney(linePrice),
    product_stock: productStock,
    product_sales: toNumber(firstValue(item.product_sales, item.sales, item.virtualSales, 0), 0),
    spec_type: toNumber(firstValue(item.spec_type, item.isMultiSpec ? 20 : 10), 10),
    isActivity: 0,
    is_virtual: toNumber(item.productType, 1) === 2 ? 1 : 0,
    custom_form: '',
    product_sku: item.product_sku || productSku
  }
}

export function normalizeProductList(data = {}, pageSize = 20) {
  const list = Array.isArray(data.list) ? data.list.map(normalizeProduct) : []
  const total = toNumber(data.total, list.length)
  const size = Math.max(1, toNumber(data.pageSize, pageSize))
  return {
    data: list,
    last_page: Math.max(1, Math.ceil(total / size))
  }
}

export function normalizeSpecData(product = {}) {
  const specAttr = Array.isArray(product.specs)
    ? product.specs.map((spec) => ({
      group_name: firstValue(spec.name, ''),
      spec_items: Array.isArray(spec.values)
        ? spec.values.map((value) => ({
          item_id: `${firstValue(value.id, value.value, '')}`,
          spec_value: firstValue(value.value, ''),
          checked: false
        }))
        : []
    })).filter((spec) => spec.group_name && spec.spec_items.length > 0)
    : []

  const specList = Array.isArray(product.skus)
    ? product.skus.map((sku) => ({
      spec_sku_id: buildSkuId(sku),
      server_sku_id: sku.id || '',
      spec_text: sku.specText || '',
      spec_form: {
        product_price: toMoney(firstValue(sku.salePrice, product.salePrice, product.priceMin, 0)),
        line_price: toMoney(firstValue(sku.linePrice, product.linePrice, 0)),
        stock_num: toNumber(firstValue(sku.stock, 0), 0),
        product_weight: toNumber(firstValue(sku.weight, 0), 0),
        image_id: sku.image ? 1 : 0,
        image_path: firstValue(sku.image, product.coverImage, '')
      }
    }))
    : []

  if (specAttr.length === 0 || specList.length === 0) return null
  return {
    spec_attr: specAttr,
    spec_list: specList
  }
}

export function normalizeProductDetail(product = {}) {
  const normalized = normalizeProduct(product)
  const images = imageList(product).map((filePath) => ({ file_path: filePath }))
  const contentImage = detailImages(product)
  const detailImageHtml = contentImage.map((item) => `<img src="${item.file_path}" />`).join('')
  const detailContent = product.detail ? `${product.detail}${detailImageHtml}` : ''
  const specData = normalizeSpecData(product)

  const detail = {
    ...normalized,
    product_max_price: toMoney(firstValue(product.product_max_price, product.priceMax, product.priceMin, normalized.product_price)),
    product_stock: toNumber(firstValue(product.product_stock, product.stock, normalized.product_stock), 0),
    product_sku: normalized.product_sku,
    image: images.length > 0 ? images : [{ file_path: normalized.product_image }],
    supplier: { shop_supplier_id: 0, name: '' },
    server: '',
    commentData: [],
    comment_data_count: 0,
    content: detailContent,
    contentImage,
    is_picture: contentImage.length > 0 && !detailContent ? 1 : 0,
    single_num: 1,
    limit_num: toNumber(firstValue(product.limitBuy, 0), 0),
    is_preview: 0,
    is_virtual: normalized.is_virtual,
    custom_form: '',
    selling_point: firstValue(product.subtitle, ''),
    store_open: 0
  }

  return {
    detail,
    specData,
    mp_service: { service_type: 10 },
    is_fav: false,
    couponList: [],
    cart_total_num: 0,
    store_open: 0,
    show_discount: false,
    discount: { product_coupon: [], product_reduce: [], give_points: 0 }
  }
}

export function fetchCategories() {
  return requestDisplayApi('/h5/miniprogram/categories')
}

export function fetchProducts(params = {}) {
  return requestDisplayApi('/h5/miniprogram/products', params)
}

export function fetchProductDetail(productId) {
  return requestDisplayApi('/h5/miniprogram/productDetail', {
    productId
  })
}
