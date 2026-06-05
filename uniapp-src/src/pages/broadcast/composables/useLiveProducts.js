import { computed, ref } from "vue";
import { normalizeScheduleNodes } from "../useReplayProductSchedule.js";

/**
 * 直播商品列表、当前讲解商品和商品卡片状态。
 * 职责边界：只处理商品数据拉取、格式化和讲解商品同步；购买流程由 useLivePurchase 处理。
 */
export function toPriceText(value) {
  if (value === null || value === undefined || value === "") return "0.00";
  const num = Number(value);
  return Number.isNaN(num) ? String(value) : num.toFixed(2);
}

const HOT_BASE_MIN = 5;
const HOT_BASE_MAX = 15;

function toNonNegativeInt(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.floor(num);
}

function stableHash(value) {
  let hash = 0;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function isTruthySoldOutFlag(value) {
  return value === true || value === 1 || value === "1";
}

function isTruthyFlag(value) {
  return value === true || value === 1 || value === "1";
}

export function getProductId(item = {}) {
  return Number(item.id || item.productId || item.product_id || item.goodsId || item.goods_id || 0);
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

const PRODUCT_RESPONSE_CONTAINER_KEYS = [
  "data",
  "payload",
  "result",
  "page",
  "pager",
  "pagination",
];

const PRODUCT_RESPONSE_LIST_KEYS = [
  "list",
  "records",
  "rows",
  "items",
  "products",
  "productList",
  "product_list",
  "goodsList",
  "goods_list",
  "goods",
  "dataList",
  "data_list",
];

function collectProductResponsePayloads(response = {}, maxDepth = 4) {
  const payloads = [];
  const visited = new Set();

  function walk(value, depth) {
    if (Array.isArray(value) || !isPlainObject(value) || visited.has(value)) return;
    visited.add(value);
    payloads.push(value);
    if (depth >= maxDepth) return;

    PRODUCT_RESPONSE_CONTAINER_KEYS.forEach((key) => {
      const nextValue = value[key];
      if (isPlainObject(nextValue)) walk(nextValue, depth + 1);
    });
  }

  walk(response, 0);
  return payloads;
}

function pickProductResponseList(response = {}) {
  if (Array.isArray(response)) return response;

  const payloads = collectProductResponsePayloads(response);
  for (const payload of payloads) {
    const direct = firstValue(payload, ...PRODUCT_RESPONSE_LIST_KEYS);
    if (Array.isArray(direct)) return direct;
  }

  for (const payload of payloads) {
    const product = firstValue(payload, "product", "currentProduct", "current_product", "goods", "currentGoods", "current_goods");
    if (isPlainObject(product)) return [product];
  }

  return [];
}

function pickProductResponseTotal(response = {}, fallbackLength = 0) {
  const payloads = collectProductResponsePayloads(response);
  for (const payload of payloads) {
    const total = firstValue(
      payload,
      "total",
      "count",
      "totalCount",
      "total_count",
      "totalRows",
      "total_rows",
      "recordCount",
      "record_count"
    );
    const n = Number(total);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return fallbackLength;
}

export function getHotSalesBase(item = {}) {
  const stock = toNonNegativeInt(item.stock);
  if (stock <= 0) return 0;
  if (stock <= HOT_BASE_MIN) return stock;

  const preset = Number(item.hotBase ?? item.hotSalesBase);
  if (Number.isFinite(preset) && preset >= HOT_BASE_MIN && preset <= HOT_BASE_MAX) {
    return Math.floor(preset);
  }
  const seed = getProductId(item) || item.name || item.title || "";
  if (seed !== "") {
    return HOT_BASE_MIN + (stableHash(seed) % (HOT_BASE_MAX - HOT_BASE_MIN + 1));
  }
  return HOT_BASE_MIN + Math.floor(Math.random() * (HOT_BASE_MAX - HOT_BASE_MIN + 1));
}

export function withHotSales(item = {}) {
  const sales = toNonNegativeInt(item.sales);
  const virtualSales = toNonNegativeInt(item.virtualSales);
  const simulatedSales = toNonNegativeInt(item.simulatedSales);
  const hotBase = getHotSalesBase(item);
  const stock = toNonNegativeInt(item.stock);
  const soldOut = isTruthySoldOutFlag(item.soldOut) || isTruthySoldOutFlag(item.isSoldOut);
  const rawHotSales = sales + virtualSales + simulatedSales + hotBase;
  return {
    ...item,
    sales,
    virtualSales,
    simulatedSales,
    hotBase,
    hotSales: soldOut || stock <= 0 ? 0 : Math.min(rawHotSales, stock),
  };
}

export function mapProductItem(item = {}, fallbackImage = "") {
  const id = getProductId(item);
  const stock = toNonNegativeInt(firstValue(item, "stock", "stockNum", "stock_num", "productStock", "product_stock", "goodsStock", "goods_stock"));
  const isSoldOut = isTruthySoldOutFlag(firstValue(item, "isSoldOut", "is_sold_out", "soldOut", "sold_out"));
  const soldOut = isTruthySoldOutFlag(firstValue(item, "soldOut", "sold_out", "isSoldOut", "is_sold_out"));
  const skuId = Number(firstValue(item, "skuId", "sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id") || 0);
  const tenantId = Number(firstValue(item, "tenantId", "tenant_id") || 0);
  const specType = Number(firstValue(item, "specType", "spec_type") || 0);
  return withHotSales({
    ...item,
    id,
    productId: id,
    product_id: id,
    goodsId: Number(firstValue(item, "goodsId", "goods_id") || id || 0),
    goods_id: Number(firstValue(item, "goodsId", "goods_id") || id || 0),
    image: firstValue(item, "coverImage", "cover_image", "productImage", "product_image", "goodsPic", "goods_pic", "goodsImage", "goods_image", "image") || fallbackImage,
    title: firstValue(item, "name", "productName", "product_name", "goodsName", "goods_name", "title") || "",
    displayIndex: item.displayIndex ?? item.sort ?? item.rank ?? item.goodsSort ?? item.goods_sort,
    price: toPriceText(firstValue(item, "salePrice", "sale_price", "productPrice", "product_price", "price")),
    originPrice:
      firstValue(item, "linePrice", "line_price", "originPrice", "origin_price", "marketPrice", "market_price")
        ? toPriceText(firstValue(item, "linePrice", "line_price", "originPrice", "origin_price", "marketPrice", "market_price"))
        : "",
    stock,
    sales: firstValue(item, "sales", "productSales", "product_sales", "saleCount", "sale_count") || 0,
    virtualSales: firstValue(item, "virtualSales", "virtual_sales") || 0,
    simulatedSales: firstValue(item, "simulatedSales", "simulated_sales") || 0,
    hotBase: getHotSalesBase(item),
    isMultiSpec: isTruthyFlag(firstValue(item, "isMultiSpec", "is_multi_spec")) || specType === 20,
    specType,
    spec_type: specType,
    skuId,
    sku_id: skuId,
    productSkuId: skuId,
    product_sku_id: skuId,
    tenantId,
    tenant_id: tenantId,
    isCurrent: !!firstValue(item, "isCurrent", "is_current"),
    isTop: item.isTop || 0,
    isSoldOut,
    soldOut: soldOut || isSoldOut || stock <= 0,
    videoId: Number(firstValue(item, "videoId", "video_id", "replayVideoId", "replay_video_id") || 0),
    video_id: Number(firstValue(item, "videoId", "video_id", "replayVideoId", "replay_video_id") || 0),
    scheduleVideoUrl: firstValue(item, "scheduleVideoUrl", "schedule_video_url") || "",
    schedule_video_url: firstValue(item, "scheduleVideoUrl", "schedule_video_url") || "",
    scheduleVideoTime: Number(firstValue(item, "scheduleVideoTime", "schedule_video_time") || 0),
    schedule_video_time: Number(firstValue(item, "scheduleVideoTime", "schedule_video_time") || 0),
    scheduleDuration: Number(firstValue(item, "scheduleDuration", "schedule_duration") || 0),
    schedule_duration: Number(firstValue(item, "scheduleDuration", "schedule_duration") || 0),
    scheduleNodes: normalizeScheduleNodes(item),
  });
}

export function useLiveProducts({
  liveId,
  showProduct,
  isReplay,
  replayCurrentVideoId,
  getLiveProducts,
  getCurrentProduct,
}) {
  const currentProduct = ref({
    image: "",
    title: "",
    price: "0.00",
  });
  const productTotal = ref(0);
  const productPage = ref(1);
  const productPageSize = 20;
  const productLoading = ref(false);
  const productFinished = ref(false);
  const productList = ref([]);
  const explainingProductId = ref(0);
  const productCardActiveIndex = ref(0);

  const productCardItems = computed(() => {
    if (Array.isArray(productList.value) && productList.value.length > 0) {
      const explainingItems = productList.value.filter((item) => item.isCurrent);
      if (explainingItems.length > 0) {
        return explainingItems;
      }
    }
    if (currentProduct.value?.id) {
      return [withHotSales(currentProduct.value)];
    }
    return [];
  });

  const mapItem = (item = {}) => mapProductItem(item, currentProduct.value.image);

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object || {}, key);
  }

  function preserveSoldOutState(rawItem = {}, nextItem = {}) {
    if (hasOwn(rawItem, "isSoldOut")) return nextItem;
    const pid = getProductId(nextItem);
    if (!pid) return nextItem;
    const currentManualSoldOut = Number(currentProduct.value?.id || 0) === pid && currentProduct.value?.isSoldOut === true;
    const existing = productList.value.find((item) => Number(item?.id || 0) === pid);
    if (!currentManualSoldOut && existing?.isSoldOut !== true) return nextItem;
    return {
      ...nextItem,
      isSoldOut: true,
      soldOut: true,
    };
  }

  function mapListItem(item = {}) {
    return preserveSoldOutState(item, mapItem(item));
  }

  function patchProductObject(target = {}, next = {}) {
    if (!target || typeof target !== "object") return false;
    let changed = false;
    Object.keys(next).forEach((key) => {
      if (target[key] === next[key]) return;
      target[key] = next[key];
      changed = true;
    });
    return changed;
  }

  function setCurrentProduct(next = {}) {
    const nextId = getProductId(next);
    if (nextId > 0 && getProductId(currentProduct.value) === nextId) {
      patchProductObject(currentProduct.value, next);
      return currentProduct.value;
    }
    currentProduct.value = next;
    return currentProduct.value;
  }

  function setProductListStable(nextList = []) {
    const currentList = productList.value;
    const sameOrder =
      currentList.length === nextList.length &&
      currentList.every((item, index) => getProductId(item) === getProductId(nextList[index]));

    if (!sameOrder) {
      productList.value = nextList;
      return productList.value;
    }

    currentList.forEach((item, index) => {
      patchProductObject(item, nextList[index]);
    });
    return currentList;
  }

  function appendProductListItems(items = []) {
    if (!items.length) return;
    items.forEach((item) => {
      productList.value.push(item);
    });
  }

  function patchProductCurrentFlags(idSet, firstItem = null) {
    productList.value.forEach((item) => {
      const pid = getProductId(item);
      const patch = {
        isCurrent: idSet.has(pid),
      };
      if (firstItem && pid === getProductId(firstItem)) {
        Object.assign(patch, firstItem);
      }
      patchProductObject(item, patch);
    });
  }

  function syncProductCardIndex(preferredId = 0) {
    const list = productCardItems.value;
    if (!list.length) {
      productCardActiveIndex.value = 0;
      return;
    }

    const targetId =
      preferredId ||
      explainingProductId.value ||
      currentProduct.value?.id ||
      list[0]?.id;
    const nextIndex = list.findIndex((item) => item.id === targetId);
    productCardActiveIndex.value = nextIndex >= 0 ? nextIndex : 0;
  }

  function onProductCardChange(index) {
    productCardActiveIndex.value = Number(index || 0);
    const nextItem = productCardItems.value[productCardActiveIndex.value];
    if (nextItem) {
      currentProduct.value = nextItem;
    }
  }

  function updateProductHotSales(productId, updater) {
    const pid = Number(productId || 0);
    if (!pid) return false;
    let changed = false;

    // 原地更新热卖字段，避免重建数组触发 swiper 重新渲染导致卡片抖动
    for (let i = 0; i < productList.value.length; i++) {
      const item = productList.value[i];
      if (Number(item?.id || 0) !== pid) continue;
      const updated = withHotSales(updater(withHotSales(item)));
      Object.assign(item, updated);
      changed = true;
    }
    if (Number(currentProduct.value?.id || 0) === pid) {
      const updated = withHotSales(updater(withHotSales(currentProduct.value)));
      Object.assign(currentProduct.value, updated);
      changed = true;
    }
    return changed;
  }

  function incrementProductHotOrder(productId, quantity = 1, options = {}) {
    const delta = Math.max(toNonNegativeInt(quantity), 1);
    return updateProductHotSales(productId, (item) => {
      if (options.virtual) {
        return { ...item, simulatedSales: item.simulatedSales + delta };
      }
      // 真实下单：sales 按购买数量递增，同时追加随机 5~15 的虚拟热度
      const randomBoost = 5 + Math.floor(Math.random() * 11);
      return {
        ...item,
        sales: item.sales + delta,
        virtualSales: item.virtualSales + randomBoost,
      };
    });
  }

  function setProductSales(productId, sales) {
    return updateProductHotSales(productId, (item) => ({
      ...item,
      sales: toNonNegativeInt(sales),
    }));
  }

  async function loadProductList(reset = false) {
    if (productLoading.value) return;
    if (!liveId.value) return;
    if (!reset && productFinished.value) return;

    productLoading.value = true;
    try {
      const nextPage = reset ? 1 : productPage.value;
      const res = await getLiveProducts(liveId.value, nextPage, productPageSize);
      const rawList = pickProductResponseList(res);
      const list = rawList.map(mapListItem);
      const total = pickProductResponseTotal(res, list.length);

      productTotal.value = total;
      if (reset) {
        setProductListStable(list);
      } else {
        const existIds = new Set(productList.value.map((p) => getProductId(p)));
        const newItems = list.filter((p) => !existIds.has(getProductId(p)));
        appendProductListItems(newItems);
      }
      productPage.value = nextPage + 1;
      productFinished.value =
        productList.value.length >= total || list.length < productPageSize;
      syncProductCardIndex();
    } catch (err) {
      console.error("[Live] getLiveProducts fail:", err);
      if (reset) {
        productFinished.value = productList.value.length > 0;
      }
    } finally {
      productLoading.value = false;
    }
  }

  async function loadCurrentProduct() {
    if (!liveId.value) return;

    try {
      const res = await getCurrentProduct(liveId.value);
      const list = pickProductResponseList(res);
      if (list.length === 0) return;

      const curVideoId = Number(replayCurrentVideoId.value || 0);
      const filtered = isReplay.value && curVideoId > 0
        ? list.filter((item) => {
            const vid = Number(item.videoId || item.video_id || item.replayVideoId || item.replay_video_id || 0);
            return vid === 0 || vid === curVideoId;
          })
        : list;

      if (filtered.length === 0) {
        if (productList.value.length === 0) {
          productList.value = list.map((item) => ({
            ...mapItem(item),
            isCurrent: false,
          }));
          productTotal.value = Math.max(productTotal.value, list.length);
          productFinished.value = true;
        }
        return;
      }

      const firstItem = { ...mapItem(filtered[0]), isCurrent: true };
      setCurrentProduct(firstItem);
      showProduct.value = true;
      explainingProductId.value = firstItem.id;

      const idSet = new Set(filtered.map((item) => getProductId(item)));

      if (productList.value.length > 0) {
        patchProductCurrentFlags(idSet, firstItem);
      } else {
        setProductListStable(list.map((item) => ({
          ...mapItem(item),
          isCurrent: idSet.has(getProductId(item)),
        })));
        productTotal.value = Math.max(productTotal.value, list.length);
        productFinished.value = true;
      }
      syncProductCardIndex(firstItem.id);
    } catch (err) {
      console.error("[Live] getCurrentProduct fail:", err);
    }
  }

  return {
    currentProduct,
    productTotal,
    productPage,
    productPageSize,
    productLoading,
    productFinished,
    productList,
    explainingProductId,
    productCardActiveIndex,
    productCardItems,
    mapProductItem: mapItem,
    syncProductCardIndex,
    onProductCardChange,
    incrementProductHotOrder,
    setProductSales,
    loadProductList,
    loadCurrentProduct,
  };
}
