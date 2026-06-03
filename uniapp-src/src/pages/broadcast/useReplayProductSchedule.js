export function normalizeScheduleNodes(product) {
  const rawNodes = Array.isArray(product?.scheduleNodes)
    ? product.scheduleNodes
    : product?.scheduleVideoUrl
      ? [
          {
            videoTime: Number(product?.scheduleVideoTime || 0),
            duration: Number(product?.scheduleDuration || 0),
          },
        ]
      : []

  return rawNodes
    .map((node) => ({
      videoTime: Number(node?.videoTime || 0),
      duration: Number(node?.duration || 0),
    }))
    .filter((node) => node.duration > 0)
    .sort((a, b) => a.videoTime - b.videoTime)
}

export function getReplayProductId(product = {}) {
  return Number(product.id || product.productId || product.product_id || product.goodsId || product.goods_id || 0)
}

function getReplayProductVideoId(product = {}) {
  return Number(product.videoId || product.video_id || product.replayVideoId || product.replay_video_id || 0)
}

export function createReplayProductScheduleController() {
  const triggeredNodeKeys = new Set()
  let activeProductId = 0

  const buildNodeKey = (productId, videoUrl, videoTime, duration) => {
    return [productId || 0, videoUrl || '', videoTime || 0, duration || 0].join('_')
  }

  const resetScheduleState = () => {
    triggeredNodeKeys.clear()
    activeProductId = 0
  }

  const syncReplaySchedule = ({
    productList = [],
    currentTime = 0,
    currentVideoUrl = '',
    currentVideoId = 0,
  }) => {
    const second = Math.floor(Number(currentTime || 0))
    if (second < 0) return { shouldActivate: false, shouldDeactivate: false }

    let newTrigger = null
    let currentWindowHit = null

    for (const product of productList || []) {
      const productId = getReplayProductId(product)
      const productVideoId = getReplayProductVideoId(product)
      const nodes = normalizeScheduleNodes(product)
      if (!nodes.length) continue
      // 按视频ID过滤：商品挂在视频下，只在对应视频播放时触发
      if (currentVideoId && productVideoId && productVideoId !== Number(currentVideoId)) continue
      if (currentVideoId && !productVideoId) continue
      if (product.scheduleVideoUrl && currentVideoUrl && product.scheduleVideoUrl !== currentVideoUrl) continue

      for (const node of nodes) {
        const triggerSecond = Math.floor(Number(node.videoTime || 0))
        const endSecond = triggerSecond + Math.max(Number(node.duration || 0), 0)
        const key = buildNodeKey(
          productId,
          product.scheduleVideoUrl,
          triggerSecond,
          node.duration,
        )

        // 还没到触发时间，跳过
        if (second < triggerSecond) continue

        // 已经过了窗口结束时间，标记为已触发并跳过
        if (second >= endSecond) {
          triggeredNodeKeys.add(key)
          continue
        }

        // 当前在窗口内 [triggerSecond, endSecond)
        if (triggeredNodeKeys.has(key)) {
          // 已经触发过，只记录当前窗口命中（用于保持显示），不重新激活
          if (!currentWindowHit || triggerSecond >= Number(currentWindowHit.node?.videoTime || 0)) {
            currentWindowHit = { product, node, key }
          }
        } else {
          // 首次触发！
          triggeredNodeKeys.add(key)
          if (!newTrigger || triggerSecond >= Number(newTrigger.node?.videoTime || 0)) {
            newTrigger = { product, node, key }
          }
          if (!currentWindowHit || triggerSecond >= Number(currentWindowHit.node?.videoTime || 0)) {
            currentWindowHit = { product, node, key }
          }
        }
      }
    }

    // 有新触发的节点 → 激活（live.vue 设定时器）
    if (newTrigger) {
      activeProductId = getReplayProductId(newTrigger.product)
      return { ...newTrigger, shouldActivate: true, shouldDeactivate: false }
    }

    // 仍在某个已触发窗口内 → 保持显示，不重新激活（不重置定时器）
    if (currentWindowHit) {
      activeProductId = getReplayProductId(currentWindowHit.product)
      return { shouldActivate: false, shouldDeactivate: false }
    }

    // 所有窗口都结束了 → 收起
    if (activeProductId) {
      activeProductId = 0
      return { shouldActivate: false, shouldDeactivate: true }
    }

    return { shouldActivate: false, shouldDeactivate: false }
  }

  return {
    resetScheduleState,
    syncReplaySchedule,
  }
}
