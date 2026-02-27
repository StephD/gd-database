export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxt/image',
    '@nuxtjs/i18n'
  ],

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'fr', language: 'fr-FR', file: 'fr.json', name: 'Français' }
    ]
  },

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  supabase: {
    redirect: false
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
