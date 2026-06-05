import { computed, ref } from "vue";

function getRefValue(value) {
  return value && typeof value === "object" && "value" in value ? value.value : value;
}

function toPositiveNumber(value, fallback) {
  const num = Number(getRefValue(value));
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function getRpxScale() {
  try {
    const info = typeof uni !== "undefined" && uni.getSystemInfoSync
      ? uni.getSystemInfoSync()
      : null;
    const width = Number(info?.windowWidth || 0);
    return width > 0 ? 750 / width : 2;
  } catch (e) {
    return 2;
  }
}

export function useVirtualProductList(options = {}) {
  const listRef = options.list || options;
  const scrollTopRpx = ref(0);
  const rpxScale = getRpxScale();

  const sourceList = computed(() => {
    const list = getRefValue(listRef);
    return Array.isArray(list) ? list : [];
  });

  const itemHeight = computed(() => toPositiveNumber(options.itemHeightRpx, 1));
  const viewportCount = computed(() => Math.ceil(toPositiveNumber(options.viewportItemCount, 8)));
  const overscanCount = computed(() => Math.max(Math.floor(toPositiveNumber(options.overscan, 2)), 0));

  const startIndex = computed(() => {
    if (sourceList.value.length === 0) return 0;
    const rawStart = Math.floor(scrollTopRpx.value / itemHeight.value);
    return Math.max(rawStart - overscanCount.value, 0);
  });

  const endIndex = computed(() => {
    const length = sourceList.value.length;
    if (length === 0) return 0;
    const rawStart = Math.floor(scrollTopRpx.value / itemHeight.value);
    return Math.min(length, rawStart + viewportCount.value + overscanCount.value * 2);
  });

  const visibleItems = computed(() =>
    sourceList.value
      .slice(startIndex.value, endIndex.value)
      .map((item, offset) => ({
        item,
        index: startIndex.value + offset,
      }))
  );

  const topSpacerHeight = computed(() => startIndex.value * itemHeight.value);
  const bottomSpacerHeight = computed(() =>
    Math.max(sourceList.value.length - endIndex.value, 0) * itemHeight.value
  );

  function onScroll(event = {}) {
    const scrollTop = Number(event?.detail?.scrollTop || event?.scrollTop || 0);
    scrollTopRpx.value = Number.isFinite(scrollTop) && scrollTop > 0
      ? scrollTop * rpxScale
      : 0;
  }

  return {
    visibleItems,
    topSpacerHeight,
    bottomSpacerHeight,
    onScroll,
  };
}
