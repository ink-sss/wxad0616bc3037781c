/**
 * Mini Program live-player status helpers.
 * Keep this small and shared so portrait/landscape judge the native player
 * readiness in the same way without changing the H5-copied view structure.
 */

export const LIVE_PLAYER_READY_CODES = [2003, 2004, 2007, 2008];

const LIVE_PLAYER_NET_ACTIVITY_FIELDS = [
  [
    "videoBitrate",
    "videoKBitrate",
    "videoBitrateKbps",
    "VIDEO_BITRATE",
    "VIDEO_KBITRATE",
    "VIDEO_BITRATE_KBPS",
    "video_bitrate",
    "video_kbitrate",
    "video_bitrate_kbps",
  ],
  [
    "audioBitrate",
    "audioKBitrate",
    "audioBitrateKbps",
    "AUDIO_BITRATE",
    "AUDIO_KBITRATE",
    "AUDIO_BITRATE_KBPS",
    "audio_bitrate",
    "audio_kbitrate",
    "audio_bitrate_kbps",
  ],
  ["videoFPS", "videoFps", "fps", "VIDEO_FPS", "FPS", "video_fps"],
  ["netSpeed", "netJitter", "NET_SPEED", "NET_JITTER", "net_speed", "net_jitter"],
  ["videoWidth", "width", "VIDEO_WIDTH", "video_width"],
  ["videoHeight", "height", "VIDEO_HEIGHT", "video_height"],
  ["videoCache", "VIDEO_CACHE", "video_cache"],
  ["audioCache", "AUDIO_CACHE", "audio_cache"],
  ["videoGOP", "videoGop", "VIDEO_GOP", "video_gop"],
  ["avRecvInterval", "AV_RECV_INTERVAL", "av_recv_interval"],
];

function firstNumericField(source, fields) {
  if (!source) return 0;
  for (const field of fields) {
    const raw = source[field];
    if (raw === undefined || raw === null || raw === "") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export function hasLivePlayerNetActivity(info) {
  return LIVE_PLAYER_NET_ACTIVITY_FIELDS.some((fields) => firstNumericField(info, fields) > 0);
}
