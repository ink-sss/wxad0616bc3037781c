import { downloadFile, normalizeBase64ImageDataUrl, writeBase64ImageToTempFile } from "@/platform/weixin/file";
import { getWeixinApi, promisifyApi, unsupportedError } from "@/platform/weixin/runtime";
import { createQrMatrix } from "@/utils/qrcode-matrix.js";

const DEFAULT_WIDTH = 750;
const SHARE_CARD_WIDTH = 500;
const SHARE_CARD_HEIGHT = 400;
const CANVAS_IMAGE_LOAD_TIMEOUT = 5000;
const AVATAR_IMAGE_LOAD_TIMEOUT = 2500;
const AVATAR_CACHE_SIZE = 320;
const CANVAS_API_TIMEOUT = 3000;
const imagePathCache = new Map();
const avatarCanvasCache = new Map();
const avatarTempFileCache = new Map();
const posterFileCache = new Map();
const shareFileCache = new Map();
const posterFilePromiseCache = new Map();
const canvasImageCache = new WeakMap();
let posterFileQueuePromise = Promise.resolve();

export function resetInvitationPosterRuntimeCache() {
  const snapshot = {
    imagePathCount: imagePathCache.size,
    avatarCanvasCount: avatarCanvasCache.size,
    avatarTempFileCount: avatarTempFileCache.size,
    posterFileCount: posterFileCache.size,
    shareFileCount: shareFileCache.size,
    posterFilePromiseCount: posterFilePromiseCache.size,
  };
  imagePathCache.clear();
  avatarCanvasCache.clear();
  avatarTempFileCache.clear();
  return snapshot;
}

export function getInvitationPosterFileCache(cacheKey) {
  return posterFileCache.get(String(cacheKey || "")) || "";
}

export function setInvitationPosterFileCache(cacheKey, filePath) {
  const key = String(cacheKey || "");
  if (!key || !filePath) return "";
  posterFileCache.set(key, filePath);
  return filePath;
}

export async function resolveInvitationPosterFileCache(cacheKey, createFile) {
  const key = String(cacheKey || "");
  if (!key || typeof createFile !== "function") {
    return { filePath: "", cached: false, shared: false };
  }
  const cached = getInvitationPosterFileCache(key);
  if (cached) {
    return { filePath: cached, cached: true, shared: false };
  }
  if (posterFilePromiseCache.has(key)) {
    const filePath = await posterFilePromiseCache.get(key);
    return { filePath, cached: false, shared: true };
  }
  const promise = posterFileQueuePromise
    .catch(() => {})
    .then(() => getInvitationPosterFileCache(key) || createFile())
    .then((filePath) => {
      if (filePath) {
        posterFileCache.set(key, filePath);
      }
      return filePath || "";
    })
    .finally(() => {
      posterFilePromiseCache.delete(key);
    });
  posterFilePromiseCache.set(key, promise);
  posterFileQueuePromise = promise.catch(() => {});
  const filePath = await promise;
  return { filePath, cached: false, shared: false };
}

export function getInvitationShareFileCache(cacheKey) {
  return shareFileCache.get(String(cacheKey || "")) || "";
}

export function setInvitationShareFileCache(cacheKey, filePath) {
  const key = String(cacheKey || "");
  if (!key || !filePath) return "";
  shareFileCache.set(key, filePath);
  return filePath;
}

export async function createInvitationPosterTempFile(template, payload = {}, options = {}) {
  if (!template?.bgImg) {
    throw new Error("邀请函模板为空");
  }

  emitPosterEvent(options, "poster_canvas_start", {
    templateId: template.id || "",
    hasAvatar: !!payload.anchorAvatar,
    hasQrcodeText: !!payload.qrcodeText,
    hasQrcodeImage: !!payload.qrcodeImage,
  });
  const canvas = createCanvas(template);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const hasBackground = await drawTemplateBackground(canvas, ctx, template.bgImg, width, height, options);
  if (!hasBackground) {
    emitPosterEvent(options, "poster_background_required_fail", {
      templateId: template.id || "",
      hasSrc: !!template.bgImg,
    });
    throw new Error("邀请函模板背景加载失败");
  }
  await drawSlots(canvas, ctx, width, height, template.slots || {}, payload, options);

  const filePath = await canvasToTempFilePath(canvas);
  emitPosterEvent(options, "poster_temp_file_success", { filePath, width, height });
  return filePath;
}

