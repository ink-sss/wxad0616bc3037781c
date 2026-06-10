import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readSource(path) {
  return readFile(join(root, path), "utf8");
}

test("invitation debug panel stays enabled and reports QR-code source", async () => {
  const debug = await readSource("src/pagesPlus/main/invitation/debug.js");
  const page = await readSource("src/pagesPlus/main/invitation/index.vue");

  assert.match(debug, /const debugVisible = ref\(true\);/);
  assert.match(debug, /always-on-invitation-debug/);
  assert.match(debug, /qrcodeSource:\s*qrcodeSource\?\.value/);
  assert.match(debug, /qrcodeFallbackReason:\s*qrcodeFallbackReason\?\.value/);
  assert.match(debug, /qrcodeFieldSource:\s*qrcodeFieldSource\?\.value/);
  assert.match(debug, /ordinaryQrCodeCandidateSource:\s*ordinaryQrCodeCandidateSource\?\.value/);
  assert.match(debug, /hasPreloadPromise:/);

  assert.match(page, /<text class="inv-debug-line">二维码: \{\{ qrcodeStatusText \}\}<\/text>/);
  assert.match(page, /function getMiniProgramQrCodeField\(data = \{\}\)/);
  assert.match(page, /function getOrdinaryQrCodeCandidateField\(data = \{\}\)/);
  assert.match(page, /data\.miniProgramQrCodeSource/);
  assert.match(page, /data\.ordinaryQrCodeCandidateSource/);
  assert.match(page, /getOrdinaryQrCodeFallbackReason\(\)/);
  assert.match(page, /qrcodeImageSource:\s*posterPayload\.qrcodeImageSource/);
});

test("invitation poster preload is delayed and cancelled around template clicks", async () => {
  const page = await readSource("src/pagesPlus/main/invitation/index.vue");

  assert.match(page, /const POSTER_PRELOAD_DELAY_MS = 1200;/);
  assert.match(page, /function schedulePosterPreloadQueue\(reason\)/);
  assert.match(page, /poster_preload_scheduled/);
  assert.match(page, /function cancelPosterPreload\(reason\)/);
  assert.match(page, /poster_preload_cancel_requested/);
  assert.match(page, /poster_preload_step_wait/);

  const selectTemplate = page.match(/async function selectTemplate\(idx\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(selectTemplate, /cancelPosterPreload\("template_select"\);/);
  assert.match(selectTemplate, /await renderPoster\(\);/);
  assert.match(selectTemplate, /schedulePosterPreloadQueue\("template_select_done"\);/);
});

test("invitation poster reuses mini-program QR temp file and skips packaged-image direct timeout", async () => {
  const sharePopup = await readSource("src/components/share-popup.vue");
  const page = await readSource("src/pagesPlus/main/invitation/index.vue");
  const poster = await readSource("src/pagesPlus/main/invitation/poster.js");

  assert.match(sharePopup, /function getMiniProgramQrCodeField\(data = \{\}\)/);
  assert.match(sharePopup, /function getOrdinaryQrCodeCandidateField\(data = \{\}\)/);
  assert.match(sharePopup, /miniProgramQrCodeFilePath:\s*loadedMiniProgramQrCodeFilePath\.value/);
  assert.match(sharePopup, /miniProgramQrCodeSource:\s*loadedMiniProgramQrCodeSource\.value/);
  assert.match(sharePopup, /ordinaryQrCodeCandidateSource:\s*loadedOrdinaryQrCodeCandidateSource\.value/);
  assert.match(page, /miniProgramQrCodeFilePath:\s*data\.miniProgramQrCodeFilePath \|\| ""/);
  assert.match(page, /resolveMiniProgramQrCodeSrc\(\s*payload\.value\.miniProgramQrCode,\s*payload\.value\.miniProgramQrCodeFilePath/s);
  assert.match(page, /source:\s*"payload-file-path"/);

  assert.match(poster, /if \(isPackagedImagePath\(src\)\) \{/);
  assert.match(poster, /const PACKAGED_IMAGE_LOAD_TIMEOUT = 1200;/);
  assert.match(poster, /function loadPackagedCanvasImage\(canvas, src/);
  assert.match(poster, /mode:\s*"packaged-direct"/);
  assert.match(poster, /function isPackagedImagePath\(src\)/);
  assert.match(poster, /function getPackagedImageCandidates\(src\)/);
});

test("explicit mini-program QR image cannot silently fall back to ordinary QR matrix", async () => {
  const page = await readSource("src/pagesPlus/main/invitation/index.vue");
  const poster = await readSource("src/pagesPlus/main/invitation/poster.js");

  assert.match(page, /const INVITATION_POSTER_CACHE_VERSION = "qrcode-image-required-v3";/);
  assert.match(page, /const qrcodeImageCandidates = \[/);
  assert.match(page, /\n\s+qrcodeImageCandidates,\n/);
  assert.match(page, /miniProgramQrCodeSrc\.value,/);
  assert.match(page, /payload\.value\.miniProgramQrCode,/);

  const cacheKeyStart = page.indexOf("function buildRenderCacheKey");
  const cacheKeyEnd = page.indexOf("function normalizeNavDomain", cacheKeyStart);
  const cacheKeyFn = cacheKeyStart >= 0 && cacheKeyEnd > cacheKeyStart ? page.slice(cacheKeyStart, cacheKeyEnd) : "";
  assert.doesNotMatch(cacheKeyFn, /miniProgramQrCodeFilePath/);
  assert.doesNotMatch(cacheKeyFn, /miniProgramQrCodeSrc/);

  assert.match(poster, /const qrcodeCanvasCache = new Map\(\);/);
  const resetRuntimeCache = poster.match(/export function resetInvitationPosterRuntimeCache\(\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(resetRuntimeCache, /qrcodeCanvasCount:\s*qrcodeCanvasCache\.size/);
  assert.doesNotMatch(resetRuntimeCache, /qrcodeCanvasCache\.clear\(\)/);
  assert.match(poster, /function normalizeQrcodeImageSources\(imageSrc\)/);
  assert.match(poster, /async function getCachedQrcodeCanvas\(src/);
  assert.match(poster, /async function cacheQrcodeCanvas\(src, image/);
  assert.match(poster, /function cacheQrcodeCanvasAliases\(sources, qrcodeCanvas/);
  assert.match(poster, /qrcode_image_required_fail/);
  assert.match(poster, /throw new Error\("邀请函小程序码加载失败"\);/);

  const start = poster.indexOf("async function drawQrcodeImageOrMatrix");
  const end = poster.indexOf("function drawQrcodeImage", start);
  const drawQrcode = start >= 0 && end > start ? poster.slice(start, end) : "";
  assert.doesNotMatch(drawQrcode, /emitPosterEvent\(options, "qrcode_image_draw_fail"[\s\S]*?drawQrMatrix/);
});
