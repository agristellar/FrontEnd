// https://nuxt.com/docs/api/configuration/nuxt-config
const defaultPort = 15007
const port = Number.parseInt(process.env.FRONTEND_PORT || '', 10)
const host = process.env.FRONTEND_HOST || '0.0.0.0'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    sourcemap: false,
    devServer: {
        host,
        port: Number.isNaN(port) ? defaultPort : port,
    },

    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxtjs/i18n',
    ],

    i18n: {
        locales: [
            { code: 'en', name: 'English', file: 'en.json' },
            { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
        ],
        defaultLocale: 'en',
        strategy: 'no_prefix',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_lang',
            fallbackLocale: 'en',
        },
    },

    runtimeConfig: {
        public: {
            apiBase: process.env.API_BASE_URL || 'http://localhost:3001/api',
            siteUrl: process.env.SITE_URL || 'https://agristellar.com',
        },
    },

    components: [
        { path: '~/components/common', pathPrefix: false },
        { path: '~/components/supplier', pathPrefix: false },
        { path: '~/components/investor', pathPrefix: false },
        { path: '~/components/admin', pathPrefix: false },
        { path: '~/components/campaign', pathPrefix: false },
    ],

    css: ['~/assets/css/main.css'],

    site: {
        url: process.env.SITE_URL || 'https://agristellar.com',
        name: 'AgriStellar',
    },

    app: {
        head: {
            htmlAttrs: { lang: 'en' },
            title: 'AgriStellar — Tokenized Agri-Export Financing on Stellar',
            titleTemplate: '%s | AgriStellar',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Invest in verified agricultural export campaigns from Vietnam. Transparent, blockchain-backed financing with milestone-based disbursement on the Stellar network.' },
                { name: 'keywords', content: 'agri finance, agricultural investment, Vietnam export, Stellar blockchain, tokenized financing, harvest note, trade finance, coffee export, cashew export, dragon fruit' },
                { name: 'author', content: 'AgriStellar' },
                { name: 'robots', content: 'index, follow' },
                { name: 'theme-color', content: '#16a34a' },
                { property: 'og:type', content: 'website' },
                { property: 'og:site_name', content: 'AgriStellar' },
                { property: 'og:title', content: 'AgriStellar — Tokenized Agri-Export Financing' },
                { property: 'og:description', content: 'Invest in verified agricultural export campaigns from Vietnam. Transparent, blockchain-backed financing on the Stellar network.' },
                { property: 'og:image', content: '/og-image.png' },
                { property: 'og:locale', content: 'en_US' },
                { property: 'og:locale:alternate', content: 'vi_VN' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: 'AgriStellar — Tokenized Agri-Export Financing' },
                { name: 'twitter:description', content: 'Invest in verified agricultural export campaigns from Vietnam on the Stellar blockchain.' },
                { name: 'twitter:image', content: '/og-image.png' },
            ],
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { rel: 'canonical', href: process.env.SITE_URL || 'https://agristellar.com' },
            ],
        },
    },
    sourcemap: {
        server: false,
        client: false
    },
    // Hoặc cấu hình riêng cho build
    vite: {
        build: {
            sourcemap: false
        }
    }
})
