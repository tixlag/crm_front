import Aura from '@primevue/themes/aura'
import pkg from './package.json'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-07-04',

  ssr: false,
  devtools: { enabled: true },
  devServer: {
    host: 'localhost.com',
    port: 3000,
    https: {
      key: './localhost-key.pem',
      cert: './localhost-cert.pem',
    },
  },

  vite: {
    // фиксит баг с компонентом Editor
    optimizeDeps: {
      include: ['quill'],
    },

    server: {
      https: {
        key: './localhost-key.pem',
        cert: './localhost-cert.pem',
      },
    },
  },

  runtimeConfig: {
    public: {
      APP_VERSION: pkg.version,
      APP_NAME: pkg.name,
      // eslint-disable-next-line node/prefer-global/process
      APP_MODE: process.env?.NODE_ENV,
      apiBase: 'https://localhost:3001',
      baseURL: process.env.API_URL || 'http://localhost:3000/'
    },
  },

  modules: [
    '@primevue/nuxt-module',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@vueuse/nuxt',
    '@nuxt/test-utils/module',
    '@nuxt/image',
    '@nuxt/fonts',
    // ['@nuxtjs/proxy', { pathRewrite: { '^/ api': '/ api/ v1' } }],

  ],


  content: {
    highlight: {
      theme: 'one-dark-pro',
      preload: ['json', 'js', 'ts', 'html', 'css', 'vue'],
    },
    // Options
  },

  i18n: {
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'ru',
    strategy: 'no_prefix',
    locales: [
      { code: 'ru', file: 'ru.json', name: 'Russian' },
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'de', file: 'de.json', name: 'German' },
    ],
    vueI18n: './vue-i18n.options.ts',
  },

  primevue: {
    autoImport: true,
    components: {
      include: ['ConfirmDialog', 'Toast'],
      exclude: ['Chart', 'Editor'],
    },
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          ripple: true,
        },
      },
      ripple: true,
    },
  },

  css: [
    'primeicons/primeicons.css'
  ],

  build: {
    // transpile: ['nuxt', 'primevue'],
    transpile: ['nuxt', 'primevue', '@primevue/themes'],
    // transpile: ['nuxt', 'formkit-primevue'],
  },

  sourcemap: {
    client: true,
    server: true,
  },
  // proxy: {
  //   '/api/': {
  //     target: 'http://localhost:3001/', // Адрес вашего backend
  //     pathRewrite: { '^/api/': '' },
  //     changeOrigin: true,
  //     secure: false,
  //   },
  // },
  // runtimeConfig: {
  //   public: {
  //     apiBase: '/api', // Базовый путь для API
  //   },
  // },
// фиксит баг с компонентом Editor
//   alias: {
//     'quill': process.dev ? 'quill/dist/quill.js' : 'quill'
//   },

})
