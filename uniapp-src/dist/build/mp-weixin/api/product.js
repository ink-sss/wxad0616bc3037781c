"use strict";const t=require("./h5.js");exports.getSkuStock=function(e){return t.h5Get("/h5/live/skuStock",{skuId:Number(e||0)})};
