let lock = false;

export function throttle(callback, delay = 500, immediate = true) {
  if (lock) return;

  lock = true;

  if (immediate) {
    if (typeof callback === 'function') callback();
    setTimeout(() => {
      lock = false;
    }, delay);
    return;
  }

  setTimeout(() => {
    lock = false;
    if (typeof callback === 'function') callback();
  }, delay);
}

export default throttle;
