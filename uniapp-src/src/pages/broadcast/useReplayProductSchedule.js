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
      const nodes = normalizeScheduleNodes(product)
      if (!nodes.length) continue
      if (currentVideoId && product.videoId && Number(product.videoId) !== Number(currentVideoId)) continue
      if (currentVideoId && !product.videoId && product.video_id && Number(product.video_id) !== Number(currentVideoId)) continue
      if (product.scheduleVideoUrl && currentVideoUrl && product.scheduleVideoUrl !== currentVideoUrl) continue

      for (const node of nodes) {
        const triggerSecond = Math.floor(Number(node.videoTime || 0))
        const duration = Math.max(Number(node.duration || 0), 0)
        const endSecond = triggerSecond + duration
        const key = buildNodeKey(
          product.id || product.productId,
          product.scheduleVideoUrl,
          triggerSecond,
          duration,
        )

        if (second < triggerSecond) continue
        if (second >= endSecond) {
          triggeredNodeKeys.add(key)
          continue
        }

        const hit = { product, node, key }
        if (triggeredNodeKeys.has(key)) {
          if (!currentWindowHit || triggerSecond >= Number(currentWindowHit.node?.videoTime || 0)) {
            currentWindowHit = hit
          }
          continue
        }

        triggeredNodeKeys.add(key)
        if (!newTrigger || triggerSecond >= Number(newTrigger.node?.videoTime || 0)) {
          newTrigger = hit
        }
        if (!currentWindowHit || triggerSecond >= Number(currentWindowHit.node?.videoTime || 0)) {
          currentWindowHit = hit
        }
      }
    }

    if (newTrigger) {
      activeProductId = newTrigger.product?.id || newTrigger.product?.productId || 0
      return { ...newTrigger, shouldActivate: true, shouldDeactivate: false }
    }

    if (currentWindowHit) {
      activeProductId = currentWindowHit.product?.id || currentWindowHit.product?.productId || 0
      return { shouldActivate: false, shouldDeactivate: false }
    }

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
