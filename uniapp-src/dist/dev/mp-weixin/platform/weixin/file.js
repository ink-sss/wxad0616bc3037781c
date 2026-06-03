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
function downloadFile(options = {}) {
  return platform_weixin_runtime.promisifyApi("downloadFile", options, { preferUni: true });
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
    const response = await uploadFile({
      url,
      filePath,
      name: options.name || "file",
      method: "PUT",
      header: {
        "content-type": options.contentType || "application/octet-stream",
        ...options.header || {}
      }
    });
    if ((response == null ? void 0 : response.statusCode) >= 200 && response.statusCode < 300) {
      return response;
    }
    throw new Error(`OSS上传失败: HTTP ${(response == null ? void 0 : response.statusCode) || "unknown"}`);
  }
}
function getFileSystemManager() {
  var _a, _b;
  const wxApi = platform_weixin_runtime.getWeixinApi(null);
  const uniApi = platform_weixin_runtime.getGlobalUni();
  const api = wxApi && typeof wxApi.getFileSystemManager === "function" ? wxApi : uniApi;
  if (!api || typeof api.getFileSystemManager !== "function") {
    throw platform_weixin_runtime.unsupportedError("getFileSystemManager");
  }
  return {
    manager: api.getFileSystemManager(),
    userDataPath: ((_a = api.env) == null ? void 0 : _a.USER_DATA_PATH) || ((_b = wxApi == null ? void 0 : wxApi.env) == null ? void 0 : _b.USER_DATA_PATH) || ""
  };
}
function writeBase64ImageToTempFile(dataUrl, fileName = `share-${Date.now()}.png`) {
  if (!dataUrl || typeof dataUrl !== "string") {
    return Promise.reject(new Error("图片数据为空"));
  }
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    return Promise.reject(new Error("不是有效的图片 dataURL"));
  }
  const ext = (match[1] || "png").toLowerCase().replace("jpeg", "jpg");
  const base64Data = match[2];
  const { manager, userDataPath } = getFileSystemManager();
  if (!manager || typeof manager.writeFile !== "function" || !userDataPath) {
    return Promise.reject(platform_weixin_runtime.unsupportedError("FileSystemManager.writeFile"));
  }
  const safeName = String(fileName || `share-${Date.now()}.${ext}`).replace(/[^\w.-]/g, "_");
  const filePath = `${userDataPath}/${safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`}`;
  return new Promise((resolve, reject) => {
    manager.writeFile({
      filePath,
      data: base64Data,
      encoding: "base64",
      success: () => resolve(filePath),
      fail: reject
    });
  });
}
function saveImageToAlbum(filePath) {
  if (!filePath)
    return Promise.reject(new Error("图片路径为空"));
  return platform_weixin_runtime.promisifyApi("saveImageToPhotosAlbum", { filePath }, { preferUni: true });
}
async function saveImageUrlToAlbum(url, fileName) {
  if (!url)
    throw new Error("图片路径为空");
  let filePath = url;
  if (/^data:image\//.test(url)) {
    filePath = await writeBase64ImageToTempFile(url, fileName);
  } else if (/^https?:\/\//.test(url)) {
    const result = await downloadFile({ url });
    if ((result == null ? void 0 : result.statusCode) && result.statusCode !== 200) {
      throw new Error(`图片下载失败: HTTP ${result.statusCode}`);
    }
    filePath = result.tempFilePath;
  }
  return saveImageToAlbum(filePath);
}
exports.chooseAddress = chooseAddress;
exports.chooseImage = chooseImage;
exports.putFileToPresignedUrl = putFileToPresignedUrl;
exports.saveImageUrlToAlbum = saveImageUrlToAlbum;
