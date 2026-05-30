"use strict";const e=require("./runtime.js");exports.requestSubscribeMessage=function(s=[],r={}){return e.promisifyApi("requestSubscribeMessage",{...r,tmplIds:s})};
