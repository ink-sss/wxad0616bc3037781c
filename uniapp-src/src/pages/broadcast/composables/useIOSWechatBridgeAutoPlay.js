export function useIOSWechatBridgeAutoPlay() {
  function tryIOSWechatBridgeAutoPlay() {
    return false;
  }

  function tryIOSWechatBridgeMutedPlay() {
    return false;
  }

  function setIOSWechatBridgeSoundAutoPlayAllowed() {}

  return {
    tryIOSWechatBridgeAutoPlay,
    tryIOSWechatBridgeMutedPlay,
    setIOSWechatBridgeSoundAutoPlayAllowed,
  };
}
