import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'
import { fileURLToPath } from 'node:url'

const uni = uniPlugin.default || uniPlugin
const sassDeprecations = ['import', 'global-builtin', 'legacy-js-api']
const enablePageSpy = process.env.VITE_ENABLE_PAGE_SPY === 'true'
const disabledPageSpyModule = fileURLToPath(new URL('./src/utils/pageSpy.disabled.js', import.meta.url))

export default defineConfig({
  define: {
    __ENABLE_PAGE_SPY__: JSON.stringify(enablePageSpy),
  },
  resolve: {
    alias: enablePageSpy ? {} : {
      '@huolala-tech/page-spy-wechat': disabledPageSpyModule,
    },
  },
  plugins: [
    uni({
      viteLegacyOptions: {
        targets: ['defaults'],
        modernPolyfills: false,
        renderLegacyChunks: false,
      },
    }),
  ],
  build: {
    target: 'es2015',
    minify: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: sassDeprecations,
      },
      sass: {
        api: 'modern-compiler',
        silenceDeprecations: sassDeprecations,
      },
    },
  },
})
