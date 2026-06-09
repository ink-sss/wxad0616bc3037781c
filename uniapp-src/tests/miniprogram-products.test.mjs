import assert from "node:assert/strict";
import test from "node:test";

import {
  dedupeProductList,
  getProductIdentity,
  mergeProductLists,
  normalizeProduct,
} from "../src/services/miniprogram-products.js";

test("product identity accepts miniprogram and h5 product id aliases", () => {
  assert.equal(getProductIdentity({ product_id: 101 }), "101");
  assert.equal(getProductIdentity({ productId: 102 }), "102");
  assert.equal(getProductIdentity({ goodsId: 103 }), "103");
  assert.equal(getProductIdentity({ goods_id: 104 }), "104");
  assert.equal(getProductIdentity({ id: 105 }), "105");
});

test("product lists keep the first matching product identity", () => {
  const source = [
    null,
    { product_id: 201, product_name: "A" },
    { productId: 201, product_name: "A duplicate" },
    { goodsId: 202, product_name: "B" },
  ];

  assert.deepEqual(dedupeProductList(source).map((item) => item.product_name), ["A", "B"]);
});

test("pagination merge does not append already rendered products", () => {
  const current = [
    { product_id: 301, product_name: "A" },
    { product_id: 302, product_name: "B" },
  ];
  const incoming = [
    { productId: 302, product_name: "B duplicate" },
    { productId: 303, product_name: "C" },
  ];

  assert.deepEqual(mergeProductLists(current, incoming).map((item) => item.product_name), ["A", "B", "C"]);
});

test("normalizing products preserves productId aliases as product_id", () => {
  const product = normalizeProduct({
    productId: 401,
    name: "Alias Product",
    salePrice: 10,
  });

  assert.equal(product.product_id, 401);
  assert.equal(product.product_name, "Alias Product");
  assert.equal(product.product_price, "10.00");
});
