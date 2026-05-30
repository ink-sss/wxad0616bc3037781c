import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { installStore } from './store'
import { installSharedRuntime } from './utils/install.js'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  const store = installStore(app)
  app.use(pinia)
  installSharedRuntime(app, { store })

  app.config.globalProperties.$migration = {
    source: 'compiled-mp-weixin',
    target: 'uni-app-vue3-js',
  }

  return {
    app,
  }
}
