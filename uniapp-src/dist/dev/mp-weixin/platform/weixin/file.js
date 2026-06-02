"use strict";
const platform_weixin_runtime = require("./runtime.js");
function chooseAddress(options = {}) {
  return platform_weixin_runtime.promisifyApi("chooseAddress", options, { preferUni: true });
}
function chooseImage(options = {}) {
  return platform_weixin_runtime.promisifyApi("chooseImage", {
    count: 6,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    ...options
  }, { preferUni: true });
}
function uploadFile(options = {}) {
  return platform_weixin_runtime.promisifyApi("uploadFile", options, { preferUni: true });
}
function readFileArrayBuffer(filePath) {
  const api = platform_weixin_runtime.getWeixinApi("getFileSystemManager") || platform_weixin_runtime.getGlobalUni();
  if (!api || typeof api.getFileSystemManager !== "function") {
    return Promise.reject(platform_weixin_runtime.unsupportedError("getFileSystemManager"));
  }
  const manager = api.getFileSystemManager();
  if (!manager || typeof manager.readFile !== "function") {
    return Promise.reject(platform_weixin_runtime.unsupportedError("FileSystemManager.readFile"));
  }
  return new Promise((resolve, reject) => {
    manager.readFile({
      filePath,
      success: (result) => resolve(result.data),
      fail: reject
    });
  });
}
async function putFileToPresignedUrl(url, filePath, options = {}) {
  const uniApi = platform_weixin_runtime.getGlobalUni();
  if (!uniApi || typeof uniApi.request !== "function") {
    return Promise.reject(platform_weixin_runtime.unsupportedError("request"));
  }
  try {
    const data = await readFileArrayBuffer(filePath);
    return await new Promise((resolve, reject) => {
      uniApi.request({
        url,
        method: "PUT",
        data,
        header: {
          "content-type": options.contentType || "application/octet-stream",
          ...options.header || {}
        },
        success(response) {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(response);
            return;
          }
          reject(new Error(`OSS上传失败: HTTP ${response.statusCode}`));
        },
        fail: reject
      });
    });
  } catch (error) {
    return uploadFile({
      url,
      filePath,
      name: options.name || "file",
      method: "PUT",
      header: {
        "content-type": options.contentType || "application/octet-stream",
        ...options.header || {}
      }
    });
  }
}
exports.chooseAddress = chooseAddress;
exports.chooseImage = chooseImage;
exports.putFileToPresignedUrl = putFileToPresignedUrl;
