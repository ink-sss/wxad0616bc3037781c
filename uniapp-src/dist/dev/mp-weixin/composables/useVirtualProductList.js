"use strict";
function useVirtualProductList(items) {
  return {
    virtualItems: items,
    containerStyle: {},
    spacerStyle: {},
    onScroll() {
    }
  };
}
exports.useVirtualProductList = useVirtualProductList;
