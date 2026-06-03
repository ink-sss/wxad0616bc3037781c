import { ref } from "vue";

/**
 * H5 uses Easemob's browser SDK for groupType=0 message fanout. The SDK depends
 * on browser WebSocket/protobuf runtime and is not safe in mp-weixin bundles.
 *
 * Keep the H5 hook contract so the copied broadcast code stays structurally
 * aligned; return false during initialization so useMessageChannel falls back
 * to the mini-program WebSocket adapter.
 */
export function useIMChannel() {
  const imState = ref("unsupported");

  async function initWebSocket() {
    imState.value = "unsupported";
    return false;
  }

  function getLiveSocket() {
    return null;
  }

  function closeLiveSocket() {
    imState.value = "closed";
  }

  return {
    imState,
    initWebSocket,
    getLiveSocket,
    closeLiveSocket,
  };
}
