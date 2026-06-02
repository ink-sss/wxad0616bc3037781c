"use strict";const s=require("../api/address.js");exports.saveAddressForm=function(e,r=0){return r?s.updateAddress({id:r,...e}):s.createAddress(e)};
