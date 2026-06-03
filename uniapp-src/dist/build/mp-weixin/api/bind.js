"use strict";const t=require("./h5.js");exports.getBindIdentity=function(e){return t.h5Get("/h5/bind/identity",{bindId:e},{authRedirect:!1})};
