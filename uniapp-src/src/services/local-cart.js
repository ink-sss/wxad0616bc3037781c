export const LOCAL_CART_STORAGE_KEY = 'local_cart_v1'
export const LOCAL_CART_CHECKED_KEY = 'CheckedData'

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toMoney(value) {
  return toNumber(value, 0).toFixed(2)
}

function firstImage(input = {}) {
  if (input.product_image) return input.product_image
  if (input.sku_image) return input.sku_image
  if (input.image && input.image.file_path) return input.image.file_path
  if (Array.isArray(input.image) && input.image[0]) return input.image[0].file_path || ''
  return ''
}

export function buildLocalCartId(productId, specSkuId = 0) {
  return `${productId}:${specSkuId || 0}`
}

export function readLocalCartItems() {
  const items = uni.getStorageSync(LOCAL_CART_STORAGE_KEY)
  return Array.isArray(items) ? items : []
}

export function writeLocalCartItems(items = []) {
  uni.setStorageSync(LOCAL_CART_STORAGE_KEY, Array.isArray(items) ? items : [])
}

export function readLocalCartCheckedIds() {
  const ids = uni.getStorageSync(LOCAL_CART_CHECKED_KEY)
  return Array.isArray(ids) ? ids.map((id) => `${id}`) : []
}

export function writeLocalCartCheckedIds(ids = []) {
  uni.setStorageSync(LOCAL_CART_CHECKED_KEY, Array.isArray(ids) ? ids.map((id) => `${id}`) : [])
}

export function normalizeLocalCartItem(input = {}, totalNum = 1) {
  const productId = input.product_id || input.productId || ''
  const specSkuId = input.spec_sku_id || input.product_sku_id || input.skuId || 0
  const localCartId = buildLocalCartId(productId, specSkuId)
  const productSku = input.product_sku || {}
  const stockNum = toNumber(input.stock_num || input.product_stock || productSku.stock_num, 0)
  const productPrice = input.product_price || input.product_min_price || productSku.product_price || 0
  const linePrice = input.line_price || productSku.line_price || 0
  const productAttr = input.product_attr || productSku.product_attr || ''

  return {
    local_cart_id: localCartId,
    cart_id: localCartId,
    product_id: productId,
    spec_sku_id: specSkuId,
    product_name: input.product_name || input.name || '',
    product_image: firstImage(input),
    product_price: toMoney(productPrice),
    line_price: toMoney(linePrice),
    total_num: Math.max(1, toNumber(totalNum, 1)),
    stock_num: stockNum,
    product_attr: productAttr,
    selected: input.selected !== false,
    updated_at: Date.now(),
    product_sku: {
      product_attr: productAttr,
      stock_num: stockNum,
      product_price: toMoney(productPrice),
      line_price: toMoney(linePrice),
      spec_sku_id: specSkuId
    }
  }
}

export function addLocalCartItem(input = {}, totalNum = 1) {
  const nextItem = normalizeLocalCartItem(input, totalNum)
  if (!nextItem.product_id) return getLocalCartSummary()

  const items = readLocalCartItems()
  const index = items.findIndex((item) => item.local_cart_id === nextItem.local_cart_id)
  if (index >= 0) {
    const current = items[index]
    const nextTotal = toNumber(current.total_num, 0) + toNumber(totalNum, 1)
    const maxStock = toNumber(nextItem.stock_num || current.stock_num, 0)
    items.splice(index, 1, {
      ...current,
      ...nextItem,
      total_num: maxStock > 0 ? Math.min(nextTotal, maxStock) : nextTotal,
      updated_at: Date.now()
    })
  } else {
    items.push(nextItem)
  }

  writeLocalCartItems(items)
  const checkedIds = readLocalCartCheckedIds()
  if (!checkedIds.includes(nextItem.local_cart_id)) writeLocalCartCheckedIds([...checkedIds, nextItem.local_cart_id])
  return getLocalCartSummary()
}

export function incrementLocalCartItem(item = {}) {
  return addLocalCartItem(item, 1)
}

export function decrementLocalCartItem(item = {}) {
  const id = `${item.local_cart_id || item.cart_id || buildLocalCartId(item.product_id, item.spec_sku_id)}`
  const items = readLocalCartItems()
  const index = items.findIndex((cartItem) => `${cartItem.local_cart_id}` === id || `${cartItem.cart_id}` === id)
  if (index < 0 || toNumber(items[index].total_num, 1) <= 1) return getLocalCartSummary()

  items[index].total_num = toNumber(items[index].total_num, 1) - 1
  items[index].updated_at = Date.now()
  writeLocalCartItems(items)
  return getLocalCartSummary()
}

export function removeLocalCartItems(ids = []) {
  const removeIds = ids.map((id) => `${id}`)
  const items = readLocalCartItems().filter((item) => (
    !removeIds.includes(`${item.local_cart_id}`) && !removeIds.includes(`${item.cart_id}`)
  ))
  const checkedIds = readLocalCartCheckedIds().filter((id) => !removeIds.includes(`${id}`))
  writeLocalCartItems(items)
  writeLocalCartCheckedIds(checkedIds)
  return getLocalCartSummary()
}

export function clearLocalCartItems() {
  writeLocalCartItems([])
  writeLocalCartCheckedIds([])
  return getLocalCartSummary()
}

export function getLocalCartSummary() {
  const items = readLocalCartItems()
  const totalNum = items.reduce((total, item) => total + toNumber(item.total_num, 0), 0)
  const totalPrice = items.reduce((total, item) => (
    total + toNumber(item.total_num, 0) * toNumber(item.product_price, 0)
  ), 0)

  return {
    items,
    productList: [{
      supplier: { shop_supplier_id: 0, name: '本地购物车' },
      productList: items.map((item) => ({
        ...item,
        cart_id: item.local_cart_id || item.cart_id,
        product_sku: item.product_sku || {
          product_attr: item.product_attr || '',
          stock_num: item.stock_num || 0
        }
      }))
    }],
    totalNum,
    totalPrice: totalPrice.toFixed(2)
  }
}
