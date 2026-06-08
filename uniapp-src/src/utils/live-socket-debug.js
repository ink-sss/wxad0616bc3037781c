const DEBUG_KEY = "__liveSocketDebug";
const DEFAULT_LIMIT = 60;

function nowIso() {
  try {
    return new Date().toISOString();
  } catch (_) {
    return "";
  }
}

function getStack() {
  try {
    return String(new Error().stack || "")
      .split("\n")
      .slice(2, 10)
      .join("\n");
  } catch (_) {
    return "";
  }
}

function maskUrl(url = "") {
  return String(url || "").replace(
    /([?&](?:auth_key|txSecret|txTime|sign|signature|token|key)=)[^&]+/ig,
    "$1***",
  );
}

function getStore() {
  const root = typeof globalThis !== "undefined"
    ? globalThis
    : (typeof wx !== "undefined" ? wx : {});
  if (!root[DEBUG_KEY]) {
    root[DEBUG_KEY] = {
      enabled: false,
      installed: false,
      nextTaskId: 1,
      events: [],
      originals: [],
    };
  }
  return root[DEBUG_KEY];
}

function pushEvent(event = {}) {
  const store = getStore();
  if (!store.enabled) return;
  const item = {
    at: nowIso(),
    ...event,
  };
  store.events.push(item);
  if (store.events.length > DEFAULT_LIMIT) {
    store.events.splice(0, store.events.length - DEFAULT_LIMIT);
  }
}

function wrapSocketTask(task, source = "uni", url = "") {
  if (!task || task.__liveSocketDebugWrapped || typeof task.close !== "function") return task;
  const store = getStore();
  const taskId = store.nextTaskId;
  store.nextTaskId += 1;
  try {
    task.__liveSocketDebugWrapped = true;
    task.__liveSocketDebugId = taskId;
  } catch (_) {}
  const rawClose = task.close;
  let openSeen = false;
  let closeSeen = false;
  let errorSeen = false;

  const bind = (onName, offName, handler) => {
    try {
      if (typeof task[onName] !== "function") return;
      task[onName](handler);
      store.originals.push(() => {
        try {
          task[offName]?.(handler);
        } catch (_) {}
      });
    } catch (_) {}
  };

  bind("onOpen", "offSocketOpen", () => {
    openSeen = true;
    pushEvent({ event: "socket_open", taskId, source, url: maskUrl(url) });
  });
  bind("onClose", "offSocketClose", (detail) => {
    closeSeen = true;
    pushEvent({ event: "socket_close_event", taskId, source, detail });
  });
  bind("onError", "offSocketError", (detail) => {
    errorSeen = true;
    pushEvent({ event: "socket_error_event", taskId, source, detail });
  });

  const closeWithDebug = function closeWithDebug(options = {}) {
    pushEvent({
      event: "socket_close_call",
      taskId,
      source,
      url: maskUrl(url),
      openSeen,
      closeSeen,
      errorSeen,
      hasFail: typeof options?.fail === "function",
      stack: getStack(),
    });
    const nextOptions = {
      ...(options || {}),
      success(res) {
        pushEvent({ event: "socket_close_success", taskId, source, detail: res || {} });
        options?.success?.(res);
      },
      fail(error) {
        pushEvent({ event: "socket_close_fail", taskId, source, detail: error || {} });
        options?.fail?.(error);
      },
    };
    try {
      return rawClose.call(this, nextOptions);
    } catch (error) {
      pushEvent({ event: "socket_close_throw", taskId, source, detail: error?.errMsg || error?.message || String(error || "") });
      throw error;
    }
  };
  try {
    task.close = closeWithDebug;
  } catch (_) {
    return task;
  }
  pushEvent({ event: "socket_task_wrapped", taskId, source, url: maskUrl(url) });
  return task;
}

function patchConnectSocket(target, source) {
  if (!target || typeof target.connectSocket !== "function" || target.connectSocket.__liveSocketDebugPatched) {
    return false;
  }
  const rawConnectSocket = target.connectSocket;
  target.connectSocket = function connectSocketWithDebug(options = {}) {
    pushEvent({
      event: "connect_socket_call",
      source,
      url: maskUrl(options?.url || ""),
      stack: getStack(),
    });
    const task = rawConnectSocket.call(this, options);
    return wrapSocketTask(task, source, options?.url || "");
  };
  target.connectSocket.__liveSocketDebugPatched = true;
  getStore().originals.push(() => {
    try {
      target.connectSocket = rawConnectSocket;
    } catch (_) {}
  });
  return true;
}

export function installLiveSocketDebug(enabled = false) {
  const store = getStore();
  store.enabled = enabled === true;
  if (store.installed) return;
  const patchedUni = patchConnectSocket(typeof uni !== "undefined" ? uni : null, "uni");
  const patchedWx = patchConnectSocket(typeof wx !== "undefined" ? wx : null, "wx");
  store.installed = patchedUni || patchedWx;
  if (store.installed) {
    pushEvent({ event: "socket_debug_installed" });
  }
}

export function setLiveSocketDebugEnabled(enabled = false) {
  const store = getStore();
  store.enabled = enabled === true;
}

export function getLiveSocketDebugSnapshot() {
  const store = getStore();
  return {
    enabled: !!store.enabled,
    installed: !!store.installed,
    nextTaskId: Number(store.nextTaskId || 0),
    events: store.events.slice(),
  };
}

installLiveSocketDebug(false);
