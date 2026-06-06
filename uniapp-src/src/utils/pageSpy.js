let realPageSpy = null
const pageSpyProxy = {
  showPanel(...args) {
    return realPageSpy?.showPanel?.(...args)
  },
  destroy(...args) {
    return realPageSpy?.destroy?.(...args)
  },
}
let $pageSpy = __ENABLE_PAGE_SPY__ ? pageSpyProxy : null
let loadingPageSpy = false

export function initPageSpy() {
  if (!__ENABLE_PAGE_SPY__) return null
  if (realPageSpy || loadingPageSpy) return $pageSpy
  loadingPageSpy = true
  import('@huolala-tech/page-spy-wechat')
    .then((module) => {
      const PageSpy = module.default || module
      realPageSpy = new PageSpy({
        api: 'pagespy.cyfwork.cn',
      })
      $pageSpy = pageSpyProxy
    })
    .catch(() => {
      realPageSpy = null
    })
    .finally(() => {
      loadingPageSpy = false
    })
  return $pageSpy
}

export function getPageSpy() {
  return realPageSpy || $pageSpy
}
