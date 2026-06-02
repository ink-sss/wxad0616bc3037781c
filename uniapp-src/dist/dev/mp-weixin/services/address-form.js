"use strict";
const api_address = require("../api/address.js");
function saveAddressForm(payload, id = 0) {
  if (id) {
    return api_address.updateAddress({ id, ...payload });
  }
  return api_address.createAddress(payload);
}
exports.saveAddressForm = saveAddressForm;
