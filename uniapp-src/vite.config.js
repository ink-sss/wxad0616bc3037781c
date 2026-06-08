import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'
import { fileURLToPath } from 'node:url'

const uni = uniPlugin.default || uniPlugin
const sassDeprecations = ['import', 'global-builtin', 'legacy-js-api']
const requestedPageSpy = process.env.VITE_ENABLE_PAGE_SPY === 'true'
const npmLifecycleEvent = process.env.npm_lifecycle_event || ''
const disabledPageSpyModule = fileURLToPath(new URL('./src/utils/pageSpy.disabled.js', import.meta.url))

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  const isReleaseBuild = npmLifecycleEvent.startsWith('build:')
  const enablePageSpy = requestedPageSpy && !isReleaseBuild

  return {
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
      minify: isBuild ? 'esbuild' : false,
      cssMinify: true,
      sourcemap: false,
    },
    esbuild: isBuild ? {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    } : undefined,
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
  }
})
