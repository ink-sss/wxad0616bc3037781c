import { uploadFilesWithComplaintUploadUrl } from '../api/upload.js';

export function uploadFiles(files, options = {}) {
  const fileType = options.isVideo ? 'video' : 'image';
  const fileList = Array.isArray(files) ? files : [files];

  if (!fileList.length) {
    if (options.onComplete) options.onComplete([]);
    return Promise.resolve([]);
  }

  uni.showLoading({
    title: options.loadingTitle || '上传中',
  });

  return uploadFilesWithComplaintUploadUrl(fileList, {
    fileType,
    name: options.name,
    contentType: options.contentType,
    data: options.formData || options.data || {},
  }).catch((error) => {
    if (options.onError) options.onError(error);
    uni.showModal({
      title: '提示',
      content: error?.message || '上传失败',
    });
    return [];
  }).then((uploaded) => {
    uni.hideLoading();
    if (options.onComplete) options.onComplete(uploaded);
    return uploaded;
  });
}

export function chooseAndUpload(options = {}) {
  const isVideo = Boolean(options.isVideo);

  return new Promise((resolve) => {
    const fail = (error) => {
      if (options.onFail) options.onFail(error);
      if (options.onComplete) options.onComplete(null);
      resolve(null);
    };

    if (isVideo) {
      uni.chooseVideo({
        maxDuration: options.maxDuration || 60,
        camera: options.camera || 'back',
        success(result) {
          uploadFiles([result.tempFilePath], options).then(resolve);
        },
        fail,
      });
      return;
    }

    uni.chooseImage({
      count: options.count || 9,
      mediaType: options.mediaType || ['image'],
      sizeType: options.sizeType || ['original', 'compressed'],
      sourceType: options.sourceType || ['album', 'camera'],
      success(result) {
        uploadFiles(result.tempFilePaths, options).then(resolve);
      },
      fail,
    });
  });
}

export default {
  chooseAndUpload,
  uploadFiles,
};
