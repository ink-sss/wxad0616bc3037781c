import { computed, ref } from "vue";
import {
  normalizePullStreams,
  selectDefaultStream,
  selectStreamByQuality,
} from "../utils/live-source.js";

const DEGRADE_COOLDOWN_MS = 30000;
const UPGRADE_COOLDOWN_MS = 60000;
const SWITCH_FAIL_COOLDOWN_MS = 60000;
const STABLE_UPGRADE_MS = 60000;
const UNKNOWN_TARGET_STABLE_UPGRADE_MS = 90000;

function nowMs() {
  return Date.now();
}

const miniNetworkHint = ref({
  effectiveType: "",
  weak: false,
});

function refreshNetworkHint() {
  if (typeof uni.getNetworkType !== "function") return;
  uni.getNetworkType({
    success(res) {
      const effectiveType = String(res?.networkType || "").toLowerCase();
      miniNetworkHint.value = {
        effectiveType,
        weak: effectiveType === "2g" || effectiveType === "3g" || effectiveType === "none",
      };
    },
  });
}

function getNetworkHint() {
  return miniNetworkHint.value;
}

function ewma(prev, next, weight = 0.35) {
  const value = Number(next || 0);
  if (!Number.isFinite(value) || value <= 0) return prev || 0;
  const old = Number(prev || 0);
  if (!Number.isFinite(old) || old <= 0) return value;
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
    activeType: sample.activeType || "",
  };
}

