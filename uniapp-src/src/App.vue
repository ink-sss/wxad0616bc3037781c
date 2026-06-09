<script>
import { applyUpdate, bindUpdateManager } from './platform/weixin/update.js'
import { runMiniProgramStartup, syncMiniProgramLoginSetting } from './services/miniprogram-startup.js'

export default {
  globalData: {
    migrationStatus: 'scaffold',
    live_id: '',
    shop_supplier_id: 0,
    live_page: '1',
    is_login: 0,
    SDKAppID: '',
    imUserId: '',
    imUserSig: '',
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

    // #ifdef MP-WEIXIN
    runMiniProgramStartup(options || {}, this).catch((error) => {
      console.warn('[App] mini program startup failed:', error)
    })
    // #endif
  },

  methods: {
    getWxopen(done) {
      syncMiniProgramLoginSetting(this)
        .catch((error) => {
          console.warn('[App] getWxopen failed:', error)
        })
        .finally(() => {
          if (typeof done === 'function') done()
        })
    },
  },

  onHide() {},
}
</script>

<style src="./app-global.scss" lang="scss"></style>
<style lang="scss">
  @import './static/style/common.scss';

  @font-face {
    font-family: 'DIN';
    src: url('https://man.lqjy.cc/static/welfare/DIN.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Medium';
    src: url('https://man.lqjy.cc/static/welfare/DIN-Medium.otf') format('truetype');
  }
</style>
