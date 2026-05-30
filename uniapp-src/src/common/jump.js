import { navigateToMiniProgram } from '../platform/weixin/navigation.js';

function parseMiniProgramTarget(value) {
  if (!value) return {};

  const matcher = /([^=,]+)=([^,]*)(?:,|$)/g;
  const target = {};
  let match = matcher.exec(value);

  while (match !== null) {
    const [, key, itemValue] = match;
    if (key === 'targetAppId') target.targetAppId = itemValue;
    if (key === 'targetGhId') target.targetGhId = itemValue;
    if (key === 'path') target.path = itemValue;
    match = matcher.exec(value);
  }

  return target;
}

export const jump = {
  checkAndNavigate(value) {
    const target = parseMiniProgramTarget(value);

    if (target.targetGhId || target.targetAppId) {
      if (target.targetAppId) {
        navigateToMiniProgram({
          appId: target.targetAppId,
          path: target.path || '',
          success() {
            console.log('小程序跳转成功');
          },
          fail(error) {
            console.log(error);
          },
        });
      } else {
        uni.showModal({
          title: '无法跳转到该小程序',
          showCancel: false,
        });
      }

      return false;
    }

    return true;
  },
};

export default jump;
