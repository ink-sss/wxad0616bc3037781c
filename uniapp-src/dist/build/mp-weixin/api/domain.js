"use strict";const n=require("./h5.js");exports.getDomainConfig=function(t){return n.h5Get("/h5/domain/config",{tenantId:Number(t||0)})};
