"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_utils_liveSource = require("../utils/live-source.js");
const DEGRADE_COOLDOWN_MS = 3e4;
const UPGRADE_COOLDOWN_MS = 6e4;
const SWITCH_FAIL_COOLDOWN_MS = 6e4;
const STABLE_UPGRADE_MS = 6e4;
const UNKNOWN_TARGET_STABLE_UPGRADE_MS = 9e4;
function nowMs() {
  return Date.now();
}
const miniNetworkHint = common_vendor.ref({
  effectiveType: "",
  weak: false
});
function refreshNetworkHint() {
  if (typeof common_vendor.index.getNetworkType !== "function")
    return;
  common_vendor.index.getNetworkType({
    success(res) {
      const effectiveType = String((res == null ? void 0 : res.networkType) || "").toLowerCase();
      miniNetworkHint.value = {
        effectiveType,
        weak: effectiveType === "2g" || effectiveType === "3g" || effectiveType === "none"
      };
    }
  });
}
function getNetworkHint() {
  return miniNetworkHint.value;
}
function ewma(prev, next, weight = 0.35) {
  const value = Number(next || 0);
  if (!Number.isFinite(value) || value <= 0)
    return prev || 0;
  const old = Number(prev || 0);
  if (!Number.isFinite(old) || old <= 0)
    return value;
  return old * (1 - weight) + value * weight;
}
function summarizeSample(sample = {}) {
  return {
    throughputKbps: Math.round(Number(sample.throughputKbps || 0)),
    mediaBitrateKbps: Math.round(Number(sample.mediaBitrateKbps || 0)),
    bufferSeconds: Number(sample.bufferSeconds || 0),
    rebufferRatio: Number(sample.rebufferRatio || 0),
    waitingMs30s: Number(sample.waitingMs30s || 0),
    eventType: sample.eventType || "",
    activeType: sample.activeType || ""
  };
}
function useLiveAdaptiveQuality(options = {}) {
  refreshNetworkHint();
  const streams = common_vendor.ref([]);
  const currentQuality = common_vendor.ref("");
  const manualLocked = common_vendor.ref(false);
  const switching = common_vendor.ref(false);
  const lastReason = common_vendor.ref("");
  const lastSample = common_vendor.ref(null);
  const estimatedBitrateByQuality = common_vendor.ref({});
  let poorScore = 0;
  let stableSince = 0;
  let lastSwitchTs = 0;
  let previousBufferSeconds = 0;
  const failedAtByQuality = /* @__PURE__ */ new Map();
  const currentStream = common_vendor.computed(() => pages_broadcast_utils_liveSource.selectStreamByQuality(streams.value, currentQuality.value));
  const controls = common_vendor.computed(() => [
    { quality: "auto", label: "自动", active: !manualLocked.value, disabled: switching.value },
    ...streams.value.map((stream) => ({
      quality: stream.quality,
      label: stream.label,
      active: currentQuality.value === stream.quality,
      disabled: switching.value,
      bitrateKbps: stream.bitrateKbps || Math.round(estimatedBitrateByQuality.value[stream.quality] || 0)
    }))
  ]);
  const debugState = common_vendor.computed(() => {
    var _a;
    return {
      currentQuality: currentQuality.value || "",
      currentLabel: ((_a = currentStream.value) == null ? void 0 : _a.label) || "",
      mode: manualLocked.value ? "manual" : "auto",
      switching: switching.value,
      lastReason: lastReason.value,
      sample: lastSample.value,
      streams: streams.value.map((stream) => ({
        quality: stream.quality,
        label: stream.label,
        bitrateKbps: stream.bitrateKbps || Math.round(estimatedBitrateByQuality.value[stream.quality] || 0),
        isDefault: stream.isDefault
      }))
    };
  });
  function getPreferredQuality() {
    var _a;
    return currentQuality.value || ((_a = pages_broadcast_utils_liveSource.selectDefaultStream(streams.value)) == null ? void 0 : _a.quality) || "";
  }
  function chooseInitialStream(nextStreams) {
    const defaultStream = pages_broadcast_utils_liveSource.selectDefaultStream(nextStreams);
    if (!defaultStream)
      return null;
    const hint = getNetworkHint();
    if (!hint.weak || defaultStream.quality !== "origin")
      return defaultStream;
    return pages_broadcast_utils_liveSource.selectStreamByQuality(nextStreams, "sd") || pages_broadcast_utils_liveSource.selectStreamByQuality(nextStreams, "ld") || defaultStream;
  }
  function setPullStreams(payloadOrStreams = {}) {
    var _a;
    const normalized = Array.isArray(payloadOrStreams) ? pages_broadcast_utils_liveSource.normalizePullStreams({ pullStreams: payloadOrStreams }) : pages_broadcast_utils_liveSource.normalizePullStreams(payloadOrStreams);
    streams.value = normalized;
    if (!normalized.length) {
      currentQuality.value = "";
      return;
    }
    if (currentQuality.value && pages_broadcast_utils_liveSource.selectStreamByQuality(normalized, currentQuality.value))
      return;
    const initial = chooseInitialStream(normalized);
    currentQuality.value = (initial == null ? void 0 : initial.quality) || "";
    if (initial && initial.quality !== ((_a = pages_broadcast_utils_liveSource.selectDefaultStream(normalized)) == null ? void 0 : _a.quality)) {
      lastReason.value = "initial_weak_network_hint";
    }
  }
  function updateSignedStreams(payloadOrStreams = {}) {
    const normalized = Array.isArray(payloadOrStreams) ? pages_broadcast_utils_liveSource.normalizePullStreams({ pullStreams: payloadOrStreams }) : pages_broadcast_utils_liveSource.normalizePullStreams(payloadOrStreams);
    if (!normalized.length)
      return;
    const oldQuality = currentQuality.value;
    setPullStreams(normalized);
    if (oldQuality && pages_broadcast_utils_liveSource.selectStreamByQuality(streams.value, oldQuality)) {
      currentQuality.value = oldQuality;
    }
  }
  function getTargetBitrate(stream) {
    if (!stream)
      return 0;
    return Number(stream.bitrateKbps || estimatedBitrateByQuality.value[stream.quality] || 0);
  }
  function getLowerStream() {
    const index = streams.value.findIndex((stream) => stream.quality === currentQuality.value);
    if (index < 0)
      return null;
    return streams.value[index + 1] || null;
  }
  function getHigherStream() {
    const index = streams.value.findIndex((stream) => stream.quality === currentQuality.value);
    if (index <= 0)
      return null;
    return streams.value[index - 1] || null;
  }
  async function switchToStream(stream, reason, manual = false) {
    var _a, _b, _c;
    if (!stream || switching.value)
      return false;
    if (failedAtByQuality.has(stream.quality) && nowMs() - failedAtByQuality.get(stream.quality) < SWITCH_FAIL_COOLDOWN_MS) {
      return false;
    }
    if (stream.quality === currentQuality.value && !manual)
      return true;
    switching.value = true;
    lastReason.value = reason;
    try {
      const ok = await ((_a = options.switchStream) == null ? void 0 : _a.call(options, stream, reason));
      if (ok !== false) {
        currentQuality.value = stream.quality;
        lastSwitchTs = nowMs();
        poorScore = 0;
        stableSince = 0;
        if (manual)
          manualLocked.value = true;
        (_b = options.recordPlaybackDebugEvent) == null ? void 0 : _b.call(options, "live_quality_switch_success", {
          quality: stream.quality,
          label: stream.label,
          reason,
          manual
        });
        return true;
      }
      failedAtByQuality.set(stream.quality, nowMs());
      (_c = options.recordPlaybackDebugEvent) == null ? void 0 : _c.call(options, "live_quality_switch_failed", {
        quality: stream.quality,
        reason
      });
      return false;
    } finally {
      switching.value = false;
    }
  }
  function isPoorSample(sample, targetBitrate) {
    const throughput = Number(sample.throughputKbps || 0);
    const bufferSeconds = Number(sample.bufferSeconds || 0);
    const rebufferRatio = Number(sample.rebufferRatio || 0);
    const bandwidthPoor = targetBitrate > 0 && throughput > 0 && throughput < targetBitrate * 1.3;
    const bufferDropping = previousBufferSeconds > 0 && bufferSeconds < previousBufferSeconds - 0.15;
    const bufferPoor = bufferSeconds > 0 && bufferSeconds < 2 && bufferDropping;
    const rebufferPoor = rebufferRatio > 0.08;
    return bandwidthPoor || bufferPoor || rebufferPoor || sample.severeStall === true;
  }
  function isGoodSample(sample, nextTargetBitrate) {
    const throughput = Number(sample.throughputKbps || 0);
    const bufferSeconds = Number(sample.bufferSeconds || 0);
    const rebufferRatio = Number(sample.rebufferRatio || 0);
    const enoughBandwidth = nextTargetBitrate > 0 ? throughput > nextTargetBitrate * 1.8 : true;
    return enoughBandwidth && rebufferRatio <= 0.02 && (bufferSeconds === 0 || bufferSeconds >= 4);
  }
  function rememberSampleBitrate(sample = {}) {
    const stream = currentStream.value;
    if (!stream)
      return;
    const mediaBitrate = Number(sample.mediaBitrateKbps || 0);
    if (mediaBitrate <= 0)
      return;
    estimatedBitrateByQuality.value = {
      ...estimatedBitrateByQuality.value,
      [stream.quality]: ewma(estimatedBitrateByQuality.value[stream.quality], mediaBitrate)
    };
  }
  function handleQualitySample(sample = {}) {
    if (!streams.value.length || !currentQuality.value)
      return;
    rememberSampleBitrate(sample);
    lastSample.value = summarizeSample(sample);
    if (manualLocked.value || switching.value)
      return;
    const current = currentStream.value;
    const targetBitrate = getTargetBitrate(current);
    const lower = getLowerStream();
    const poor = isPoorSample(sample, targetBitrate);
    previousBufferSeconds = Number(sample.bufferSeconds || 0);
    if (poor) {
      poorScore += 1;
      stableSince = 0;
    } else {
      poorScore = Math.max(0, poorScore - 1);
      if (!stableSince)
        stableSince = nowMs();
    }
    const severe = sample.severeStall === true || Number(sample.waitingMs30s || 0) >= 3e3;
    if (lower && (severe || poorScore >= 3) && nowMs() - lastSwitchTs >= DEGRADE_COOLDOWN_MS) {
      switchToStream(lower, severe ? "severe_stall_degrade" : "quality_sample_degrade", false);
      return;
    }
    const higher = getHigherStream();
    if (!higher || !stableSince || nowMs() - lastSwitchTs < UPGRADE_COOLDOWN_MS)
      return;
    const higherTarget = getTargetBitrate(higher);
    const needStableMs = higherTarget > 0 ? STABLE_UPGRADE_MS : UNKNOWN_TARGET_STABLE_UPGRADE_MS;
    if (nowMs() - stableSince >= needStableMs && isGoodSample(sample, higherTarget)) {
      switchToStream(higher, "quality_sample_upgrade", false);
    }
  }
  function handleDebugQualityClick(quality) {
    var _a;
    if (quality === "auto") {
      manualLocked.value = false;
      lastReason.value = "debug_auto_enabled";
      (_a = options.recordPlaybackDebugEvent) == null ? void 0 : _a.call(options, "live_quality_auto_enabled", {});
      return;
    }
    const stream = pages_broadcast_utils_liveSource.selectStreamByQuality(streams.value, quality);
    switchToStream(stream, "debug_manual_switch", true);
  }
  return {
    streams,
    currentQuality,
    currentStream,
    controls,
    debugState,
    manualLocked,
    setPullStreams,
    updateSignedStreams,
    getPreferredQuality,
    handleQualitySample,
    handleDebugQualityClick
  };
}
exports.useLiveAdaptiveQuality = useLiveAdaptiveQuality;