export async function createInvitationShareCardTempFile(template, payload = {}, options = {}) {
  emitPosterEvent(options, "share_card_canvas_start", {
    templateId: template?.id || "",
    hasAvatar: !!payload.anchorAvatar,
    hasQrcodeText: !!payload.qrcodeText,
    hasQrcodeImage: !!payload.qrcodeImage,
  });
  const canvas = createFixedCanvas(SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  const ctx = canvas.getContext("2d");
  await drawShareCard(canvas, ctx, template, payload, options);
  const filePath = await canvasToTempFilePath(canvas);
  emitPosterEvent(options, "share_card_temp_file_success", {
    filePath,
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
  });
  return filePath;
}

function createCanvas(template) {
  const width = DEFAULT_WIDTH;
  const aspectRatio = Number(template.aspectRatio || DEFAULT_WIDTH / 1334);
  const height = Math.round(width / aspectRatio);
  return createFixedCanvas(width, height);
}

function createFixedCanvas(width, height) {
  const api = getWeixinApi("createOffscreenCanvas");
  if (!api || typeof api.createOffscreenCanvas !== "function") {
    throw unsupportedError("createOffscreenCanvas");
  }
  return api.createOffscreenCanvas({ type: "2d", width, height });
}

async function drawShareCard(canvas, ctx, template, payload, options = {}) {
  const width = SHARE_CARD_WIDTH;
  const height = SHARE_CARD_HEIGHT;
  drawShareCardBase(ctx, width, height);
  const background = await loadCanvasImage(canvas, template?.bgImg, options, "share_background", {
    timeoutMs: CANVAS_IMAGE_LOAD_TIMEOUT,
  });
  if (background) {
    ctx.save();
    ctx.globalAlpha = 0.52;
    ctx.drawImage(background, 0, 0, width, height);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(12, 0, 24, 0.58)";
  roundRect(ctx, 24, 24, width - 48, height - 48, 24);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("直播邀请函", 42, 52);

  ctx.font = "26px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText(truncate(payload.liveName || "精彩直播", 10), 42, 120);

  ctx.font = "22px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText(truncate(payload.displayTime || "敬请期待", 16), 42, 162);

  await drawShareAvatar(canvas, ctx, payload, options);

  const qrSize = 150;
  const qrX = width - qrSize - 48;
  const qrY = height - qrSize - 58;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 14);
  ctx.fill();
  await drawQrcodeImageOrMatrix(
    canvas,
    ctx,
    payload.qrcodeImage,
    payload.qrcodeText || payload.miniProgramPath || payload.link || "/pages/broadcast/entry",
    qrX,
    qrY,
    qrSize,
    options,
    "share_qrcode",
  );

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("扫码进入直播间", qrX + qrSize / 2, qrY + qrSize + 18);
  ctx.textAlign = "left";
}

function drawShareCardBase(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#12001f");
  gradient.addColorStop(1, "#31004d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255, 0, 212, 0.18)";
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.12, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(111, 0, 255, 0.22)";
  ctx.beginPath();
  ctx.arc(width * 0.16, height * 0.92, 140, 0, Math.PI * 2);
  ctx.fill();
}

async function drawShareAvatar(canvas, ctx, payload, options = {}) {
  const avatarSize = 82;
  const x = 42;
  const y = 222;
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  roundRect(ctx, x - 12, y - 12, 250, avatarSize + 24, 16);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const image = await loadCanvasImage(canvas, payload.anchorAvatar, options, "share_avatar", {
    preferDirect: true,
    timeoutMs: AVATAR_IMAGE_LOAD_TIMEOUT,
  });
  if (image) {
    ctx.drawImage(image, x, y, avatarSize, avatarSize);
    emitPosterEvent(options, "share_avatar_drawn", { loaded: true });
  } else {
    drawAvatarFallback(ctx, x, y, avatarSize, payload.inviterName);
    emitPosterEvent(options, "share_avatar_drawn", {
      loaded: false,
      hasSrc: !!payload.anchorAvatar,
    });
  }
  ctx.restore();

  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  ctx.fillText(truncate(payload.inviterName || "游客", 8), x + avatarSize + 18, y + 12);
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("邀请你一起看直播", x + avatarSize + 18, y + 48);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function drawTemplateBackground(canvas, ctx, src, width, height, options = {}) {
  const image = await loadCanvasImage(canvas, src, options, "poster_background", {
    timeoutMs: CANVAS_IMAGE_LOAD_TIMEOUT,
  });
  if (image) {
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }
  ctx.fillStyle = "#160026";
  ctx.fillRect(0, 0, width, height);
  emitPosterEvent(options, "poster_background_fallback", { hasSrc: !!src });
  return false;
}

async function drawSlots(canvas, ctx, width, height, slots, payload, options = {}) {
  drawTextSlot(ctx, width, height, slots.inviterName, payload.inviterName || "游客", 8);
  drawTextSlot(ctx, width, height, slots.liveName, payload.liveName || "精彩直播", 12);
  drawTextSlot(ctx, width, height, slots.time, payload.displayTime || "敬请期待", 18);
  await drawAvatarSlot(canvas, ctx, width, height, slots.avatar, payload.anchorAvatar, payload.inviterName, options);
  await drawQrcodeSlot(
    canvas,
    ctx,
    width,
    height,
    slots.qrcode,
    payload.qrcodeImage,
    payload.qrcodeText || payload.miniProgramPath || payload.link || "/pages/broadcast/entry",
    options,
  );
}

function drawTextSlot(ctx, width, height, slot, rawText, defaultMaxLen) {
  if (!slot) return;
  const fontSize = Math.round(height * Number(slot.fontPct || 0.02));
  ctx.fillStyle = slot.color || "#ffffff";
  ctx.font = `${slot.bold ? "bold " : ""}${fontSize}px sans-serif`;
  ctx.textBaseline = "middle";
  const text = truncate(rawText, Number(slot.maxLen || defaultMaxLen));
  if (slot.cx != null) {
    ctx.textAlign = "center";
    ctx.fillText(text, width * Number(slot.cx), height * Number(slot.cy || 0));
    return;
  }
  ctx.textAlign = "left";
  ctx.fillText(text, width * Number(slot.x || 0), height * Number(slot.y || 0));
}

async function drawAvatarSlot(canvas, ctx, width, height, slot, src, fallbackText, options = {}) {
  if (!slot) {
    emitPosterEvent(options, "poster_avatar_skip", { hasSlot: !!slot, hasSrc: !!src });
    return;
  }
  const cx = width * Number(slot.cx || 0);
  const cy = height * Number(slot.cy || 0);
  const radius = width * Number(slot.r || 0);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const image = await loadCanvasImage(canvas, src, options, "poster_avatar", {
    preferDirect: true,
    timeoutMs: AVATAR_IMAGE_LOAD_TIMEOUT,
  });
  if (image) {
    ctx.drawImage(image, cx - radius, cy - radius, radius * 2, radius * 2);
    emitPosterEvent(options, "poster_avatar_drawn", { loaded: true });
  } else {
    drawAvatarFallback(ctx, cx - radius, cy - radius, radius * 2, fallbackText);
    emitPosterEvent(options, "poster_avatar_drawn", { loaded: false, hasSrc: !!src });
  }
  ctx.restore();
}

async function drawQrcodeSlot(canvas, ctx, width, height, slot, imageSrc, text, options = {}) {
  if (!slot || (!imageSrc && !text)) {
    emitPosterEvent(options, "poster_qrcode_skip", { hasSlot: !!slot, hasImage: !!imageSrc, hasText: !!text });
    return;
  }
  const size = Math.round(width * Number(slot.size || 0));
  const x = Math.round(width * Number(slot.cx || 0) - size / 2);
  const y = Math.round(height * Number(slot.cy || 0) - size / 2);
  await drawQrcodeImageOrMatrix(canvas, ctx, imageSrc, text, x, y, size, options, "poster_qrcode");
}

async function drawQrcodeImageOrMatrix(canvas, ctx, imageSrc, text, x, y, size, options = {}, label = "qrcode") {
  if (imageSrc) {
    emitPosterEvent(options, "qrcode_image_draw_start", {
      label,
      size,
      hasImage: true,
    });
    const image = await loadCanvasImage(canvas, imageSrc, options, label, {
      timeoutMs: CANVAS_IMAGE_LOAD_TIMEOUT,
    });
    if (image) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, size, size);
      ctx.drawImage(image, x, y, size, size);
      emitPosterEvent(options, "qrcode_image_draw_success", { label });
      return;
    }
    emitPosterEvent(options, "qrcode_image_draw_fail", { label });
  }
  drawQrMatrix(ctx, text, x, y, size, options, label);
}

function drawQrMatrix(ctx, text, x, y, size, options = {}, label = "qrcode") {
  emitPosterEvent(options, "qrcode_draw_start", {
    label,
    size,
    textLength: String(text || "").length,
  });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, size, size);
  let matrix = null;
  try {
    matrix = createQrMatrix(text);
  } catch (error) {
    emitPosterEvent(options, "qrcode_matrix_fail", {
      label,
      error: normalizePosterError(error),
    });
    ctx.fillStyle = "#222222";
    ctx.font = `${Math.max(14, Math.round(size * 0.09))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("扫码进入", x + size / 2, y + size / 2 - 10);
    ctx.fillText("直播间", x + size / 2, y + size / 2 + 16);
    ctx.textAlign = "left";
    return;
  }
  const margin = 1;
  const moduleCount = matrix.length + margin * 2;
  const cellSize = size / moduleCount;
  ctx.fillStyle = "#000000";
  matrix.forEach((row, rowIndex) => {
    row.forEach((dark, colIndex) => {
      if (!dark) return;
      ctx.fillRect(
        x + (colIndex + margin) * cellSize,
        y + (rowIndex + margin) * cellSize,
        Math.ceil(cellSize),
        Math.ceil(cellSize),
      );
    });
  });
  emitPosterEvent(options, "qrcode_draw_success", {
    label,
    modules: matrix.length,
  });
}

function truncate(text, maxLen) {
  const value = String(text || "");
  const max = Number(maxLen || 10);
  return value.length > max ? `${value.slice(0, Math.max(max - 1, 1))}...` : value;
}

async function loadCanvasImage(canvas, src, options = {}, label = "image", loadOptions = {}) {
  emitPosterEvent(options, "image_load_start", {
    label,
    hasSrc: !!src,
    src: summarizeImageSource(src),
  });
  if (!src) return null;
  if (loadOptions.preferDirect && isUnwhitelistedAvatarUrl(src)) {
    const cachedAvatarCanvas = await getCachedAvatarCanvas(src, options, label);
    if (cachedAvatarCanvas) {
      emitPosterEvent(options, "image_load_success", { label, mode: "avatar-canvas-cache" });
      return cachedAvatarCanvas;
    }
    const cachedAvatarPath = await getCachedAvatarTempFilePath(src, options, label);
    if (cachedAvatarPath) {
      const cachedAvatar = await createCanvasImage(canvas, cachedAvatarPath, options, label, "avatar-temp-cache", loadOptions);
      if (cachedAvatar) {
        emitPosterEvent(options, "image_load_success", { label, mode: "avatar-temp-cache" });
        return cachedAvatar;
      }
      avatarTempFileCache.delete(String(src || ""));
      emitPosterEvent(options, "image_load_fail", { label, mode: "avatar-temp-cache" });
    }
    const directAvatar = await createCanvasImage(canvas, src, options, label, "avatar-direct", loadOptions);
    if (directAvatar) {
      cacheAvatarCanvas(src, directAvatar, options, label);
      emitPosterEvent(options, "image_load_success", { label, mode: "avatar-direct" });
      return directAvatar;
    }
    const avatarPath = await resolveAvatarTempFilePath(src, options, label);
    if (!avatarPath) {
      emitPosterEvent(options, "image_load_skip_local_path", {
        label,
        reason: "unwhitelisted-avatar-url",
      });
      return null;
    }
    const avatarImage = await createCanvasImage(canvas, avatarPath, options, label, "avatar-temp-file", loadOptions);
    if (avatarImage) {
      emitPosterEvent(options, "image_load_success", { label, mode: "avatar-temp-file" });
      return avatarImage;
    }
    avatarTempFileCache.delete(String(src || ""));
    emitPosterEvent(options, "image_load_fail", { label, mode: "avatar-temp-file" });
    return null;
  }
  if (loadOptions.preferDirect) {
    const direct = await createCanvasImage(canvas, src, options, label, "direct-fast", loadOptions);
    if (direct) {
      emitPosterEvent(options, "image_load_success", { label, mode: "direct-fast" });
      return direct;
    }
    if (isUnwhitelistedAvatarUrl(src)) {
      emitPosterEvent(options, "image_load_skip_local_path", {
        label,
        reason: "unwhitelisted-avatar-url",
      });
      return null;
    }
  }
  if (/^data:image\//.test(String(src || ""))) {
    const localPath = await resolveBase64ImagePath(src, options, label);
    if (!localPath) {
      emitPosterEvent(options, "image_base64_path_empty", { label });
      return null;
    }
    const localImage = await createCanvasImage(canvas, localPath, options, label, "base64-temp", loadOptions);
    emitPosterEvent(options, localImage ? "image_load_success" : "image_load_fail", {
      label,
      mode: "base64-temp",
      localPath: summarizeImageSource(localPath),
    });
    return localImage;
  }
  if (/^https?:\/\//.test(String(src || ""))) {
    const localPath = await resolveLocalImagePath(src, options, label);
    if (!localPath) {
      emitPosterEvent(options, "image_local_path_empty", {
        label,
        reason: "empty-local-path",
      });
      return loadCanvasImageDirect(canvas, src, options, label, "remote-direct-fallback");
    }
    const localImage = await createCanvasImage(canvas, localPath, options, label, "local", loadOptions);
    emitPosterEvent(options, localImage ? "image_load_success" : "image_local_load_fail", {
      label,
      mode: "local",
      localPath: summarizeImageSource(localPath),
    });
    if (localImage) return localImage;
    return loadCanvasImageDirect(canvas, src, options, label, "remote-direct-fallback");
  }
  return loadCanvasImageDirect(canvas, src, options, label, "direct", loadOptions);
}

async function resolveBase64ImagePath(src, options = {}, label = "image") {
  const dataUrl = normalizeBase64ImageDataUrl(src);
  if (!dataUrl) return "";
  if (imagePathCache.has(dataUrl)) {
    const cached = imagePathCache.get(dataUrl);
    emitPosterEvent(options, "image_base64_path_cache_hit", {
      label,
      path: summarizeImageSource(cached),
    });
    return cached;
  }
  try {
    const filePath = await writeBase64ImageToTempFile(dataUrl, `poster-${label}-${Date.now()}.png`);
    imagePathCache.set(dataUrl, filePath);
    emitPosterEvent(options, "image_base64_path_success", {
      label,
      path: summarizeImageSource(filePath),
    });
    return filePath;
  } catch (error) {
    emitPosterEvent(options, "image_base64_path_fail", {
      label,
      error: normalizePosterError(error),
    });
    return "";
  }
}

async function getCachedAvatarCanvas(src, options = {}, label = "avatar") {
  const value = String(src || "");
  if (!value || !avatarCanvasCache.has(value)) return null;
  const cachedCanvas = await avatarCanvasCache.get(value);
  if (!cachedCanvas) {
    avatarCanvasCache.delete(value);
    emitPosterEvent(options, "avatar_canvas_cache_empty", { label });
    return null;
  }
  emitPosterEvent(options, "avatar_canvas_cache_hit", {
    label,
    width: cachedCanvas.width || 0,
    height: cachedCanvas.height || 0,
  });
  return cachedCanvas;
}

async function getCachedAvatarTempFilePath(src, options = {}, label = "avatar") {
  const value = String(src || "");
  if (!value || !avatarTempFileCache.has(value)) return "";
  const cachedPath = await avatarTempFileCache.get(value);
  if (!cachedPath) {
    avatarTempFileCache.delete(value);
    emitPosterEvent(options, "avatar_temp_file_cache_empty", { label });
    return "";
  }
  emitPosterEvent(options, "avatar_temp_file_cache_hit", {
    label,
    path: summarizeImageSource(cachedPath),
  });
  return cachedPath;
}

async function resolveAvatarTempFilePath(src, options = {}, label = "avatar") {
  const value = String(src || "");
  if (!value) return "";
  const cachedPath = await getCachedAvatarTempFilePath(value, options, label);
  if (cachedPath) return cachedPath;
  const promise = createAvatarTempFilePath(value, options, label).catch((error) => {
    avatarTempFileCache.delete(value);
    emitPosterEvent(options, "avatar_temp_file_fail", {
      label,
      error: normalizePosterError(error),
    });
    return "";
  });
  avatarTempFileCache.set(value, promise);
  const filePath = await promise;
  if (!filePath) {
    avatarTempFileCache.delete(value);
  }
  return filePath;
}

async function cacheAvatarCanvas(src, image, options = {}, label = "avatar") {
  const value = String(src || "");
  if (!value || !image || avatarCanvasCache.has(value)) return null;
  const promise = createAvatarCanvasFromImage(image, options, label).catch((error) => {
    avatarCanvasCache.delete(value);
    emitPosterEvent(options, "avatar_canvas_cache_fail", {
      label,
      error: normalizePosterError(error),
    });
    return null;
  });
  avatarCanvasCache.set(value, promise);
  const avatarCanvas = await promise;
  if (!avatarCanvas) {
    avatarCanvasCache.delete(value);
  }
  return avatarCanvas;
}

async function createAvatarTempFilePath(src, options = {}, label = "avatar") {
  emitPosterEvent(options, "avatar_temp_file_start", {
    label,
    src: summarizeImageSource(src),
  });
  const size = 180;
  const canvas = createFixedCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const image = await createCanvasImage(canvas, src, options, label, "avatar-direct-localize", {
    timeoutMs: AVATAR_IMAGE_LOAD_TIMEOUT,
  });
  if (!image) return "";
  ctx.drawImage(image, 0, 0, size, size);
  const filePath = await canvasToTempFilePath(canvas);
  emitPosterEvent(options, "avatar_temp_file_success", {
    label,
    filePath: summarizeImageSource(filePath),
  });
  return filePath;
}

async function createAvatarCanvasFromImage(image, options = {}, label = "avatar") {
  emitPosterEvent(options, "avatar_canvas_cache_start", { label });
  const size = AVATAR_CACHE_SIZE;
  const canvas = createFixedCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const imageWidth = Number(image.width || 0);
  const imageHeight = Number(image.height || 0);
  if (imageWidth > 0 && imageHeight > 0) {
    const side = Math.min(imageWidth, imageHeight);
    const sx = Math.max((imageWidth - side) / 2, 0);
    const sy = Math.max((imageHeight - side) / 2, 0);
    ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
  } else {
    ctx.drawImage(image, 0, 0, size, size);
  }
  emitPosterEvent(options, "avatar_canvas_cache_success", {
    label,
    width: canvas.width,
    height: canvas.height,
  });
  return canvas;
}

async function loadCanvasImageDirect(canvas, src, options = {}, label = "image", mode = "direct", loadOptions = {}) {
  const direct = await createCanvasImage(canvas, src, options, label, mode, loadOptions);
  if (direct) {
    emitPosterEvent(options, "image_load_success", { label, mode });
    return direct;
  }
  const localPath = await resolveLocalImagePath(src, options, label);
  if (!localPath || localPath === src) {
    emitPosterEvent(options, "image_load_fail", {
      label,
      reason: !localPath ? "empty-local-path" : "local-path-unchanged",
    });
    return null;
  }
  const localImage = await createCanvasImage(canvas, localPath, options, label, "local-fallback", loadOptions);
  emitPosterEvent(options, localImage ? "image_load_success" : "image_load_fail", {
    label,
    mode: "local-fallback",
    localPath: summarizeImageSource(localPath),
  });
  return localImage;
}

function createCanvasImage(canvas, src, options = {}, label = "image", mode = "direct", loadOptions = {}) {
  if (!src || !canvas || typeof canvas.createImage !== "function") {
    return Promise.resolve(null);
  }
  const cacheKey = String(src || "");
  const perCanvasCache = getCanvasImageCache(canvas);
  if (perCanvasCache.has(cacheKey)) {
    return Promise.resolve(perCanvasCache.get(cacheKey));
  }
  return new Promise((resolve) => {
    let settled = false;
    const image = canvas.createImage();
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (result) {
        perCanvasCache.set(cacheKey, result);
      } else {
        emitPosterEvent(options, "image_create_timeout_or_fail", { label, mode, timeoutMs });
      }
      resolve(result);
    };
    const timeoutMs = Number(loadOptions.timeoutMs || CANVAS_IMAGE_LOAD_TIMEOUT);
    const timer = setTimeout(() => finish(null), timeoutMs);
    image.onload = () => finish(image);
    image.onerror = () => finish(null);
    image.src = src;
  });
}

async function resolveLocalImagePath(src, options = {}, label = "image") {
  const value = String(src || "");
  if (imagePathCache.has(value)) {
    const cached = normalizePackagedImagePath(value, imagePathCache.get(value));
    imagePathCache.set(value, cached);
    emitPosterEvent(options, "image_local_path_cache_hit", {
      label,
      path: summarizeImageSource(cached),
    });
    return cached;
  }
  if (!/^https?:\/\//.test(value)) {
    const infoPath = await resolvePackagedImagePath(value, options, label);
    if (infoPath && infoPath !== value) {
      imagePathCache.set(value, infoPath);
      return infoPath;
    }
    return value;
  }
  try {
    const info = await withTimeout(
      promisifyApi("getImageInfo", { src: value }, { preferUni: true }),
      CANVAS_API_TIMEOUT,
      "getImageInfo timeout",
    );
    if (info?.path) {
      const infoPath = normalizePackagedImagePath(value, info.path);
      imagePathCache.set(value, infoPath);
      emitPosterEvent(options, "image_local_path_success", {
        label,
        mode: "getImageInfo",
        path: summarizeImageSource(infoPath),
      });
      return infoPath;
    }
  } catch (error) {
    emitPosterEvent(options, "image_get_info_fail", {
      label,
      error: normalizePosterError(error),
    });
  }
  try {
    const result = await withTimeout(downloadFile({ url: value }), CANVAS_API_TIMEOUT, "downloadFile timeout");
    if (!result?.statusCode || result.statusCode === 200) {
      imagePathCache.set(value, result.tempFilePath);
      emitPosterEvent(options, "image_local_path_success", {
        label,
        mode: "downloadFile",
        statusCode: result?.statusCode || "",
        path: summarizeImageSource(result?.tempFilePath),
      });
      return result.tempFilePath;
    }
    emitPosterEvent(options, "image_download_bad_status", {
      label,
      statusCode: result.statusCode,
    });
  } catch (error) {
    emitPosterEvent(options, "image_download_fail", {
      label,
      error: normalizePosterError(error),
    });
  }
  return "";
}

async function resolvePackagedImagePath(src, options = {}, label = "image") {
  if (!src || /^wxfile:\/\//.test(String(src))) return src;
  try {
    const info = await withTimeout(
      promisifyApi("getImageInfo", { src }, { preferUni: true }),
      CANVAS_API_TIMEOUT,
      "getImageInfo timeout",
    );
    if (info?.path) {
      const infoPath = normalizePackagedImagePath(src, info.path);
      emitPosterEvent(options, "image_local_path_success", {
        label,
        mode: "packaged-getImageInfo",
        path: summarizeImageSource(infoPath),
      });
      return infoPath;
    }
  } catch (error) {
    emitPosterEvent(options, "image_get_info_fail", {
      label,
      mode: "packaged-getImageInfo",
      error: normalizePosterError(error),
    });
  }
  return src;
}

function normalizePackagedImagePath(src, path) {
  const value = String(path || "");
  if (!value) return "";
  if (/^(?:https?:\/\/|wxfile:\/\/|data:|\/)/i.test(value)) return value;
  if (String(src || "").startsWith("/")) return `/${value}`;
  return value;
}

function canvasToTempFilePath(canvas) {
  if (canvas && typeof canvas.toTempFilePath === "function") {
    return withTimeout(
      new Promise((resolve, reject) => {
        canvas.toTempFilePath({
          fileType: "png",
          success: (result) => resolve(result.tempFilePath),
          fail: reject,
        });
      }),
      CANVAS_API_TIMEOUT,
      "canvas.toTempFilePath timeout",
    );
  }

  const api = getWeixinApi("canvasToTempFilePath");
  if (api && typeof api.canvasToTempFilePath === "function") {
    return withTimeout(
      new Promise((resolve, reject) => {
        api.canvasToTempFilePath({
          canvas,
          fileType: "png",
          success: (result) => resolve(result.tempFilePath),
          fail: reject,
        });
      }),
      CANVAS_API_TIMEOUT,
      "canvasToTempFilePath timeout",
    );
  }

  return Promise.reject(unsupportedError("canvas.toTempFilePath"));
}

function withTimeout(promise, timeoutMs, message) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      const error = new Error(message);
      error.code = "TIMEOUT";
      reject(error);
    }, timeoutMs);

    Promise.resolve(promise).then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function emitPosterEvent(options = {}, type, detail = {}) {
  if (typeof options.onEvent !== "function") return;
  try {
    options.onEvent(type, sanitizePosterDetail(detail));
  } catch (_) {}
}

function sanitizePosterDetail(value, depth = 0) {
  if (depth > 3) return "[MaxDepth]";
  if (value == null) return value;
  if (typeof value === "string") return value.length > 180 ? `${value.slice(0, 180)}...` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizePosterDetail(item, depth + 1));
  if (typeof value === "object") {
    return Object.keys(value).reduce((result, key) => {
      result[key] = sanitizePosterDetail(value[key], depth + 1);
      return result;
    }, {});
  }
  return String(value);
}

function normalizePosterError(error) {
  if (!error) return { message: "" };
  if (typeof error === "string") return { message: error };
  return {
    message: error.message || error.errMsg || String(error),
    code: error.code || error.errCode || "",
    apiName: error.apiName || "",
  };
}

function summarizeImageSource(src) {
  const value = String(src || "");
  if (!value) return "";
  if (/^data:/i.test(value)) return `[data-url:${value.length}]`;
  if (value.length <= 180) return value;
  return `${value.slice(0, 180)}...`;
}

function getCanvasImageCache(canvas) {
  let cache = canvasImageCache.get(canvas);
  if (!cache) {
    cache = new Map();
    canvasImageCache.set(canvas, cache);
  }
  return cache;
}

function isUnwhitelistedAvatarUrl(src) {
  const value = String(src || "");
  return /thirdwx\.qlogo\.cn|qlogo\.cn|wx\.qlogo\.cn/i.test(value);
}

function drawAvatarFallback(ctx, x, y, size, text) {
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, "#7A42FF");
  gradient.addColorStop(1, "#FF4FD8");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(size * 0.42)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(getAvatarInitial(text), x + size / 2, y + size / 2);
  ctx.textAlign = "left";
}

function getAvatarInitial(text) {
  const value = String(text || "").trim();
  if (!value) return "邀";
  return value.slice(0, 1).toUpperCase();
}
