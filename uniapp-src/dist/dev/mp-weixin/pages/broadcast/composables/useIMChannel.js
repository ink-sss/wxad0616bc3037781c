"use strict";
const common_vendor = require("../../../common/vendor.js");
function useIMChannel() {
  const imState = common_vendor.ref("unsupported");
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
    closeLiveSocket
  };
}
exports.useIMChannel = useIMChannel;
