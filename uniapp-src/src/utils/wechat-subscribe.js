export function hasWechatSubscribeConfig(options = {}) {
  return !!(options.templateId || options.subscribeTemplateId || options.roomSetting?.subscribeTemplateId)
}
