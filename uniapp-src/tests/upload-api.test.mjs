import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadUploadModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "upload-api-"));
  const sourcePath = join(root, "src/api/upload.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { h5Post, normalizeH5AssetUrl } from './h5.js'",
      "const h5Post = globalThis.__h5Post; const normalizeH5AssetUrl = (url = '') => /^https?:\\/\\//.test(url) ? url : `https://man.lqjy.cc${url.startsWith('/') ? url : `/${url}`}`;",
    )
    .replace(
      "import { putFileToPresignedUrl } from '../platform/weixin/file.js'",
      "const putFileToPresignedUrl = globalThis.__putFileToPresignedUrl;",
    );
  const modulePath = join(tempDir, "upload.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

test("business uploads use complaint getUploadUrl and return legacy file_path", async () => {
  const h5Calls = [];
  const putCalls = [];
  globalThis.__h5Post = async (url, data) => {
    h5Calls.push({ url, data });
    return {
      uploadUrl: "https://oss.example.test/presigned",
      fileUrl: "/uploads/avatar.jpg",
      extra: "kept",
    };
  };
  globalThis.__putFileToPresignedUrl = async (...args) => {
    putCalls.push(args);
    return { statusCode: 200 };
  };

  const { uploadFileWithComplaintUploadUrl } = await loadUploadModule();
  const uploaded = await uploadFileWithComplaintUploadUrl({
    filePath: "/tmp/avatar.jpg",
    fileType: "image",
    data: { orderId: 123 },
  });

  assert.equal(h5Calls.length, 1);
  assert.equal(h5Calls[0].url, "/h5/complaint/getUploadUrl");
  assert.equal(h5Calls[0].data.orderId, 123);
  assert.equal(h5Calls[0].data.filename, "avatar.jpg");
  assert.equal(h5Calls[0].data.contentType, "image/jpeg");
  assert.equal(putCalls.length, 1);
  assert.equal(putCalls[0][0], "https://oss.example.test/presigned");
  assert.equal(putCalls[0][1], "/tmp/avatar.jpg");
  assert.equal(uploaded.url, "https://man.lqjy.cc/uploads/avatar.jpg");
  assert.equal(uploaded.file_path, "https://man.lqjy.cc/uploads/avatar.jpg");
  assert.equal(uploaded.filePath, "https://man.lqjy.cc/uploads/avatar.jpg");
  assert.equal(uploaded.rawUrl, "/uploads/avatar.jpg");
  assert.equal(uploaded.extra, "kept");
});