export function useLiveAdaptiveQuality(options = {}) {
  refreshNetworkHint();
  const streams = ref([]);
  const currentQuality = ref("");
  const manualLocked = ref(false);
  const switching = ref(false);
  const lastReason = ref("");
  const lastSample = ref(null);
  const estimatedBitrateByQuality = ref({});

  let poorScore = 0;
  let stableSince = 0;
  let lastSwitchTs = 0;
  let previousBufferSeconds = 0;
  const failedAtByQuality = new Map();

  const currentStream = computed(() => selectStreamByQuality(streams.value, currentQuality.value));
  const controls = computed(() => [
    { quality: "auto", label: "自动", active: !manualLocked.value, disabled: switching.value },
    ...streams.value.map((stream) => ({
      quality: stream.quality,
      label: stream.label,
      active: currentQuality.value === stream.quality,
      disabled: switching.value,
      bitrateKbps: stream.bitrateKbps || Math.round(estimatedBitrateByQuality.value[stream.quality] || 0),
    })),
  ]);
  const debugState = computed(() => ({
    currentQuality: currentQuality.value || "",
    currentLabel: currentStream.value?.label || "",
    mode: manualLocked.value ? "manual" : "auto",
    switching: switching.value,
    lastReason: lastReason.value,
    sample: lastSample.value,
    streams: streams.value.map((stream) => ({
      quality: stream.quality,
      label: stream.label,
      bitrateKbps: stream.bitrateKbps || Math.round(estimatedBitrateByQuality.value[stream.quality] || 0),
      isDefault: stream.isDefault,
    })),
  }));

  function getPreferredQuality() {
    return currentQuality.value || selectDefaultStream(streams.value)?.quality || "";
  }

  function chooseInitialStream(nextStreams) {
    const defaultStream = selectDefaultStream(nextStreams);
    if (!defaultStream) return null;
    const hint = getNetworkHint();
    if (!hint.weak || defaultStream.quality !== "origin") return defaultStream;
    return selectStreamByQuality(nextStreams, "sd") || selectStreamByQuality(nextStreams, "ld") || defaultStream;
  }

  function setPullStreams(payloadOrStreams = {}) {
    const normalized = Array.isArray(payloadOrStreams)
      ? normalizePullStreams({ pullStreams: payloadOrStreams })
      : normalizePullStreams(payloadOrStreams);
    streams.value = normalized;
    if (!normalized.length) {
      currentQuality.value = "";
      return;
    }
    if (currentQuality.value && selectStreamByQuality(normalized, currentQuality.value)) return;
    const initial = chooseInitialStream(normalized);
    currentQuality.value = initial?.quality || "";
    if (initial && initial.quality !== selectDefaultStream(normalized)?.quality) {
      lastReason.value = "initial_weak_network_hint";
    }
  }

  function updateSignedStreams(payloadOrStreams = {}) {
    const normalized = Array.isArray(payloadOrStreams)
      ? normalizePullStreams({ pullStreams: payloadOrStreams })
      : normalizePullStreams(payloadOrStreams);
    if (!normalized.length) return;
    const oldQuality = currentQuality.value;
    setPullStreams(normalized);
    if (oldQuality && selectStreamByQuality(streams.value, oldQuality)) {
      currentQuality.value = oldQuality;
    }
  }

  function getTargetBitrate(stream) {
    if (!stream) return 0;
    return Number(stream.bitrateKbps || estimatedBitrateByQuality.value[stream.quality] || 0);
  }

  function getLowerStream() {
    const index = streams.value.findIndex((stream) => stream.quality === currentQuality.value);
    if (index < 0) return null;
    return streams.value[index + 1] || null;
  }

  function getHigherStream() {
    const index = streams.value.findIndex((stream) => stream.quality === currentQuality.value);
    if (index <= 0) return null;
    return streams.value[index - 1] || null;
  }

  async function switchToStream(stream, reason, manual = false) {
    if (!stream || switching.value) return false;
    if (failedAtByQuality.has(stream.quality) && nowMs() - failedAtByQuality.get(stream.quality) < SWITCH_FAIL_COOLDOWN_MS) {
      return false;
    }
    if (stream.quality === currentQuality.value && !manual) return true;
    switching.value = true;
    lastReason.value = reason;
    try {
      const ok = await options.switchStream?.(stream, reason);
      if (ok !== false) {
        currentQuality.value = stream.quality;
        lastSwitchTs = nowMs();
        poorScore = 0;
        stableSince = 0;
        if (manual) manualLocked.value = true;
        options.recordPlaybackDebugEvent?.("live_quality_switch_success", {
          quality: stream.quality,
          label: stream.label,
          reason,
          manual,
        });
        return true;
      }
      failedAtByQuality.set(stream.quality, nowMs());
      options.recordPlaybackDebugEvent?.("live_quality_switch_failed", {
        quality: stream.quality,
        reason,
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
    if (!stream) return;
    const mediaBitrate = Number(sample.mediaBitrateKbps || 0);
    if (mediaBitrate <= 0) return;
    estimatedBitrateByQuality.value = {
      ...estimatedBitrateByQuality.value,
      [stream.quality]: ewma(estimatedBitrateByQuality.value[stream.quality], mediaBitrate),
    };
  }

  function handleQualitySample(sample = {}) {
    if (!streams.value.length || !currentQuality.value) return;
    rememberSampleBitrate(sample);
    lastSample.value = summarizeSample(sample);
    if (manualLocked.value || switching.value) return;
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
      if (!stableSince) stableSince = nowMs();
    }
    const severe = sample.severeStall === true || Number(sample.waitingMs30s || 0) >= 3000;
    if (lower && (severe || poorScore >= 3) && nowMs() - lastSwitchTs >= DEGRADE_COOLDOWN_MS) {
      switchToStream(lower, severe ? "severe_stall_degrade" : "quality_sample_degrade", false);
      return;
    }
    const higher = getHigherStream();
    if (!higher || !stableSince || nowMs() - lastSwitchTs < UPGRADE_COOLDOWN_MS) return;
    const higherTarget = getTargetBitrate(higher);
    const needStableMs = higherTarget > 0 ? STABLE_UPGRADE_MS : UNKNOWN_TARGET_STABLE_UPGRADE_MS;
    if (nowMs() - stableSince >= needStableMs && isGoodSample(sample, higherTarget)) {
      switchToStream(higher, "quality_sample_upgrade", false);
    }
  }

  function handleDebugQualityClick(quality) {
    if (quality === "auto") {
      manualLocked.value = false;
      lastReason.value = "debug_auto_enabled";
      options.recordPlaybackDebugEvent?.("live_quality_auto_enabled", {});
      return;
    }
    const stream = selectStreamByQuality(streams.value, quality);
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
    handleDebugQualityClick,
  };
}
