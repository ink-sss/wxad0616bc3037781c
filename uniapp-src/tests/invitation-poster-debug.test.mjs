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

test("invitation poster re-entry validates exported caches and does not wait for stale page tasks", async () => {
  const page = await readSource("src/pagesPlus/main/invitation/index.vue");
  const poster = await readSource("src/pagesPlus/main/invitation/poster.js");

  assert.match(page, /const posterPageInstanceId = `invitation-\$\{Date\.now\(\)\}-/);
  assert.match(page, /promiseScope:\s*posterPageInstanceId/);
  assert.match(page, /posterImageSrc\.value = await getCachedPosterFile/);
  assert.match(page, /shareImageSrc\.value = await getCachedShareFile/);
  assert.match(page, /const cachedPoster = await getCachedPosterFile/);
  assert.match(page, /const cachedShare = await getCachedShareFile/);
  assert.match(page, /async function getCachedPosterFile/);
  assert.match(page, /setInvitationPosterFileCache\(cacheKey, readyFile\)/);
  assert.match(page, /async function getCachedShareFile/);
  assert.match(page, /setInvitationShareFileCache\(cacheKey, readyFile\)/);
  assert.doesNotMatch(page, /if \(shareReadyMap\.value\[templateId\]\) \{\s*shareImageSrc\.value = shareReadyMap\.value\[templateId\];/);

  assert.match(poster, /const FILE_CACHE_VALIDATE_TIMEOUT = 800;/);
  assert.match(poster, /export async function getUsableInvitationPosterFileCache/);
  assert.match(poster, /export async function getUsableInvitationShareFileCache/);
  assert.match(poster, /export async function resolveInvitationPosterFileCache\(cacheKey, createFile, options = \{\}\)/);
  assert.match(poster, /const promiseScope = getPosterFilePromiseScope\(options\);/);
  assert.match(poster, /canSharePosterFilePromise\(entry, promiseScope\)/);
  assert.match(poster, /poster_file_promise_scope_mismatch/);
  assert.match(poster, /poster_file_promise_stale_result/);
  assert.match(poster, /posterFilePromiseCache\.set\(key, \{ promise, scope: promiseScope \}\);/);
  assert.match(poster, /function shouldValidateLocalFile\(filePath\)/);
  assert.match(poster, /manager\.access\(\{\s*path: value,/s);
  assert.match(poster, /cached_file_validate_fail/);
  assert.match(poster, /cached_file_unusable/);
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
  assert.match(page, /const miniProgramQrCodeSrcCache = new Map\(\);/);
  assert.match(page, /mini_program_qrcode_temp_file_cache_hit/);
  assert.match(page, /`invitation-qrcode-\$\{hashText\(image\)\}\.png`/);
  assert.match(page, /function hashText\(value\)/);
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
  assert.match(resetRuntimeCache, /imagePathCount:\s*imagePathCache\.size/);
  assert.match(resetRuntimeCache, /avatarCanvasCount:\s*avatarCanvasCache\.size/);
  assert.doesNotMatch(resetRuntimeCache, /imagePathCache\.clear\(\)/);
  assert.doesNotMatch(resetRuntimeCache, /avatarCanvasCache\.clear\(\)/);
  assert.doesNotMatch(resetRuntimeCache, /avatarTempFileCache\.clear\(\)/);
  assert.doesNotMatch(resetRuntimeCache, /qrcodeCanvasCache\.clear\(\)/);
  assert.match(poster, /mode:\s*"packaged-cache"/);
  assert.match(poster, /function deleteImagePathCache\(src/);
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
