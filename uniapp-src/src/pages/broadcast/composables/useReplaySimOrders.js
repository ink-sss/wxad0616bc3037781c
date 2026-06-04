/**
 * useReplaySimOrders - 录播视频模拟下单消息时间线消费（分段请求版）
 *
 * 特性：
 * 1. 按 20 秒窗口分段请求，startSec/endSec 均对齐到 20 的倍数，提高后端缓存命中率
 * 2. 在 onVideoTimeUpdate 中按 triggerAtSec 与当前播放进度对比，逐条弹出
 * 3. seek 回退时重置游标和已加载区间
 */
import { ref } from 'vue'
import { getReplaySimMessages } from '@/api/live'

const WINDOW_SIZE = 20 // 每次预加载 20 秒的消息，与后端缓存键对齐
const PRELOAD_LEAD_SEC = 5 // 提前 5 秒预加载下一窗口
const SEEK_JUMP_THRESHOLD_SEC = 10 // 原生 video seek/timeupdate 跳跃时跳过旧窗口飘屏

function firstValue(source = {}, ...keys) {
  if (!source || typeof source !== 'object') return undefined
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function firstObject(source = {}, ...keys) {
  for (const key of keys) {
    const value = firstValue(source, key)
    if (value && typeof value === 'object' && !Array.isArray(value)) return value
  }
  return {}
}

function pickReplaySimList(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  const directKeys = [
    'list',
    'records',
    'rows',
    'items',
    'messages',
    'simMessages',
    'sim_messages',
    'orderList',
    'order_list',
    'orders',
  ]
  for (const key of directKeys) {
    const value = payload[key]
    if (Array.isArray(value)) return value
  }
  if (payload.data && payload.data !== payload) return pickReplaySimList(payload.data)
  if (payload.result && payload.result !== payload) return pickReplaySimList(payload.result)
  return []
}

function toSeconds(value, fallback = NaN) {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'string' && value.includes(':')) {
    const parts = value.split(':').map((part) => Number(part))
    if (parts.every((part) => Number.isFinite(part))) {
      return parts.reduce((total, part) => total * 60 + part, 0)
    }
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toPositiveInt(value, fallback = 1) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

function normalizeSeconds(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function normalizeReplaySimOrder(raw = {}) {
  const payload = raw && typeof raw === 'object' ? raw : {}
  const product = firstObject(payload, 'product', 'goods', 'goodsInfo', 'goods_info', 'productInfo', 'product_info')
  const customer = firstObject(payload, 'customer', 'user', 'buyer', 'viewer')
  const triggerAtSec = toSeconds(firstValue(
    payload,
    'triggerAtSec',
    'trigger_at_sec',
    'triggerSecond',
    'trigger_second',
    'triggerSeconds',
    'trigger_seconds',
    'timelineSeconds',
    'timeline_seconds',
    'playSeconds',
    'play_seconds',
    'playTime',
    'play_time',
    'showAtSec',
    'show_at_sec',
    'offsetSec',
    'offset_sec',
    'second',
    'seconds',
    'time'
  ))
  if (!Number.isFinite(triggerAtSec)) return null
  const productId = Number(firstValue(
    payload,
    'productId',
    'product_id',
    'goodsId',
    'goods_id',
    'skuProductId',
    'sku_product_id'
  ) || firstValue(product, 'id', 'productId', 'product_id', 'goodsId', 'goods_id') || 0)
  const quantity = toPositiveInt(firstValue(
    payload,
    'quantity',
    'qty',
    'num',
    'count',
    'buyCount',
    'buy_count',
    'productNum',
    'product_num',
    'goodsNum',
    'goods_num'
  ), 1)
  const customerName = String(firstValue(
    payload,
    'customerName',
    'customer_name',
    'nickname',
    'nick',
    'userName',
    'user_name',
    'buyerName',
    'buyer_name'
  ) || firstValue(customer, 'customerName', 'customer_name', 'nickname', 'nick', 'name', 'userName', 'user_name') || '观众')
  const productName = String(firstValue(
    payload,
    'productName',
    'product_name',
    'goodsName',
    'goods_name',
    'title'
  ) || firstValue(product, 'name', 'title', 'productName', 'product_name', 'goodsName', 'goods_name') || '')
  const productImage = String(firstValue(
    payload,
    'productImage',
    'product_image',
    'goodsPic',
    'goods_pic',
    'goodsImage',
    'goods_image',
    'image',
    'img',
    'pic',
    'cover',
    'thumb'
  ) || firstValue(product, 'image', 'img', 'pic', 'cover', 'thumb', 'productImage', 'product_image', 'goodsPic', 'goods_pic') || '')
  const noticeText = String(firstValue(
    payload,
    'noticeText',
    'notice_text',
    'actionText',
    'action_text',
    'text',
    'content'
  ) || '')
  return {
    ...payload,
    triggerAtSec,
    productId,
    quantity,
    customerName,
    productName,
    productImage,
    noticeText,
  }
}

export function normalizeReplaySimMessages(payload) {
  return pickReplaySimList(payload)
    .map(normalizeReplaySimOrder)
    .filter(Boolean)
    .sort((a, b) => a.triggerAtSec - b.triggerAtSec)
}

// 对齐到 WINDOW_SIZE 的下边界（夂0、203〔1 → 0、200、220）
function alignDownToWindow(sec) {
  const n = Math.max(0, Math.floor(Number(sec) || 0))
  return Math.floor(n / WINDOW_SIZE) * WINDOW_SIZE
}

export function useReplaySimOrders() {
  // 当前视频的模拟下单消息时间线（当前窗口内，按 triggerAtSec 升序）
  const simTimeline = ref([])
  // 当前已消费到的游标位置
  const simCursor = ref(0)
  // 当前视频 ID
  let _videoId = 0
  // 已加载的区间上界（endSec），到达此秒数时触发加载下一段
  let _loadedEndSec = 0
  // 是否正在加载
  let _loading = false
  // 当前录播上下文，供 H5 后端按房间/租户/分享归因过滤模拟消息
  let _context = {}
  let _requestVersion = 0
  let _lastConsumeSeconds = 0

  /**
   * 切视频时：重置所有状态并从指定秒数开始加载
   * @param {number} videoId
   * @param {number} startFromSec 从哪一秒开始（之前的消息不加载不显示）
   */
  const loadSimMessages = async (videoId, startFromSec = 0, context = {}) => {
    const startSeconds = normalizeSeconds(startFromSec)
    _videoId = videoId
    _context = context && typeof context === 'object' ? { ...context } : {}
    simTimeline.value = []
    simCursor.value = 0
    _loadedEndSec = 0
    _loading = false
    _requestVersion += 1
    _lastConsumeSeconds = startSeconds
    if (!videoId) return
    await _loadWindow(alignDownToWindow(startSeconds), {
      syncCursorSeconds: startSeconds,
      version: _requestVersion,
    })
  }

  /**
   * 清空
   */
  const resetSimMessages = () => {
    _videoId = 0
    _context = {}
    simTimeline.value = []
    simCursor.value = 0
    _loadedEndSec = 0
    _loading = false
    _requestVersion += 1
    _lastConsumeSeconds = 0
  }

  function syncCursorToSeconds(currentSeconds) {
    const targetSeconds = normalizeSeconds(currentSeconds)
    const timeline = simTimeline.value
    let lo = 0
    let hi = timeline.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (Number(timeline[mid].triggerAtSec || 0) <= targetSeconds) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    simCursor.value = lo
  }

  function reloadWindowAt(currentSeconds) {
    const targetSeconds = normalizeSeconds(currentSeconds)
    simTimeline.value = []
    simCursor.value = 0
    _loadedEndSec = 0
    _loading = false
    _requestVersion += 1
    _lastConsumeSeconds = targetSeconds
    if (_videoId) {
      _loadWindow(alignDownToWindow(targetSeconds), {
        syncCursorSeconds: targetSeconds,
        version: _requestVersion,
      })
    }
  }

  /**
   * 按播放进度消费消息 + 触发预加载
   * @param {number} currentSeconds 当前播放秒数
   * @returns {Array} 本次触发的消息列表
   */
  const consumeSimOrders = (currentSeconds) => {
    const normalizedSeconds = normalizeSeconds(currentSeconds)
    if (_videoId && _loadedEndSec > 0 && normalizedSeconds > _loadedEndSec + WINDOW_SIZE) {
      reloadWindowAt(normalizedSeconds)
      return []
    }
    const jumpedForward =
      simTimeline.value.length > 0 &&
      normalizedSeconds > _lastConsumeSeconds + SEEK_JUMP_THRESHOLD_SEC
    if (
      jumpedForward
    ) {
      syncCursorToSeconds(normalizedSeconds)
    }
    // 当播放进度接近已加载上界时，预加载下一窗口
    if (_videoId && !_loading && _loadedEndSec > 0 && normalizedSeconds >= _loadedEndSec - PRELOAD_LEAD_SEC) {
      _loadWindow(_loadedEndSec, jumpedForward ? {
        syncCursorSeconds: normalizedSeconds,
        version: _requestVersion,
      } : {})
    }

    const pending = []
    while (simCursor.value < simTimeline.value.length) {
      const item = simTimeline.value[simCursor.value]
      if (item.triggerAtSec > normalizedSeconds) break
      pending.push(item)
      simCursor.value++
    }
    _lastConsumeSeconds = normalizedSeconds
    return pending
  }

  /**
   * seek 回退时重定位游标（二分查找）
   * 如果 seek 到已加载区间之前，需要重新加载
   */
  const syncSimCursor = (currentSeconds) => {
    // 如果回退到已加载数据之前的位置，重新加载
    if (simTimeline.value.length > 0 && currentSeconds < simTimeline.value[0].triggerAtSec) {
      // 清空并从当前位置重新加载
      reloadWindowAt(currentSeconds)
      return
    }
    // 在已有数据内，二分查找定位游标
    syncCursorToSeconds(currentSeconds)
    _lastConsumeSeconds = normalizeSeconds(currentSeconds)
  }

  /**
   * 加载指定起始秒的一个窗口，startSec 会被对齐到 WINDOW_SIZE 的倍数
   */
  const _loadWindow = async (startSec, options = {}) => {
    if (_loading) return
    _loading = true
    const version = options.version || _requestVersion
    const requestVideoId = _videoId
    const alignedStart = alignDownToWindow(startSec)
    const endSec = alignedStart + WINDOW_SIZE
    try {
      const data = normalizeReplaySimMessages(await getReplaySimMessages(_videoId, alignedStart, endSec, _context))
      if (version !== _requestVersion || requestVideoId !== _videoId) return
      if (Array.isArray(data) && data.length > 0) {
        // 追加到 timeline（已按 triggerAtSec 排序，直接 concat）
        simTimeline.value = simTimeline.value.concat(data)
        if (Number.isFinite(Number(options.syncCursorSeconds))) {
          syncCursorToSeconds(options.syncCursorSeconds)
        }
        // [diag] 拉取到数据时记录一条，确认 API 返回与跨窗口拼接正常
        // console.log('[useReplaySimOrders] 加载区间', {
        //   videoId: _videoId,
        //   range: [alignedStart, endSec],
        //   gotCount: data.length,
        //   timelineLen: simTimeline.value.length,
        // })
      }
      _loadedEndSec = endSec
    } catch (e) {
      console.error('[useReplaySimOrders] 加载模拟消息失败:', e)
    } finally {
      if (version === _requestVersion) {
        _loading = false
      }
    }
  }

  return {
    simTimeline,
    simCursor,
    loadSimMessages,
    resetSimMessages,
    consumeSimOrders,
    syncSimCursor
  }
}
