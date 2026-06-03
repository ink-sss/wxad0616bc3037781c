import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'

const uni = uniPlugin.default || uniPlugin
const sassDeprecations = ['import', 'global-builtin', 'legacy-js-api']

export default defineConfig({
  plugins: [uni()],
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
