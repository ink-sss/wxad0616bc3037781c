"use strict";
function useIOSWechatBridgeAutoPlay() {
  function tryIOSWechatBridgeAutoPlay() {
    return false;
  }
  function tryIOSWechatBridgeMutedPlay() {
    return false;
  }
  function setIOSWechatBridgeSoundAutoPlayAllowed() {
  }
  return {
    tryIOSWechatBridgeAutoPlay,
    tryIOSWechatBridgeMutedPlay,
    setIOSWechatBridgeSoundAutoPlayAllowed
  };
}
exports.useIOSWechatBridgeAutoPlay = useIOSWechatBridgeAutoPlay;
