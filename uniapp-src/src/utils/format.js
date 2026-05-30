export function formatTime(seconds) {
  if (seconds <= 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours > 0 ? `${hours}小时 ` : ''}${minutes > 0 ? `${minutes}分钟 ` : ''}${seconds % 60}秒`;
}

export function numToWeek(value) {
  switch (value && parseInt(value, 10)) {
    case 1:
      return '周一';
    case 2:
      return '周二';
    case 3:
      return '周三';
    case 4:
      return '周四';
    case 5:
      return '周五';
    case 6:
      return '周六';
    case 7:
      return '周日';
    default:
      return '';
  }
}

export function sToTime(seconds) {
  if (seconds <= 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours > 0 ? `${hours < 9 ? '0' : ''}${hours}:` : ''}${minutes < 9 ? '0' : ''}${minutes}`;
}
