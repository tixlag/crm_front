import Aura from '@primevue/themes/aura'
import pkg from './package.json'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-07-04',

  ssr: false,
  devtools: { enabled: true },

  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      APP_VERSION: pkg.version,
      APP_NAME: pkg.name,
      // eslint-disable-next-line node/prefer-global/process
      APP_MODE: process.env?.NODE_ENV,
      apiBase: '/api',
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
    '@formkit/nuxt',
    // ['@nuxtjs/proxy', { pathRewrite: { '^/ api': '/ api/ v1' } }],

  ],

  formkit: {
    autoImport: true,
  },

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
    autoImport: false,
    components: {
      exclude: ['Chart', 'Editor'],
    },
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
        },
      },
      ripple: true,
    },
  },

  css: [
    'primeicons/primeicons.css',
    '@sfxcode/formkit-primevue/dist/sass/formkit-primevue.scss',
  ],

  build: {
    transpile: ['nuxt', 'primevue', 'formkit-primevue'],
  },

  sourcemap: {
    client: false,
    server: false,
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



})
