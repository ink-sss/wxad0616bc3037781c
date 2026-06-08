import PageSpyModule from '@huolala-tech/page-spy-wechat'

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

export function initPageSpy() {
  if (!__ENABLE_PAGE_SPY__) return null
  if (realPageSpy) return $pageSpy
  try {
    const PageSpy = PageSpyModule.default || PageSpyModule
    realPageSpy = new PageSpy({
      api: 'pagespy.cyfwork.cn',
    })
    $pageSpy = pageSpyProxy
  } catch (error) {
    realPageSpy = null
  }
  return $pageSpy
}

export function getPageSpy() {
  return realPageSpy || $pageSpy
}
