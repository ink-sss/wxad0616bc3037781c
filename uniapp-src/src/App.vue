<script>
import { applyUpdate, bindUpdateManager } from './platform/weixin/update.js'

export default {
  globalData: {
    migrationStatus: 'scaffold',
  },

  onLaunch(options) {
    this.globalData.launchOptions = options || {}

    // #ifdef MP-WEIXIN
    const updateManager = bindUpdateManager({
      onUpdateReady: () => {
        uni.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              applyUpdate(updateManager)
            }
          },
        })
      },
    })
    // #endif
  },

  onHide() {},
}
</script>

<style src="./app-global.scss" lang="scss"></style>
