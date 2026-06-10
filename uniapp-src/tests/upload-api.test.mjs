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

async function loadRefundModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "refund-api-"));
  const sourcePath = join(root, "src/api/refund.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace(
      "import { h5Get, h5Post } from './h5.js'",
      "const h5Get = globalThis.__h5Get; const h5Post = globalThis.__h5Post;",
    )
    .replace(
      "import { uploadFileWithComplaintUploadUrl } from './upload.js'",
      "const uploadFileWithComplaintUploadUrl = globalThis.__uploadFileWithComplaintUploadUrl;",
    );
  const modulePath = join(tempDir, "refund.mjs");
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
    data: { orderId: 123, liveRoomId: 88 },
  });

  assert.equal(h5Calls.length, 1);
  assert.equal(h5Calls[0].url, "/h5/complaint/getUploadUrl");
  assert.equal(h5Calls[0].data.orderId, 123);
  assert.equal(h5Calls[0].data.RoomId, 88);
  assert.equal(h5Calls[0].data.roomId, 88);
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

test("business uploads use H5 blob PUT without platform upload fallback", async () => {
  const originalXmlHttpRequest = globalThis.XMLHttpRequest;
  const h5Calls = [];
  const putCalls = [];
  const uploadFileFallbackCalls = [];
  globalThis.__h5Post = async (url, data) => {
    h5Calls.push({ url, data });
    return {
      uploadUrl: "https://oss.example.test/presigned",
      fileUrl: "/uploads/refund.jpg",
    };
  };
  globalThis.__putFileToPresignedUrl = async (...args) => {
    uploadFileFallbackCalls.push(args);
    return { statusCode: 200 };
  };
  globalThis.XMLHttpRequest = class {
    open(method, url) {
      this.method = method;
      this.url = url;
    }
    setRequestHeader(key, value) {
      this.headers = { ...(this.headers || {}), [key]: value };
    }
    send(file) {
      putCalls.push({
        method: this.method,
        url: this.url,
        headers: this.headers,
        file,
      });
      this.status = 200;
      this.readyState = 4;
      this.onload?.();
    }
  };

  try {
    const { uploadFileWithComplaintUploadUrl } = await loadUploadModule();
    const file = new Blob(["fake-image"], { type: "image/jpeg" });
    const uploaded = await uploadFileWithComplaintUploadUrl({
      filePath: "blob:http://localhost/fake",
      file,
      fileName: "refund.jpg",
      contentType: "image/jpeg",
      fileType: "image",
      data: { orderId: 123, roomId: 88 },
    });

    assert.equal(h5Calls.length, 1);
    assert.equal(putCalls.length, 1);
    assert.equal(putCalls[0].method, "PUT");
    assert.equal(putCalls[0].headers["Content-Type"], "image/jpeg");
    assert.equal(putCalls[0].file, file);
    assert.equal(uploadFileFallbackCalls.length, 0);
    assert.equal(uploaded.rawUrl, "/uploads/refund.jpg");
  } finally {
    globalThis.XMLHttpRequest = originalXmlHttpRequest;
  }
});

test("business uploads read H5 blob filePath when tempFiles lacks File object", async () => {
  const originalFetch = globalThis.fetch;
  const originalXmlHttpRequest = globalThis.XMLHttpRequest;
  const putCalls = [];
  const uploadFileFallbackCalls = [];
  globalThis.__h5Post = async () => ({
    uploadUrl: "https://oss.example.test/presigned",
    fileUrl: "/uploads/refund.jpg",
  });
  globalThis.__putFileToPresignedUrl = async (...args) => {
    uploadFileFallbackCalls.push(args);
    return { statusCode: 200 };
  };
  const file = new Blob(["fake-image"], { type: "image/jpeg" });
  globalThis.fetch = async (url) => {
    assert.equal(url, "blob:http://localhost/fake");
    return {
      ok: true,
      blob: async () => file,
    };
  };
  globalThis.XMLHttpRequest = class {
    open(method, url) {
      this.method = method;
      this.url = url;
    }
    setRequestHeader(key, value) {
      this.headers = { ...(this.headers || {}), [key]: value };
    }
    send(body) {
      putCalls.push({ method: this.method, url: this.url, headers: this.headers, body });
      this.status = 200;
      this.readyState = 4;
      this.onload?.();
    }
  };

  try {
    const { uploadFileWithComplaintUploadUrl } = await loadUploadModule();
    await uploadFileWithComplaintUploadUrl({
      filePath: "blob:http://localhost/fake",
      fileName: "refund.jpg",
      contentType: "image/jpeg",
      data: { orderId: 123, roomId: 88 },
    });

    assert.equal(putCalls.length, 1);
    assert.equal(putCalls[0].body, file);
    assert.equal(uploadFileFallbackCalls.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.XMLHttpRequest = originalXmlHttpRequest;
  }
});

test("refund voucher upload forwards roomId into unified upload metadata", async () => {
  const uploadCalls = [];
  globalThis.__h5Get = async () => ({});
  globalThis.__h5Post = async () => ({});
  globalThis.__uploadFileWithComplaintUploadUrl = async (payload) => {
    uploadCalls.push(payload);
    return { url: "https://man.lqjy.cc/uploads/refund.jpg", rawUrl: "/uploads/refund.jpg" };
  };

  const { uploadRefundImage } = await loadRefundModule();
  const uploaded = await uploadRefundImage({
    orderId: 123,
    roomId: 88,
    filePath: "/tmp/refund.jpg",
    fileName: "refund.jpg",
    contentType: "image/jpeg",
  });

  assert.equal(uploadCalls.length, 1);
  assert.equal(uploadCalls[0].data.orderId, 123);
  assert.equal(uploadCalls[0].data.roomId, 88);
  assert.equal(uploaded.rawUrl, "/uploads/refund.jpg");
});

test("refund voucher upload rejects missing roomId before requesting upload URL", async () => {
  const uploadCalls = [];
  globalThis.__h5Get = async () => ({});
  globalThis.__h5Post = async () => ({});
  globalThis.__uploadFileWithComplaintUploadUrl = async (payload) => {
    uploadCalls.push(payload);
    return { url: "" };
  };

  const { uploadRefundImage } = await loadRefundModule();
  await assert.rejects(
    () => uploadRefundImage({
      orderId: 123,
      filePath: "/tmp/refund.jpg",
      fileName: "refund.jpg",
      contentType: "image/jpeg",
    }),
    /直播间信息异常/,
  );
  assert.equal(uploadCalls.length, 0);
});
