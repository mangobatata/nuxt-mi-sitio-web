// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },


  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Mi tienda de servicios',
      meta: [
        {
          name: 'description',
          content: 'Bienvenido a mi tienda de servicios generales.',
        },
      ],
    },
  },


})
