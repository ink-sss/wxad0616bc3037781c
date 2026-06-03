"use strict";const s=require("./h5.js");exports.getUsableCoupons=function(t={}){return s.h5Post("/h5/coupon/usableList",t)};
