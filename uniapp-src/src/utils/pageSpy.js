// #ifdef MP-WEIXIN
import PageSpy from '@huolala-tech/page-spy-wechat'

let $pageSpy = null

export function initPageSpy() {
  try {
      $pageSpy = new PageSpy({
        api: 'pagespy.cyfwork.cn'
      })
      console.log('PageSpy 初始化成功')
    } catch (error) {
      console.warn('PageSpy 初始化失败:', error)
    }
  return $pageSpy
}

export function getPageSpy() {
  return $pageSpy
}
// #endif

// #ifndef MP-WEIXIN
export function initPageSpy() {
  return null
}

export function getPageSpy() {
  return null
}
// #endif
