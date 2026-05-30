import { config } from '../env/config.js';

function parseUploadData(data) {
  if (typeof data === 'object') return data;
  return JSON.parse(data);
}

function resolveRuntimeContext(context = {}) {
  return {
    config: context.config || config,
    websiteUrl: context.websiteUrl || config.app_url,
    getAppId: typeof context.getAppId === 'function' ? context.getAppId.bind(context) : () => config.app_id,
    doLogin: typeof context.doLogin === 'function' ? context.doLogin.bind(context) : () => {},
  };
}

export function uploadFiles(files, options = {}) {
  const runtime = resolveRuntimeContext(options.context);
  const fileType = options.isVideo ? 'video' : 'image';
  const uploaded = [];
  const fileList = Array.isArray(files) ? files : [files];
  const uploadUrl = options.url || `${runtime.websiteUrl}/index.php?s=/api/file.upload/image`;

  if (!fileList.length) {
    if (options.onComplete) options.onComplete(uploaded);
    return Promise.resolve(uploaded);
  }

  uni.showLoading({
    title: options.loadingTitle || '上传中',
  });

  return Promise.all(
    fileList.map(
      (filePath) =>
        new Promise((resolve) => {
          uni.uploadFile({
            url: uploadUrl,
            filePath,
            name: options.name || 'iFile',
            formData: {
              token: runtime.config.token,
              app_id: runtime.getAppId(),
              appid: runtime.config.appid,
              file_type: fileType,
              ...(options.formData || {}),
            },
            success(result) {
              const body = parseUploadData(result.data);

              if (body.code === -1) {
                console.log('登录态失效, 重新登录');
                runtime.doLogin();
                resolve(null);
                return;
              }

              if (body.code === 1) {
                uploaded.push(body.data);
              } else {
                uni.showModal({
                  title: '提示',
                  content: body.msg,
                });
              }

              resolve(body);
            },
            fail(error) {
              if (options.onError) options.onError(error);
              resolve(null);
            },
          });
        }),
    ),
  ).then(() => {
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
