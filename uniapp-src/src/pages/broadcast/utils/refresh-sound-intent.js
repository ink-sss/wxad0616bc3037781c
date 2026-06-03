export function resolveIOSWechatRefreshSoundIntent({
  isWeChatIOSH5,
  roomCode,
  loadState,
} = {}) {
  if (!isWeChatIOSH5 || !roomCode || typeof loadState !== "function") {
    return {
      hasStoredState: false,
      shouldRestoreSound: false,
      allowBridgeSoundAutoPlay: true,
    };
  }
  const state = loadState(roomCode);
  if (!state) {
    return {
      hasStoredState: false,
      shouldRestoreSound: false,
      allowBridgeSoundAutoPlay: true,
    };
  }
  const userMutedSound = state.soundMutedByUser === true;
  const shouldRestoreSound = !userMutedSound;
  return {
    hasStoredState: true,
    shouldRestoreSound,
    allowBridgeSoundAutoPlay: shouldRestoreSound,
  };
}
