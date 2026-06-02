"use strict";
const api_h5 = require("./h5.js");
function getAddressList() {
  return api_h5.h5Get("/h5/address/list");
}
function createAddress(data = {}) {
  return api_h5.h5Post("/h5/address/create", data);
}
function updateAddress(data = {}) {
  return api_h5.h5Put("/h5/address/update", data);
}
function deleteAddress(id) {
  return api_h5.h5Delete("/h5/address/delete", { id: Number(id || 0) });
}
exports.createAddress = createAddress;
exports.deleteAddress = deleteAddress;
exports.getAddressList = getAddressList;
exports.updateAddress = updateAddress;
