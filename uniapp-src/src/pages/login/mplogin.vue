<template>
  <view></view>
</template>

<script>
import { getCurrentRedirect } from './page-tools.js'

export default {
  onLoad(query = {}) {
    if (query.token) uni.setStorageSync('token', query.token)
    if (query.user_id) uni.setStorageSync('user_id', query.user_id)

    const app = getApp()
    const done = () => {
      this.gotoPage(getCurrentRedirect('/pages/user/index/index'), 'reLaunch')
    }

    if (app && app.globalData && app.globalData.is_login) done()
    else if (app && typeof app.getWxopen === 'function') app.getWxopen(done)
    else done()
  },
}
</script>
