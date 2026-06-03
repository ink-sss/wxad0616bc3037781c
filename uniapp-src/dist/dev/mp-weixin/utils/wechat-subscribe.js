"use strict";
function hasWechatSubscribeConfig(options = {}) {
  var _a;
  return !!(options.templateId || options.subscribeTemplateId || ((_a = options.roomSetting) == null ? void 0 : _a.subscribeTemplateId));
}
exports.hasWechatSubscribeConfig = hasWechatSubscribeConfig;
