export class OnFire {
  constructor() {
    this.es = {};
    this.emit = this.fire;
  }

  on(eventName, callback, once = false) {
    if (!this.es[eventName]) this.es[eventName] = [];
    this.es[eventName].push({ cb: callback, once });
  }

  once(eventName, callback) {
    this.on(eventName, callback, true);
  }

  fire(eventName, ...args) {
    const listeners = this.es[eventName] || [];

    for (let index = 0; index < listeners.length; index += 1) {
      const listener = listeners[index];
      listener.cb.apply(this, args);

      if (listener.once) {
        listeners.splice(index, 1);
        index -= 1;
      }
    }
  }

  off(eventName, callback) {
    if (eventName === undefined) {
      this.es = {};
      return;
    }

    if (callback === undefined) {
      delete this.es[eventName];
      return;
    }

    const listeners = this.es[eventName] || [];
    for (let index = 0; index < listeners.length; index += 1) {
      if (listeners[index].cb === callback) {
        listeners.splice(index, 1);
        index -= 1;
      }
    }
  }
}

OnFire.ver = '2.0.0';

export default OnFire;
