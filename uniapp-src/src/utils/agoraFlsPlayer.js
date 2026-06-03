export function createAgoraFlsPlayer() {
  return {
    play() {
      return Promise.reject(new Error('Agora FLS is unsupported in mp-weixin; use live-player source instead'))
    },
    stop() {},
    destroy() {},
  }
}
