export default defineNuxtConfig({
  compatibilityDate:'2025-07-01',
  ssr:false,
  devtools:{ enabled:false },
  modules:['@pinia/nuxt'],
  css:['~/assets/scss/main.scss'],
  runtimeConfig:{ public:{ apiBase:'http://localhost:3001',logoUrl:'' } },
  app:{ head:{
    title:'Susi Air · Pilot Operations', htmlAttrs:{ lang:'en' },
    meta:[{ name:'description',content:'Your flight hours, documents and duty schedule in one place.' },{ name:'theme-color',content:'#0E2138' }],
    link:[{ rel:'icon',type:'image/x-icon',href:'/favicon.ico?v=susiair-official' },{ rel:'apple-touch-icon',sizes:'512x512',href:'/apple-touch-icon.png' },{ rel:'preconnect',href:'https://fonts.googleapis.com' },{ rel:'preconnect',href:'https://fonts.gstatic.com',crossorigin:'' },{ rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }],
  } },
  typescript:{ strict:true },
});
